const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync('work/atlas-onboarding.js','utf8');
const begin=code.indexOf('// On-demand tour placement'),end=code.indexOf('// End on-demand tour placement');
assert(begin>=0&&end>begin,'Placement must be invalidated instead of perpetually polled');
let count=0,next=0;const frames=new Map(),events=new Map(),resize=[],mutations=[];
const eventNode=name=>({name,isConnected:true,addEventListener(type,fn){events.set(name+':'+type,fn)},removeEventListener(type){events.delete(name+':'+type)}});
const root=eventNode('root'),card=eventNode('card'),layer={hidden:false,contains:n=>n?.overlay===true},target=eventNode('target'),watch=eventNode('watch');
const c={root,card,layer,toast:{},frame:0,active:{els:[target],watch:[watch],step:{}},window:eventNode('window'),document:eventNode('document'),PULSE_EVENTS:['input'],pulse(){},
 requestAnimationFrame(fn){frames.set(++next,fn);return next},cancelAnimationFrame(id){frames.delete(id)},place(){count++},
 ResizeObserver:class{constructor(fn){this.fn=fn;this.observed=new Set();resize.push(this)}observe(n){this.observed.add(n)}unobserve(n){this.observed.delete(n)}disconnect(){this.observed.clear()}},
 MutationObserver:class{constructor(fn){this.fn=fn;mutations.push(this)}observe(){this.connected=true}disconnect(){this.connected=false}}
};vm.createContext(c);vm.runInContext(code.slice(begin,end),c);
const flush=()=>{const f=[...frames.values()];frames.clear();for(const fn of f)fn()};
c.startPlacement();assert.equal(frames.size,1);c.queuePlace();c.queuePlace();assert.equal(frames.size,1,'Coalesce invalidations');flush();assert.equal(count,1);assert.equal(frames.size,0,'No idle placement RAF');
assert(resize.at(-1).observed.has(target)&&resize.at(-1).observed.has(watch));
resize.at(-1).fn([]);flush();assert.equal(count,2);
events.get('window:scroll')({});events.get('window:resize')({});flush();assert.equal(count,3,'Scroll and resize refresh once');
mutations.at(-1).fn([{target:{overlay:true}}]);assert.equal(frames.size,0,'Own overlay writes do not feed back');
const graph={closest:s=>s.includes('svg')?{}:null};mutations.at(-1).fn([{target:graph}]);assert.equal(frames.size,0,'Static target ignores graphics-only redraws');
c.active.step.hand=()=>({});mutations.at(-1).fn([{target:graph}]);flush();assert.equal(count,4,'Moving marker hint follows graph redraw');
const replacement=eventNode('replacement');c.active.els=[replacement];c.queuePlace();flush();assert(!resize.at(-1).observed.has(target));assert(resize.at(-1).observed.has(replacement));
events.get('root:pointermove')({target:{},buttons:0,type:'pointermove'});assert.equal(frames.size,0,'Hover does not remeasure');
events.get('root:pointermove')({target:{},buttons:1,type:'pointermove'});assert.equal(frames.size,1,'Drag invalidates');
c.stopPlacement();assert.equal(frames.size,0);assert.equal(events.size,0);assert(!mutations.at(-1).connected);assert.equal(resize.at(-1).observed.size,0);
resize.at(-1).fn([]);mutations.at(-1).fn([{target:{}}]);c.queuePlace();assert.equal(frames.size,0,'Late observer delivery stays stopped');
c.startPlacement();flush();c.layer.hidden=true;c.queuePlace();assert.equal(frames.size,0);c.stopPlacement();
assert(code.includes('schedulePlace')||code.includes('queuePlace'));
assert(!/function loop\(\)\s*\{\s*place\(\)/.test(code));
console.log('PASS: coalesced event-driven placement, no idle loop/hover work, resize/scroll/DOM/marker tracking, target replacement and complete stop/restart cleanup.');

(async()=>{
 const frames=new Map(),cleared=[],calls=[];let id=0;
 const svg={getBoundingClientRect:()=>({left:0,bottom:200}),dispatchEvent:e=>calls.push('svg:'+e.type)};
 const c={layer:{hidden:false},at:4,solid:()=>svg,PointerEvent:class{constructor(type,opts){this.type=type;Object.assign(this,opts)}},window:{dispatchEvent:e=>calls.push('window:'+e.type)},performance:{now:()=>0},requestAnimationFrame(fn){frames.set(++id,fn);return id},cancelAnimationFrame(i){frames.delete(i)},clearTimeout:i=>cleared.push(i)};
 vm.createContext(c);vm.runInContext(code.slice(code.indexOf('let cameraDemoTimer='),code.indexOf('function selectKey(')),c);
 vm.runInContext('cameraDemoTimer=17;',c);
 const pending=c.orbit(0,105);assert.equal(frames.size,1);c.stopCameraDemo();const released=calls.length;c.layer.hidden=true;await pending;
 assert.equal(frames.size,0);assert(cleared.includes(17));assert.equal(calls.length,released,'No delayed pointer event after close');assert.equal(calls.filter(x=>x==='svg:pointerup').length,1,'Release active camera drag during cleanup exactly once');
 c.layer.hidden=false;const old=c.orbit(0,105);c.stopCameraDemo();const newer=c.orbit(0,105);const before=calls.length;await old;assert.equal(calls.length,before,'Cancelled old orbit cannot release a new drag');c.stopCameraDemo();await newer;
 console.log('PASS: delayed camera timer/RAF cancellation releases during teardown, without late pointer events or cross-session drag release.');
})().catch(e=>{console.error(e);process.exitCode=1;});
