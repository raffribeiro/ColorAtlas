"""Validate the offline locale contract and synchronized final embedding."""
import json, re, html, sys
from pathlib import Path
base=Path(__file__).resolve().parent
codes={'en','pt-BR','es','fr','de','it','ja','ko','zh-CN'}
files={p.stem:p for p in (base/'locales').glob('*.json')}
assert set(files)==codes
english=json.loads(files['en'].read_text())
assert all(k==v for k,v in english.items())
for code,path in files.items():
 pack=json.loads(path.read_text());assert set(pack)==set(english),code
 assert all(isinstance(v,str) and v.strip() and '<' not in v for v in pack.values()),code
for directory in ('full','supplement','extra'):
 reference=json.loads((base/'locales'/directory/'en.json').read_text())
 for code in codes-{'en'}:
  translated=json.loads((base/'locales'/directory/(code+'.json')).read_text())
  assert list(translated)==list(reference),(directory,code,'key order/set')
  for key,value in translated.items():
   assert value.strip(),(code,key)
   assert sorted(re.findall(r'\{\d+\}',key))==sorted(re.findall(r'\{\d+\}',value)),(code,key,'placeholders')
source=Path(sys.argv[1] if len(sys.argv)>1 else base.parent/'outputs/munsell-color-picker.html').read_text()
frame=html.unescape(re.search(r'data-srcdoc="([^"]*)"',source)[1])
for ident,path in [('atlas-i18n-ui','atlas-i18n.js'),('atlas-i18n-style','atlas-i18n.css')]:
 assert (base/path).read_text() in frame,ident
assert (base/'atlas-i18n-host.js').read_text() in source
packs=json.loads(re.search(r'<script id="atlas-language-packs" type="application/json">(.*?)</script>',frame,re.S)[1])
for code in codes-{'en'}:
 expected=json.loads(files[code].read_text())
 for directory in ('full','supplement','extra'):expected.update(json.loads((base/'locales'/directory/(code+'.json')).read_text()))
 assert packs[code]==expected,code
print(f'PASS offline language packs: {len(codes)} languages, complete UI/guide/tutorial/help catalogs, preserved placeholders and exact embedding.')
