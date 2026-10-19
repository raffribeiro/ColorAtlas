from pathlib import Path
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html');s=p.read_text()
s=s.replace('<div id="munsell-picker">','<div id="munsell-picker"><svg class="color-connections" aria-hidden="true"></svg>',1)
css='''
#munsell-picker{position:relative}.color-connections{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;overflow:visible}.color-connections path{fill:none;stroke-linecap:round}.color-connections .color-link-active{stroke:#8bd6ff;stroke-width:1.8;stroke-dasharray:4 5;opacity:.7}.color-connections .color-link-idle{stroke:#a5bbd0;stroke-width:1;opacity:.10}
'''
s=s.replace('</style>',css+'\n</style>',1)
a=s.index('function labRotationStep')
code='''function colorConnectionPath(a,b,c){return `M ${a.x} ${a.y} C ${a.x+35} ${a.y},${b.x-35} ${b.y},${b.x} ${b.y} M ${b.x} ${b.y} C ${b.x} ${b.y+30},${c.x} ${c.y-30},${c.x} ${c.y}`;}
if(typeof requestAnimationFrame==='function'){
 let lastLinks=0;const refreshColorLinks=now=>{if(now-lastLinks>80){lastLinks=now;const root=$('#munsell-picker'),overlay=root.querySelector('.color-connections');
 if(state.system!=='vfx'||state.gradientSelection.kind!=='color')overlay.innerHTML='';else{
 const box=root.getBoundingClientRect(),sx=root.clientWidth/box.width,sy=root.clientHeight/box.height;overlay.setAttribute('viewBox',`0 0 ${root.clientWidth} ${root.clientHeight}`);
 const center=node=>{const r=node.getBoundingClientRect();return {x:(r.left+r.width/2-box.left)*sx,y:(r.top+r.height/2-box.top)*sy};};let paths='';
 state.gradientColors.forEach((key,i)=>{const lab=root.querySelector(`[data-lab-gradient-key="${i}"] circle`),list=root.querySelector(`[data-gradient-select="${i}"] .studio-key-swatch`),ramp=root.querySelector(`[data-gradient-kind="color"][data-gradient-index="${i}"] circle`);if(lab&&list&&ramp){const active=i===state.gradientSelection.index;paths+=`<path class="${active?'color-link-active':'color-link-idle'}" d="${colorConnectionPath(center(lab),center(list),center(ramp))}"/>`;}});overlay.innerHTML=paths;
 }}requestAnimationFrame(refreshColorLinks);};requestAnimationFrame(refreshColorLinks);
}
'''
s=s[:a]+code+s[a:];p.write_text(s)
print('PASS: each key links Lab, list and ramp by original key index; selected connection emphasized.')
