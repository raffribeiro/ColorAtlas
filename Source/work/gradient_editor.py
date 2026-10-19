from pathlib import Path
import re
p=Path(re.search("const file='([^']+)'",Path('work/check_triad.cjs').read_text())[1]);s=p.read_text()
s=s.replace('    <div class="viz-grid" data-field="vfx-ramp"></div>', '''    <section class="mp-section" aria-label="Gradient map editor">
      <div class="viz-row"><strong>GRADIENT MAP</strong><button class="btn" type="button" data-action="gradient-add">+ Color key</button><button class="btn" type="button" data-action="gradient-alpha">+ Alpha key</button><button class="btn" type="button" data-action="gradient-remove">Remove key</button><button class="btn" type="button" data-action="gradient-apply">Use Lab color</button><button class="btn" type="button" data-action="gradient-png">Export PNG</button><button class="btn" type="button" data-action="gradient-code">Copy gradient data</button></div>
      <svg class="mp-gradient cursor-interaction" role="img" aria-label="Gradient with alpha keys above and color keys below; drag keys to change position"></svg>
      <div class="viz-row"><label class="form-label" for="gradient-position">Position %</label><input id="gradient-position" class="form-range" type="range" min="0" max="100" step=".1"><output data-field="gradient-position-value"></output><label class="form-label" for="gradient-alpha-value">Alpha</label><input id="gradient-alpha-value" class="form-range" type="range" min="0" max="1" step=".01"><output data-field="gradient-alpha-output"></output></div>
      <div class="viz-row" data-field="gradient-keys"></div><span class="text-small" data-field="gradient-status" aria-live="polite"></span>
      <div class="text-small">Color keys below · alpha keys above · interpolate in linear RGB · PNG 256 × 16, sRGB encoded RGBA. For shader sampling, use Clamp wrap and no mipmaps; enable sRGB decoding for linear RGB output.</div>
    </section>
    <div class="viz-grid" data-field="vfx-ramp" hidden></div>''',1)
s=s.replace('VFX · LAB COLOR × HDR ENERGY × READABILITY','VFX · LAB COLOR × GRADIENT MAP')
s=s.replace('    <div class="text-small" data-field="vfx-engine-note">','    <div class="text-small" data-field="vfx-engine-note" hidden>')
s=s.replace('    <div class="text-small" data-field="vfx-note"','    <div class="text-small" data-field="vfx-note" hidden')
s=s.replace('<div class="text-small" data-field="vfx-energy">','<div class="text-small" data-field="vfx-energy" hidden>').replace('<div class="text-small" data-field="vfx-hdr">','<div class="text-small" data-field="vfx-hdr" hidden>').replace('data-action="vfx-copy">','data-action="vfx-copy" hidden>')
s=s.replace('class="mp-vfx-scene"','class="mp-vfx-scene" hidden',1)
for k in ['stops','core','halo']:
 s=s.replace('<div class="mp-control-group"><label class="form-label" for="mp-vfx-'+k+'">','<div class="mp-control-group" hidden><label class="form-label" for="mp-vfx-'+k+'">',1)
