"""3D graph: denser selected-lightness samples, quieter background volume.

The selected plane uses a 4-unit grid, smaller opaque dots and a background
cloud at 8 percent opacity. Historical sampling changes are kept in the edit chain.
  python3 work/install_lab_volume.py [canonical.html] [outputs/munsell-color-picker.html]
"""
from pathlib import Path
import html, json, re, sys
WORK = Path(__file__).parent
CANONICAL = Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
EXPORT = WORK.parent / 'outputs' / 'munsell-color-picker.html'
SCRIPT_EDITS = [tuple(e) for e in json.loads((WORK / 'lab-volume-script-edits.json').read_text())]


def patch(s):
    for old, new in SCRIPT_EDITS:
        if new in s or any(new in later_old and later_new in s for later_old, later_new in SCRIPT_EDITS):
            continue
        assert s.count(old) == 1, 'expected once: ' + old[:60]
        s = s.replace(old, new, 1)
    return s



def install():
    canonical = Path(sys.argv[1]) if len(sys.argv) > 1 else CANONICAL
    export = Path(sys.argv[2]) if len(sys.argv) > 2 else EXPORT
    s = patch(canonical.read_text())
    assert len(s.encode()) < 1_000_000, 'canonical fragment must stay below 1 MB'
    canonical.write_text(s)
    print('canonical:', f'{len(s.encode()):,} bytes')
    if export.exists():
        e = export.read_text()
        m = re.search(r'data-srcdoc="([^"]*)"', e)
        e = e[:m.start(1)] + html.escape(patch(html.unescape(m[1])), quote=True) + e[m.end(1):]
        export.write_text(e)
        print('export:', f'{len(e.encode()):,} bytes')


if __name__ == '__main__':
    install()
