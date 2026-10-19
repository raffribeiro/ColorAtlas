"""Verify wiki structure, English leads, embedded modules and preserved editor code."""
from pathlib import Path
from html.parser import HTMLParser
import re

SOURCE=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
class Node:
 def __init__(self,tag,attrs,parent):self.tag=tag;self.attrs=dict(attrs);self.parent=parent;self.text=''
 def within(self,id):
  n=self
  while n:
   if n.attrs.get('id')==id:return True
   n=n.parent
  return False
class Page(HTMLParser):
 def __init__(self):super().__init__();self.stack=[];self.nodes=[]
 def handle_starttag(self,tag,attrs):
  node=Node(tag,attrs,self.stack[-1] if self.stack else None);self.nodes.append(node)
  if tag not in {'input','img','br','hr','meta','link'}:self.stack.append(node)
 def handle_startendtag(self,tag,attrs):self.handle_starttag(tag,attrs);self.handle_endtag(tag)
 def handle_endtag(self,tag):
  for i in range(len(self.stack)-1,-1,-1):
   if self.stack[i].tag==tag:self.stack=self.stack[:i];break
 def handle_data(self,text):
  for node in self.stack:node.text+=text

def check(html,exported=False):
 styles=Path('work/atlas-documentation.css').read_text().strip()
 assert styles in html,'Guide reading styles stay synchronized in canonical and export'
 for token in ['max-width:72ch','font-size:15px;line-height:1.8','var(--atlas-chroma)','var(--atlas-chroma-soft)','var(--atlas-chroma-toggle)','::selection{background:#244568;background:oklch(.38 .07 250)','outline:2px solid #d4dfea']:
  assert token in styles,'Missing reading design / accessible highlight: '+token
 assert Path('work/atlas-library-naming.js').read_text().strip() in html,'Reviewed library naming stays synchronized'
 assert Path('work/atlas-lab-surface.js').read_text().strip() in html,'Continuous lightness surface stays synchronized'
 assert Path('work/atlas-neutral-axis.js').read_text().strip() in html,'Neutral spine stays synchronized'
 for module in ['atlas-preset-data-bundle.js','atlas-library-folders-bundle.js']:
  assert Path('work',module).read_text().strip() in html,'Library module synchronization: '+module
 assert Path('work/atlas-preview-fit-bundle.js').read_text().strip() in html,'Preview sizing stays synchronized in canonical and export'
 assert Path('work/atlas-editor-refinements-bundle.js').read_text().strip() in html,'Editor refinements stay synchronized'
 assert Path('work/atlas-editor-refinements.css').read_text().strip() in html,'Editor refinement styles stay synchronized'
 assert Path('work/atlas-context-help.js').read_text().strip() in html,'Context help source stays synchronized'
 assert Path('work/atlas-context-help.css').read_text().strip() in html,'Context help styles stay synchronized'
 assert html.count('data-doc-reset aria-label=')==11,'All examples offer local reset'
 assert Path('work/atlas-attention-bundle.js').read_text().strip() in html,'Attention module stays synchronized in canonical and export'
 assert Path('work/atlas-lab-live-color-bundle.js').read_text().strip() in html,'Live 3D module stays synchronized in canonical and export'
 for file in ['atlas-preview-fit-bundle.js','atlas-preview-camera-bundle.js','atlas-preview-camera.css','atlas-preview-camera.html','atlas-preview-layers-bundle.js','atlas-preview-layers.css','atlas-preview-layers.html','atlas-preview-presets.html']:
  assert Path('work',file).read_text().strip() in html,'Preview layers module differs: '+file
 for file in ['atlas-workspace-resize-bundle.js','atlas-workspace-resize.css','atlas-motion-ui-bundle.js']:
  assert Path('work',file).read_text().strip() in html,'Compiled workspace module differs: '+file
 p=Page();p.feed(html)
 docs=next(n for n in p.nodes if n.attrs.get('id')=='atlas-documentation')
 assert docs.parent.attrs.get('id')=='munsell-picker','Documentation must be a sibling of the editor panels'
 assert docs.attrs.get('lang')=='en' and 'hidden' in docs.attrs
 nodes=[n for n in p.nodes if n.within('atlas-documentation')]
 topics=[n for n in nodes if 'data-doc-topic' in n.attrs];assert len(topics)==10
 keys={n.attrs['data-doc-topic'] for n in topics};assert len(keys)==len(topics)
 for topic in topics:
  children=[n for n in nodes if n.within(topic.attrs['id'])]
  paragraphs=[n for n in children if n.tag=='p'];assert paragraphs and paragraphs[0].attrs.get('class')=='doc-lead',topic.attrs['id']
  assert len(paragraphs[0].text)>90,'Every topic starts with an approachable explanation'
  assert any(n.tag=='h2' for n in children),'Each topic then supplies technical detail'
  h1=next(n for n in children if n.tag=='h1');assert h1.attrs.get('tabindex')=='-1'
  assert not re.search(r'\b(explicação|fórmulas|documentação|não|precisamos|Saturação|Todas as cores)\b',topic.text)
 links=[n for n in nodes if 'data-doc-link' in n.attrs]
 assert {n.attrs['data-doc-link'] for n in links}==keys
 assert all(n.attrs['href']=='#doc-'+n.attrs['data-doc-link'] for n in links)
 # Guide v2: interactive examples replace static diagrams and screenshots.
 examples=[n for n in nodes if 'data-doc-example' in n.attrs];assert len(examples)==11
 assert {n.attrs['data-doc-example'] for n in examples}=={'munsell','lookup','slice','interp','normalize','blend','harmony','bloom','vision','uv','srgb'}
 for figure in examples:
  def under(n):
   n=n.parent
   while n is not None and n is not figure:n=n.parent
   return n is figure
  inner=[n for n in nodes if under(n)]
  canvases=[n for n in inner if n.tag=='canvas'];assert canvases and all(c.attrs.get('role')=='img' and c.attrs.get('aria-label') for c in canvases),'Example canvases need text alternatives'
  controls=[n for n in inner if n.tag in ('input','select')];assert controls and all(c.parent.tag=='label' for c in controls),'Every example control is labeled'
  assert any(n.tag=='figcaption' for n in inner),'Every example explains what to try'
 assert not [n for n in nodes if n.tag in ('svg','img')],'No static diagrams or file images remain in the guide'
 ids=[n.attrs['id'] for n in p.nodes if 'id' in n.attrs];assert len(ids)==len(set(ids)),'No duplicate DOM ids'
 assert next(n for n in nodes if n.attrs.get('id')=='atlas-doc-results').attrs.get('aria-live')=='polite'
 assert any(n.attrs.get('data-studio-view')=='documentation' for n in p.nodes)
 manual=next(n for n in p.nodes if n.attrs.get('id')=='clipboard-dialog')
 assert manual.tag=='dialog' and manual.parent.attrs.get('id')=='munsell-picker','Manual copy must be outside hidden system panels'
 assert manual.attrs.get('aria-labelledby')=='clipboard-title' and manual.attrs.get('aria-describedby')=='clipboard-manual-status'
 assert 'readonly' in next(n for n in p.nodes if n.attrs.get('id')=='clipboard-text').attrs
 for dialog_id in ['palette-save-dialog','palette-delete-dialog']:
  dialog=next(n for n in p.nodes if n.attrs.get('id')==dialog_id)
  assert dialog.tag=='dialog' and dialog.parent.attrs.get('id')=='munsell-picker' and dialog.attrs.get('aria-labelledby') and dialog.attrs.get('aria-describedby')
 for module,file,tag in [('atlas-user-palettes-style','atlas-user-palettes.css','style'),('atlas-documentation-style','atlas-documentation.css','style'),('atlas-documentation-ui','atlas-documentation-bundle.js','script'),('atlas-documentation-examples','atlas-documentation-examples.js','script')]:
  text=re.search(f'<{tag} id="{module}">([\\s\\S]*?)</{tag}>',html)[1]
  assert text.strip()==Path('work',file).read_text().strip(),module+' differs from editable module'
 assert not any('CIELCh' in n.text for n in p.nodes if n.tag=='option')
 return p

