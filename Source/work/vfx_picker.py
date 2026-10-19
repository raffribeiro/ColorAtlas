from pathlib import Path
import re
p=Path(re.search("const file='([^']+)'",Path('work/check_triad.cjs').read_text())[1]);s=p.read_text()
s=s.replace('<option value="munsell">Munsell</option>','<option value="munsell">Munsell</option><option value="vfx">VFX · emission designer</option>',1)
pos=s.index('  <section data-field="labcart-panel"')
s=s[:pos]+'''  <section data-field="vfx-panel" class="mp-section" hidden>
    <div class="viz-row"><strong>VFX · COLOR × ENERGY × READABILITY</strong><span class="text-small">An artist workflow · linear sRGB emission</span></div>
    <div class="mp-poster-grid text-small"><div><strong>IDENTITY</strong><p>Choose Hue and saturation for the effect’s body. Build a readable core and halo from the same color family.</p></div><div><strong>ENERGY</strong><p>Emission is linear RGB × 2^stops. +1 stop doubles energy. Stops here are relative multipliers, not calibrated nits or camera EV100.</p></div><div><strong>CONTEXT</strong><p>Check the same effect against dark and light backgrounds. Bloom is a visual sketch; renderer exposure and tone mapping will change the final result.</p></div><div><strong>HANDOFF</strong><p>HEX stores the base display color only. Copy linear HDR values for shader math; avoid applying sRGB conversion twice.</p><a href="https://docs.unity.com/en-us/engine/6000.6/manual/materials-and-shaders/graphics-color/hdr/hdr-color-picker-reference" target="_blank" rel="noopener noreferrer">Unity HDR reference</a></div></div>
    <div class="mp-layout"><svg class="mp-vfx-scene" role="img" aria-label="Emission preview on dark and light backgrounds"></svg><div class="mp-controls">
''' + ''.join(f'<div class="mp-control-group"><label class="form-label" for="mp-vfx-{k}">{label} <output data-field="vfx-{k}-value"></output></label><input id="mp-vfx-{k}" class="form-range" type="range" min="{lo}" max="{hi}" step="{step}"></div>' for k,label,lo,hi,step in [('h','Hue',0,359,1),('s','Sat %',0,100,1),('v','Base %',0,100,1),('stops','Stops',-4,10,.25),('core','Core %',0,100,1),('halo','Halo %',0,100,1)])+'''
    <div class="viz-row"><button class="btn btn-ghost" type="button" data-copy-hex data-field="vfx-hex"></button><span class="text-small">Base sRGB</span></div><div class="text-small" data-field="vfx-energy"></div><div class="text-small" data-field="vfx-hdr"></div><button class="btn" type="button" data-action="vfx-copy">Copy linear HDR RGB</button></div></div>
    <div class="viz-grid" data-field="vfx-ramp"></div>
    <div class="text-small" data-field="vfx-note" aria-live="polite"></div>
  </section>
''' +s[pos:]
s=s.replace('lchOtherChroma:[null,null]},geometry','lchOtherChroma:[null,null],vfx:{h:190,s:85,v:90,stops:3,core:70,halo:55}},geometry')
s=s.replace("['labcart','lab','munsell'].includes", "['vfx','labcart','lab','munsell'].includes")
s=s.replace("if(typeof m.paletteName", "if(m.vfx)for(const [k,lo,hi] of [['h',0,359],['s',0,100],['v',0,100],['stops',-4,10],['core',0,100],['halo',0,100]])if(Number.isFinite(m.vfx[k]))state.vfx[k]=Math.max(lo,Math.min(hi,m.vfx[k]));if(typeof m.paletteName",1)
pos=s.index('function drawSystem(){')
s=s[:pos]+'''function hsvRGB(h,s,v){s/=100;v/=100;const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;const rgb=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return rgb.map(n=>n+m);}
const decodeSRGB=n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4;
const encodeSRGB=n=>n<=.0031308?12.92*n:1.055*n**(1/2.4)-.055;
function rgbHex(rgb){return '#'+rgb.map(n=>Math.round(255*Math.max(0,Math.min(1,n))).toString(16).padStart(2,'0')).join('');}
function vfxColors(){const p=state.vfx,base=hsvRGB(p.h,p.s,p.v),energy=2**p.stops,linear=base.map(decodeSRGB),coreLinear=linear.map(n=>n+(1-n)*p.core/100);return {base:rgbHex(base),energy,linear,hdr:linear.map(n=>n*energy),coreHDR:coreLinear.map(n=>n*energy),haloHDR:linear.map(n=>n*energy*.18),coreBase:rgbHex(coreLinear.map(encodeSRGB))};}
const toneHex=rgb=>rgbHex(rgb.map(n=>encodeSRGB(n/(1+n))));
function drawVfx(){
 if(state.system!=='vfx')return;
 const p=state.vfx,c=vfxColors();for(const k of ['h','s','v','stops','core','halo']){$('#mp-vfx-'+k).value=p[k];field('vfx-'+k+'-value').textContent=p[k];}
 field('vfx-hex').textContent=c.base.toUpperCase();field('vfx-energy').textContent=`Energy ×${c.energy.toFixed(2)} · linear luminance ${(c.hdr[0]*.2126+c.hdr[1]*.7152+c.hdr[2]*.0722).toFixed(3)}`;field('vfx-hdr').textContent=`Linear HDR (${c.hdr.map(n=>n.toFixed(4)).join(', ')})`;
 const scene=$('.mp-vfx-scene'),w=scene.clientWidth||640,H=scene.clientHeight||300;scene.setAttribute('viewBox',`0 0 ${w} ${H}`);
 let out='<title>VFX emission context preview</title><desc>Two backgrounds compare the same linear emission, tone mapped using Reinhard per channel. Glow is illustrative.</desc>';
 for(let i=0;i<2;i++){const x=i*w/2,bg=i===0?[.005,.005,.005]:[.5,.5,.5],radius=Math.min(w/4-18,100),cx=x+w/4,cy=H/2;const composite=(emission,weight=1)=>toneHex(emission.map((v,j)=>bg[j]+v*weight));out+=`<defs><radialGradient id="vfx-glow-${i}"><stop offset="0" stop-color="${composite(c.haloHDR,p.halo/35)}"/><stop offset="1" stop-color="${toneHex(bg)}"/></radialGradient><radialGradient id="vfx-core-${i}"><stop offset="0" stop-color="${composite(c.coreHDR)}"/><stop offset=".35" stop-color="${composite(c.hdr)}"/><stop offset="1" stop-color="${toneHex(bg)}"/></radialGradient></defs><rect x="${x+3}" y="28" width="${w/2-6}" height="${H-56}" fill="${toneHex(bg)}"/><circle cx="${cx}" cy="${cy}" r="${radius}" fill="url(#vfx-glow-${i})"/><circle cx="${cx}" cy="${cy}" r="${radius*.5}" fill="url(#vfx-core-${i})"/><text x="${cx}" y="18" text-anchor="middle">${i===0?'Dark context':'Light context'}</text><text x="${cx}" y="${H-8}" text-anchor="middle">Same emission · ×${c.energy.toFixed(1)}</text>`;}
 scene.innerHTML=out;
 field('vfx-ramp').innerHTML=[['Core',c.coreBase,c.coreHDR],['Body',c.base,c.hdr],['Halo',c.base,c.haloHDR]].map(([name,hex,hdr])=>`<div class="mp-triad-column"><div class="mp-triad-swatch" style="background-color:${toneHex(hdr)}"></div><div class="viz-row"><strong>${name}</strong><button class="btn btn-ghost" type="button" data-copy-hex="${hex}">${hex.toUpperCase()}</button></div><span class="text-small">Linear HDR · ${hdr.map(n=>n.toFixed(3)).join(' · ')}</span></div>`).join('');
 field('vfx-note').textContent='Preview: per-channel Reinhard → sRGB, with illustrative radial glow. Ramp swatches show tone-mapped HDR; HEX codes are unexposed base colors. Values are relative emission, not physical light units.';
}
for(const k of ['h','s','v','stops','core','halo'])$('#mp-vfx-'+k).addEventListener('input',()=>{state.vfx[k]=Number($('#mp-vfx-'+k).value);drawVfx();remember();});
$('[data-action="vfx-copy"]').addEventListener('click',e=>copyCode(vfxColors().hdr.map(n=>n.toFixed(6)).join(', '),{x:e.clientX,y:e.clientY,target:e.currentTarget}));
''' +s[pos:]
s=s.replace("$('#mp-system').value=state.system;", "$('#mp-system').value=state.system;field('vfx-panel').hidden=state.system!=='vfx';drawVfx();",1)
s=s.replace('drawLch();drawLabPlane()}).observe(root)','drawLch();drawLabPlane();drawVfx()}).observe(root)')
s=s.replace('<style>','<style>\n#munsell-picker .mp-vfx-scene{display:block;width:100%;height:300px}',1)
p.write_text(s)
q=Path('work/check_triad.cjs');t=q.read_text().replace('lchColors,drawSystem}', 'lchColors,drawSystem,vfxColors,hsvRGB}');q.write_text(t)
