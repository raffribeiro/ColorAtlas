from pathlib import Path
import re
p=Path(re.search("const file='([^']+)'",Path('work/check_triad.cjs').read_text())[1]);s=p.read_text()
s=s.replace('Choose Hue and saturation for the effect’s body. Build a readable core and halo from the same color family.', 'Choose L*, a* and b* for the effect’s body. Core moves toward neutral white in Lab; HDR energy is applied separately in linear RGB.')
s=s.replace('<strong>VFX · COLOR × ENERGY × READABILITY</strong>', '<strong>VFX · LAB COLOR × HDR ENERGY × READABILITY</strong>')
for old,new,label,lo,hi in [('h','l','L*',0,100),('s','a','a*',-128,127),('v','b','b*',-128,127)]:
 pattern=r'<div class="mp-control-group"><label class="form-label" for="mp-vfx-'+old+r'">.*?</div>'
 replacement=f'<div class="mp-control-group"><label class="form-label" for="mp-vfx-{new}">{label} <output data-field="vfx-{new}-value"></output></label><input id="mp-vfx-{new}" class="form-range" type="range" min="{lo}" max="{hi}" step="1"></div>'
 s,n=re.subn(pattern,replacement,s,count=1);assert n==1
s=s.replace('vfx:{h:190,s:85,v:90,stops:3,core:70,halo:55}', 'vfx:{l:65,a:-25,b:-30,stops:3,core:70,halo:55}')
s=s.replace("if(m.vfx)for(const [k,lo,hi] of [['h',0,359],['s',0,100],['v',0,100]", "if(m.vfx&&Number.isFinite(m.vfx.h)&&!Number.isFinite(m.vfx.l)){const migrated=rgbToLab(rgbHex(hsvRGB(m.vfx.h,m.vfx.s,m.vfx.v)));Object.assign(state.vfx,migrated);}if(m.vfx)for(const [k,lo,hi] of [['l',0,100],['a',-128,127],['b',-128,127]")
s=s.replace("['h','s','v','stops','core','halo']", "['l','a','b','stops','core','halo']")
a=s.index('function vfxColors(){');b=s.index('const toneHex=',a)
s=s[:a]+'''function labLinearRGB(l,a,b){const fy=(l+16)/116,fx=fy+a/500,fz=fy-b/200,inv=t=>t>6/29?t*t*t:3*(6/29)**2*(t-4/29);const x=.95047*inv(fx),y=inv(fy),z=1.08883*inv(fz);return [3.2404542*x-1.5371385*y-.4985314*z,-.969266*x+1.8760108*y+.041556*z,.0556434*x-.2040259*y+1.0572252*z];}
function vfxColors(){
 const p=state.vfx,raw=labLinearRGB(p.l,p.a,p.b),linear=raw.map(n=>Math.max(0,Math.min(1,n))),energy=2**p.stops,t=p.core/100;
 const coreLab={l:p.l+(100-p.l)*t,a:p.a*(1-t),b:p.b*(1-t)},coreLinear=labLinearRGB(coreLab.l,coreLab.a,coreLab.b).map(n=>Math.max(0,Math.min(1,n)));
 return {base:rgbHex(linear.map(encodeSRGB)),energy,linear,hdr:linear.map(n=>n*energy),coreHDR:coreLinear.map(n=>n*energy),haloHDR:linear.map(n=>n*energy*.18),coreBase:rgbHex(coreLinear.map(encodeSRGB)),outside:raw.some(n=>n<-.00001||n>1.00001)};
}
''' +s[b:]
s=s.replace("field('vfx-note').textContent='Preview:", "field('vfx-note').textContent=(c.outside?'× Lab base is outside sRGB: linear RGB is clipped before emission. ':'Lab base is inside sRGB. ')+`D65 · L* ${p.l}, a* ${p.a}, b* ${p.b}. `+'Preview:")
p.write_text(s)
q=Path('work/check_triad.cjs');t=q.read_text();t=t[:t.index("picker.state.system='vfx';picker.state.vfx=")];q.write_text(t)