source=SOURCE.read_text();check(source)
assert SOURCE.stat().st_size<1_000_000
before=Path('work/selector-before-documentation.html').read_text()
def main(s):return next(m[2] for m in re.finditer(r'<script\b([^>]*)>([\s\S]*?)</script>',s) if 'const raw=JSON.parse' in m[2])
expected=main(before).replace('CIELCh','OKLCh').replace("function labRotationStep(elapsed){if(state.system!=='vfx'||lab3dDrag", "function labRotationStep(elapsed){if(root.dataset?.view==='documentation'||state.system!=='vfx'||lab3dDrag")
def without_export(script):
 # This change replaces the former immediate-copy handler and shared export module only.
 script=re.sub(r"\$\('\[data-action=\"gradient-code\"\]'\)\.addEventListener\('click',e=>\{[\s\S]*?copyCode\(code,[^\n]*?\);\}\);\n",'',script,count=1)
 return re.sub(r'// PNG export options\n[\s\S]*?// End PNG export options','',script,count=1)
def without_colorplay(script):
 script=re.sub(r'// ColorPlay contextual generation\n[\s\S]*?// End ColorPlay contextual generation\n\n?','',script,count=1)
 script=script.replace("if(['colorplay', 'auto',", "if(['auto',",1)
 script=script.replace('const bounds=plan.bounds?.[layer]||[.6,.9],b1=', 'const bounds=[.6,.9],b1=',1)
 script=script.replace("if(type==='colorplay'){best=makeColorPlayPair(random);\n }else if(type==='true-random'){", "if(type==='true-random'){",1)
 script=script.replace('syncColorPlayControl();','')
 baseline=main(Path('work/selector-before-colorplay.html').read_text())
 def lut(s):
  a=s.index('const lut=Array.from({length:256}',s.index('function drawExplosionMap()'))
  b=s.index('});for(let i=0;i<explosionPixels.length',a)+3
  return s[a:b]
 script=script.replace(lut(script),lut(baseline),1)
 return script
