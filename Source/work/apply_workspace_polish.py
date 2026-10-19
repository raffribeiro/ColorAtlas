from pathlib import Path
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
s=p.read_text();Path('work/selector-before-workspace-polish.html').write_text(s)
def change(a,b):
 global s
 assert s.count(a)==1,(a[:120],s.count(a));s=s.replace(a,b)
change('randomType:"auto",libraryFolders:', 'randomType:"perceptual",randomDefaultsVersion:1,libraryFolders:')
change('<option value="perceptual">Perceptual</option>','<option value="perceptual" selected>Perceptual</option>')
change("const randomType=m.randomType??(m.artistHarmony==='theme'?'auto':m.artistHarmony);", "const savedRandomType=m.randomType??(m.artistHarmony==='theme'?'auto':m.artistHarmony);const randomType=savedRandomType==='auto'&&m.randomDefaultsVersion!==1?'perceptual':savedRandomType;")
change('<details class="studio-card studio-lab" style="margin:12px 18px">','<details class="studio-card studio-lab" hidden style="margin:12px 18px">')
change('<section class="studio-card studio-preview"><div class="studio-preview-toolbar"><h3>Preview</h3>', '<section class="studio-card studio-preview"><h3>03 · PREVIEW MAP</h3><div class="studio-preview-toolbar">')
change('<div class="mp-vfx-visuals"><svg class="mp-vfx-lab', '<div class="mp-vfx-visuals"><div class="studio-graph-caption"><span data-field="lab-view-lightness"></span><span>Drag to rotate</span></div><svg class="mp-vfx-lab')
# All four selected-circle views use the identical renderer, spectrum and clock.
start=s.index('<span class="studio-key-swatch" style="background:')
end=s.index('</span>',start)+len('</span>')
change(s[start:end], '''<span class="studio-key-swatch" style="background:${isAlpha?rgbHex([k.a,k.a,k.a]):k.hex}">${i===state.gradientSelection.index?'<svg class="studio-selection-ring" width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" focusable="false">'+selectionStrokeSVG(16,16,12,2.5,isAlpha?rgbHex([k.a,k.a,k.a]):k.hex)+'</svg>':''}</span>''')
# Use nearby free label positions instead of clipping multiple labels to the same point.
helper='''function layoutLabLabels(labels,w,H,obstacles=[]){
 const occupied=[...obstacles],placed=[];
 const overlap=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
 for(const label of labels){
  const width=Math.min(w-8,String(label.text).length*6.2+8),height=16;
  let best=null,bestScore=Infinity;
  for(const dy of [-10,18,-28,36,-46,54,-64,72])for(const dx of [0,20,-20,40,-40,60,-60,80,-80]){
   const x=Math.max(width/2+4,Math.min(w-width/2-4,label.x+dx)),y=Math.max(14,Math.min(H-6,label.y+dy));
   const box={left:x-width/2,right:x+width/2,top:y-12,bottom:y+4};
   const collision=occupied.reduce((sum,rect)=>sum+overlap(box,rect),0),score=collision*100000+(x-label.x)**2+(y-label.y)**2;
   if(score<bestScore){bestScore=score;best={...label,...box,x,y};}
  }
  placed.push(best);occupied.push(best);
 }
 return placed;
}
'''
change('function drawLabPlane(){',helper+'function drawLabPlane(){')
old='''for(const [p,label] of [[{l:100,a:0,b:0},'White'],[{l:0,a:0,b:0},'Black'],[{l:50,a:bounds,b:0},'Red'],[{l:50,a:-bounds,b:0},'Green'],[{l:50,a:0,b:bounds},'Yellow'],[{l:50,a:0,b:-bounds},'Blue']]){const point=project(p);svg+=`<text x="${Math.max(55,Math.min(w-55,point.x))}" y="${Math.max(20,Math.min(H-15,point.y-9))}" text-anchor="middle">${label}</text>`;}'''
new='''const labelAnchors=[[{l:100,a:0,b:0},'White'],[{l:0,a:0,b:0},'Black'],[{l:50,a:bounds,b:0},'Red'],[{l:50,a:-bounds,b:0},'Green'],[{l:50,a:0,b:bounds},'Yellow'],[{l:50,a:0,b:-bounds},'Blue']].map(([p,text])=>({...project(p),text}));
 const marker=project(color);
 if(state.system==='vfx'&&state.gradientSelection.kind==='color'){
  const rank=state.gradientColors.map((k,i)=>({k,i})).sort((a,b)=>b.k.t-a.k.t||a.i-b.i).findIndex(p=>p.i===state.gradientSelection.index)+1;
  labelAnchors.unshift({x:marker.x+18,y:marker.y,text:String(rank),selectedRank:true});
 }
 const labLabels=layoutLabLabels(labelAnchors,w,H,[{left:marker.x-16,right:marker.x+16,top:marker.y-16,bottom:marker.y+16}]);'''
change(old,new)
change('<text x="${p.x+10}" y="${p.y-10}" fill="var(--foreground)" opacity="${selected?1:.3}" font-size="${selected?9:8}">${p.rank}</text>','')
change('''<text x="${w/2}" y="18" text-anchor="middle">L ${color.l.toFixed(1)}% · drag to rotate</text>`;''','''${state.system==='vfx'?'':`<text x="${w/2}" y="18" text-anchor="middle">L ${color.l.toFixed(1)}% · drag to rotate</text>`}`;
 for(const label of labLabels)svg+=`<text class="lab-axis-label"${label.selectedRank?' data-lab-selected-rank':''} x="${label.x}" y="${label.y}" text-anchor="middle" fill="var(--foreground)" stroke="var(--background)" stroke-width="3" paint-order="stroke" font-size="${label.selectedRank?9:11}">${label.text}</text>`;
 if(state.system==='vfx')field('lab-view-lightness').textContent=`L ${color.l.toFixed(1)}%`;''')
# Normalize older embedded controls without replacing their event handlers.
change("const heading=document.createElement('h3');heading.textContent='Preview';toolbar.appendChild(heading);", "const heading=document.createElement('h3');heading.textContent='03 · PREVIEW MAP';")
change('panel.prepend(toolbar);\n}', 'panel.prepend(toolbar);panel.prepend(heading);\n}')
p.write_text(s)