s=s.replace('vfxLock:true,vfx:', 'vfxLock:true,gradientColors:[{t:0,hex:"#080d26"},{t:.5,hex:"#00cfff"},{t:1,hex:"#ffffff"}],gradientAlphas:[{t:0,a:1},{t:1,a:1}],gradientSelection:{kind:"color",index:1},vfx:',1)
s=s.replace("if(typeof m.vfxLock", "if(Array.isArray(m.gradientColors)){const keys=m.gradientColors.filter(k=>Number.isFinite(k.t)&&k.t>=0&&k.t<=1&&/^#[a-f0-9]{6}$/i.test(k.hex)).slice(0,8);if(keys.length>=2)state.gradientColors=keys;}if(Array.isArray(m.gradientAlphas)){const keys=m.gradientAlphas.filter(k=>Number.isFinite(k.t)&&k.t>=0&&k.t<=1&&Number.isFinite(k.a)&&k.a>=0&&k.a<=1).slice(0,8);if(keys.length>=2)state.gradientAlphas=keys;}if(typeof m.vfxLock",1)
s=s.replace('<style>','<style>\n#munsell-picker .mp-gradient{display:block;width:100%;height:110px;touch-action:none}',1)
pos=s.index('function drawVfx(){')
s=s[:pos]+'''const gradientSvg=$('.mp-gradient');let gradientGeometry={},gradientDrag=null,gradientSkipClick=false;
function gradientSample(t){
 function interpolate(keys,value){const sorted=[...keys].sort((a,b)=>a.t-b.t);if(t<=sorted[0].t)return value(sorted[0]);if(t>=sorted[sorted.length-1].t)return value(sorted[sorted.length-1]);let i=1;while(sorted[i].t<t)i++;const a=sorted[i-1],b=sorted[i],weight=(t-a.t)/(b.t-a.t||1),av=value(a),bv=value(b);return av.map((v,j)=>v+(bv[j]-v)*weight);}
 return {rgb:interpolate(state.gradientColors,k=>k.hex.match(/[a-f0-9]{2}/gi).map(n=>decodeSRGB(parseInt(n,16)/255))),alpha:interpolate(state.gradientAlphas,k=>[k.a])[0]};
}
function gradientSelected(){const q=state.gradientSelection,list=q.kind==='color'?state.gradientColors:state.gradientAlphas;q.index=Math.max(0,Math.min(list.length-1,q.index));return list[q.index];}
function drawGradient(){
 const w=gradientSvg.clientWidth||700,left=12,width=w-24;gradientGeometry={left,width};let svg='<title>Editable RGBA gradient</title>';
 for(let x=0;x<width;x+=12)for(let y=30;y<70;y+=10)svg+=`<rect x="${left+x}" y="${y}" width="12" height="10" fill="${(Math.floor(x/12)+Math.floor((y-30)/10))%2?'var(--muted)':'var(--background)'}"/>`;
 for(let i=0;i<256;i++){const color=gradientSample(i/255);svg+=`<rect x="${left+i*width/256}" y="30" width="${width/256+.2}" height="40" fill="${rgbHex(color.rgb.map(encodeSRGB))}" fill-opacity="${color.alpha}"/>`;}
 for(const kind of ['alpha','color']){const keys=kind==='color'?state.gradientColors:state.gradientAlphas;keys.forEach((k,index)=>{const x=left+k.t*width,y=kind==='alpha'?16:84,selected=state.gradientSelection.kind===kind&&state.gradientSelection.index===index;svg+=`<g data-gradient-kind="${kind}" data-gradient-index="${index}"><circle cx="${x}" cy="${y}" r="${selected?8:6}" fill="${kind==='color'?k.hex:rgbHex([k.a,k.a,k.a])}" stroke="var(--foreground)" stroke-width="${selected?2:1}"/><rect x="${x-12}" y="${y-12}" width="24" height="24" fill="transparent"/></g>`;});}
 gradientSvg.setAttribute('viewBox',`0 0 ${w} 110`);gradientSvg.innerHTML=svg;
 const key=gradientSelected(),isAlpha=state.gradientSelection.kind==='alpha';$('#gradient-position').value=key.t*100;field('gradient-position-value').textContent=(key.t*100).toFixed(1)+'%';$('#gradient-alpha-value').disabled=!isAlpha;$('#gradient-alpha-value').value=isAlpha?key.a:1;field('gradient-alpha-output').textContent=isAlpha?key.a.toFixed(2):'—';$('[data-action="gradient-apply"]').disabled=isAlpha;
 field('gradient-keys').innerHTML=(isAlpha?state.gradientAlphas:state.gradientColors).map((k,i)=>`<button class="btn" type="button" data-gradient-select="${i}" aria-pressed="${i===state.gradientSelection.index}">${isAlpha?'Alpha '+k.a.toFixed(2):k.hex.toUpperCase()} · ${(k.t*100).toFixed(1)}%</button>`).join('');
}
function gradientChange(){drawGradient();remember();}
$('#gradient-position').addEventListener('input',()=>{gradientSelected().t=Number($('#gradient-position').value)/100;gradientChange();});
$('#gradient-alpha-value').addEventListener('input',()=>{if(state.gradientSelection.kind==='alpha')gradientSelected().a=Number($('#gradient-alpha-value').value);gradientChange();});
field('gradient-keys').addEventListener('click',e=>{const b=e.target.closest('[data-gradient-select]');if(b){state.gradientSelection.index=Number(b.dataset.gradientSelect);drawGradient();}});
function addGradientKey(kind){const keys=kind==='color'?state.gradientColors:state.gradientAlphas;if(keys.length>=8){field('gradient-status').textContent='Maximum 8 keys per channel.';return;}keys.push(kind==='color'?{t:.5,hex:vfxColors().base}:{t:.5,a:1});state.gradientSelection={kind,index:keys.length-1};gradientChange();}
$('[data-action="gradient-add"]').addEventListener('click',()=>addGradientKey('color'));
$('[data-action="gradient-alpha"]').addEventListener('click',()=>addGradientKey('alpha'));
$('[data-action="gradient-remove"]').addEventListener('click',()=>{const q=state.gradientSelection,keys=q.kind==='color'?state.gradientColors:state.gradientAlphas;if(keys.length<=2)return;keys.splice(q.index,1);q.index=Math.min(q.index,keys.length-1);gradientChange();});
$('[data-action="gradient-apply"]').addEventListener('click',()=>{if(state.gradientSelection.kind==='color'){gradientSelected().hex=vfxColors().base;gradientChange();}});
gradientSvg.addEventListener('pointerdown',e=>{const g=e.target.closest('[data-gradient-kind]');if(!g||e.button!==0)return;state.gradientSelection={kind:g.dataset.gradientKind,index:Number(g.dataset.gradientIndex)};gradientDrag=e.pointerId;gradientSvg.setPointerCapture(e.pointerId);e.preventDefault();drawGradient();});
gradientSvg.addEventListener('pointermove',e=>{if(e.pointerId!==gradientDrag)return;const box=gradientSvg.getBoundingClientRect();gradientSelected().t=Math.max(0,Math.min(1,(e.clientX-box.left-gradientGeometry.left)/gradientGeometry.width));gradientChange();});
for(const type of ['pointerup','pointercancel'])gradientSvg.addEventListener(type,e=>{if(e.pointerId!==gradientDrag)return;gradientDrag=null;if(gradientSvg.hasPointerCapture(e.pointerId))gradientSvg.releasePointerCapture(e.pointerId);});
$('[data-action="gradient-code"]').addEventListener('click',e=>{const colors=[...state.gradientColors].sort((a,b)=>a.t-b.t),alphas=[...state.gradientAlphas].sort((a,b)=>a.t-b.t);let code;
 if(state.vfxEngine==='unity'){code='var gradient = new Gradient();\\ngradient.SetKeys(\\n  new GradientColorKey[] { '+colors.map(k=>{const rgb=k.hex.match(/[a-f0-9]{2}/gi).map(n=>decodeSRGB(parseInt(n,16)/255));return `new GradientColorKey(new Color(${rgb.map(n=>n.toFixed(6)+'f').join(', ')}, 1f), ${k.t.toFixed(6)}f)`;}).join(', ')+' },\\n  new GradientAlphaKey[] { '+alphas.map(k=>`new GradientAlphaKey(${k.a.toFixed(6)}f, ${k.t.toFixed(6)}f)`).join(', ')+' }\\n);';}
 else code=JSON.stringify({colorSpace:'linear-sRGB',colors:colors.map(k=>({time:k.t,rgb:k.hex.match(/[a-f0-9]{2}/gi).map(n=>decodeSRGB(parseInt(n,16)/255))})),alphas:alphas.map(k=>({time:k.t,alpha:k.a}))},null,2);
 copyCode(code,{x:e.clientX,y:e.clientY,target:e.currentTarget});});
$('[data-action="gradient-png"]').addEventListener('click',()=>{const canvas=document.createElement('canvas');canvas.width=256;canvas.height=16;const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(256,16);for(let x=0;x<256;x++){const s=gradientSample(x/255);for(let y=0;y<16;y++){const i=(y*256+x)*4;for(let c=0;c<3;c++)pixels.data[i+c]=Math.round(encodeSRGB(s.rgb[c])*255);pixels.data[i+3]=Math.round(s.alpha*255);}}ctx.putImageData(pixels,0,0);const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='gradient-map.png';a.click();field('gradient-status').textContent='Exported 256 × 16 RGBA PNG.';});
''' +s[pos:]
s=s.replace("applyVfxLock();syncVfxAxisRanges();", "applyVfxLock();syncVfxAxisRanges();drawGradient();")
s=s.replace('drawScene();drawStrip();drawLch();if(state.system', 'drawScene();drawStrip();drawLch();if(state.system')
p.write_text(s)
q=Path('work/check_triad.cjs');t=q.read_text().replace('fitLabToSRGB,vfxAxisRange}', 'fitLabToSRGB,vfxAxisRange,gradientSample,gradientSelected}');q.write_text(t)
