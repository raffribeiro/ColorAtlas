from pathlib import Path
import re
p=Path(re.search("const file='([^']+)'",Path('work/check_triad.cjs').read_text())[1]);s=p.read_text()
s=s.replace('  <h2>Seletor Munsell</h2>', '''  <div class="viz-row"><h2>Seletor de cores</h2><label class="form-label" for="mp-system">Sistema</label><select id="mp-system" class="form-select"><option value="munsell">Munsell</option><option value="lab">CIELAB · D65</option></select></div>
  <section data-field="lab-panel" class="mp-section" hidden>
    <div class="viz-row"><strong>CIELAB</strong><span class="text-small">Referência D65 · observador 2°</span></div>
    <div class="mp-control-group"><label class="form-label" for="mp-lab-l">L* <output data-field="lab-l-value"></output></label><input id="mp-lab-l" class="form-range" type="range" min="0" max="100" step="1"></div>
    <div class="mp-control-group"><label class="form-label" for="mp-lab-a">a* <output data-field="lab-a-value"></output></label><input id="mp-lab-a" class="form-range" type="range" min="-128" max="127" step="1"></div>
    <div class="mp-control-group"><label class="form-label" for="mp-lab-b">b* <output data-field="lab-b-value"></output></label><input id="mp-lab-b" class="form-range" type="range" min="-128" max="127" step="1"></div>
    <div class="mp-lab-preview" data-field="lab-preview" role="img" aria-label="Prévia CIELAB"></div>
    <div class="viz-row"><span data-field="lab-notation"></span><button class="btn btn-ghost" type="button" data-copy-hex data-field="lab-hex"></button><span data-field="lab-gamut" class="text-small" aria-live="polite"></span></div>
    <div class="text-small">L*: claro ↔ escuro · a*: verde ↔ vermelho · b*: azul ↔ amarelo. Valores fora de sRGB têm a prévia limitada à tela.</div>
  </section>
  <div data-field="munsell-panel">''',1)
s=s.replace('  <script type="application/json" id="mp-data">','  </div>\n  <script type="application/json" id="mp-data">',1)
s=s.replace('<style>','<style>\n#munsell-picker [data-field="munsell-panel"]{display:flex;flex-direction:column;gap:8px}\n#munsell-picker .mp-lab-preview{height:160px;width:100%}',1)
s=s.replace('paletteSelected:-1},geometry', 'paletteSelected:-1,system:"munsell",lab:{l:50,a:0,b:0}},geometry')
s=s.replace('if(typeof m.paletteName', "if(m.system==='lab'||m.system==='munsell')state.system=m.system;if(m.lab&&['l','a','b'].every(k=>Number.isFinite(m.lab[k])))state.lab={l:Math.max(0,Math.min(100,m.lab.l)),a:Math.max(-128,Math.min(127,m.lab.a)),b:Math.max(-128,Math.min(127,m.lab.b))};if(typeof m.paletteName",1)
pos=s.index('function update(save=false){')
s=s[:pos]+'''function labColor(l,a,b){
 const fy=(l+16)/116,fx=fy+a/500,fz=fy-b/200,inv=t=>t>6/29?t*t*t:3*(6/29)**2*(t-4/29);
 const x=.95047*inv(fx),y=inv(fy),z=1.08883*inv(fz);
 const linear=[3.2404542*x-1.5371385*y-.4985314*z,-.969266*x+1.8760108*y+.041556*z,.0556434*x-.2040259*y+1.0572252*z];
 const outside=linear.some(v=>v<-.00001||v>1.00001),channels=linear.map(v=>{v=Math.max(0,Math.min(1,v));return Math.round(255*(v<=.0031308?12.92*v:1.055*v**(1/2.4)-.055));});
 return {hex:'#'+channels.map(v=>v.toString(16).padStart(2,'0')).join(''),outside};
}
function rgbToLab(hex){
 const [r,g,b]=hex.match(/[a-f0-9]{2}/gi).map(s=>{const v=parseInt(s,16)/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});
 const f=t=>t>(6/29)**3?Math.cbrt(t):t/(3*(6/29)**2)+4/29;
 const x=f((.4124564*r+.3575761*g+.1804375*b)/.95047),y=f(.2126729*r+.7151522*g+.072175*b),z=f((.0193339*r+.119192*g+.9503041*b)/1.08883);
 return {l:Math.round(116*y-16),a:Math.round(500*(x-y)),b:Math.round(200*(y-z))};
}
function drawSystem(){
 $('#mp-system').value=state.system;field('lab-panel').hidden=state.system!=='lab';field('munsell-panel').hidden=state.system==='lab';
 const col=labColor(state.lab.l,state.lab.a,state.lab.b);
 for(const k of ['l','a','b']){$('#mp-lab-'+k).value=state.lab[k];field('lab-'+k+'-value').textContent=state.lab[k];}
 field('lab-preview').style.backgroundColor=col.hex;field('lab-hex').textContent=col.hex.toUpperCase();field('lab-notation').textContent=`L* ${state.lab.l} · a* ${state.lab.a} · b* ${state.lab.b}`;field('lab-gamut').textContent=col.outside?'× Fora de sRGB — prévia limitada':'Dentro de sRGB';
}
$('#mp-system').addEventListener('change',()=>{state.system=$('#mp-system').value;if(state.system==='lab')state.lab=rgbToLab(swatch(state.h,state.v,state.c)[0]);update(true);});
for(const k of ['l','a','b'])$('#mp-lab-'+k).addEventListener('input',()=>{state.lab[k]=Number($('#mp-lab-'+k).value);drawSystem();remember();});
''' +s[pos:]
s=s.replace('function update(save=false){','function update(save=false){\n drawSystem();',1)
p.write_text(s)
q=Path('work/check_triad.cjs');t=q.read_text().replace('{state,triadColors,update}', '{state,triadColors,update,labColor,rgbToLab}');q.write_text(t)
