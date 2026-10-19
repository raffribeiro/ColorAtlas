"""Let the Keys/Wheel divider use its available height instead of a 200 px cap."""
from pathlib import Path

SOURCE = Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
SCRIPT_EDITS = [
 ('Math.min(Math.max(80,Number(requestedWheel)||200),200,available-84)',
  'Math.min(Math.max(80,Number(requestedWheel)||200),available-84)'),
 ('size=Math.max(80,Math.min(200,wheelHeight))',
  'size=Math.max(80,wheelHeight)'),
 ('Math.min(list-Math.min(84,list),200-wheel,delta)',
  'Math.min(list-Math.min(84,list),delta)')
]

def install():
 s = SOURCE.read_text()
 for old, new in SCRIPT_EDITS:
  if old in s:
   assert s.count(old) == 1, old
   s = s.replace(old, new, 1)
  else:
   assert s.count(new) == 1, new
 assert len(s.encode()) < 1_000_000
 SOURCE.write_text(s)
 print('Installed available-height wheel resizing:', len(s.encode()), 'bytes')

if __name__ == '__main__':
 install()
