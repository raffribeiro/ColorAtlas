from pathlib import Path
import re
BASE=Path(__file__).parent
SOURCE=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
SCRIPT_EDITS=[("vfxLab.style.setProperty('height',size+'px','important');}drawLabPlane();", "vfxLab.style.setProperty('height',size+'px','important');$('.studio-author').style.setProperty('--atlas-graph-height',size+'px');fitStudioKeys();}drawLabPlane();")]
def install():
 s=SOURCE.read_text()
 for old,new in SCRIPT_EDITS:
  if new not in s:
   assert s.count(old)==1,old
   s=s.replace(old,new,1)
 s,n=re.subn(r'// PNG export options\n[\s\S]*?// End PNG export options',lambda _:BASE.joinpath('atlas-png-export-bundle.js').read_text().strip(),s,count=1);assert n==1
 s,n=re.subn(r'// ColorPlay contextual generation\n[\s\S]*?// End ColorPlay contextual generation',lambda _:BASE.joinpath('atlas-colorplay-bundle.js').read_text().strip(),s,count=1);assert n==1
 for tag,id,file in [('script','atlas-motion-ui','atlas-motion-ui-bundle.js'),('script','atlas-workspace-resize','atlas-workspace-resize-bundle.js'),('style','atlas-workspace-resize-style','atlas-workspace-resize.css'),('style','atlas-author-wheel-layout','author-wheel-layout-bundle.css')]:
  block=f'<{tag} id="{id}">\n'+BASE.joinpath(file).read_text()+f'</{tag}>'
  if f'id="{id}"' in s:
   s,n=re.subn(r'<'+tag+' id="'+id+r'">[\s\S]*?</'+tag+'>',lambda _:block,s,count=1);assert n==1
  else:s+='\n'+block+'\n'
 assert len(s.encode())<1_000_000,len(s.encode())
 SOURCE.write_text(s);print('Installed workspace resizing:',len(s.encode()),'bytes')
if __name__=='__main__':install()