def without_clipboard(script):
 baseline=main(Path('work/selector-before-clipboard-fix.html').read_text())
 def block(s):
  a=s.index("root.addEventListener('click',e=>{const target=e.target.closest('[data-copy-hex]')")
  b=s.index("$('[data-action=\"copy\"]').addEventListener",a)
  return s[a:b]
 return script.replace(block(script),block(baseline),1)
def without_user_palettes(script):
 baseline=main(Path('work/selector-before-user-palettes.html').read_text())
 script=re.sub(r'// My palettes: independent[\s\S]*?// End My palettes\n\n?','',script,count=1)
 script=script.replace('libraryFolders:{},userPalettes:[],favoritePresets:[]','libraryFolders:{},favoritePresets:[]',1)
 script=script.replace('if(Array.isArray(m.userPalettes))state.userPalettes=cleanUserPalettes(m.userPalettes);','',1)
 script=re.sub(r'function remember\(strict=false\)\{[^\n]+',lambda _:re.search(r'function remember\(\)\{[^\n]+',baseline)[0],script,count=1)
 def library_block(s):
  a=s.index('let studioLibrarySignature=');b=s.index("$('[data-action=\"gradient-blackbody\"]').addEventListener",a)
  return s[a:b]
 return script.replace(library_block(script),library_block(baseline),1)
def without_workspace_cleanup(script):
 from install_workspace_cleanup import SCRIPT_EDITS
 for old,new in reversed(SCRIPT_EDITS):
  if new:script=script.replace(new,old,1)
  else:
   assert old=="installIframeDropdown($('#mp-system'),'System');\n"
   script=script.replace("installIframeDropdown($('#color-vision'),'Color vision');",old+"installIframeDropdown($('#color-vision'),'Color vision');",1)
 return script
def without_lab_live_color(script):
 a=script.index('function labClickColor(');b=script.index('function hsvRGB(',a)
 assert script[a:b].strip()==Path('work/atlas-lab-live-color-bundle.js').read_text().strip()
 script=script[:a]+Path('work/lab-live-color-before.js').read_text()+script[b:]
 return script.replace('Drag the selection circle to color; drag elsewhere to rotate. OKLab L is vertical;', 'Drag to rotate. OKLab L is vertical;',1)
def without_editor_refinements(script):
 from install_wheel_resize_range import SCRIPT_EDITS as WHEEL_RANGE_EDITS
 for old,new in reversed(WHEEL_RANGE_EDITS):
  assert new in script,'Available-height wheel resizing is embedded'
  script=script.replace(new,old,1)
 from install_lab_nodes import SCRIPT_EDITS as NODE_EDITS
 for old,new in reversed(NODE_EDITS):
  assert new in script,'Stable node-label edit is embedded'
  script=script.replace(new,old,1)
 from install_editor_refinements import SCRIPT_EDITS
 from install_wheel_default import SCRIPT_EDITS as WHEEL_DEFAULT_EDITS
 for old,new in reversed(WHEEL_DEFAULT_EDITS):script=script.replace(new,old,1)
 from install_workspace_resize import SCRIPT_EDITS as WORKSPACE_EDITS
 for old,new in reversed(WORKSPACE_EDITS):script=script.replace(new,old,1)
 script=re.sub(r'// Editor comparison and selection visibility\.[\s\S]*?// End editor comparison and selection visibility\.\n','',script,count=1)
 for old,new in reversed(SCRIPT_EDITS):script=script.replace(new,old,1)
 return script
