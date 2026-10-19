# -*- coding: utf-8 -*-
from pathlib import Path
import numpy as np, json, collections
# Reuse only the verified color-conversion definitions, without rerunning the audit.
ns={};exec(Path('work/analyze_color_coverage.py').read_text().split('samples=to_lab(')[0],ns)
to_lab,to_rgb,hexes=ns['to_lab'],ns['to_rgb'],ns['hexes']
grid=np.load('work/color-coverage-grid.npz');ref=grid['reference'];dist=grid['distance'].copy()
# A dark neutral ramp covers the quantization-sensitive region near zero lightness.
# Its actual Smooth interpolation is checked in the full app audit afterwards.
dark=ref[:,0]<.08;dist[dark]=np.minimum(dist[dark],np.linalg.norm(ref[dark,1:],axis=1))
chosen=[]
while dist.max()>.020:
 i=int(np.argmax(dist));hex=hexes(to_rgb(ref[[i]]))[0];rgb=np.array([[int(hex[j:j+2],16)/255 for j in [1,3,5]]]);linear=np.where(rgb<=.04045,rgb/12.92,((rgb+.055)/1.055)**2.4);lab=to_lab(linear)[0]
 if hex in [v['hex'] for v in chosen]:raise ValueError('Cannot cover reference within 8-bit anchor precision: '+hex)
 chosen.append({'hex':hex,'lab':lab.tolist(),'reference':ref[i].tolist(),'previousDistance':float(dist[i])})
 dist=np.minimum(dist,np.linalg.norm(ref-lab,axis=1))
 assert len(chosen)<800
labels=['Rose Red','Amber Orange','Golden Yellow','Lime','Leaf Green','Emerald','Turquoise','Sky Cyan','Deep Blue','Indigo Violet','Purple Magenta','Fuchsia Rose']
levels=['Shadow','Midtone','Luminous','Highlight']
groups=collections.defaultdict(list)
for c in chosen:
 L,a,b=c['lab'];h=np.degrees(np.arctan2(b,a))%360;groups[(int(h//30),min(3,int(L//.25)))].append(c)
rows=[]
def row(id,name,colors,notes):
 labs=[]
 for hex in colors:
  rgb=np.array([[int(hex[j:j+2],16)/255 for j in [1,3,5]]]);linear=np.where(rgb<=.04045,rgb/12.92,((rgb+.055)/1.055)**2.4);labs.append(to_lab(linear)[0])
 distance=np.r_[0,np.cumsum(np.maximum(np.linalg.norm(np.diff(labs,axis=0),axis=1),.001))];positions=(distance/distance[-1]).tolist()
 return {'id':'coverage-fill-'+id,'name':'OKLab · '+name,'category':'Creative','originalCategory':'Perceptual','transition':'smooth','colors':colors,'positions':positions,'searchAliases':'coverage fill gamut saturation chroma '+name.lower(),'description':notes+' Original sRGB color study selected from underrepresented OKLab regions. Smooth paths connect nearby colors; positions follow perceptual path length. Not a wavelength scale or a validated data colormap.'}
rows.append(row('neutral-depth','Neutral · Black Depth',['#000000','#010101','#030303','#080808','#121212','#242424'],'Black-to-charcoal depth ramp for shadows and low-value masks.'))
for (h,l),items in sorted(groups.items()):
 # Order neighbors within each hue/lightness region to keep paths coherent.
 remaining=items[:];ordered=[remaining.pop(min(range(len(remaining)),key=lambda i:remaining[i]['lab'][0]))]
 while remaining:
  index=min(range(len(remaining)),key=lambda i:np.linalg.norm(np.array(remaining[i]['lab'])-ordered[-1]['lab']));ordered.append(remaining.pop(index))
 for start in range(0,len(ordered),16):
  batch=ordered[start:start+16];colors=[c['hex'] for c in batch]
  if len(colors)==1:
   lab=np.array(batch[0]['lab']);lab[0]=max(.05,lab[0]-.08);lab[1:]*=.8
   colors.insert(0,hexes(to_rgb(lab[None,:]))[0])
  idx=start//16+1;suffix='' if len(ordered)<=16 else f' {idx:02}'
  rows.append(row(f'h{h:02}-l{l}-{idx}',f'{labels[h]} · {levels[l]} Chroma{suffix}',colors,'Focused hue/lightness study for recoloring, pigment and emission masks.'))
assert len(rows)<=60 and all(2<=len(r['colors'])<=16 for r in rows)
Path('work/coverage-fill-templates.json').write_text(json.dumps(rows,indent=2))
Path('work/coverage-fill-targets.json').write_text(json.dumps(chosen,indent=2))
print('Gap anchors:',len(chosen),'new templates:',len(rows),'predicted maximum ΔEOK:',dist.max())
print('Point counts:',dict(collections.Counter(len(p['colors']) for p in rows)))
