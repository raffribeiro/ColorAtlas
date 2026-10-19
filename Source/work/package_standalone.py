from pathlib import Path
from html.parser import HTMLParser
import html,re,hashlib
from release_preflight import check_release_preflight
src=Path('outputs/munsell-color-picker.html')
root=Path('/Users/raffribeiro/Documents/ColorAtlas')
dst=root/'App'
release=root/'Realase'
def strip_optional(s):
    # Renderer utilities: optional tooltip positioning and generic Lucide icons.
    s=re.sub(r'<script\b[^>]*\bsrc=["\']https://unpkg\.com/[^"\']+["\'][^>]*>\s*</script>','',s)
    return s
version=Path('VERSION').read_text().strip()
assert re.fullmatch(r'\d+\.\d+(?:\.\d+)?',version)
s=src.read_text()
s=s.replace('<head>',f'<head>\n<meta name="color-atlas-version" content="{version}">',1)
s=re.sub(r'data-srcdoc="([^"]*)"',lambda m:'data-srcdoc="'+html.escape(strip_optional(html.unescape(m[1])).replace('<footer class="studio-credit">Created by Raff Ribeiro</footer>',f'<footer class="studio-credit">Created by Raff Ribeiro · v{version}</footer>',1),quote=True)+'"',s,count=1)
s=strip_optional(s)
# The loading screen shows the current version too.
s=re.sub(r'data-srcdoc="([^"]*)"',lambda m:'data-srcdoc="'+html.escape(re.sub(r'<span class="splash-version">Version [^<]*</span>',f'<span class="splash-version">Version {version}</span>',html.unescape(m[1])),quote=True)+'"',s,count=1)
# Browser edition: retain IndexedDB Preview bridge and renderer localStorage state.
assert 'id="atlas-preview-storage"' in s and 'atlas-folder-data' not in s

class Dependencies(HTMLParser):
    def __init__(self):super().__init__();self.frame=None;self.external=[]
    def handle_starttag(self,t,attrs):
        a=dict(attrs)
        if t=='iframe' and a.get('id')=='codex-visualization':self.frame=a['data-srcdoc']
        u=a.get('src') if t in ('script','img','source','video','audio') else a.get('href') if t=='link' and a.get('rel') in ('stylesheet','preload','modulepreload') else None
        if u and not u.startswith(('data:','blob:')):self.external.append(u)
p=Dependencies();p.feed(s);assert p.frame
q=Dependencies();q.feed(p.frame)
assert not p.external+q.external,p.external+q.external
assert 'file://' not in p.frame
assert not re.search(r'url\([\s\"\']*(?:https?:|file:)',p.frame)
assert 'id="atlas-preview-storage"' in s and 'Created by Raff Ribeiro' in p.frame
assert 'allow-downloads' in s and 'atlas-fullscreen-ui' not in p.frame
assert 'codex-use-esse' in p.frame and 'const AtlasBuiltinPreview=' in p.frame
# Reject an incompatible branch or immutable archive before touching the live App.
# The sync step repeats its final consistency checks after packaging as before.
check_release_preflight(root,version,s.encode('utf-8'))
release.mkdir(parents=True,exist_ok=True)
out=dst/'COLOR_ATLAS_START_HERE.html';dst.mkdir(parents=True,exist_ok=True);out.write_text(s)
(dst/'README.txt').write_text(f'COLOR ATLAS v{version}\n\nOpen COLOR_ATLAS_START_HERE.html in your browser. Presets and images are saved in browser IndexedDB; palettes and settings use browser localStorage. No Data connection, server or internet is required.\n\nReopen with the same browser profile, file path and query string. Moving the app or clearing browser data may make saved work unavailable. Sharing App does not include your browser library. Export important gradients before clearing browser data.\n\nData contains bundled default assets and preserved files from the earlier folder edition. This version does not write there or import those older files automatically. External documentation links require internet.\n')
print(f'PASS: standalone package has no external runtime assets; {out.stat().st_size:,} bytes; SHA256 {hashlib.sha256(out.read_bytes()).hexdigest()}')

# VERSION belongs to Realase; runtime identifies itself through HTML metadata.
obsolete=dst/'VERSION'
if obsolete.exists():obsolete.unlink()
for filename in ('VERSION','CHANGELOG.md'):(release/filename).write_bytes(Path(filename).read_bytes())
import json
(release/'release.json').write_text(json.dumps({'app':'Color Atlas','version':version,'entry':'COLOR_ATLAS_START_HERE.html','sha256':hashlib.sha256(out.read_bytes()).hexdigest()},indent=2)+'\n')

(dst/'Data').mkdir(exist_ok=True)
(dst/'Data'/'README.txt').write_text('COLOR ATLAS DATA\n\nsettings.json: editor settings and My palettes.\npreview.json: Preview presets and scene metadata. Images/: preset and imported image PNG files.\nLegacy folder data is preserved. This browser edition stores new edits in browser storage and does not write these files.\nClose all app tabs before backing up or editing these files. Browser data from earlier versions is not migrated automatically.\n')

for name,initial in [('settings.json','{}\n'),('preview.json','{"presets":[]}\n')]:
 file=dst/'Data'/name
 if not file.exists():file.write_text(initial)

(dst/'Data'/'Images').mkdir(exist_ok=True)
(dst/'Data'/'Images'/'README.txt').write_text('Bundled default and legacy preset image PNG files are kept here. New images are stored in browser IndexedDB. Keep this folder with preview.json. Unreferenced images are retained.\n')
import shutil
seed=dst/'Data'/'Defaults';seed.mkdir(exist_ok=True)
for image in Path('work/default-preview-images').glob('*.png'):shutil.copyfile(image,seed/image.name)
builtin=json.loads(Path('work/default-preview.json').read_text())
for layer in builtin['layers']:
 raw=__import__('base64').b64decode(layer['asset'].split(',')[1]);layer['asset']='Images/'+hashlib.sha256(raw).hexdigest()+'.png'
seed.joinpath('preview.json').write_text(json.dumps({'builtinRevision':'explosion-images-v1','presets':[{'id':'codex-use-esse','name':'Default','doc':builtin}]}))
design=json.loads(Path('work/design-preview.json').read_text())
shutil.copyfile('work/design-preview.png',seed/'Temp_Design.png')
shutil.copyfile('work/design-preview.png',dst/'Data'/'Images'/'Temp_Design.png')
design['layers'][0]['asset']='Images/Temp_Design.png'
seeds=json.loads((seed/'preview.json').read_text())
seeds['presets'].append({'id':'temp-design','name':'Temp_Design','doc':design})
(seed/'preview.json').write_text(json.dumps(seeds))
# Keep the shipped sources separate from personal runtime images.
for image in seed.glob('*.png'):shutil.copyfile(image,dst/'Data'/'Images'/image.name)
import subprocess
subprocess.run(['python3','work/sync_release_folder.py'],check=True)
