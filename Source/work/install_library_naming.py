"""Embed explicit reviewed metadata; keep identifiers and user state unchanged."""
from pathlib import Path
import json,re
BASE=Path(__file__).parent
SOURCE=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
def compact(value):return json.dumps(value,ensure_ascii=False,separators=(',',':'))
def install():
 policy=json.loads(BASE.joinpath('library-naming-policy.json').read_text())
 generic=[id for id,p in policy['patches'].items() if p.get('description','').startswith('Visual color study:')]
 code='''// Reviewed library metadata; identifiers and user-authored names stay unchanged.
const neutralPresetNames='''+compact(policy['names'])+''',neutralDescriptions=new Set('''+compact(generic)+'''),neutralThemes='''+compact(policy['themes'])+''';
for(const p of gradientPresets){
 const name=neutralPresetNames[p.id];if(name){p.name=name;p.searchAliases=name;}
 if(neutralDescriptions.has(p.id))p.description='Visual color study: '+p.name+'. Adapt masks, contrast and exposure to the asset.';
 if(neutralThemes[p.originalCategory])p.originalCategory=neutralThemes[p.originalCategory];
 if(p.movement==='Orphism'){p.movement='Chromatic Abstraction';p.description='Chromatic abstraction study: '+p.name+'. Adapt contrast, coverage and exposure to the asset.';}
 if(p.id.startsWith('trope-env-')){p.category='World';p.originalCategory='Environment';}
 if(p.originalCategory==='Surface materials')p.category='World';
}
// End reviewed library metadata.
'''
 BASE.joinpath('atlas-library-naming.js').write_text(code)
 s=SOURCE.read_text()
 edits_path=BASE/'library-naming-script-edits.json'
 if not edits_path.exists():
  edits=[]
  old=re.search(r'const templateCategories=\[[^\n]+;',s)[0]
  new='const templateCategories='+compact(policy['categories'])+';';edits.append([old,new])
  old=re.search(r'const thematicTemplateNames=\{[^\n]+;',s)[0]
  entries=json.loads(old[len('const thematicTemplateNames='):-1]);entries={id:name for id,name in entries.items() if not id.startswith('art-design-')}
  new='const thematicTemplateNames='+compact(entries)+';';edits.append([old,new])
  edits.append(["const name=thematicTemplateNames[p.id];if(!name)continue;", "const name=thematicTemplateNames[p.id]||(p.collectionKind?p.name:null);if(!name)continue;"])
  edits_path.write_text(json.dumps(edits,ensure_ascii=False,indent=2)+'\n')
 for old,new in json.loads(edits_path.read_text()):
  if new not in s:
   assert s.count(old)==1,old[:100]
   s=s.replace(old,new,1)
 if '// Reviewed library metadata;' in s:
  s,n=re.subn(r'// Reviewed library metadata;[\s\S]*?// End reviewed library metadata\.\n',lambda _:code,s,count=1);assert n==1
 else:
  needle="field('preset-count').textContent=gradientPresets.length;"
  assert s.count(needle)==1;s=s.replace(needle,code+needle,1)
 assert len(s.encode())<1_000_000,len(s.encode())
 SOURCE.write_text(s);print('Installed reviewed naming:',len(s.encode()),'bytes')
if __name__=='__main__':install()
