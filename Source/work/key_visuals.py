from pathlib import Path
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html');s=p.read_text()
s=s.replace('</select></div><svg class="mp-gradient','</select><button class="btn" type="button" data-action="gradient-toggle-layer" title="Switch Emission / Smoke" aria-label="Switch between Emission and Smoke">⇄</button></div><svg class="mp-gradient',1)
s=s.replace("${isAlpha?'Alpha '+k.a.toFixed(2):k.hex.toUpperCase()} · ${(k.t*100).toFixed(1)}%", "<span class=\"studio-key-swatch\" style=\"background:${isAlpha?rgbHex([k.a,k.a,k.a]):k.hex}\"></span><span class=\"studio-key-index\">${i+1}</span><span>${isAlpha?'Alpha '+k.a.toFixed(2):k.hex.toUpperCase()}</span><span class=\"studio-key-position\">${(k.t*100).toFixed(1)}%</span>")
s=s.replace("$('#gradient-layer').addEventListener('change'", "$('[data-action=\"gradient-toggle-layer\"]').addEventListener('click',()=>selectGradientLayer(state.gradientLayer==='emission'?'smoke':'emission'));\n$('#gradient-layer').addEventListener('change'",1)
needle=' svg+=`<g class="${pop?\'mp-elastic-marker\':\'\'}" data-selected-marker>'
insert=''' if(state.system==='vfx'){
 const keys=state.gradientColors.map((k,i)=>({...project(rgbToLab(k.hex)),hex:k.hex,index:i}));
 svg+=`<polyline points="${[...keys].sort((a,b)=>state.gradientColors[a.index].t-state.gradientColors[b.index].t).map(p=>p.x+','+p.y).join(' ')}" fill="none" stroke="var(--foreground)" stroke-opacity=".5" stroke-width="1" stroke-dasharray="3 3"/>`;
 for(const p of keys){const selected=state.gradientSelection.kind==='color'&&state.gradientSelection.index===p.index;svg+=`<g data-lab-gradient-key="${p.index}" style="cursor:pointer"><title>Gradient key ${p.index+1} · ${p.hex.toUpperCase()}</title><circle cx="${p.x}" cy="${p.y}" r="${selected?10:7}" fill="${p.hex}" stroke="var(--foreground)" stroke-width="${selected?2:1}"/><text x="${p.x+10}" y="${p.y-10}" fill="var(--foreground)" font-size="9">${p.index+1}</text><circle cx="${p.x}" cy="${p.y}" r="14" fill="transparent"/></g>`;}
 }
'''
assert needle in s;s=s.replace(needle,insert+needle)
s=s.replace("target.addEventListener('pointerdown',e=>{if(e.button!==0)return;lab3dDrag=", "target.addEventListener('pointerdown',e=>{if(e.button!==0)return;const key=e.target?.closest('[data-lab-gradient-key]');if(state.system==='vfx'&&key){state.gradientSelection={kind:'color',index:Number(key.dataset.labGradientKey)};loadGradientColor();drawGradient();e.preventDefault();return;}lab3dDrag=")
s=s.replace('</style>','''
#munsell-picker .studio-keys [data-field="gradient-keys"] button{display:flex;align-items:center;gap:9px}.studio-key-swatch{width:23px;height:23px;border-radius:50%;border:1px solid #9aa9ba;box-shadow:0 0 0 2px #0c1015;flex:none}.studio-key-index{color:#8796a7;font-size:10px}.studio-key-position{margin-left:auto;color:#bcc9d6;font-variant-numeric:tabular-nums}[data-action="gradient-toggle-layer"]{font-size:19px!important;line-height:1;padding:6px 12px!important}
</style>''',1)
p.write_text(s)
