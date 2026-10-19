from pathlib import Path
import json, numpy as np, hashlib, csv, time

OUT=Path('outputs/color-coverage');OUT.mkdir(exist_ok=True)
source=json.loads(Path('work/color-coverage-samples.json').read_text());presets=source['presets'];n=source['samplesPerPreset']
M1=np.array([[.4122214708,.5363325363,.0514459929],[.2119034982,.6806995451,.1073969566],[.0883024619,.2817188376,.6299787005]])
M2=np.array([[.2104542553,.793617785,-.0040720468],[1.9779984951,-2.428592205,.4505937099],[.0259040371,.7827717662,-.808675766]])
def to_lab(rgb):return np.einsum('...j,ij->...i',np.cbrt(np.einsum('...j,ij->...i',np.asarray(rgb),M1)),M2)
def to_rgb(lab):
 L,a,b=np.asarray(lab).T
 v=np.column_stack([L+.3963377774*a+.2158037573*b,L-.1055613458*a-.0638541728*b,L-.0894841775*a-1.291485548*b])**3
 return np.einsum('...j,ij->...i',v,np.array([[4.0767416621,-3.3077115913,.2309699292],[-1.2684380046,2.6097574011,-.3413193965],[-.0041960863,-.7034186147,1.707614701]]))
def hexes(rgb):
 rgb=np.clip(rgb,0,1);u=np.rint(np.where(rgb<=.0031308,rgb*12.92,1.055*rgb**(1/2.4)-.055)*255).astype(int)
 return ['#'+''.join(f'{v:02X}' for v in row) for row in u]
# Exact vectorized kd-tree: no rounded/deduplicated coordinates in distance results.
class Tree:
 def __init__(self,points,indices=None):
  self.points=points;self.indices=np.arange(len(points)) if indices is None else indices
  local=points[self.indices];self.lo=local.min(axis=0);self.hi=local.max(axis=0)
  if len(local)<=24:self.left=None;return
  self.axis=int(np.argmax(self.hi-self.lo));order=np.argsort(local[:,self.axis]);self.indices=self.indices[order];mid=len(local)//2
  self.split=(points[self.indices[mid-1],self.axis]+points[self.indices[mid],self.axis])/2
  self.left=Tree(points,self.indices[:mid]);self.right=Tree(points,self.indices[mid:])
 def nearest(self,queries):
  best=np.full(len(queries),np.inf);matches=np.zeros(len(queries),dtype=int)
  def visit(node,ids):
   if not len(ids):return
   q=queries[ids];delta=np.maximum(np.maximum(node.lo-q,q-node.hi),0);ids=ids[np.sum(delta*delta,axis=1)<=best[ids]]
   if not len(ids):return
   if node.left is None:
    ds=np.sum((queries[ids,None,:]-node.points[node.indices][None,:,:])**2,axis=2);ix=np.argmin(ds,axis=1);dist=ds[np.arange(len(ids)),ix];better=dist<best[ids];chosen=ids[better];best[chosen]=dist[better];matches[chosen]=node.indices[ix[better]];return
   near=queries[ids,node.axis]<=node.split;left=ids[near];right=ids[~near]
   visit(node.left,left);visit(node.right,right);visit(node.right,left);visit(node.left,right)
  visit(self,np.arange(len(queries)));return np.sqrt(best),matches

