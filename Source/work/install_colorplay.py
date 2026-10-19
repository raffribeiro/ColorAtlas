from pathlib import Path
import re
base=Path(__file__).parent
source=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
s=source.read_text()
option='<option value="colorplay">ColorPlay</option>'
if option not in s:s=s.replace('<option value="auto">Harmonic</option>',option+'<option value="auto">Harmonic</option>',1)
if 'data-action="colorplay-study"' not in s:
    a=s.index('<select id="random-type"');b=s.index('</select>',a)+len('</select>')
    s=s[:b]+'<button class="btn btn-ghost" type="button" data-action="colorplay-study" title="Compare colors in different surroundings" hidden>Compare</button>'+s[b:]
if '<dialog id="colorplay-dialog"' not in s:s=s.replace('<footer class="studio-credit">',base.joinpath('atlas-colorplay.html').read_text()+'\n<footer class="studio-credit">',1)
else:s=re.sub(r'<dialog id="colorplay-dialog"[\s\S]*?</dialog>',lambda _:base.joinpath('atlas-colorplay.html').read_text().strip(),s,count=1)
if '// ColorPlay contextual generation\n' not in s:s=s.replace('function randomAllLayers(',base.joinpath('atlas-colorplay.js').read_text()+'\nfunction randomAllLayers(',1)
else:s=re.sub(r'// ColorPlay contextual generation\n[\s\S]*?// End ColorPlay contextual generation',lambda _:base.joinpath('atlas-colorplay.js').read_text().strip(),s,count=1)
if 'id="atlas-colorplay-style"' not in s:s+='\n<style id="atlas-colorplay-style">\n'+base.joinpath('atlas-colorplay.css').read_text()+'</style>\n'
else:s=re.sub(r'<style id="atlas-colorplay-style">[\s\S]*?</style>',lambda _:'<style id="atlas-colorplay-style">\n'+base.joinpath('atlas-colorplay.css').read_text()+'</style>',s,count=1)
s=s.replace("if(['auto', 'true-random', 'perceptual',", "if(['colorplay', 'auto', 'true-random', 'perceptual',",1)
s=s.replace('const bounds=[.6,.9],b1=', 'const bounds=plan.bounds?.[layer]||[.6,.9],b1=',1)
if "if(type==='colorplay')" not in s:s=s.replace("if(type==='true-random'){", "if(type==='colorplay'){best=makeColorPlayPair(random);\n }else if(type==='true-random'){",1)
s=s.replace("$('#random-type').value=state.randomType;remember();", "$('#random-type').value=state.randomType;remember();")
s=s.replace("state.randomType=$('#random-type').value;remember();", "state.randomType=$('#random-type').value;syncColorPlayControl();remember();",1)
if "$('#mp-system').value=state.system;$('#random-type').value=state.randomType;syncColorPlayControl();" not in s:s=s.replace("$('#mp-system').value=state.system;$('#random-type').value=state.randomType;", "$('#mp-system').value=state.system;$('#random-type').value=state.randomType;syncColorPlayControl();",1)
# Reuse the exact mapper for scoring and the visible preview, preserving byte rounding.
a=s.index('const lut=Array.from({length:256}',s.index('function drawExplosionMap()'));b=s.index('});for(let i=0;i<explosionPixels.length',a)+3
s=s[:a]+"const lut=Array.from({length:256},(_,v)=>{const sample=previewGradientSample(v/255,layers);return [...sample.rgb.map(c=>Math.round(encodeSRGB(c)*255)),Math.round(sample.alpha*255)];});"+s[b:]
assert len(s.encode())<1_000_000
source.write_text(s)
print('Installed ColorPlay:',len(s.encode()),'bytes')