def without_attention(script):
 from install_attention import SCRIPT_EDITS
 a=script.index('// Color Atlas adaptation:');b=script.index("$('#color-vision').value",a)
 assert script[a:b].strip()==Path('work/atlas-attention-bundle.js').read_text().strip()
 script=script[:a]+Path('work/attention-before.js').read_text()+script[b:]
 for old,new in reversed(SCRIPT_EDITS):script=script.replace(new,old,1)
 return script
def without_preview_layers(script):
 from install_preview_layers import SCRIPT_EDITS
 script=re.sub(r'// Independent image Gradient Maps;[\s\S]*?// End Preview image stack\.\n','',script,count=1)
 for old,new in reversed(SCRIPT_EDITS):script=script.replace(new,old,1)
 return script
def without_library_naming(script):
 import json
 data=Path('work/atlas-preset-data-bundle.js').read_text()
 assert data in script
 script=script.replace(data,Path('work/atlas-preset-data.js').read_text(),1)
 script=script.replace("{id:'fire',name:'Fire',positions:[0,.072,.2,.4,.6,.8,1],colors:['#000000','#120202','#650B06','#CB2A08','#FF790C','#FFCC45','#FFF9DC']}","{id:'fire',name:'Fire',colors:['#120202','#650b06','#cb2a08','#ff790c','#ffcc45','#fff9dc']}",1)
 folders=Path('work/atlas-library-folders-bundle.js').read_text()
 assert folders in script
 script=script.replace(folders,Path('work/library-folders-before.js').read_text(),1)
 script=re.sub(r'// Reviewed library metadata;[\s\S]*?// End reviewed library metadata\.\n','',script,count=1)
 for old,new in reversed(json.loads(Path('work/library-naming-script-edits.json').read_text())):
  assert new in script,'Reviewed naming replacement missing'
  script=script.replace(new,old,1)
 return script
def without_preview_multiselect(script):
 from install_preview_multiselect import SCRIPT_EDITS
 for old,new in reversed(SCRIPT_EDITS):
  assert new in script,'Reviewed multi-selection Random edit is embedded'
  script=script.replace(new,old,1)
 return script

def without_startup(script):
 from install_splash import SCRIPT_EDITS
 for old,new in reversed(SCRIPT_EDITS):
  assert new in script,'Missing deferred editor startup boundary'
  script=script.replace(new,old,1)
 return script
def without_live_gradient(script):
 from install_neutral_axis import SCRIPT_EDITS as NEUTRAL_EDITS
 for old,new in reversed(NEUTRAL_EDITS):
  assert script.count(new)==1,"Neutral spine integration appears once"
  script=script.replace(new,old,1)
 from install_lab_surface import SCRIPT_EDITS as LAB_SURFACE_EDITS
 for old,new in reversed(LAB_SURFACE_EDITS):
  assert script.count(new)==1,'Reviewed continuous surface edit must appear exactly once'
  script=script.replace(new,old,1)
 from install_lab_volume import SCRIPT_EDITS as LAB_VOLUME_EDITS
 for old,new in reversed(LAB_VOLUME_EDITS):
  assert script.count(new)==1,'Reviewed 3D volume edit must appear exactly once'
  script=script.replace(new,old,1)
 from install_lab_axes import SCRIPT_EDITS as LAB_AXES_EDITS
 for old,new in reversed(LAB_AXES_EDITS):
  assert script.count(new)==1,'Reviewed 3D axis edit must appear exactly once'
  script=script.replace(new,old,1)
 script=script.replace("emission:make('fire'),smoke:make('atlas-explosion-smoke')","emission:make('atlas-explosion-fire'),smoke:make('atlas-explosion-smoke')",1)
 script=script.replace('const labDefaultView={yaw:.25,pitch:-.75,zoom:1,panX:0,panY:0};','const labDefaultView={yaw:2.08,pitch:-.2,zoom:1.3,panX:.02,panY:0};',1)
 new='colorWheelDrag.changed=true;drawGradient();'
 old='colorWheelDrag.changed=true;storeGradientLayer();drawColorWheel();drawSelectedColorPreview();drawExplosionMap();'
 assert script.count(new)==1,'Reviewed live wheel ramp update must appear exactly once'
 return script.replace(new,old,1)
