from pathlib import Path
import re
p=Path(re.search("const file='([^']+)'",Path('work/check_triad.cjs').read_text())[1]);s=p.read_text()
a=s.index('  <section data-field="lab-panel"');b=s.index('  <div data-field="munsell-panel">',a)
s=s[:a]+'''  <section data-field="lab-panel" class="mp-section" hidden>
    <div class="viz-row"><strong>CIELCh · THE CYLINDRICAL VIEW OF LAB</strong><span class="text-small">D65 reference · 2° observer</span></div>
    <div class="mp-poster-grid text-small"><div><strong>SAME SPACE, NEW COORDINATES</strong><p>L* stays vertical. C* = √(a*² + b*²) moves outward. h° = atan2(b*, a*) wraps around the axis.</p></div><div><strong>A FAMILIAR SOLID</strong><p>The shape resembles Munsell, but its coordinates are different. CIELCh hue degrees are Lab angles, not Munsell hue steps.</p></div><div><strong>THE DISPLAY BOUNDARY</strong><p>These layers sample colors inside sRGB at L* intervals of 10. The visible edge is a display gamut boundary, not the full extent of CIELAB.</p></div><div><strong>EXPLORE</strong><p>Drag the axis for L*, click the disk for h° and C*, or use the sliders. A triad uses h°, h° + 120°, h° + 240°.</p></div></div>
    <div class="mp-layout"><svg class="mp-lch-scene cursor-interaction" role="img" aria-label="CIELCh solid: L star vertically, hue around the axis, Chroma outward"></svg><div class="mp-controls">
    <div class="mp-control-group"><label class="form-label" for="mp-lab-l">L* <output data-field="lab-l-value"></output></label><input id="mp-lab-l" class="form-range" type="range" min="0" max="100" step="1"></div>
    <div class="mp-control-group"><label class="form-label" for="mp-lch-h">h° <output data-field="lch-h-value"></output></label><input id="mp-lch-h" class="form-range" type="range" min="0" max="359" step="1"></div>
    <div class="mp-control-group"><label class="form-label" for="mp-lch-c">C* <output data-field="lch-c-value"></output></label><input id="mp-lch-c" class="form-range" type="range" min="0" max="150" step="1"></div>
    <div class="mp-lab-preview" data-field="lab-preview" role="img" aria-label="CIELCh preview"></div>
    <button class="btn btn-ghost" type="button" data-copy-hex data-field="lab-hex"></button><span data-field="lab-gamut" class="text-small" aria-live="polite"></span>
    <span data-field="lab-notation" class="text-small"></span>
    </div></div>
    <label class="form-check form-switch"><input id="mp-lch-triad" class="form-check-input" type="checkbox" checked><span class="form-check-label">CIELCh triad</span></label>
    <div class="viz-grid" data-field="lch-triad-colors"></div>
    <div class="text-small">□ Current color · × Outside sRGB · faded layers show the sampled sRGB volume</div>
  </section>
''' +s[b:]
s=s.replace('CIELAB · D65</option>','CIELCh / Lab · D65</option>')
s=s.replace('lab:{l:50,a:0,b:0}},geometry','lab:{l:50,a:0,b:0},lchHue:0,lchTriad:true,lchOtherChroma:[null,null]},geometry')
s=s.replace('function drawSystem(){', '''function toLch(){const c=Math.hypot(state.lab.a,state.lab.b);return {l:state.lab.l,c,h:c<1e-8?state.lchHue:((Math.atan2(state.lab.b,state.lab.a)*180/Math.PI)+360)%360};}
function setLch(l,c,h){state.lchHue=h;state.lab={l,a:c*Math.cos(h*Math.PI/180),b:c*Math.sin(h*Math.PI/180)};}
function lchColors(){const q=toLch();return [0,120,240].map((offset,i)=>{const h=(q.h+offset)%360,c=i===0?q.c:(state.lchOtherChroma[i-1]??q.c);return {l:q.l,c,h,...labColor(q.l,c*Math.cos(h*Math.PI/180),c*Math.sin(h*Math.PI/180))};});}
const lchScene=$('.mp-lch-scene');let lchGeometry={},lchDrag=null,lchSkipClick=false,lchSignature='';
const lchLayerCache=new Map();
function drawLch(){
 if(state.system!=='lab')return;
 const w=lchScene.clientWidth||640,H=lchScene.clientHeight||390,cx=w/2,base=H-48,z=(H-125)/100,unit=Math.min((w/2-28)/150,2),q=toLch(),cy=base-q.l*z;
 lchScene.setAttribute('viewBox',`0 0 ${w} ${H}`);lchGeometry={w,H,cx,base,z,unit,cy};
 const layer=(l,active)=>{
  const key=[w,H,l,active?q.h.toFixed(2):'ghost'].join(':');if(!active&&lchLayerCache.has(key))return lchLayerCache.get(key);
  let out=`<g data-lch-layer="${l}" pointer-events="none">`,yy=base-l*z;
  for(let h=0;h<360;h+=15)for(let c=10;c<=150;c+=10){const col=labColor(l,c*Math.cos(h*Math.PI/180),c*Math.sin(h*Math.PI/180));if(col.outside)continue;
  const poly=points(cx,yy,(c+5)*unit,h-7.5,h+7.5).concat(points(cx,yy,Math.max(0,c-5)*unit,h+7.5,h-7.5));out+=`<path d="${dpath(poly)}" fill="${col.hex}" opacity="${active?(Math.abs(((h-q.h+540)%360)-180)<8?.5:.16):.035}" stroke="var(--background)" stroke-width=".3"/>`;}
  out+='</g>';if(!active)lchLayerCache.set(key,out);return out;
 };
 let out='<title>CIELCh solid inside sRGB</title><desc>Drag the neutral axis for lightness; click the active slice for hue and chroma.</desc>';
 for(let l=10;l<=90;l+=10)if(l!==q.l)out+=layer(l,false);
 for(let l=0;l<=100;l+=10){const y=base-l*z-z*5;out+=`<rect x="${cx-8}" y="${y}" width="16" height="${z*10}" fill="${labColor(l,0,0).hex}"/>`;if(l%20===0)out+=`<text x="${cx+17}" y="${y+10}">${l}</text>`;}
 out+=layer(q.l,true);
 const colors=state.lchTriad?lchColors():[lchColors()[0]],pts=colors.map(s=>({...s,x:cx+s.c*unit*Math.cos(s.h*Math.PI/180),y:cy-.38*s.c*unit*Math.sin(s.h*Math.PI/180)}));
 if(pts.length===3)out+=`<path d="${dpath(pts.map(p=>[p.x,p.y]))}" fill="none" stroke="var(--foreground)" stroke-width="1.25"/>`;
 for(const p of pts)out+=`<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="var(--foreground)" stroke-width="1"/><circle cx="${p.x}" cy="${p.y}" r="7" fill="${p.hex}" stroke="var(--foreground)" stroke-width="2"/>`;
 for(const h of [0,90,180,270]){const rad=h*Math.PI/180;out+=`<text x="${cx+155*unit*Math.cos(rad)}" y="${cy-.38*155*unit*Math.sin(rad)}" text-anchor="middle">${h}°</text>`;}
 out+=`<rect x="${cx-13}" y="${cy-5}" width="26" height="10" rx="3" fill="var(--card)" stroke="var(--foreground)"/><text x="${cx}" y="20" text-anchor="middle">L* ${Math.round(q.l)} · drag the central axis</text><text x="${cx}" y="${H-10}" text-anchor="middle">C* increases away from the axis</text>`;lchScene.innerHTML=out;
 const panel=field('lch-triad-colors');panel.hidden=!state.lchTriad;$('#mp-lch-triad').checked=state.lchTriad;
 if(lchSignature!=='ready'){lchSignature='ready';panel.innerHTML=[0,1,2].map(i=>`<div class="mp-triad-column"><div class="mp-triad-swatch" data-lch-swatch="${i}"></div><div class="viz-row"><span data-lch-label="${i}"></span><button class="btn btn-ghost" type="button" data-copy-hex data-lch-hex="${i}"></button></div><label class="form-label" for="lch-triad-${i}">C* <output data-lch-c-value="${i}"></output></label><input id="lch-triad-${i}" class="form-range" type="range" min="0" max="150" step="1" data-lch-c="${i}"></div>`).join('');}
 lchColors().forEach((s,i)=>{$(`[data-lch-swatch="${i}"]`).style.backgroundColor=s.hex;$(`[data-lch-label="${i}"]`).textContent=`${i===0?'Base':'Color '+(i+1)} · h° ${Math.round(s.h)}${s.outside?' · × Outside sRGB':''}`;$(`[data-lch-hex="${i}"]`).textContent=s.hex.toUpperCase();$(`[data-lch-c="${i}"]`).value=Math.round(s.c);$(`[data-lch-c-value="${i}"]`).textContent=Math.round(s.c);});
}
function drawSystem(){''')
s=s.replace("for(const k of ['l','a','b']){$('#mp-lab-'+k).value=state.lab[k];field('lab-'+k+'-value').textContent=state.lab[k];}", "const q=toLch();$('#mp-lab-l').value=q.l;field('lab-l-value').textContent=Math.round(q.l);$('#mp-lch-h').value=Math.round(q.h)%360;field('lch-h-value').textContent=Math.round(q.h)%360;$('#mp-lch-c').value=Math.round(q.c);field('lch-c-value').textContent=Math.round(q.c);drawLch();")
s=s.replace("for(const k of ['l','a','b'])$('#mp-lab-'+k).addEventListener('input',()=>{state.lab[k]=Number($('#mp-lab-'+k).value);drawSystem();remember();});", '''$('#mp-lab-l').addEventListener('input',()=>{state.lab.l=Number($('#mp-lab-l').value);drawSystem();remember();});
for(const k of ['h','c'])$('#mp-lch-'+k).addEventListener('input',()=>{const q=toLch();setLch(q.l,k==='c'?Number($('#mp-lch-c').value):q.c,k==='h'?Number($('#mp-lch-h').value):q.h);drawSystem();remember();});
$('#mp-lch-triad').addEventListener('change',()=>{state.lchTriad=$('#mp-lch-triad').checked;drawSystem();remember();});
field('lch-triad-colors').addEventListener('input',e=>{const target=e.target.closest('[data-lch-c]');if(!target)return;const i=Number(target.dataset.lchC),c=Number(target.value),q=toLch();if(i===0)setLch(q.l,c,q.h);else state.lchOtherChroma[i-1]=c;drawSystem();remember();});
function moveLchValue(e){const box=lchScene.getBoundingClientRect();state.lab.l=Math.max(0,Math.min(100,Math.round((lchGeometry.base-(e.clientY-box.top))/lchGeometry.z)));drawSystem();remember();}
lchScene.addEventListener('pointerdown',e=>{if(e.button!==0)return;const box=lchScene.getBoundingClientRect();if(Math.abs(e.clientX-box.left-lchGeometry.cx)>22)return;lchDrag=e.pointerId;lchSkipClick=true;lchScene.setPointerCapture(e.pointerId);e.preventDefault();moveLchValue(e);});
lchScene.addEventListener('pointermove',e=>{if(e.pointerId===lchDrag){e.preventDefault();moveLchValue(e);}});
for(const type of ['pointerup','pointercancel'])lchScene.addEventListener(type,e=>{if(e.pointerId!==lchDrag)return;if(type==='pointerup')moveLchValue(e);lchDrag=null;if(lchScene.hasPointerCapture(e.pointerId))lchScene.releasePointerCapture(e.pointerId);});
lchScene.addEventListener('click',e=>{if(lchSkipClick){lchSkipClick=false;return;}const box=lchScene.getBoundingClientRect(),dx=e.clientX-box.left-lchGeometry.cx,dy=(lchGeometry.cy-(e.clientY-box.top))/.38,c=Math.hypot(dx,dy)/lchGeometry.unit;if(c>155)return;const h=(Math.atan2(dy,dx)*180/Math.PI+360)%360;setLch(state.lab.l,Math.min(150,Math.round(c)),Math.round(h)%360);drawSystem();remember();});''')
s=s.replace('drawScene();drawStrip()}).observe(root)', 'drawScene();drawStrip();drawLch()}).observe(root)')
s=s.replace('.mp-lab-preview{height:160px;width:100%}', '.mp-lab-preview{height:48px;width:100%}\n#munsell-picker .mp-lch-scene{display:block;width:100%;height:390px;touch-action:none}')
# Keep valid cylindrical coordinates and independent triad chromas across reopening.
s=s.replace("if(typeof m.paletteName", "if(Number.isFinite(m.lchHue))state.lchHue=((m.lchHue%360)+360)%360;if(typeof m.lchTriad==='boolean')state.lchTriad=m.lchTriad;if(Array.isArray(m.lchOtherChroma))state.lchOtherChroma=[0,1].map(i=>Number.isFinite(m.lchOtherChroma[i])?Math.max(0,Math.min(150,m.lchOtherChroma[i])):null);if(typeof m.paletteName",1)
s=s.replace('Math.max(-128,Math.min(127,m.lab.a))','Math.max(-150,Math.min(150,m.lab.a))').replace('Math.max(-128,Math.min(127,m.lab.b))','Math.max(-150,Math.min(150,m.lab.b))')
p.write_text(s)
q=Path('work/check_triad.cjs');t=q.read_text().replace('labColor,rgbToLab}', 'labColor,rgbToLab,toLch,setLch,lchColors,drawSystem}');q.write_text(t)