samples=to_lab(np.array([p['samples'] for p in presets]).reshape(-1,3));owners=np.repeat(np.arange(len(presets)),n)
weights=np.tile(np.r_[.5,np.ones(n-2),.5]/(n-1),len(presets))/len(presets)
stops=np.concatenate([np.array(p['stops']) for p in presets]);assert np.allclose(to_lab(to_rgb(stops)),stops,atol=1e-6)
# Include exact authored stops in geometric coverage; density is only actual strip area.
paths=to_lab(np.concatenate([np.array(p['coverageSamples']) for p in presets]));path_owners=np.concatenate([np.repeat(i,len(p['coverageSamples'])) for i,p in enumerate(presets)]);
assert np.isfinite(paths).all() and np.isfinite(samples).all();
all_colors=np.concatenate([samples,stops,paths]);stop_owners=np.concatenate([np.repeat(i,len(p['stops'])) for i,p in enumerate(presets)]);all_owners=np.r_[owners,stop_owners,path_owners]
unique,first=np.unique(all_colors,axis=0,return_index=True);unique_owners=all_owners[first]
print('Unique rendered/stop colors:',len(unique),flush=True)
axisL=np.arange(.01,1,.01);axisa=np.arange(-.4,.401,.01);axisb=np.arange(-.4,.401,.01)
reference=np.stack(np.meshgrid(axisL,axisa,axisb,indexing='ij'),axis=-1).reshape(-1,3);rgb=to_rgb(reference);inside=np.all((rgb>=-1e-9)&(rgb<=1+1e-9),axis=1);reference=reference[inside];rgb=rgb[inside]
print('Uniform OKLab in-gamut grid:',len(reference),flush=True)
shifted=np.stack(np.meshgrid(np.arange(.015,1,.01),np.arange(-.395,.4,.01),np.arange(-.395,.4,.01),indexing='ij'),axis=-1).reshape(-1,3);shifted_rgb=to_rgb(shifted);shifted=shifted[np.all((shifted_rgb>=-1e-9)&(shifted_rgb<=1+1e-9),axis=1)]
tree=Tree(unique);distance,nearest=tree.nearest(reference)
shifted_distance,_=tree.nearest(shifted)
np.savez_compressed('work/color-coverage-grid.npz',reference=reference,distance=distance)
# Check exact kd-tree against brute force at fixed reference positions.
check=np.random.default_rng(42).choice(len(reference),64,replace=False)
for i in check:assert abs(distance[i]-np.sqrt(np.sum((unique-reference[i])**2,axis=1)).min())<1e-12
hue=lambda x:np.mod(np.degrees(np.arctan2(x[:,2],x[:,1])),360)
chroma=lambda x:np.linalg.norm(x[:,1:],axis=1)
sC=chroma(samples);rC=chroma(reference);sH=hue(samples);rH=hue(reference)
names=['Red / coral','Orange / amber','Yellow / gold','Lime / chartreuse','Leaf green','Emerald / mint','Teal / turquoise','Cyan / sky','Azure / blue','Indigo / violet','Purple / magenta','Pink / crimson']
light_edges=[0,.2,.4,.6,.8,1.0001];light_labels=['Very dark','Dark','Midtone','Light','Very light']
chroma_edges=[0,.02,.06,.14,.22,1];chroma_labels=['Neutral','Muted','Moderate','Rich','High chroma']
chrom_s=sC>=.02;chrom_r=rC>=.02
sHue=np.floor(sH/30).astype(int);rHue=np.floor(rH/30).astype(int)
def stats(mask):
 d=distance[mask];return {'gridCells':int(mask.sum()),'covered025Pct':round(float(np.mean(d<=.025)*100),2),'covered04Pct':round(float(np.mean(d<=.04)*100),2),'meanDistance':round(float(d.mean()),5),'p95Distance':round(float(np.quantile(d,.95)),5),'maxDistance':round(float(d.max()),5)} if mask.any() else None
rows=[]
for i,name in enumerate(names):
 rm=chrom_r&(rHue==i);sm=chrom_s&(sHue==i);area=float(weights[sm].sum());ref_share=float(rm.sum()/chrom_r.sum());sample_share=area/weights[chrom_s].sum()
 rows.append({'hue':i,'name':name,'degrees':[i*30,(i+1)*30],'gradientAreaPct':round(area*100,3),'chromaticAreaPct':round(sample_share*100,3),'gamutVolumePct':round(ref_share*100,3),'representationRatio':round(sample_share/ref_share,3),'templatesVisiting':int(np.unique(owners[sm]).size),**stats(rm)})
regions=[]
for hi,name in enumerate(names):
 for li,label in enumerate(light_labels):
  for ci,clabel in enumerate(chroma_labels[1:],1):
   rm=(rHue==hi)&(reference[:,0]>=light_edges[li])&(reference[:,0]<light_edges[li+1])&(rC>=chroma_edges[ci])&(rC<chroma_edges[ci+1]);sm=(sHue==hi)&(samples[:,0]>=light_edges[li])&(samples[:,0]<light_edges[li+1])&(sC>=chroma_edges[ci])&(sC<chroma_edges[ci+1])
   if rm.sum()<30:continue
   st=stats(rm);area=float(weights[sm].sum());ratio=area/(rm.sum()/len(reference));regions.append({'hue':hi,'name':name,'lightness':label,'lightnessRange':light_edges[li:li+2],'chroma':clabel,'chromaRange':chroma_edges[ci:ci+2],'gradientAreaPct':round(area*100,4),'representationRatio':round(ratio,3),**st})