assert without_export(without_colorplay(without_clipboard(without_user_palettes(without_workspace_cleanup(without_lab_live_color(without_attention(without_editor_refinements(without_preview_layers(without_library_naming(without_startup(without_preview_multiselect(without_live_gradient(main(source))))))))))))))==without_export(expected),'Reviewed export, ColorPlay, clipboard, My palettes and live 3D changes must preserve unrelated editor handlers and color math'
embedded=re.search(r'// PNG export options\n[\s\S]*?// End PNG export options',main(source))[0]
assert embedded.strip()==Path('work/atlas-png-export-bundle.js').read_text().strip()
for fact in ['Perceptual (OKLab)','Linear RGB','GradientMode.PerceptualBlend','ColorSpace.Linear','Decode sRGB exactly once','UserInterface2D (RGBA)','NoMipmaps','Particle Relative Time','u = (t · (W − 1) + 0.5) / W']:
 assert fact in source,'Missing audited documentation or export detail: '+fact
assert 'Native engine interpolation between those keys can differ from this OKLab ramp' not in source
assert 'Copy operates on the active layer.' not in source
for fact in ['ColorPlay','Josef Albers','16 candidate pairs']:
 assert fact in source,'Missing ColorPlay explanation: '+fact
embedded=re.search(r'// ColorPlay contextual generation\n[\s\S]*?// End ColorPlay contextual generation',main(source))[0]
assert embedded.strip()==Path('work/atlas-colorplay-bundle.js').read_text().strip()
assert Path('work/atlas-clipboard.js').read_text().strip() in source
assert Path('work/atlas-clipboard.css').read_text().strip() in source
for fact in ['Copy manually']:
 assert fact in source,'Missing clipboard behavior or limit: '+fact

assert re.search(r'<script type="application/json" id="mp-data">([\s\S]*?)</script>',before)[1]==re.search(r'<script type="application/json" id="mp-data">([\s\S]*?)</script>',source)[1]
if Path('outputs/munsell-color-picker.html').exists():
 outer=Page();outer.feed(Path('outputs/munsell-color-picker.html').read_text())
 frame=next(n for n in outer.nodes if n.attrs.get('id')=='codex-visualization')
 assert frame.attrs['sandbox']=='allow-scripts allow-forms allow-downloads','Imports preserve the existing iframe permission boundary'
 storage=re.search(r'<script id="atlas-preview-storage">([\s\S]*?)</script>',Path('outputs/munsell-color-picker.html').read_text())
 assert storage and storage[1].strip()==('const AtlasBuiltinPreview='+Path('work/default-preview.json').read_text()+';\n'+'const AtlasDesignPreview='+Path('work/design-preview.json').read_text()+';\n'+Path('work/atlas-preview-storage.js').read_text()).strip(),'Standalone host embeds current image storage module'
 if 'id="atlas-documentation"' in frame.attrs['data-srcdoc']:check(frame.attrs['data-srcdoc'],True)
 else:raise AssertionError('Standalone export has not been regenerated with documentation')
print('PASS: 10 English lead-first topics, valid wiki links, 11 labeled interactive examples, unique IDs, synchronized modules in canonical and export, and preserved editor logic/data outside reviewed modules including attention and editor refinements.')

for dialog_id in ['palette-save-dialog','palette-delete-dialog']:
 p=Page();p.feed(source);n=next(n for n in p.nodes if n.attrs.get('id')==dialog_id)
 assert n.tag=='dialog' and n.parent.attrs.get('id')=='munsell-picker' and n.attrs.get('aria-labelledby') and n.attrs.get('aria-describedby')
assert re.search(r'// My palettes: independent[\s\S]*?// End My palettes',main(source))[0].strip()==Path('work/atlas-user-palettes.js').read_text().strip()
for fact in ['My palettes','Save palette','8 KiB','active ramp or both ramps']:
 assert fact in source,fact
