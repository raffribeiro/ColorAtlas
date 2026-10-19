from pathlib import Path
import base64,html,re
s=Path('outputs/munsell-color-picker.html').read_text()
f=html.unescape(re.search(r'data-srcdoc="([^"]*)"',s)[1])
a=re.search(r'<div class="splash-art" aria-hidden="true"><img src="data:image/png;base64,([^"]+)"',f)
assert a and base64.b64decode(a[1])==Path('work/Explosion_Loading.png').read_bytes()
assert '<span class="splash-version">Version '+Path('VERSION').read_text().strip()+'</span>' in f
assert f.count('class="splash-version"')==1
assert f.count('id="atlas-loading-art-style"')==1
assert 'object-fit:cover' in f
assert 'transform:translate(-8%,5%) scale(2.3);transform-origin:50% 45%' in f
assert '.splash-art{position:relative;overflow:hidden' in f
css=Path('work/atlas-slider-style.css').read_text()
assert '.studio-preview .preview-controls{grid-template-columns:110px minmax(50px,180px) 40px;justify-content:center;' in css
assert '.studio-preview #explosion-bloom{width:100%;min-width:0;max-width:180px;justify-self:center}' in css
assert css in f
assert 'Desktop/' not in f
print('PASS: supplied loading PNG embedded byte-for-byte, release version derived, compact centered bloom CSS synchronized.')

assert '<h1 id="atlas-splash-title"><span class="studio-brand">COLOR ATLAS</span><small>VFX</small></h1>' in f
assert '.splash-mark{color:#fff;border-color:#fff;background-image:none;-webkit-text-fill-color:#fff}' in f
assert 'font-size:26px;line-height:1.15;font-weight:700;letter-spacing:2px' in f
assert '#atlas-splash h1 small{font-size:11px;line-height:1;letter-spacing:1px;color:#bac5d3' in f
print('PASS: white Ca and shared studio-brand COLOR ATLAS wordmark with matching header typography.')
