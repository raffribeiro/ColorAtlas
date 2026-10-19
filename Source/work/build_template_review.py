from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,csv,html,collections
rows=json.loads(Path('work/template-review-samples.json').read_text());out=Path('outputs/template-color-review');out.mkdir(exist_ok=True)
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',13);small=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',11)
for page in range((len(rows)+79)//80):
 group=rows[page*80:(page+1)*80];im=Image.new('RGB',(1600,1120),(17,23,31));d=ImageDraw.Draw(im);d.text((16,12),f'COLOR ATLAS — PALETTE REVIEW {page+1} | Before / After / OKLab lightness',(220,229,239),font=font)
 for i,p in enumerate(group):
  x=16+(i%4)*395;y=44+(i//4)*53
  name=p['name'];d.text((x,y),name[:49],fill=(132,206,234) if p['reviewStatus']=='revised' else (196,206,218),font=small)
  for r,key in enumerate(['beforeSamples','samples']):
   a=p.get(key)
   if a:
    for xx in range(375):d.line((x+xx,y+14+r*10,x+xx,y+22+r*10),fill=tuple(a[round(xx*256/374)]))
  # A perceptual-lightness strip for comparison, not physical luminance.
  if p.get('samples'):
   for xx in range(375):
    rgb=p['samples'][round(xx*256/374)];v=[c/255 for c in rgb];lin=[c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in v];r,g,b=lin
    l=(.4122214708*r+.5363325363*g+.0514459929*b)**(1/3);m=(.2119034982*r+.6806995451*g+.1073969566*b)**(1/3);s=(.0883024619*r+.2817188376*g+.6299787005*b)**(1/3)
    grey=round(255*(.2104542553*l+.793617785*m-.0040720468*s));d.line((x+xx,y+36,x+xx,y+40),fill=(grey,grey,grey))
 im.save(out/f'contact-sheet-{page+1:02}.png')
with (out/'palette-audit.csv').open('w') as f:
 writer=csv.writer(f);writer.writerow(['ID','Name','Category','Type','Status','Points','Min OKLab L','Max OKLab L','Mean OKLab chroma','Reason','Before colors','After colors'])
 for p in rows:writer.writerow([p['id'],p['name'],p['category'],p.get('dataType','artistic'),p['reviewStatus'],len(p.get('colors',[])),round(p['metrics']['minL'],2),round(p['metrics']['maxL'],2),round(p['metrics']['meanChroma'],4),p['reviewReason'],' '.join(p.get('beforeColors',[])),' '.join(p.get('colors',[]))])
esc=html.escape
parts=['<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Color Atlas · Revisão de paletas</title><style>body{background:#11171f;color:#dbe5ef;font:15px system-ui;max-width:1100px;margin:30px auto;padding:20px}input,select{background:#1c2836;color:inherit;border:1px solid #526173;padding:10px}article{padding:16px;border-bottom:1px solid #354252}h3{margin:0 0 8px}canvas{width:100%;height:18px;display:block;margin:4px 0}p{color:#a7bacb}a{color:#81d1ed}small{color:#a7bacb}</style><h1>Revisão de cores · Color Atlas</h1>',f'<p>{len(rows)} templates analisados; {sum(p["reviewStatus"]=="revised" for p in rows)} revisados. Cores interpretativas: não são amostras certificadas de obras, animais, materiais ou marcas.</p>','<p>Critérios por propósito: progressão de luz para magnitude; centro compartilhado para divergência; fechamento de ciclos; distinção de classes; preservação de identidade, proporções estimadas e contrastes intencionais para arte, natureza e VFX. OKLab é uma aproximação perceptual, não uma prova de preferência universal ou acessibilidade.</p>','<p>A análise técnica percorre a biblioteca inteira. As mudanças estéticas se concentram em paletas cuja identidade estava excessivamente genérica. Paletas mantidas não recebem um selo de perfeição. Os strips exibem a interpolação Smooth real do app; classes e thresholds também exigem o modo Bands e mapeamento discreto quando usados para dados.</p>','<p>Referências: <a href="https://bottosson.github.io/posts/oklab/">OKLab</a>, <a href="https://colorbrewer2.org/learnmore/schemes.html">ColorBrewer</a>, <a href="https://www.kennethmoreland.com/color-maps/ColorMapsExpanded.pdf">Moreland: mapas divergentes</a>.</p>','<input id="search" placeholder="Nome, autor, categoria"><select id="status"><option value="all">Todos</option><option value="revised">Revisados</option><option value="retained">Mantidos</option></select><div id="list"></div>']
public=[{k:v for k,v in p.items() if k in ['id','name','artist','category','reviewStatus','reviewReason','beforeSamples','samples','colors','beforeColors','dataType','metrics']} for p in rows]
parts.append('<script>const rows='+json.dumps(public).replace('</','<\\/')+';const list=document.getElementById("list");function render(){list.replaceChildren();const q=document.getElementById("search").value.toLowerCase(),status=document.getElementById("status").value;for(const p of rows.filter(p=>(status==="all"||p.reviewStatus===status)&&JSON.stringify([p.name,p.artist,p.category]).toLowerCase().includes(q))){const a=document.createElement("article"),h=document.createElement("h3");h.textContent=p.name;a.append(h);const note=document.createElement("small");note.textContent=p.reviewStatus+" · "+p.category+" · "+p.colors?.length+" pontos";a.append(note);for(const key of ["beforeSamples","samples"]){if(!p[key])continue;const label=document.createElement("small");label.textContent=key==="samples"?"Depois":"Antes";a.append(label);const c=document.createElement("canvas");c.width=257;c.height=1;const ctx=c.getContext("2d"),im=ctx.createImageData(257,1);p[key].forEach((rgb,i)=>{im.data.set([...rgb,255],i*4)});ctx.putImageData(im,0,0);a.append(c);}const reason=document.createElement("p");reason.textContent=p.reviewReason;a.append(reason);list.append(a);}}document.getElementById("search").oninput=render;document.getElementById("status").onchange=render;render();</script></html>')
(out/'index.html').write_text(''.join(parts))
print('Full searchable report, CSV and', (len(rows)+79)//80,'contact sheets exported.')
