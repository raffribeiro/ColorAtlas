from pathlib import Path
import re
source=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
s=source.read_text();backup=Path('work/selector-before-documentation.html')
if not backup.exists():backup.write_text(s)
assert 'id="atlas-documentation"' not in s,'Documentation already installed; edit its modules deliberately instead.'
s=s.replace('<span class="studio-tab">Editor</span>','<nav class="studio-workspace-nav" aria-label="Workspace"><button type="button" class="studio-tab" data-studio-view="editor" aria-pressed="true">Editor</button><button type="button" class="studio-tab" data-studio-view="documentation" aria-controls="atlas-documentation" aria-pressed="false">Documentation</button></nav>',1)
s=s.replace('CIELCh · cylindrical Lab · D65','OKLCh · cylindrical OKLab · D65')
s=s.replace('CIELCh','OKLCh').replace('THE CYLINDRICAL VIEW OF LAB','THE CYLINDRICAL VIEW OF OKLAB')
s=s.replace('Colors interpolate in linear RGB; alpha controls opacity separately.','Colors interpolate in OKLab; alpha controls opacity separately.')
s=s.replace("function labRotationStep(elapsed){if(state.system!=='vfx'||lab3dDrag", "function labRotationStep(elapsed){if(root.dataset?.view==='documentation'||state.system!=='vfx'||lab3dDrag")
s=s.replace('<footer class="studio-credit">',Path('work/atlas-documentation.html').read_text()+'\n<footer class="studio-credit">',1)
# Append modules after the existing modules; never insert by searching closing
# tags inside JavaScript template strings.
s+='\n<style id="atlas-documentation-style">\n'+Path('work/atlas-documentation.css').read_text()+'</style>\n<script id="atlas-documentation-ui">\n'+Path('work/atlas-documentation-bundle.js').read_text()+'</script>\n'
assert len(s.encode())<1_000_000
source.write_text(s)
print('Installed documentation, corrected OKLCh naming, and paused hidden rotation; source bytes:',source.stat().st_size)
