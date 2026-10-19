from pathlib import Path
import re
BASE=Path(__file__).parent
SOURCE=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
SCRIPT_EDITS=[
 ('String(label.text).length*6.2+8', 'String(label.text).length*(label.selectedRank?5:6.2)+(label.selectedRank?4:8)'),
 ('for(const dy of [-10,18,-28,36,-46,54,-64,72])for(const dx of [0,20,-20,40,-40,60,-60,80,-80])', 'for(const dy of label.selectedRank?[4,-10,18,-28]:[-10,18,-28,36,-46,54,-64,72])for(const dx of label.selectedRank?[0,6,-6,20,-20,40,-40]:[0,20,-20,40,-40,60,-60,80,-80])'),
 ("function loadGradientColor(){if(state.gradientSelection.kind!=='color')return;Object.assign", "function loadGradientColor(){if(state.gradientSelection.kind!=='color')return;requestGradientKeyReveal();Object.assign"),
 ('const w=target.clientWidth||640,H=target.clientHeight||390;lab3dGeometry={w,H};', 'target.setAttribute(\'data-editing-color\',String(lab3dDrag?.mode===\'color\'&&lab3dDrag.moved));const w=target.clientWidth||640,H=target.clientHeight||390;lab3dGeometry={w,H};'),
 ('<circle cx="${p.x}" cy="${p.y}" r="${p.slice?3.2:2}"', '<circle ${!p.slice&&Math.abs(p.l-color.l)>.5?\'data-lab-context\':\'\'} cx="${p.x}" cy="${p.y}" r="${p.slice?3.2:2}"'),
 ('<polyline points="${[...keys]', '<polyline data-lab-context points="${[...keys]'),
 ('<g data-lab-gradient-key="${p.index}" style="pointer-events:none">', '<g data-lab-gradient-key="${p.index}" ${selected?\'\':\'data-lab-context\'} style="pointer-events:none">'),
 ('drawHotBloom(ctx);applyColorVisionPreview(ctx,state.colorVision);','drawHotBloom(ctx);syncVisionComparison(ctx);applyColorVisionPreview(ctx,state.colorVision);'),
 ("</div>`).join('');\n}\nfunction gradientChange", "</div>`).join('');revealSelectedGradientKey();\n}\nfunction gradientChange")
]
SCRIPT_EDITS += [
 ('''const marker=project(color);
 if(state.system==='vfx'&&state.gradientSelection.kind==='color'){
  const rank=state.gradientColors.map((k,i)=>({k,i})).sort((a,b)=>b.k.t-a.k.t||a.i-b.i).findIndex(p=>p.i===state.gradientSelection.index)+1;
  labelAnchors.unshift({x:marker.x+18,y:marker.y,text:String(rank),selectedRank:true});
 }
 const labLabels=layoutLabLabels(labelAnchors,w,H,[{left:marker.x-16,right:marker.x+16,top:marker.y-16,bottom:marker.y+16}]);''',
 '''const marker=project(color);
 const keys=state.system==='vfx'?state.gradientColors.map((k,i)=>({...project(state.gradientSelection.kind==='color'&&state.gradientSelection.index===i?color:rgbToLab(k.hex)),hex:k.hex,index:i})).sort((a,b)=>state.gradientColors[b.index].t-state.gradientColors[a.index].t||a.index-b.index):[];keys.forEach((p,i)=>p.rank=i+1);
 const nodeLabels=keys.map(p=>({x:p.x+10,y:p.y+4,text:String(p.rank),nodeIndex:p.index,nodeRank:true,selectedRank:state.gradientSelection.kind==='color'&&state.gradientSelection.index===p.index}));
 const selectedLabel=nodeLabels.find(p=>p.selectedRank);
 if(selectedLabel)labelAnchors.unshift({...selectedLabel,x:marker.x+18,y:marker.y});
 labelAnchors.push(...nodeLabels.filter(p=>!p.selectedRank));
 const labLabels=layoutLabLabels(labelAnchors,w,H,[{left:marker.x-16,right:marker.x+16,top:marker.y-16,bottom:marker.y+16},...keys.filter(p=>p.index!==selectedLabel?.nodeIndex).map(p=>({left:p.x-5,right:p.x+5,top:p.y-5,bottom:p.y+5}))]);'''),
 (''' if(state.system==='vfx'){
 const keys=state.gradientColors.map((k,i)=>({...project(state.gradientSelection.kind==='color'&&state.gradientSelection.index===i?color:rgbToLab(k.hex)),hex:k.hex,index:i})).sort((a,b)=>state.gradientColors[b.index].t-state.gradientColors[a.index].t||a.index-b.index);keys.forEach((p,i)=>p.rank=i+1);''',
 ''' if(state.system==='vfx'){
 // Use the same ranked nodes for labels and path.'''),
 ('''for(const label of labLabels)svg+=`<text class="lab-axis-label"${label.selectedRank?' data-lab-selected-rank':''} x="${label.x}" y="${label.y}" text-anchor="middle" fill="var(--foreground)" stroke="var(--background)" stroke-width="3" paint-order="stroke" font-size="${label.selectedRank?9:11}">${label.text}</text>`;''',
 '''for(const label of labLabels)svg+=`<text class="lab-axis-label"${label.nodeRank?` data-lab-node-rank data-lab-node-index="${label.nodeIndex}" pointer-events="none"${label.selectedRank?' data-lab-selected-rank':' data-lab-context'}`:''} x="${label.x}" y="${label.y}" text-anchor="middle" fill="var(--foreground)" stroke="var(--background)" stroke-width="${label.nodeRank?2:3}" paint-order="stroke" font-size="${label.nodeRank?9:11}">${label.text}</text>`;''')
]
def install():
 s=SOURCE.read_text()
 from install_lab_nodes import SCRIPT_EDITS as NODE_EDITS
 probe=s
 for old,new in reversed(NODE_EDITS):probe=probe.replace(new,old,1)
 for old,new in SCRIPT_EDITS:
  if new not in s and new not in probe:
   assert old in s,old[:80];s=s.replace(old,new,1)
 module=BASE.joinpath('atlas-editor-refinements-bundle.js').read_text()
 if '// Editor comparison and selection visibility.' in s:s=re.sub(r'// Editor comparison and selection visibility\.[\s\S]*?// End editor comparison and selection visibility\.\n',lambda _:module,s,count=1)
 else:s=s.replace('function drawExplosionMap(){',module+'function drawExplosionMap(){',1)
 markup=BASE.joinpath('atlas-editor-refinements.html').read_text().strip()
 if 'id="vision-comparison"' not in s:s=s.replace('aria-label="Explosion with current gradient applied"></canvas></figure>','aria-label="Explosion with current gradient applied"></canvas>'+markup+'</figure>',1)
 style='<style id="atlas-editor-refinements-style">\n'+BASE.joinpath('atlas-editor-refinements.css').read_text()+'</style>'
 if 'id="atlas-editor-refinements-style"' in s:s=re.sub(r'<style id="atlas-editor-refinements-style">[\s\S]*?</style>',lambda _:style,s,count=1)
 else:s+=style
 SOURCE.write_text(s);print('Installed editor refinements:',len(s.encode()),'bytes; rebuild docs before final size check')
def install_styles():
 s=SOURCE.read_text()
 style='<style id="atlas-editor-refinements-style">\n'+BASE.joinpath('atlas-editor-refinements.css').read_text()+'</style>'
 s,n=re.subn(r'<style id="atlas-editor-refinements-style">[\s\S]*?</style>',lambda _:style,s,count=1)
 assert n==1,'Expected the installed refinement stylesheet'
 SOURCE.write_text(s)
 print('Installed editor refinement styles')
if __name__=='__main__':
 import sys
 if '--styles-only' in sys.argv:install_styles()
 else:install()