# Widely separated exact-gamut gaps; prevents one boundary hue dominating a shortlist.
selected=[]
for i in np.argsort(distance)[::-1]:
 if all(np.linalg.norm(reference[i]-reference[j])>=.075 for j in selected):selected.append(int(i))
 if len(selected)==16:break
gaps=[]
for i,hex in zip(selected,hexes(rgb[selected])):
 nearidx=nearest[i];owner=unique_owners[nearidx];p=presets[int(owner)]
 gaps.append({'hex':hex,'lab':reference[i].tolist(),'hue':round(float(rH[i]),1),'chroma':round(float(rC[i]),4),'distance':round(float(distance[i]),5),'nearestHex':hexes(to_rgb(unique[[nearidx]]))[0],'nearestPreset':p['name'],'nearestId':p['id']})
lightness=[]
for i,label in enumerate(light_labels):
 rm=(reference[:,0]>=light_edges[i])&(reference[:,0]<light_edges[i+1]);sm=(samples[:,0]>=light_edges[i])&(samples[:,0]<light_edges[i+1]);lightness.append({'name':label,'gradientAreaPct':round(float(weights[sm].sum())*100,2),**stats(rm)})
chromas=[]
for i,label in enumerate(chroma_labels):
 rm=(rC>=chroma_edges[i])&(rC<chroma_edges[i+1]);sm=(sC>=chroma_edges[i])&(sC<chroma_edges[i+1]);chromas.append({'name':label,'gradientAreaPct':round(float(weights[sm].sum())*100,2),**stats(rm)})
# Every sector-by-lightness cell for overview.
heatmap=[]
for li,label in enumerate(light_labels):
 for hi,name in enumerate(names):
  mask=chrom_r&(rHue==hi)&(reference[:,0]>=light_edges[li])&(reference[:,0]<light_edges[li+1]);st=stats(mask)
  heatmap.append({'hue':hi,'lightness':li,**(st or {'gridCells':0,'covered025Pct':None})})
report={'templates':len(presets),'samples':len(samples),'controlPoints':len(stops),'adaptivePathSamples':len(paths),'uniqueStopHexes':len(set(c.upper() for p in presets for c in p['colors'])),'gridStep':.01,'referenceCells':len(reference),'sourceSha256':hashlib.sha256(Path(source['source']).read_bytes()).hexdigest(),'method':{'space':'OKLab D65, standard coordinates L 0–1, a/b approximately -0.4–0.4','reference':'Uniform Cartesian grid restricted to linear-sRGB gamut; all grid cells have equal OKLab volume.','density':'Each template receives equal weight; 257 actual Smooth samples per gradient, trapezoidal endpoint weights. Real authored positions retained.','distance':'Exact nearest among density samples, authored stops and adaptive segment samples (authored OKLab spacing <= .001). Thresholds .025 and .04 are analysis choices, not universal JND values.','scope':'sRGB display colors, not full spectral locus or all human-visible colors; opacity, exposure, surroundings and display calibration not modeled.','caveats':'Uniform color-volume coverage is a diagnostic baseline, not a prescription for equal artistic use. Samples assume Smooth, including categorical palettes; Bands needs a separate use-case audit.'},'independentValidation':{'method':'Same-spacing Cartesian grid shifted by .005 in L, a and b; restricted to sRGB. Not used to select gap anchors.','referenceCells':int(len(shifted)),'covered025Pct':round(float(np.mean(shifted_distance<=.025)*100),3),'covered04Pct':round(float(np.mean(shifted_distance<=.04)*100),3),'maxDistance':round(float(shifted_distance.max()),6)},'overall':stats(np.ones(len(reference),bool)),'hues':rows,'lightness':lightness,'chroma':chromas,'regions':regions,'gaps':gaps,'heatmap':heatmap,'categories':{category:sum(p['category']==category for p in presets) for category in sorted(set(p['category'] for p in presets))}}
(OUT/'analysis.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
for filename,table in [('hue-coverage.csv',rows),('region-coverage.csv',regions),('color-gaps.csv',gaps)]:
 with (OUT/filename).open('w') as f:
  writer=csv.DictWriter(f,fieldnames=table[0].keys());writer.writeheader();writer.writerows(table)
print(json.dumps({'overall':report['overall'],'hues':sorted(rows,key=lambda r:r['representationRatio']),'chroma':chromas,'worstRegions':sorted(regions,key=lambda r:r['covered025Pct'])[:15],'gaps':gaps[:8]},ensure_ascii=False,indent=2),flush=True)
