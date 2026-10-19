"""Replace the embedded Motion 14 subset (126.7 KB) with work/atlas-motion-lite.js (~4.6 KB).

The app only calls Motion.animate() (see atlas-motion-ui.js). motion-lite implements that
call shape on the Web Animations API: element keyframes (opacity, x, y, scale, scaleX,
scaleY, rotate), per-segment cubic ease, times, delay, duration-based springs, and
numeric tweens with onUpdate. Validated against Motion 14 in Chromium (v0.90.16): the
selection pulse matches within 0.0003 and springs within 0.015.
  python3 work/install_motion_lite.py [canonical.html] [outputs/munsell-color-picker.html]
"""
from pathlib import Path
import html, re, sys
WORK = Path(__file__).parent
CANONICAL = Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
EXPORT = WORK.parent / 'outputs' / 'munsell-color-picker.html'
LITE = (WORK / 'atlas-motion-lite.js').read_text()
assert '</script' not in LITE.lower()
BLOCK = '<script id="atlas-motion-vendor" data-version="atlas-lite-1">\n' + LITE + '</script>'


def patch(s):
    s, n = re.subn(r'<script id="atlas-motion-vendor"[^>]*>[\s\S]*?</script>', lambda _: BLOCK, s, count=1)
    assert n == 1, 'motion vendor block'
    assert s.index('id="atlas-motion-vendor"') < s.index('<script id="atlas-motion-ui">'), 'vendor loads before the controller'
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
