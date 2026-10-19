from pathlib import Path
import json
src=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
rows=[]
for line in Path('work/art_design_palettes.txt').read_text().splitlines():
 parts=line.split('|')
 if len(parts)==2: movement,kind=parts; continue
 title,artist,hexes=parts
 colors=['#'+h for h in hexes.split()]
 rows.append(dict(id='art-design-'+str(len(rows)+1),name=f'{movement} · {title}',category='Creative',movement=movement,collectionKind=kind,artist=artist,workTitle=title,description=f'{artist} — {title}. {movement}. Interpreted color study; not sampled from the original work.',colors=colors,positions=[i/(len(colors)-1) for i in range(len(colors))],transition='smooth'))
code='const artDesignTemplates='+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';\ngradientPresets.push(...artDesignTemplates);\n'
s=src.read_text();s=s.replace("field('preset-count').textContent=gradientPresets.length;",code+"field('preset-count').textContent=gradientPresets.length;",1)
s=s.replace('<div data-field="studio-library"', '<select id="studio-movement" class="form-select" aria-label="Art and design movement" hidden><option value="all">All art and design movements</option></select><div data-field="studio-library"',1)
s=s.replace("function renderStudioLibrary(){", "$('#studio-movement').innerHTML='<option value=\"all\">All art and design movements</option>'+[...new Set(artDesignTemplates.map(p=>p.movement))].map(m=>`<option value=\"${m}\">${m}</option>`).join('');\nfunction renderStudioLibrary(){",1)
s=s.replace("$('#studio-data-type').value,state.gradientPreset", "$('#studio-data-type').value,$('#studio-movement').value,state.gradientPreset",1)
s=s.replace("$('#studio-data-type').hidden=category!=='Data';", "$('#studio-movement').hidden=category!=='Creative';if(category!=='Creative')$('#studio-movement').value='all';$('#studio-data-type').hidden=category!=='Data';",1)
s=s.replace("gradientPresets.filter(p=>($('#studio-data-type')", "gradientPresets.filter(p=>($('#studio-movement').value==='all'||p.movement===$('#studio-movement').value)&&($('#studio-data-type')",1)
s=s.replace("$('#studio-data-type').addEventListener('change',renderStudioLibrary);", "$('#studio-movement').addEventListener('change',renderStudioLibrary);$('#studio-data-type').addEventListener('change',renderStudioLibrary);",1)
src.write_text(s)
Path('work/art_design_templates.json').write_text(json.dumps(rows,indent=2))
print(len(rows), 'palettes',len(set(p['movement'] for p in rows)),'movements')
