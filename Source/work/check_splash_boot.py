from pathlib import Path
import re
source=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html').read_text()
root=re.search(r'<div id="munsell-picker"[^>]*>',source)[0]
assert 'data-boot="loading"' in root,'The editor must be covered from the first parsed markup, before any startup JavaScript'
style=source.index('<style id="atlas-splash-style">')
assert style<source.index(root),'Splash visibility rules must precede the editor markup'
assert ':root,html,body{background:#07090f}' in source[:source.index(root)],'The initial frame uses the same dark background as the splash'
output=Path('outputs/munsell-color-picker.html').read_text()
head=output.split('</head>',1)[0]
assert 'id="atlas-initial-background"' in head,'Set the outer page background before the first body paint'
assert 'background:#07090f' in head
frame=re.search(r'<iframe id="codex-visualization"[^>]*>',output)[0]
assert 'style="visibility:hidden"' in frame,'Do not display a blank iframe before its app document is loaded'
assert 'id="atlas-frame-reveal"' in output,'Reveal the loaded frame while the splash covers app warmup'
print('PASS: initial markup guard, early splash CSS, dark shell/frame and load-gated iframe reveal.')
