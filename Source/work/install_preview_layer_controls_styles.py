"""Keep CSS formatting compact enough for the complete 1 MB app artifact.

Only whitespace/comments change; the editable originals are recorded alongside
compiled replacements. Layer UI behavior lives in atlas-preview-layers modules.
"""
from pathlib import Path
import json
SOURCE=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
SCRIPT_EDITS=json.loads(Path(__file__).with_name('preview-layer-controls-style-edits.json').read_text())
def install():
 s=SOURCE.read_text()
 for old,new in SCRIPT_EDITS:
  if new in s:continue
  assert s.count(old)==1,'CSS source changed; review rather than overwrite it'
  s=s.replace(old,new,1)
 assert len(s.encode())<1_000_000
 SOURCE.write_text(s)
if __name__=='__main__':install()
