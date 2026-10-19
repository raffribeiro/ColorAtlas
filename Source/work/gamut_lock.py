from pathlib import Path
import re
p=Path(re.search("const file='([^']+)'",Path('work/check_triad.cjs').read_text())[1]);s=p.read_text()
s=s.replace('    <div class="text-small" data-field="vfx-engine-note">', '    <label class="form-check form-switch"><input id="mp-vfx-lock" class="form-check-input" type="checkbox" checked><span class="form-check-label">Lock base to sRGB · HDR energy stays free</span></label>\n    <div class="text-small" data-field="vfx-mapping" aria-live="polite"></div>\n    <div class="text-small" data-field="vfx-engine-note">',1)
s=s.replace('vfxEngine:"unity",vfx:', 'vfxEngine:"unity",vfxLock:true,vfx:',1)
s=s.replace("if(m.vfxEngine===", "if(typeof m.vfxLock==='boolean')state.vfxLock=m.vfxLock;if(m.vfxEngine===",1)
pos=s.index('function vfxColors(){')
s=s[:pos]+'''function fitLabToSRGB(l,a,b){
 const valid=t=>labLinearRGB(l,a*t,b*t).every(n=>n>=-1e-7&&n<=1.000001);
 if(valid(1))return {l,a,b,changed:false};
 let low=0,high=1;for(let i=0;i<32;i++){const mid=(low+high)/2;if(valid(mid))low=mid;else high=mid;}
 return {l,a:a*low,b:b*low,changed:true};
}
function applyVfxLock(){if(!state.vfxLock)return;const p=state.vfx,fit=fitLabToSRGB(p.l,p.a,p.b);if(fit.changed){state.vfx.a=fit.a;state.vfx.b=fit.b;}}
$('#mp-vfx-lock').addEventListener('change',()=>{state.vfxLock=$('#mp-vfx-lock').checked;applyVfxLock();drawVfx();remember();});
''' +s[pos:]
s=s.replace('const coreLab={l:', 'let coreLab={l:').replace('b:p.b*(1-t)},coreLinear=', 'b:p.b*(1-t)};if(state.vfxLock)coreLab=fitLabToSRGB(coreLab.l,coreLab.a,coreLab.b);const coreLinear=')
s=s.replace("if(state.system!=='vfx')return;\n drawLabPlane();", "if(state.system!=='vfx')return;\n applyVfxLock();$('#mp-vfx-lock').checked=state.vfxLock;\n drawLabPlane();")
s=s.replace("field('vfx-note').textContent=", "const used=rgbToLab(c.base);field('vfx-mapping').textContent=state.vfxLock?`LOCKED · Lab L* ${p.l.toFixed(1)}, a* ${p.a.toFixed(1)}, b* ${p.b.toFixed(1)} · Chroma reduced when needed; L* and hue preserved.`:`UNLOCKED · Requested Lab (${p.l.toFixed(1)}, ${p.a.toFixed(1)}, ${p.b.toFixed(1)}) → shader base Lab ≈ (${used.l}, ${used.a}, ${used.b})${c.outside?' · × gamut clipping changes the color.':' · inside sRGB.'}`;\n field('vfx-note').textContent=")
s=s.replace('Out-of-gamut channels are clipped to [0, 1] before emission; the warning marks this loss.', 'Lock reduces Lab Chroma while preserving L* and hue. Unlocked colors use channel clipping; the readout shows the requested and shader-base Lab coordinates.')
s=s.replace('field(\'vfx-\'+k+\'-value\').textContent=p[k];', "field('vfx-'+k+'-value').textContent=Number(p[k].toFixed(2));")
p.write_text(s)
q=Path('work/check_triad.cjs');t=q.read_text().replace('vfxColors,hsvRGB,engineColorCode}', 'vfxColors,hsvRGB,engineColorCode,fitLabToSRGB}').replace("node('#mp-vfx-a').value='127';", "picker.state.vfxLock=false;node('#mp-vfx-a').value='127';");q.write_text(t)
