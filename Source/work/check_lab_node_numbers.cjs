const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html','utf8');
const svg={clientWidth:480,clientHeight:300,setAttribute(){}};
const state={system:'vfx',vfx:{l:60,a:12,b:15},gradientSelection:{kind:'color',index:2},gradientColors:[],lab:{l:50,a:0,b:0}};
const c={state,window:{AtlasLabSurface:{svg:()=>''},AtlasNeutralAxis:{svg:()=>''}},labView:{yaw:2.08,pitch:-.2,zoom:1.3,panX:.02,panY:0},lab3dDrag:null,labVolume:[],field:()=>({style:{}}),toLch:()=>({l:50,c:0,h:0}),activeLabSvg:()=>svg,activeLabColor:()=>state.system==='vfx'?state.vfx:state.lab,dpath:()=>'',labColor:()=>({hex:'#aabbcc'}),fitLabToSRGB:(l,a,b)=>({l,a,b}),selectionStrokeSVG:()=>'',markerAnimationDelay:()=>'',vfxColors:()=>({base:'#aabbcc'}),rgbToLab:hex=>({l:20+parseInt(hex.slice(1),16)%70,a:parseInt(hex.slice(1,3),16)/2-60,b:parseInt(hex.slice(3,5),16)/2-60}),$:()=>({})};
vm.createContext(c);
vm.runInContext(source.slice(source.indexOf('function projectLab('),source.indexOf('// Two restrained OKLab spectra')),c);
vm.runInContext(source.slice(source.indexOf('function layoutLabLabels('),source.indexOf("for(const k of ['l','a','b'])$('#mp-cart-")),c);
function labels(){return [...svg.innerHTML.matchAll(/<text\b([^>]*)>(\d+)<\/text>/g)].map(m=>({attrs:m[1],rank:+m[2]}));}
for(const count of [2,8,16]){
 state.gradientColors=Array.from({length:count},(_,i)=>({t:(count-i-1)/(count-1),hex:'#'+(0x193366+i*0xa0911).toString(16).padStart(6,'0')}));
 // Equal positions must retain the same index tie-break as the list and ramp.
 if(count>=8)state.gradientColors[4].t=state.gradientColors[3].t;
 state.gradientColors.reverse();state.gradientSelection.index=count-1;
 const before=JSON.stringify(state),order=state.gradientColors.map((k,i)=>({k,i})).sort((a,b)=>b.k.t-a.k.t||a.i-b.i);
 for(const selectedKind of ['color','alpha']){
  state.gradientSelection.kind=selectedKind;c.drawLabPlane();
  const numbers=labels();assert.equal(numbers.length,count,'Every gradient node needs a visible, subdued number');
  assert.deepEqual(numbers.map(n=>n.rank).sort((a,b)=>a-b),Array.from({length:count},(_,i)=>i+1));
  for(const n of numbers){
   const index=order[n.rank-1].i;
   assert(n.attrs.includes(`data-lab-node-index="${index}"`),'Rank maps to the actual key index');
   assert(n.attrs.includes('data-lab-node-rank'),'Each rank can be styled independently of axis names');
   assert(n.attrs.includes('font-size="9"'),'Ranks are smaller than axis labels');
   const selected=selectedKind==='color'&&index===state.gradientSelection.index;
   assert.equal(n.attrs.includes('data-lab-selected-rank'),selected);
   assert.equal(n.attrs.includes('data-lab-context'),!selected,'Only other node numbers dim during dragging');
   assert(n.attrs.includes('pointer-events="none"'),'Text must not interfere with camera or marker gestures');
   const x=+n.attrs.match(/\bx="([^"]+)"/)[1],y=+n.attrs.match(/\by="([^"]+)"/)[1];
   assert(x>=0&&x<=svg.clientWidth&&y>=0&&y<=svg.clientHeight);
  }
 }
 state.gradientSelection.kind='color';assert.equal(JSON.stringify(state),before,'Rendering numbers preserves key colors, positions and selection');
}
// Numbers follow a fixed offset from each projected node, rather than jumping to avoid collisions.
state.gradientSelection={kind:'color',index:4};
for(let yaw=0;yaw<Math.PI*2;yaw+=.07){
 c.labView.yaw=yaw;c.drawLabPlane();
 for(const n of labels()){
  const index=+n.attrs.match(/data-lab-node-index="(\d+)"/)[1],selected=index===state.gradientSelection.index;
  const point=c.projectLab(selected?state.vfx:c.rgbToLab(state.gradientColors[index].hex),svg.clientWidth,svg.clientHeight);
  const x=+n.attrs.match(/\bx="([^"]+)"/)[1],y=+n.attrs.match(/\by="([^"]+)"/)[1];
  assert(Math.abs(x-Math.max(8,Math.min(svg.clientWidth-8,point.x+(selected?18:10))))<1e-8,'Node number keeps its fixed horizontal anchor during camera rotation');
  assert(Math.abs(y-Math.max(12,Math.min(svg.clientHeight-6,point.y+4)))<1e-8,'Node number keeps its fixed vertical anchor even when nodes overlap');
 }
}
state.system='labcart';c.drawLabPlane();assert.equal(labels().length,0,'Standalone OKLab view has no gradient-key numbers');
const css=fs.readFileSync('work/atlas-editor-refinements.css','utf8');
assert(/\[data-lab-node-rank\]\{[^}]*opacity:\.35/.test(css),'Unselected ranks have reduced contrast');
assert(/\[data-lab-selected-rank\]\{[^}]*opacity:\.55/.test(css),'Selected rank retains its restrained emphasis');
console.log('PASS: all 2–16 3D gradient nodes have small, muted ranks consistent with list/ramp ordering, ties and alpha selection; drag dimming, pointer gestures and data are preserved.');
