from pathlib import Path
import re
BASE=Path(__file__).parent
SOURCE=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
def install():
 content='<script id="color-atlas-preview-fit">\n'+BASE.joinpath('atlas-preview-fit-bundle.js').read_text()+'</script>'
 s,n=re.subn(r'<script id="color-atlas-preview-fit">[\s\S]*?</script>',lambda _:content,SOURCE.read_text())
 assert n==1
 # Drop obsolete square-frame limits; the camera stylesheet owns framing.
 for old in [
  '#munsell-picker .studio-preview .mp-explosion-previews{width:min(100%,520px);margin:0 auto}',
  '#munsell-picker .studio-preview .mp-explosion-previews figure{width:min(100%,var(--studio-preview-size,260px));flex:none}',
  '/* Native-size controls and a bounded square preview at wide viewport widths. */',
  '/* One square preview fills the card without a thumbnail or letterboxing. */'
 ]:s=s.replace(old,'',1)
 assert len(s.encode())<1_000_000
 SOURCE.write_text(s)
if __name__=='__main__':install()
