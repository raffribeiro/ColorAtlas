"""Install the neutral White–Black spine and reversible editor integration."""
from pathlib import Path
import json
import re
import sys

WORK = Path(__file__).parent
CANONICAL = Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
SCRIPT_EDITS = [tuple(pair) for pair in json.loads((WORK / 'neutral-axis-script-edits.json').read_text())]


def patch(source):
    # Upgrade the earlier single overlay pass before applying the current integration.
    legacy=SCRIPT_EDITS[0][0]+"\n svg+=window.AtlasNeutralAxis.svg(color.l,project,l=>labColor(l,0,0).hex,state.system==='vfx'?'vfx':'lab');"
    source=source.replace(legacy,SCRIPT_EDITS[0][0],1)
    for old, new in SCRIPT_EDITS:
        if new in source:
            continue
        assert source.count(old) == 1, 'Expected one editor anchor: ' + old[:70]
        source = source.replace(old, new, 1)
    module = '<script id="atlas-neutral-axis">\n' + (WORK / 'atlas-neutral-axis.js').read_text().strip() + '\n</script>'
    pattern = r'<script id="atlas-neutral-axis">[\s\S]*?</script>'
    if re.search(pattern, source):
        source = re.sub(pattern, lambda _: module, source, count=1)
    else:
        main = next(m for m in re.finditer(r'<script\b[^>]*>([\s\S]*?)</script>', source) if 'const raw=JSON.parse' in m[1])
        source = source[:main.start()] + module + '\n' + source[main.start():]
    assert len(source.encode()) < 1_000_000
    return source


if __name__ == '__main__':
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else CANONICAL
    target.write_text(patch(target.read_text()))
    print('Installed neutral axis:', target.stat().st_size, 'bytes')
