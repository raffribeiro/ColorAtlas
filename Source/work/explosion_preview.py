from pathlib import Path
import base64,sys
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
s=p.read_text()
asset=Path(sys.argv[1]);encoded=base64.b64encode(asset.read_bytes()).decode()
s=s.replace('      <svg class="mp-gradient', '      <div class="mp-explosion-previews"><figure><figcaption>Grayscale reference · full 0–255 range</figcaption><canvas data-field="explosion-gray" width="512" height="512" aria-label="Grayscale explosion reference"></canvas></figure><figure><figcaption>Live gradient map</figcaption><canvas data-field="explosion-mapped" width="512" height="512" aria-label="Explosion with current gradient applied"></canvas></figure></div>\n      <svg class="mp-gradient',1)
s=s.replace('<style>','<style>\n.mp-explosion-previews{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0}.mp-explosion-previews figure{margin:0}.mp-explosion-previews figcaption{margin-bottom:8px}.mp-explosion-previews canvas{display:block;width:100%;max-height:400px;object-fit:contain;background:#000}@media(max-width:600px){.mp-explosion-previews{grid-template-columns:1fr}}\n',1)
code='''let explosionPixels=null;
function drawExplosionMap(){if(!explosionPixels)return;const canvas=field('explosion-mapped'),ctx=canvas.getContext('2d'),pixels=ctx.createImageData(512,512),lut=Array.from({length:256},(_,v)=>{const sample=gradientSample(v/255);return [...sample.rgb.map(c=>Math.round(encodeSRGB(c)*255)),Math.round(sample.alpha*255)];});for(let i=0;i<explosionPixels.length;i++){pixels.data.set(lut[explosionPixels[i]],i*4);}ctx.putImageData(pixels,0,0);}
function initializeExplosion(){const image=new Image();image.onload=()=>{const canvas=field('explosion-gray'),ctx=canvas.getContext('2d');ctx.drawImage(image,0,0,512,512);const pixels=ctx.getImageData(0,0,512,512);let low=255,high=0;const gray=new Float32Array(512*512);for(let i=0;i<gray.length;i++){const offset=i*4;gray[i]=.2126*pixels.data[offset]+.7152*pixels.data[offset+1]+.0722*pixels.data[offset+2];low=Math.min(low,gray[i]);high=Math.max(high,gray[i]);}explosionPixels=new Uint8Array(gray.length);for(let i=0;i<gray.length;i++){const v=Math.round((gray[i]-low)*255/(high-low||1));explosionPixels[i]=v;pixels.data.set([v,v,v,255],i*4);}ctx.putImageData(pixels,0,0);drawExplosionMap();};image.src='DATA_IMAGE';}
'''.replace('DATA_IMAGE','data:image/png;base64,'+encoded)
s=s.replace('function gradientSample(t){',code+'\nfunction gradientSample(t){')
s=s.replace('gradientSvg.innerHTML=svg;','gradientSvg.innerHTML=svg;drawExplosionMap();')
s=s.replace('const savedGradient=','initializeExplosion();\nconst savedGradient=')
p.write_text(s)
