from pathlib import Path
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html');s=p.read_text()
s=s.replace('<strong>GRADIENT MAP</strong>','<strong>GRADIENT MAP</strong><label class="form-label" for="gradient-preset">Palette</label><select id="gradient-preset" class="form-select" aria-label="Default gradient palette"></select>',1)
s=s.replace('gradientVersion:1,','gradientVersion:1,gradientPreset:"blackbody",',1)
s=s.replace("if(typeof m.vfxLock==='boolean')", "if(typeof m.gradientPreset==='string')state.gradientPreset=m.gradientPreset;if(typeof m.vfxLock==='boolean')",1)
start=s.index('function resetBlackbody(){');end=s.index("$('[data-action=\"gradient-blackbody\"]')",start)
code='''const gradientPresets=[
 {id:'blackbody',name:'Black Body · 1000–12000 K'},
 {id:'fire',name:'Fire',positions:[0,.072,.2,.4,.6,.8,1],colors:['#000000','#120202','#650B06','#CB2A08','#FF790C','#FFCC45','#FFF9DC']},
 {id:'lava',name:'Lava',colors:['#080507','#260a12','#750a19','#e22910','#ff8c18','#fff18c']},
 {id:'ice',name:'Ice',colors:['#031127','#0c3261','#136fa4','#41c7dc','#b1f2fa','#ffffff']},
 {id:'electric',name:'Electric Blue',colors:['#050620','#19176b','#224aff','#4d9bff','#83eaff','#f1ffff']},
 {id:'plasma',name:'Plasma',colors:['#11051e','#420b63','#9c1bc9','#ed45be','#ffb4d8','#fff1fd']},
 {id:'toxic',name:'Toxic',colors:['#071107','#173b0a','#427409','#8fc714','#d7f75c','#f8ffdb']},
 {id:'arcane',name:'Arcane',colors:['#0c0823','#242367','#6250ae','#a18cf7','#cbe0ff','#ffffff']},
 {id:'solar',name:'Solar',colors:['#211004','#78410b','#c88a17','#f9cb38','#fff08c','#fffce3']},
 {id:'copper',name:'Copper',colors:['#170e0b','#4d261b','#985037','#cb8961','#edc39a','#fff2dc']},
 {id:'emerald',name:'Emerald',colors:['#021613','#074e3d','#008d62','#31cd88','#a0f1bf','#eafff3']},
 {id:'ocean',name:'Ocean',colors:['#020c20','#103256','#075d78','#168fa7','#74d9db','#ecffff']},
 {id:'sakura',name:'Sakura',colors:['#210d23','#66254f','#af4b79','#e68ba7','#ffd2d9','#fff4ed']},
 {id:'spectral',name:'Spectral Energy',colors:['#160728','#48259b','#267bd0','#21bead','#f1d661','#fff6e6']},
 {id:'smoke',name:'Smoke / Grayscale',colors:['#000000','#242424','#555555','#929292','#cdcdcd','#ffffff']}
];
const presetSelect=$('#gradient-preset');presetSelect.innerHTML='<option value="custom">Custom · edited palette</option>'+gradientPresets.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
function applyGradientPreset(id){const preset=gradientPresets.find(p=>p.id===id);if(!preset)return;state.gradientPreset=id;state.gradientColors=id==='blackbody'?[1000,1800,2700,4000,5500,6500,9000,12000].map(k=>({t:(k-1000)/11000,hex:blackbodyHex(k)})):preset.colors.map((hex,i)=>({t:i/(preset.colors.length-1),hex}));state.gradientAlphas=[{t:0,a:1},{t:1,a:1}];state.gradientSelection={kind:'color',index:0};loadGradientColor();state.gradientPreset=id;gradientChange(false);field('gradient-status').textContent=id==='blackbody'?'Black Body · 1000–12000 K · approximate Planck / CIE 1931 colors, normalized brightness.':preset.name+' · editable color keys · opaque alpha.';}
function resetBlackbody(){applyGradientPreset('blackbody');}
presetSelect.addEventListener('change',()=>applyGradientPreset(presetSelect.value));
'''
s=s[:start]+code+s[end:]
s=s.replace('function gradientChange(){drawGradient();remember();}','function gradientChange(markCustom=true){if(markCustom)state.gradientPreset="custom";drawGradient();remember();}')
s=s.replace("const key=gradientSelected(),isAlpha=", "$('#gradient-preset').value=gradientPresets.some(p=>p.id===state.gradientPreset)?state.gradientPreset:'custom';const key=gradientSelected(),isAlpha=")
s=s.replace("if(state.gradientSelection.kind==='color')gradientSelected().hex=vfxColors().base;", "if(state.gradientSelection.kind==='color'){const next=vfxColors().base;if(gradientSelected().hex.toLowerCase()!==next.toLowerCase())state.gradientPreset='custom';gradientSelected().hex=next;}")
p.write_text(s)
