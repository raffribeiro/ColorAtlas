from pathlib import Path
import re
BASE=Path(__file__).parent
SOURCE=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
def install():
 s=SOURCE.read_text()
 # Migrate the former standalone camera row into the presets toolbar.
 s=re.sub(r'<div class="preview-camera-controls">[\s\S]*?</div>','',s,count=1)
 presets=BASE.joinpath('atlas-preview-presets.html').read_text().strip()
 assert BASE.joinpath('atlas-preview-camera.html').read_text().strip() in presets
 s,n=re.subn(r'<div class="preview-preset-toolbar">[\s\S]*?</dialog>',lambda _:presets,s,count=1);assert n==1
 for tag,id,file in [('style','atlas-preview-camera-style','atlas-preview-camera.css'),('script','atlas-preview-camera-ui','atlas-preview-camera-bundle.js'),('script','atlas-documentation-ui','atlas-documentation-bundle.js')]:
  block=f'<{tag} id="{id}">\n'+BASE.joinpath(file).read_text()+f'</{tag}>'
  if f'id="{id}"' in s:s,n=re.subn(r'<'+tag+' id="'+id+r'">[\s\S]*?</'+tag+'>',lambda _:block,s,count=1);assert n==1
  else:s+='\n'+block+'\n'
 assert len(s.encode())<1_000_000,len(s.encode())
 SOURCE.write_text(s);print('Installed Preview mouse navigation and Reset view:',len(s.encode()),'bytes')
if __name__=='__main__':install()
