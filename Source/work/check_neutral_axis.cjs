const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('work/atlas-neutral-axis.js','utf8'),c);
const canonical=fs.readFileSync('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html','utf8');
const start=canonical.indexOf('function projectLab('),end=canonical.indexOf('\n}',start)+2;
c.labView={yaw:0,pitch:0,zoom:1,panX:0,panY:0};vm.runInContext(canonical.slice(start,end),c);
for(const yaw of [0,.25,1.57,3.14])for(const pitch of [-1,-.75,0,.8])for(const zoom of [.5,1,2])for(const L of [0,20,54.7,100]){
 Object.assign(c.labView,{yaw,pitch,zoom,panX:.2,panY:-.1});const project=p=>c.projectLab(p,640,420);
 for(const phase of ['back','front']){
  const part=c.window.AtlasNeutralAxis.svg(L,project,()=> '#777777','test',phase);
  // Negative pitch looks down onto the slice: White is in front, Black behind.
  const upperBehind=pitch>0;
  const upper=(phase==='back')===upperBehind;
  assert(part.includes(`data-neutral-start="${upper?L:0}" data-neutral-end="${upper?100:L}"`),'Camera depth chooses the correct half');
  assert.equal(part.includes('data-neutral-level='),phase==='front','One current-level ring in the front pass');
  assert(!/NaN|Infinity|undefined/.test(part));
 }
 const html=c.window.AtlasNeutralAxis.svg(L,project,l=>'#'+Math.round(l*2.55).toString(16).padStart(2,'0').repeat(3),'test');
 assert(!/NaN|Infinity|undefined/.test(html));assert(html.includes('pointer-events="none"'));
 const q=project({l:L,a:0,b:0});assert(html.includes(`data-center-x="${q.x}" data-center-y="${q.y}"`));
 assert(html.includes(`data-neutral-level="${L}"`));assert(html.includes('offset="0%" stop-color="#000000"'));assert(html.includes('offset="100%" stop-color="#ffffff"'));
 assert.equal((html.match(/<path /g)||[]).length,4);
}
assert(canonical.includes(fs.readFileSync('work/atlas-neutral-axis.js','utf8').trim()));
console.log('PASS neutral cylinder and lightness ring: 192 camera/lightness combinations, finite projection, neutral endpoints, no pointer capture, bounded SVG.');

const back=canonical.indexOf("'vfx':'lab','back');"),surface=canonical.indexOf("svg+=window.AtlasLabSurface.svg(color.l"),front=canonical.indexOf("'vfx':'lab','front');");
assert(back<surface&&surface<front,'Far column renders before slice, near column after it');
assert(canonical.includes("axes.filter(axis=>axis.id!=='l')"),'No overlaid full-height L line');
console.log('PASS camera-aware back/slice/front ordering across 192 cases, one level ring, no overlaid neutral line.');
