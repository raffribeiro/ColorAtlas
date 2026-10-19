from pathlib import Path
import subprocess
BASE=Path(__file__).parent
SOURCE=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
def install():
 subprocess.run(['node',str(BASE/'build_lab_live_color.cjs')],cwd=BASE.parent,check=True)
 s=SOURCE.read_text();a=s.index('function labClickColor(');b=s.index('function hsvRGB(',a)
 s=s[:a]+BASE.joinpath('atlas-lab-live-color-bundle.js').read_text()+s[b:]
 for old in ['Drag to rotate. OKLab L is vertical;', 'Drag the slice to color; Shift-drag to rotate. OKLab L is vertical;']:
  s=s.replace(old,'Drag the selection circle to color; drag elsewhere to rotate. OKLab L is vertical;',1)
 for old in ['<span>Drag to rotate</span>', '<span>Drag slice · Shift-drag rotate</span>']:
  s=s.replace(old,'<span>Drag circle · Elsewhere rotates</span>',1)
 assert len(s.encode())<1_000_000,'Rebuild/compact documentation before embedding this module'
 SOURCE.write_text(s)
 print('Installed live 3D color:',len(s.encode()),'bytes; rebuild documentation before export.')
if __name__=='__main__':install()
