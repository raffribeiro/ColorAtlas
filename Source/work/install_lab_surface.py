"""Install the cached continuous OKLab slice and reversible editor integration."""
from pathlib import Path
import json
import re
import sys

WORK = Path(__file__).parent
CANONICAL = Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
SCRIPT_EDITS = [tuple(pair) for pair in json.loads((WORK / 'lab-surface-script-edits.json').read_text())]


def patch(source):
    # Later neutral-axis passes wrap the surface call. Temporarily undo only
    # integrations actually present, apply this module, then restore them. This
    # preserves ownership and lets current sources reinstall without replaying an
    # obsolete dot-slice migration against already migrated geometry.
    from install_neutral_axis import SCRIPT_EDITS as NEUTRAL_EDITS
    wrapped = [(old, new) for old, new in NEUTRAL_EDITS if new in source]
    for old, new in reversed(wrapped):
        assert source.count(new) == 1, 'Ambiguous neutral-axis integration'
        source = source.replace(new, old, 1)
    for old, new in SCRIPT_EDITS:
        if new in source:
            continue
        assert source.count(old) == 1, 'Expected one editor anchor: ' + old[:70]
        source = source.replace(old, new, 1)
    for old, new in wrapped:
        assert source.count(old) == 1, 'Cannot restore neutral-axis integration'
        source = source.replace(old, new, 1)
    module = '<script id="atlas-lab-surface">\n' + (WORK / 'atlas-lab-surface.js').read_text().strip() + '\n</script>'
    pattern = r'<script id="atlas-lab-surface">[\s\S]*?</script>'
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
    print('Installed continuous selected-lightness surface:', target.stat().st_size, 'bytes')
