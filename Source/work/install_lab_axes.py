"""3D graph: draw the Red-Green and Yellow-Blue axes on the selected-lightness plane,
colored with the fitted OKLab colors in their directions (v0.90.15).

Before, the chromatic axes sat at L 50 with fixed stylized colors, so in perspective
they crossed slice dots of other hues. Applies work/lab-axes-script-edits.json to the
canonical fragment and the standalone export.
  python3 work/install_lab_axes.py [canonical.html] [outputs/munsell-color-picker.html]
"""
from pathlib import Path
import html, json, re, sys
WORK = Path(__file__).parent
CANONICAL = Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
EXPORT = WORK.parent / 'outputs' / 'munsell-color-picker.html'
SCRIPT_EDITS = [tuple(e) for e in json.loads((WORK / 'lab-axes-script-edits.json').read_text())]


def patch(s):
    for old, new in SCRIPT_EDITS:
        if new in s:
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
