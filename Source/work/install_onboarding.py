"""Install the onboarding tour into the canonical fragment and the standalone export.

Also installs library export/import (work/atlas-library-io.js/.css) and the shared brand (work/atlas-brand.css: header lockup + loading screen) as
<style id="atlas-brand-style"> before the splash script, and starts 3D rotation off.

Named blocks (replaced in place when present):
  <script id="atlas-onboarding-state">  before atlas-splash-ui, so it wraps every widget-state write
  <style id="atlas-onboarding-style">   appended at the end of the fragment
  <script id="atlas-onboarding-ui">     appended at the end of the fragment
Usage from the workspace root:
  python3 work/install_onboarding.py [canonical.html] [outputs/munsell-color-picker.html]
"""
from pathlib import Path
import html, re, sys

WORK = Path(__file__).parent
CANONICAL = Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
EXPORT = WORK.parent / 'outputs' / 'munsell-color-picker.html'
STATE = (WORK / 'atlas-onboarding-state.js').read_text()
STYLE = (WORK / 'atlas-onboarding.css').read_text()
UI = (WORK / 'atlas-onboarding.js').read_text()
BRAND = (WORK / 'atlas-brand.css').read_text()
IO_JS = (WORK / 'atlas-library-io.js').read_text()
IO_CSS = (WORK / 'atlas-library-io.css').read_text()
assert '</script' not in IO_JS.lower()
OLD_LOGO = '<h2 style="display:flex;align-items:center;gap:10px"><span class="studio-brand">COLOR ATLAS</span><small>VFX</small></h2>'
NEW_LOGO = '<h2 class="atlas-lockup" aria-label="Color Atlas VFX"><span class="atlas-lockup-mark" aria-hidden="true">Ca</span><span class="studio-brand" aria-hidden="true">Color <span class="atlas-lockup-accent">Atlas</span></span><small aria-hidden="true">VFX</small></h2>'
for code in (STATE, UI):
    assert '</script' not in code.lower()


def block(s, tag, ident, body, insert):
    open_tag = f'<{tag} id="{ident}">'
    if open_tag in s:
        a = s.index(open_tag); b = s.index(f'</{tag}>', a) + len(f'</{tag}>')
        return s[:a] + open_tag + '\n' + body + f'</{tag}>' + s[b:]
    return insert(s, open_tag + '\n' + body + f'</{tag}>')


def patch(s):
    anchor = '<script id="atlas-splash-ui">'
    assert s.count(anchor) == 1, 'splash script anchor'
    s = block(s, 'script', 'atlas-onboarding-state', STATE, lambda s, b: s.replace(anchor, b + '\n' + anchor, 1))
    s = block(s, 'style', 'atlas-onboarding-style', STYLE, lambda s, b: s + '\n' + b)
    s = block(s, 'script', 'atlas-onboarding-ui', UI, lambda s, b: s + '\n' + b + '\n')
    # Library export / import (uses the same widget-state bridge).
    s = block(s, 'style', 'atlas-library-io-style', IO_CSS, lambda s, b: s + '\n' + b + '\n')
    s = block(s, 'script', 'atlas-library-io-ui', IO_JS, lambda s, b: s + '\n' + b + '\n')
    # Brand tokens load before the splash paints so both logos share them.
    s = re.sub(r'\n?<style id="atlas-brand-style">[\s\S]*?</style>\n?', '\n', s, count=1)
    s = s.replace(anchor, '<style id="atlas-brand-style">\n' + BRAND + '</style>\n' + anchor, 1)
    # Loading-screen wordmark uses the same markup as the header lockup.
    title = '<h1 id="atlas-splash-title"><span class="studio-brand">Color <span class="atlas-lockup-accent">Atlas</span></span> <small>VFX</small></h1>'
    for old in ('<h1 id="atlas-splash-title">Color Atlas <small>VFX</small></h1>', '<h1 id="atlas-splash-title"><span class="studio-brand">COLOR ATLAS</span><small>VFX</small></h1>', '<h1 id="atlas-splash-title">Color <span class="atlas-lockup-accent">Atlas</span> <small>VFX</small></h1>'):
        s = s.replace(old, title, 1)
    assert title in s, 'loading-screen wordmark'
    # 3D rotation starts off (user preference, v0.13.2).
    s = s.replace('<input id="lab-auto-rotate" type="checkbox" class="form-check-input" checked>', '<input id="lab-auto-rotate" type="checkbox" class="form-check-input">', 1)
    assert '<input id="lab-auto-rotate" type="checkbox" class="form-check-input">' in s
    if OLD_LOGO in s:
        s = s.replace(OLD_LOGO, NEW_LOGO, 1)
    assert s.count(NEW_LOGO) == 1, 'header lockup markup'
    assert s.index('id="atlas-onboarding-state"') < s.index(anchor) < s.index('const raw=JSON.parse')
    for ident in ('atlas-onboarding-state', 'atlas-onboarding-style', 'atlas-onboarding-ui', 'atlas-brand-style', 'atlas-library-io-style', 'atlas-library-io-ui'):
        assert s.count(f'id="{ident}"') == 1, ident
    return s


canonical = Path(sys.argv[1]) if len(sys.argv) > 1 else CANONICAL
export = Path(sys.argv[2]) if len(sys.argv) > 2 else EXPORT
s = patch(canonical.read_text())
assert len(s.encode()) < 1_000_000, 'canonical fragment must stay below 1 MB'
canonical.write_text(s)
print('canonical:', f'{len(s.encode()):,} bytes')
if export.exists():
    e = export.read_text()
    # Host-side preview storage (outside the frame): refreshed from its module, as check_documentation_content expects.
    host = ('const AtlasBuiltinPreview=' + (WORK / 'default-preview.json').read_text() + ';\n' + 'const AtlasDesignPreview=' + (WORK / 'design-preview.json').read_text() + ';\n' + (WORK / 'atlas-preview-storage.js').read_text())
    a = e.index('<script id="atlas-preview-storage">'); b = e.index('</script>', a)
    e = e[:a] + '<script id="atlas-preview-storage">\n' + host + e[b:]
    m = re.search(r'data-srcdoc="([^"]*)"', e)
    e = e[:m.start(1)] + html.escape(patch(html.unescape(m[1])), quote=True) + e[m.end(1):]
    export.write_text(e)
    print('export:', f'{len(e.encode()):,} bytes')
