from pathlib import Path
from PIL import Image
import base64,re,sys,shutil
asset=Path('outputs/explosion-grayscale-v2.png');shutil.copyfile(sys.argv[1],asset)
im=Image.open(asset).convert('RGB');print('Original channels:',im.getextrema());print('Gray levels:',len(set(im.convert('L').getdata())))
im.save('work/explosion-preview-v2.jpg',quality=85,optimize=True)
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
s=p.read_text();encoded=base64.b64encode(Path('work/explosion-preview-v2.jpg').read_bytes()).decode();s,n=re.subn(r"image.src='data:image/[^;]+;base64,[^']+'", "image.src='data:image/jpeg;base64,"+encoded+"'",s);assert n==1;p.write_text(s);print('Embedded replacement bytes:',p.stat().st_size)
