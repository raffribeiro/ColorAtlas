const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const html=fs.readFileSync(source,'utf8');
const markup=html.match(/<input\b[^>]*id="lab-auto-rotate"[^>]*>/)[0];
const code=html.slice(html.indexOf('function labRotationStep('),html.indexOf('\nconst labVolume='));
function app(reduced=false){
 const toggle={checked:/\bchecked\b/.test(markup)},frames=[];
 const context={state:{system:'vfx'},root:{dataset:{view:'editor'}},lab3dDrag:null,labView:{yaw:0},document:{hidden:false},draws:0,
  $:()=>toggle,matchMedia:()=>({matches:reduced}),requestAnimationFrame:fn=>frames.push(fn),drawLabPlane:()=>context.draws++};
 vm.createContext(context);vm.runInContext(code,context);
 return {context,toggle,step:elapsed=>context.labRotationStep(elapsed),frame:now=>frames.shift()(now)};
}
const a=app();assert.equal(a.toggle.checked,true,'Automatic rotation starts enabled');
assert(a.step(.05));assert.equal(a.context.labView.yaw,.003,'Rotation uses half the previous angular speed');
a.context.labView.yaw=0;a.step(4);assert.equal(a.context.labView.yaw,.006,'Long frame delays remain capped');
a.context.labView.yaw=2*Math.PI-.001;a.step(.05);assert(Math.abs(a.context.labView.yaw-.002)<1e-12,'Angles wrap');
for(const elapsed of [0,-1]){const yaw=a.context.labView.yaw;a.step(elapsed);assert.equal(a.context.labView.yaw,yaw);}
a.context.root.dataset.view='documentation';const pausedYaw=a.context.labView.yaw;assert.equal(a.step(.05),false,'Documentation pauses background rotation');assert.equal(a.context.labView.yaw,pausedYaw);a.context.root.dataset.view='editor';
a.context.lab3dDrag={};assert.equal(a.step(.05),false);a.context.lab3dDrag=null;
a.toggle.checked=false;assert.equal(a.step(.05),false);a.toggle.checked=true;
a.context.state.system='lab';assert.equal(a.step(.05),false);a.context.state.system='vfx';
const b=app();b.frame(100);b.frame(150);assert.equal(b.context.draws,1);assert.equal(b.context.labView.yaw,.003);
b.context.document.hidden=true;b.frame(200);assert.equal(b.context.draws,1);assert.equal(b.context.labView.yaw,.003);
const c=app(true);assert.equal(c.toggle.checked,false,'Reduced-motion preference is respected');c.toggle.checked=true;assert(c.step(.05),'Manual opt-in remains available');
console.log('PASS: enabled startup, half-speed rotation, delay cap, angle wrap, drag/toggle/mode/hidden-tab pauses and reduced-motion opt-in.');
