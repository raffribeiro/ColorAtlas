from pathlib import Path
BASE=Path(__file__).parent
SOURCE=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
SCRIPT_EDITS=[("attention.title='Estimated attention · luminance and contrast';","attention.title='Estimated attention · 1 Primary, 2 Secondary, 3 Tertiary';"),("controls[3].setAttribute('aria-label','Estimated attention');","controls[3].setAttribute('aria-label','Show estimated primary, secondary and tertiary attention');")]
def install():
 s=SOURCE.read_text();a=s.index('// Color Atlas adaptation:') if '// Color Atlas adaptation:' in s else s.index('// Lightweight intensity saliency');b=s.index("$('#color-vision').value",a)
 s=s[:a]+BASE.joinpath('atlas-attention-bundle.js').read_text()+s[b:]
 for old,new in SCRIPT_EDITS:s=s.replace(old,new,1)
 s=s.replace('title="Estimated attention · luminance and contrast"','title="Estimated attention · 1 Primary, 2 Secondary, 3 Tertiary"',1)
 s=s.replace('id="attention-toggle" type="checkbox" aria-label="Estimated attention"','id="attention-toggle" type="checkbox" aria-label="Show estimated primary, secondary and tertiary attention" aria-describedby="attention-legend"',1)
 s=s.replace('Low → high attention · blue → yellow → red. Luminance and local contrast estimate, not measured gaze.','1 Primary · 2 Secondary · 3 Tertiary. Color, luminance and edge saliency; not measured gaze.')
 SOURCE.write_text(s)
 print('Attention installed; rebuild docs before final size check:',len(s.encode()))
if __name__=='__main__':install()
