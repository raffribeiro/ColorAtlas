from pathlib import Path
from PIL import Image
import base64,re,sys,shutil
asset=Path('outputs/explosion-transparent.png');shutil.copyfile(sys.argv[1],asset)
im=Image.open(asset).convert('RGBA');print('RGBA ranges:',im.getextrema());assert im.getextrema()[3][0]==0 and im.getextrema()[3][1]==255
im.save('work/explosion-transparent.webp',quality=85,method=6)
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html');s=p.read_text();encoded=base64.b64encode(Path('work/explosion-transparent.webp').read_bytes()).decode();s,n=re.subn(r"image.src='data:image/[^;]+;base64,[^']+'", "image.src='data:image/webp;base64,"+encoded+"'",s);assert n==1
s=s.replace('let explosionPixels=null;','let explosionPixels=null,explosionAlpha=null;')
s=s.replace('pixels.data.set(lut[explosionPixels[i]],i*4);','const color=lut[explosionPixels[i]];pixels.data.set([color[0],color[1],color[2],Math.round(color[3]*explosionAlpha[i]/255)],i*4);')
s=s.replace('low=Math.min(low,gray[i]);high=Math.max(high,gray[i]);','if(pixels.data[offset+3]>0){low=Math.min(low,gray[i]);high=Math.max(high,gray[i]);}')
s=s.replace('explosionPixels=new Uint8Array(gray.length);','explosionPixels=new Uint8Array(gray.length);explosionAlpha=new Uint8Array(gray.length);')
s=s.replace('explosionPixels[i]=v;pixels.data.set([v,v,v,255],i*4);','explosionPixels[i]=v;explosionAlpha[i]=pixels.data[i*4+3];pixels.data.set([v,v,v,explosionAlpha[i]],i*4);')
s=s.replace('Grayscale reference · full 0–255 range','Grayscale cutout · neutral black backdrop').replace('Live gradient map</figcaption>','Live gradient map · neutral black backdrop</figcaption>')
p.write_text(s);print('Fragment bytes:',p.stat().st_size)
