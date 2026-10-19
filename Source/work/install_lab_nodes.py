from pathlib import Path
import json
BASE=Path(__file__).parent
SOURCE=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
SCRIPT_EDITS=json.loads(BASE.joinpath('lab-node-script-edits.json').read_text())
def install():
 s=SOURCE.read_text()
 for old,new in SCRIPT_EDITS:
  if new not in s:
   assert s.count(old)==1,old[:80]
   s=s.replace(old,new,1)
 SOURCE.write_text(s)
 print('Installed stable node labels:',len(s.encode()),'bytes')
if __name__=='__main__':install()
