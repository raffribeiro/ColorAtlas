"""Build outputs/munsell-color-picker.html from the canonical fragment — one source.

The standalone page = host shell (work/standalone-shell.html, with __ATLAS_FRAME__
where the frame goes) + frame (work/standalone-frame-prefix.html + canonical
fragment + work/standalone-frame-suffix.html), then work/fit_local_page.py adds
the export modules, images and host storage bridge. Edit the canonical fragment
or a module, never the generated page.

  python3 work/build_standalone.py [canonical.html]            # build
  python3 work/build_standalone.py --extract [canonical.html]  # one-time: capture shell/prefix/suffix
                                                                #   from the current outputs page
"""
from pathlib import Path
import html, re, sys
from atlas_build import atomic_write
from fit_local_page import fit_page

WORK = Path(__file__).parent
ROOT = WORK.parent
CANONICAL = Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
OUT = ROOT / 'outputs' / 'munsell-color-picker.html'
SHELL, PREFIX, SUFFIX = WORK / 'standalone-shell.html', WORK / 'standalone-frame-prefix.html', WORK / 'standalone-frame-suffix.html'
FRAME_START = '<style id="atlas-splash-style">'          # first line of the canonical fragment
SUFFIX_START = '<script>\n(() => {\n  if (window.FloatingUIDOM == null)'  # renderer utilities after the fragment

args = [a for a in sys.argv[1:] if not a.startswith('--')]
canonical = Path(args[0]) if args else CANONICAL

if '--extract' in sys.argv:
    page = OUT.read_text()
    m = re.search(r'data-srcdoc="([^"]*)"', page)
    frame = html.unescape(m[1])
    a, b = frame.index(FRAME_START), frame.index(SUFFIX_START)
    end = frame.index('</html>', b) + len('</html>')
    SHELL.write_text(page[:m.start(1)] + '__ATLAS_FRAME__' + page[m.end(1):])
    PREFIX.write_text(frame[:a])
    SUFFIX.write_text('\n\n\n' + frame[b:end])
    print(f'extracted shell {SHELL.stat().st_size:,} B, prefix {len(frame[:a]):,} chars, suffix {end - b:,} chars')
    sys.exit(0)

fragment = canonical.read_text()
assert fragment.startswith(FRAME_START), 'canonical fragment must start with the splash style'
frame = PREFIX.read_text() + fragment + SUFFIX.read_text()
# Local asset references in the fragment (file:// URIs from the original machine) become data URIs here,
# so the build does not depend on where the workspace is mounted.
import base64
for name, mime in (('default-explosion.webp', 'image/webp'), ('attention-reference-study.png', 'image/png')):
    for folder in ('outputs', 'work'):
        asset = ROOT / folder / name
        if asset.exists():
            uri = 'data:' + mime + ';base64,' + base64.b64encode(asset.read_bytes()).decode('ascii')
            frame = re.sub(r'file://[^"\'\s)]*/' + re.escape(folder + '/' + name), uri, frame)
shell = SHELL.read_text()
assert shell.count('__ATLAS_FRAME__') == 1
# Assemble and validate everything in memory before replacing the deliverable.
page = fit_page(shell.replace('__ATLAS_FRAME__', html.escape(frame, quote=True)))
atomic_write(OUT, page)
print(f'built {OUT.relative_to(ROOT)} from {canonical.name}: {OUT.stat().st_size:,} bytes')
