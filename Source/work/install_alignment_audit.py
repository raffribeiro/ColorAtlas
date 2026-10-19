from pathlib import Path
import re
BASE=Path(__file__).parent
SOURCE=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
LEGACY=[
 '#munsell-picker .wheel-toolbar{display:flex;align-items:center;justify-content:space-between;gap:6px;white-space:nowrap}',
 '#munsell-picker .wheel-toolbar .studio-muted{margin:0;font-size:9px;letter-spacing:.5px}',
 '#munsell-picker .wheel-toolbar [data-action="wheel-reset-view"]{margin-left:0!important;order:3}',
 '#munsell-picker .wheel-toolbar{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:8px;height:28px;min-height:28px}',
 '#munsell-picker .wheel-toolbar>span{order:1;margin:0;font-size:9px;line-height:16px}',
 '#munsell-picker .wheel-toolbar>label{order:2;justify-self:end;display:flex;align-items:center;gap:4px;font-size:10px!important;line-height:16px}',
 '#munsell-picker .wheel-toolbar>button{order:3;justify-self:end}'
]
def install():
 s=SOURCE.read_text()
 for rule in LEGACY:s=s.replace(rule,'',1)
 for id,module in [('atlas-author-wheel-layout','author-wheel-layout.css'),('atlas-colorplay-style','atlas-colorplay.css')]:
  content='<style id="'+id+'">\n'+BASE.joinpath(module).read_text()+'</style>'
  s,n=re.subn(r'<style id="'+id+r'">[\s\S]*?</style>',lambda _:content,s)
  assert n==1
 assert len(s.encode())<1_000_000,len(s.encode())
 SOURCE.write_text(s)
 print('Installed alignment styles:',len(s.encode()),'bytes')
if __name__=='__main__':install()
