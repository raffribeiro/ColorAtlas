from pathlib import Path
from html.parser import HTMLParser
import re
SOURCE=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
class Node:
 def __init__(self,tag,attrs,parent): self.tag=tag;self.attrs=dict(attrs);self.parent=parent
 def within(self,cls):
  n=self
  while n:
   if cls in n.attrs.get('class','').split(): return True
   n=n.parent
  return False
class Page(HTMLParser):
 def __init__(self):super().__init__();self.stack=[];self.nodes=[]
 def handle_starttag(self,tag,attrs):
  n=Node(tag,attrs,self.stack[-1] if self.stack else None);self.nodes.append(n)
  if tag not in {'input','img','br','hr','meta','link','path','circle','rect','line','polyline','polygon','stop'}:self.stack.append(n)
 def handle_startendtag(self,tag,attrs):self.handle_starttag(tag,attrs);self.handle_endtag(tag)
 def handle_endtag(self,tag):
  for i in range(len(self.stack)-1,-1,-1):
   if self.stack[i].tag==tag:self.stack=self.stack[:i];break
s=SOURCE.read_text();p=Page();p.feed(s)
def field(name):
 matches=[n for n in p.nodes if n.attrs.get('data-field')==name];assert len(matches)==1,(name,len(matches));return matches[0]
for cls,title in [('studio-author','AUTHORING COLORS'),('studio-preview','PREVIEW')]:
 headings=[n for n in p.nodes if n.tag=='h3' and n.within(cls)]
 assert len(headings)==1 and 'studio-panel-title' in headings[0].attrs.get('class','').split(),cls+' has one panel heading'
 assert '<h3 class="studio-panel-title">'+title+'</h3>' in s
assert not any(n.tag=='h3' and n.within('studio-keys') for n in p.nodes),'Keys retain the Color Wheel toolbar title'
preview_style=s.split('<style id="atlas-preview-layers-style">',1)[1].split('</style>',1)[0]
assert preview_style.strip()==Path('work/atlas-preview-layers.css').read_text().strip()
assert 'grid-template-areas:"author keys preview" "ramp ramp preview"' in preview_style,'Preview spans both rows; ramp ends at Keys'
assert 'grid-template-areas:"author" "keys" "ramp" "preview"' in preview_style,'Compact viewports stack all panels'
assert any(n.attrs.get('id')=='preview-layer-list' and n.within('studio-preview') for n in p.nodes),'Layers belong below the Preview'
wheel=field('color-wheel');assert wheel.within('studio-keys'),'Color Wheel must return to Place Keys'
assert not wheel.within('studio-author'),'Author Color no longer owns the wheel'
assert field('wheel-divider').within('studio-keys')
assert field('gradient-keys').within('studio-keys')
assert field('selected-color-preview').within('studio-keys'),'Selected color strip stays above the wheel'
assert s.index('<section class="studio-card studio-keys"')<s.index('data-field="selected-color-preview"')<s.index('data-field="color-wheel"')<s.index('<section class="studio-card studio-preview"'),'Wheel sits below the selected color in Place Keys'
position=[n for n in p.nodes if n.attrs.get('id')=='gradient-position'];assert len(position)==1
assert position[0].within('studio-ramp'),'Position must belong to Gradient Map'
assert not position[0].within('studio-keys'),'Position no longer occupies the Keys column'
for action in ['gradient-png','random-all-layers','gradient-save']:
 matches=[n for n in p.nodes if n.attrs.get('data-action')==action];assert len(matches)==1
 assert 'studio-primary-action' in matches[0].attrs.get('class','').split(),action+' shares primary action styling'
assert '<span class="studio-color-space">Base sRGB</span>' not in s,'Redundant color space caption removed'
for name in ['artist-transition']:
 matches=[n for n in p.nodes if n.attrs.get('id')==name];assert len(matches)==1 and matches[0].within('studio-ramp-settings'),name+' belongs to the secondary settings group'
for removed in ['random-gradient-family','gradient-layer']:
 assert not any(n.attrs.get('id')==removed for n in p.nodes),removed+' menu removed'
 assert "$('#"+removed+"')" not in s,removed+' has no dangling DOM binding'
assert 'random-harmony-range' not in s,'Harmony range dropdown and event references are removed'
assert not any(n.attrs.get('data-field')=='wheel-show-all' for n in p.nodes),'Remove the all-colors toggle'
assert 'wheel-show-all' not in s,'No dangling references after toggle removal'
saturation=[n for n in p.nodes if n.attrs.get('id')=='vfx-saturation'];assert len(saturation)==1
assert saturation[0].parent.within('mp-axis-slider'),'Saturation gets endpoint labels next to its slider'
assert '<span>0%</span><span>100%</span>' in s,'Both saturation endpoints are visible'
assert '#mp-vfx-l::-webkit-slider-runnable-track{border:1px' not in s,'Remove WebKit lightness box stroke'
assert '#mp-vfx-l::-moz-range-track{border:1px' not in s,'Remove Firefox lightness box stroke'
style=s.split('<style id="atlas-author-wheel-layout">',1)[1].split('</style>',1)[0]
assert '.wheel-toolbar>span{grid-column:1;grid-row:1;display:flex;align-items:center;height:24px;' in style,'Wheel title centers on the same row as Reset'
assert '.wheel-toolbar>button{grid-column:2;grid-row:1;justify-self:end;margin:0!important;line-height:18px!important;' in style,'Reset has no offset and shares the title text line height'
assert 'grid-template-columns:auto 1fr auto;align-items:center;gap:8px;height:28px' not in s,'Remove obsolete three-column wheel layout'
assert 'minmax(260px,1.05fr) minmax(200px,.65fr) minmax(0,1.4fr)' in style
assert '.studio-ramp-title>strong{grid-column:1;grid-row:1;' in style,'Gradient Map title shares the toolbar row'
assert '.studio-ramp-position{grid-column:3;grid-row:1;' in style,'Position moves to the right of the controls, aligned with the Gradient Map title'
assert '.studio-ramp-settings{grid-column:2;grid-row:1;' in style,'Secondary controls leave space for Position on the same row'
assert '.studio-export-actions{grid-column:4;grid-row:1;' in style,'Export follows Position on the same row as Gradient Map'
assert '.studio-export-actions{order:5;margin-left:auto;flex-basis:auto;' in style,'Compact Export wraps after the editing controls'
assert style.strip()==re.sub(r'/\*[\s\S]*?\*/','',Path('work/author-wheel-layout.css').read_text()).strip(),'Editable layout CSS stays synchronized with the canonical app'
assert 'studio-hex-tools' in s,'Compact HEX row is preserved'
assert 'height:var(--studio-fitted-wheel-size' in style and 'height:var(--studio-fitted-graph-size' in style
assert "observe($('.studio-author'))" in s,'Author column resizes update wheel and graph budgets'
assert "list:field('gradient-keys').getBoundingClientRect().height" in s,'Wheel divider trades space with the key list'
print('PASS: unique wheel below Place Keys controls, compact HEX retained, narrower key column and independent author resizing.')
