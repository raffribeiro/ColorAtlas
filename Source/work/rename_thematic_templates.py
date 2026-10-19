from pathlib import Path
import json,re
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html');s=p.read_text()
mapping=json.loads(Path('work/thematic_template_names.json').read_text())
match=re.search(r'const artDesignTemplates=(.*?);\nfor\(const p of artDesignTemplates\)',s,re.S);assert match
rows=json.loads(match[1])
for row in rows:
 row['name']=mapping[row['id']]
 row.pop('artist',None);row.pop('workTitle',None)
 row['description']=row['movement']+' color study: '+row['name'].split(' · ',1)[1]+'. Adapt contrast, coverage and exposure to the asset.'
s=s[:match.start(1)]+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+s[match.end(1):]
code='''// Thematic public names; stable preset IDs preserve existing saved selections.
const thematicTemplateNames='''+json.dumps(mapping,ensure_ascii=False,separators=(',',':'))+''';
for(const p of gradientPresets){
 const name=thematicTemplateNames[p.id];if(!name)continue;
 p.name=name;p.searchAliases=name;
 delete p.artist;delete p.workTitle;
 if(p.collectionKind)p.description=p.movement+' color study: '+name.split(' · ').slice(1).join(' · ')+'. Adapt contrast, coverage and exposure to the asset.';
 else if(p.category==='Champions'){
  p.originalCategory='Game Tropes';
  p.description='Thematic palette for '+name.toLowerCase()+'. Adapt masks, exposure and compositing to the asset.';
 }else p.description='Thematic color study for '+name.toLowerCase()+'.';
}
'''
needle="field('preset-count').textContent=gradientPresets.length;";assert needle in s;s=s.replace(needle,code+needle,1)
p.write_text(s)
print(len(mapping),'thematic names applied')
