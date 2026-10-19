from pathlib import Path
import re
BASE=Path(__file__).parent
SOURCE=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
SCRIPT_EDITS=[
 ('function studioKeySizes(available,requestedWheel=160)', 'function studioKeySizes(available,requestedWheel=200)'),
 ('Number(requestedWheel)||160', 'Number(requestedWheel)||200'),
 ("parseFloat(svg.style.getPropertyValue('--studio-wheel-size'))||160", "parseFloat(svg.style.getPropertyValue('--studio-wheel-size'))||200")
]
def install():
 s=SOURCE.read_text()
 for old,new in SCRIPT_EDITS:
  if new not in s:
   assert s.count(old)==1,old
   s=s.replace(old,new,1)
 style='<style id="atlas-author-wheel-layout">\n'+BASE.joinpath('author-wheel-layout.css').read_text()+'</style>'
 s,n=re.subn(r'<style id="atlas-author-wheel-layout">[\s\S]*?</style>',lambda _:style,s,count=1)
 assert n==1 and len(s.encode())<1_000_000
 SOURCE.write_text(s)
 print('Installed 200 px wheel default:',len(s.encode()),'bytes')
if __name__=='__main__':install()
