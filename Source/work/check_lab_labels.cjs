const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html','utf8');
const start=source.indexOf('function layoutLabLabels('),end=source.indexOf('function drawLabPlane(){',start);
assert(start>=0,'Graph labels need a collision-aware layout');
const context={labView:{yaw:2.08,pitch:-.2,zoom:1.3,panX:.02,panY:0}};vm.createContext(context);
vm.runInContext(source.slice(start,end),context);
vm.runInContext(source.slice(source.indexOf('function projectLab('),source.indexOf('// Two restrained OKLab spectra')),context);
const anchors=[['White',100,0,0],['Black',0,0,0],['Red',50,110,0],['Green',50,-110,0],['Yellow',50,0,110],['Blue',50,0,-110]];
const overlaps=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
for(const [w,h] of [[260,100],[320,160],[480,240]])for(const pitch of [-.2,-.5])for(let yaw=0;yaw<Math.PI*2;yaw+=.3){
 context.labView.yaw=yaw;context.labView.pitch=pitch;
 const labels=anchors.map(([text,l,a,b])=>({text,...context.projectLab({l,a,b},w,h)}));
 const selected=context.projectLab({l:78,a:20,b:28},w,h),obstacle={left:selected.x-15,right:selected.x+15,top:selected.y-15,bottom:selected.y+15};
 const result=context.layoutLabLabels(labels,w,h,[obstacle]);
 assert.equal(result.length,6);
 for(const [i,label] of result.entries()){
  assert(label.left>=0&&label.right<=w&&label.top>=0&&label.bottom<=h,'Labels remain within the graph');
  assert(!overlaps(label,obstacle),'Keep labels clear of the selected color');
  for(const earlier of result.slice(0,i))assert(!overlaps(label,earlier),'Labels must not overlap at '+[w,h,pitch,yaw,label.text,earlier.text]);
 }
}
assert(source.includes('data-field="lab-view-lightness"'),'Lightness has a separate caption outside the SVG');
for(const rank of ['4','16']){
 const marker={x:160,y:90},obstacle={left:144,right:176,top:74,bottom:106};
 const label=context.layoutLabLabels([{x:marker.x+18,y:marker.y,text:rank,selectedRank:true}],320,180,[obstacle])[0];
 assert(Math.hypot(label.x-marker.x,label.y-marker.y)<=28,'Selected rank stays beside its circle instead of jumping away');
 assert(!overlaps(label,obstacle),'Selected rank clears the selection ring');
}
console.log('PASS: graph labels stay separated, visible and clear of selection across camera rotations and three graph sizes.');
