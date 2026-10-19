from pathlib import Path
import re
BASE=Path(__file__).parent
SOURCE=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
# Keep the exact reviewed replacements available for preservation checks.
SCRIPT_EDITS=[
 ('system:"munsell",lab:', 'system:"vfx",lab:'),
 ("if(['vfx','labcart','lab','munsell'].includes(m.system))state.system=m.system;", "state.system='vfx';"),
 ("function drawSystem(){\n", "function drawSystem(){\n state.system='vfx';\n"),
 ("installIframeDropdown($('#mp-system'),'System');\n", ''),
 ("[['GREEN',26,94],['YELLOW',110,15],['RED',193,94],['BLUE',110,175]]", "[['GREEN',18,94],['YELLOW',110,15],['RED',202,94],['BLUE',110,175]]"),
 ("function drawGradient(){$('#artist-transition')", "function drawGradient(){if(state.gradientSelection.kind!=='color')state.gradientSelection={kind:'color',index:middleGradientIndex()};$('#artist-transition')"),
 ("let svg='<title>Editable RGBA gradient</title>';", "let svg='<title>Editable color gradient</title>';"),
 ("for(const kind of ['alpha','color'])", "for(const kind of ['color'])"),
 ("if(e.button!==0)return;if(!g){const box=gradientSvg", "if(e.button!==0||g&&g.dataset.gradientKind!=='color')return;if(!g){const box=gradientSvg"),
 ("kind=e.clientY-box.top<30?'alpha':'color',keys=", "kind='color',keys=")
]
HTML_EDITS=[
 ('<label class="form-label" for="mp-system">System</label>', '<label class="form-label" for="mp-system" hidden>System</label>'),
 ('<select id="mp-system" class="form-select">', '<select id="mp-system" class="form-select" hidden>'),
 ('<label class="form-label" for="mp-vfx-engine">Engine</label>', '<label class="form-label" for="mp-vfx-engine" hidden>Engine</label>'),
 ('<select id="mp-vfx-engine" class="form-select">', '<select id="mp-vfx-engine" class="form-select" hidden>'),
 ('<label class="viz-row studio-muted"><input id="lab-auto-rotate" type="checkbox" checked> Slow rotation ', '<label class="viz-row studio-muted form-check form-switch"><input id="lab-auto-rotate" type="checkbox" class="form-check-input" checked><span class="form-check-label">Slow rotation</span> '),
 ('<figcaption>Combined importance layers · neutral black backdrop</figcaption>', ''),
 ('<button class="btn" type="button" data-action="gradient-code">Copy gradient data</button>', ''),
 ('aria-label="Gradient with alpha keys above and color keys below; drag keys to change position"', 'aria-label="Color gradient; drag color keys below the ramp to change position"'),
 ('Color below the ramp. Alpha above. Drag to position.', 'Color keys below the ramp. Drag to position.')
]
# Keep legacy controls as hidden state adapters for saved maps and presets.
INSPECTION_UI_EDITS=[
 ('<label class="form-label" for="explosion-view">', '<label class="form-label" for="explosion-view" hidden>'),
 ('<select id="explosion-view" class="form-select">', '<select id="explosion-view" class="form-select" hidden>'),
 ('data-action="gradient-toggle-layer" title=', 'data-action="gradient-toggle-layer" hidden title=')
]
def install():
 s=SOURCE.read_text()
 if 'Color gradient; drag color keys below' not in s:
  for old,new in HTML_EDITS+SCRIPT_EDITS:
   assert old in s,old
   s=s.replace(old,new,1)
 for old,new in INSPECTION_UI_EDITS:
  if new not in s:
   assert old in s,old
   s=s.replace(old,new,1)
 # Export behavior is edited in its own maintained module.
 s=re.sub(r'// PNG export options\n[\s\S]*?// End PNG export options',lambda _:BASE.joinpath('atlas-png-export-bundle.js').read_text().strip(),s,count=1)
 assert len(s.encode())<1_000_000
 SOURCE.write_text(s)
 print('Installed VFX workspace cleanup:',len(s.encode()),'bytes')
if __name__=='__main__':install()
