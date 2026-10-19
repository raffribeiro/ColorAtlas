from pathlib import Path
import re
p=Path(re.search("const file='([^']+)'",Path('work/check_triad.cjs').read_text())[1]);s=p.read_text()
s=s.replace('<span class="text-small">An artist workflow · linear sRGB emission</span></div>', '<span class="text-small">An artist workflow · linear sRGB emission</span><label class="form-label" for="mp-vfx-engine">Engine</label><select id="mp-vfx-engine" class="form-select"><option value="unity">Unity</option><option value="unreal">Unreal Engine</option></select></div>',1)
s=s.replace('<div class="text-small" data-field="vfx-note"', '<div class="text-small" data-field="vfx-engine-note"></div>\n    <div class="text-small" data-field="vfx-note"',1)
s=s.replace('vfx:{h:190', 'vfxEngine:"unity",vfx:{h:190',1)
s=s.replace('if(m.vfx)for(', "if(m.vfxEngine==='unity'||m.vfxEngine==='unreal')state.vfxEngine=m.vfxEngine;if(m.vfx)for(",1)
s=s.replace("const p=state.vfx,c=vfxColors();for", "const p=state.vfx,c=vfxColors();$('#mp-vfx-engine').value=state.vfxEngine;$('[data-action=\"vfx-copy\"]').textContent=state.vfxEngine==='unity'?'Copy Unity Color':'Copy Unreal LinearColor';field('vfx-engine-note').textContent=state.vfxEngine==='unity'?'Unity · linear RGB emission for shader math. Copy creates a C# Color constructor with intensity already applied. Connect through the appropriate linear emission input; do not convert from sRGB again.':'Unreal · linear RGB for Emissive Color. Copy creates a LinearColor tuple with intensity already applied. Connect to Emissive Color without multiplying by the same intensity twice.';for",1)
s=s.replace("$('[data-action=\"vfx-copy\"]').addEventListener('click',e=>copyCode(vfxColors().hdr.map(n=>n.toFixed(6)).join(', '),{x:e.clientX,y:e.clientY,target:e.currentTarget}));", """function engineColorCode(){const rgb=vfxColors().hdr.map(n=>n.toFixed(6));return state.vfxEngine==='unity'?`new Color(${rgb.map(n=>n+'f').join(', ')}, 1f)`:`(R=${rgb[0]},G=${rgb[1]},B=${rgb[2]},A=1.000000)`;}
$('#mp-vfx-engine').addEventListener('change',()=>{state.vfxEngine=$('#mp-vfx-engine').value;drawVfx();remember();});
$('[data-action="vfx-copy"]').addEventListener('click',e=>copyCode(engineColorCode(),{x:e.clientX,y:e.clientY,target:e.currentTarget}));""")
p.write_text(s)
q=Path('work/check_triad.cjs');t=q.read_text().replace('vfxColors,hsvRGB}', 'vfxColors,hsvRGB,engineColorCode}');q.write_text(t)
