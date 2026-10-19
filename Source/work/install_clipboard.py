from pathlib import Path
import re
base=Path(__file__).parent
source=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
s=source.read_text();a=s.index("root.addEventListener('click',e=>{const target=e.target.closest('[data-copy-hex]')");b=s.index("$('[data-action=\"copy\"]').addEventListener",a)
s=s[:a]+base.joinpath('atlas-clipboard.js').read_text()+s[b:]
if '<dialog id="clipboard-dialog"' not in s:s=s.replace('<footer class="studio-credit">',base.joinpath('atlas-clipboard.html').read_text()+'\n<footer class="studio-credit">',1)
else:s=re.sub(r'<dialog id="clipboard-dialog"[\s\S]*?</dialog>',lambda _:base.joinpath('atlas-clipboard.html').read_text().strip(),s,count=1)
if 'id="atlas-clipboard-style"' not in s:s+='\n<style id="atlas-clipboard-style">\n'+base.joinpath('atlas-clipboard.css').read_text()+'</style>\n'
else:s=re.sub(r'<style id="atlas-clipboard-style">[\s\S]*?</style>',lambda _:'<style id="atlas-clipboard-style">\n'+base.joinpath('atlas-clipboard.css').read_text()+'</style>',s,count=1)
assert len(s.encode())<1_000_000
source.write_text(s);print('Installed clipboard fix:',len(s.encode()),'bytes')
