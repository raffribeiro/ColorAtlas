from pathlib import Path
import re
p=Path(re.search("const file='([^']+)'",Path('work/check_triad.cjs').read_text())[1]);s=p.read_text()
s=s.replace('<option value="lab">CIELCh / Lab · D65</option>', '<option value="labcart">CIELAB · a* / b* plane · D65</option><option value="lab">CIELCh · cylindrical Lab · D65</option>')
pos=s.index('  <section data-field="lab-panel"')
s=s[:pos]+'''  <section data-field="labcart-panel" class="mp-section" hidden>
    <div class="viz-row"><strong>CIELAB · A PLANE THROUGH COLOR SPACE</strong><span class="text-small">D65 reference · 2° observer</span></div>
    <div class="mp-poster-grid text-small"><div><strong>L* · LIGHTNESS</strong><p>Each plane is a slice at one L*. Move from black toward white without changing a* or b*.</p></div><div><strong>a* · GREEN TO RED</strong><p>Negative a* points toward green; positive a* toward red. This is a Cartesian coordinate, not a hue angle.</p></div><div><strong>b* · BLUE TO YELLOW</strong><p>Negative b* points toward blue; positive b* toward yellow. The center a* = b* = 0 is neutral.</p></div><div><strong>THE sRGB FOOTPRINT</strong><p>Colored cells show displayable samples. The blank area is outside sRGB, not outside Lab. CIELCh expresses this same plane using radius and angle.</p></div></div>
    <div class="mp-layout"><svg class="mp-lab-plane cursor-interaction" role="img" aria-label="CIELAB a star horizontal and b star vertical at selected lightness"></svg><div class="mp-controls">
      <div class="mp-control-group"><label class="form-label" for="mp-cart-l">L* <output data-field="cart-l-value"></output></label><input id="mp-cart-l" class="form-range" type="range" min="0" max="100" step="1"></div>
      <div class="mp-control-group"><label class="form-label" for="mp-cart-a">a* <output data-field="cart-a-value"></output></label><input id="mp-cart-a" class="form-range" type="range" min="-128" max="128" step="1"></div>
      <div class="mp-control-group"><label class="form-label" for="mp-cart-b">b* <output data-field="cart-b-value"></output></label><input id="mp-cart-b" class="form-range" type="range" min="-128" max="128" step="1"></div>
      <div class="mp-lab-preview" data-field="cart-preview" role="img" aria-label="Selected Lab color"></div><button class="btn btn-ghost" type="button" data-copy-hex data-field="cart-hex"></button><div class="text-small" data-field="cart-gamut" aria-live="polite"></div><div class="text-small" data-field="cart-lch"></div>
    </div></div>
    <div class="text-small">Click the plane to select a* and b*. ○ Selection · × Outside sRGB · sampled at 4-unit intervals.</div>
  </section>
''' +s[pos:]
s=s.replace("m.system==='lab'||m.system==='munsell'", "['labcart','lab','munsell'].includes(m.system)")
s=s.replace("field('munsell-panel').hidden=state.system==='lab';", "field('munsell-panel').hidden=state.system!=='munsell';field('labcart-panel').hidden=state.system!=='labcart';drawLabPlane();")
s=s.replace("if(state.system==='lab')state.lab=rgbToLab", "if(state.system==='lab'||state.system==='labcart')state.lab=rgbToLab")
pos=s.index('function drawSystem(){')
s=s[:pos]+'''const labPlane=$('.mp-lab-plane');let planeGeometry={};
function drawLabPlane(){
 if(state.system!=='labcart')return;
 const w=labPlane.clientWidth||640,H=labPlane.clientHeight||390,size=Math.min(w-96,H-88),x=(w-size)/2,y=34,scale=size/256;
 planeGeometry={x,y,size,scale};labPlane.setAttribute('viewBox',`0 0 ${w} ${H}`);
 let svg=`<title>CIELAB a*/b* at L* ${state.lab.l}</title><desc>Horizontal: green to red. Vertical: blue to yellow. Colored cells are inside sRGB. Blank cells are outside sRGB.</desc><rect x="${x}" y="${y}" width="${size}" height="${size}" fill="var(--muted)" fill-opacity=".2" stroke="var(--border)"/>`;
 for(let a=-126;a<=126;a+=4)for(let b=-126;b<=126;b+=4){const color=labColor(state.lab.l,a,b);if(color.outside)continue;svg+=`<rect x="${x+(a+126)*scale}" y="${y+(126-b)*scale}" width="${4*scale+.2}" height="${4*scale+.2}" fill="${color.hex}"/>`;}
 const zeroX=x+128*scale,zeroY=y+128*scale;
 svg+=`<path d="M${zeroX},${y} V${y+size} M${x},${zeroY} H${x+size}" stroke="var(--foreground)" stroke-width=".7" stroke-opacity=".5" fill="none"/>`;
 for(const tick of [-128,-64,0,64,128]){const xx=x+(tick+128)*scale,yy=y+(128-tick)*scale;svg+=`<text x="${xx}" y="${y+size+18}" text-anchor="middle">${tick}</text><text x="${x-8}" y="${yy+4}" text-anchor="end">${tick}</text>`;}
 svg+=`<text x="${w/2}" y="17" text-anchor="middle">L* ${state.lab.l} · a* / b* slice</text><text x="${w/2}" y="${y+size+39}" text-anchor="middle">a* · green ← neutral → red</text><text x="${x-43}" y="${y+size/2}" transform="rotate(-90 ${x-43} ${y+size/2})" text-anchor="middle">b* · blue ← neutral → yellow</text>`;
 const col=labColor(state.lab.l,state.lab.a,state.lab.b),px=x+(state.lab.a+128)*scale,py=y+(128-state.lab.b)*scale;
 svg+=`<circle cx="${px}" cy="${py}" r="7" fill="${col.hex}" stroke="var(--foreground)" stroke-width="2"/><circle cx="${px}" cy="${py}" r="10" fill="none" stroke="var(--background)" stroke-width="1"/>${col.outside?`<text x="${px}" y="${py-14}" text-anchor="middle">×</text>`:''}`;labPlane.innerHTML=svg;
 for(const k of ['l','a','b']){$('#mp-cart-'+k).value=state.lab[k];field('cart-'+k+'-value').textContent=state.lab[k].toFixed(1);}
 field('cart-preview').style.backgroundColor=col.hex;field('cart-hex').textContent=col.hex.toUpperCase();field('cart-gamut').textContent=col.outside?'× Outside sRGB — clipped preview':'Inside sRGB';const q=toLch();field('cart-lch').textContent=`Same color in LCh: L* ${q.l.toFixed(1)} · C* ${q.c.toFixed(1)} · h° ${q.h.toFixed(1)}`;
}
for(const k of ['l','a','b'])$('#mp-cart-'+k).addEventListener('input',()=>{state.lab[k]=Number($('#mp-cart-'+k).value);drawSystem();remember();});
labPlane.addEventListener('click',e=>{const box=labPlane.getBoundingClientRect(),g=planeGeometry,xx=e.clientX-box.left,yy=e.clientY-box.top;if(xx<g.x||xx>g.x+g.size||yy<g.y||yy>g.y+g.size)return;state.lab.a=Math.round((xx-g.x)/g.scale-128);state.lab.b=Math.round(128-(yy-g.y)/g.scale);drawSystem();remember();});
''' +s[pos:]
s=s.replace('drawScene();drawStrip();drawLch()}).observe(root)', 'drawScene();drawStrip();drawLch();drawLabPlane()}).observe(root)')
s=s.replace('<style>','<style>\n#munsell-picker .mp-lab-plane{display:block;width:100%;height:390px;touch-action:manipulation}',1)
# Switching between Lab coordinate views preserves the same color.
s=s.replace("state.system=$('#mp-system').value;if(state.system==='lab'||state.system==='labcart')state.lab=rgbToLab(swatch(state.h,state.v,state.c)[0]);", "const previous=state.system;state.system=$('#mp-system').value;if(previous==='munsell'&&state.system!=='munsell')state.lab=rgbToLab(swatch(state.h,state.v,state.c)[0]);")
p.write_text(s)
