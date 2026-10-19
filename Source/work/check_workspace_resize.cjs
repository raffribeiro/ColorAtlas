const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html','utf8');
const script=source.match(/<script id="atlas-workspace-resize">([\s\S]*?)<\/script>/)?.[1];
assert(script,'Workspace needs visible, functional column and internal splitters');
class Node{
 constructor(rect){this.rect=rect;this.clientWidth=rect.width;this.clientHeight=rect.height;this.children=[];this.handlers={};this.attrs={};this.style={setProperty(k,v){this[k]=v},getPropertyValue(k){return this[k]||''},removeProperty(k){delete this[k]}};this.dataset={}}
 getBoundingClientRect(){return this.rect}setAttribute(k,v){this.attrs[k]=v}addEventListener(k,f){this.handlers[k]=f}append(n){this.children.push(n)}setPointerCapture(id){this.capture=id}hasPointerCapture(id){return this.capture===id}releasePointerCapture(){this.capture=null}
}
assert(fs.readFileSync('work/atlas-workspace-resize.css','utf8').includes('minmax(260px,1.05fr) minmax(200px,.7fr) minmax(0,1.35fr)'),'Reference default columns follow approximately 34/23/43 proportions');
const main=new Node({left:10,top:10,width:1200,height:800}),author=new Node({left:22,top:22,right:382,bottom:622,width:360,height:600}),keys=new Node({left:392,top:22,right:632,bottom:622,width:240,height:600}),preview=new Node({left:642,top:22,right:1198,bottom:798,width:556,height:776}),ramp=new Node({left:22,top:632,right:632,bottom:798,width:610,height:166}),layers=new Node({left:654,top:640,width:532,height:146}),list=new Node({left:654,top:704,width:532,height:80});
const map={'.studio-main':main,'.studio-author':author,'.studio-keys':keys,'.studio-preview':preview,'.studio-ramp':ramp,'.studio-ramp-title':new Node({left:22,top:632,width:600,height:28}),'#preview-layers':layers,'#preview-layer-list':list},root={querySelector:k=>map[k]},frames=new Map();let next=0;
let wide=true;const c={document:{getElementById:()=>root,createElement:()=>new Node({left:0,top:0,width:12,height:12})},getComputedStyle:()=>({columnGap:'10px',rowGap:'10px',paddingTop:'12px',paddingBottom:'12px'}),matchMedia:()=>({matches:wide}),ResizeObserver:class{observe(){}},requestAnimationFrame:f=>{frames.set(++next,f);return next},addEventListener(){},Math};
vm.createContext(c);vm.runInContext(script,c);const flush=()=>{for(const f of frames.values())f();frames.clear()};flush();
assert.equal(parseFloat(layers.style['--atlas-layers-default-height']).toFixed(2),'232.80','Reference default gives Layers 30% and Preview about 70% of the column');
const all=[...main.children,...layers.children];assert.equal(all.length,4);assert(all.every(n=>n.attrs.role==='separator'&&n.tabIndex===0));
const col=all.find(n=>n.attrs['aria-label']==='Resize Authoring Colors and Keys');
const ev=x=>({button:0,pointerId:7,clientX:382,clientY:622,preventDefault(){},...x});
col.handlers.pointerdown(ev());col.handlers.pointermove(ev({clientX:442}));flush();assert(main.style['--atlas-columns'].includes('200px,180fr')===false,'Pair stops at Keys minimum');
assert(main.style['--atlas-columns'].includes('400fr')&&main.style['--atlas-columns'].includes('200fr'),'Pair uses the available 40px without shrinking Keys below minimum');
col.handlers.pointerup(ev());const before=main.style['--atlas-columns'];col.handlers.pointermove(ev({clientX:200}));assert.equal(main.style['--atlas-columns'],before,'Release ends resize');
col.handlers.dblclick();assert(!main.style['--atlas-columns'],'Double click resets default columns');col.handlers.keydown(ev({key:'ArrowRight'}));assert(main.style['--atlas-columns'].includes('376fr'),'Keyboard resizes by 16px');
const row=all.find(n=>n.attrs['aria-label']==='Resize Gradient Map');row.handlers.keydown(ev({key:'ArrowUp'}));assert.equal(main.style['--atlas-ramp-height'],'182px');row.handlers.keydown(ev({key:'Home'}));assert(!main.style['--atlas-ramp-height']);
const layer=all.find(n=>n.attrs['aria-label']==='Resize Preview and Layers');
// Simulate the reference default being laid out before the first pointer interaction.
layers.rect.height=232.80;list.rect.height=166.8;
layer.handlers.pointerdown(ev());layer.handlers.pointermove(ev());assert.equal(layers.style['--atlas-layers-height'],'232.8px','First interaction preserves the displayed default without a jump');layer.handlers.pointerup(ev());
layer.handlers.dblclick();flush();assert(!layers.style['--atlas-layers-height']);assert.equal(parseFloat(layers.style['--atlas-layers-default-height']).toFixed(2),'232.80','Reset returns to the same reference default');
layers.rect.height=146;list.rect.height=80;
layer.handlers.pointerdown(ev());layer.handlers.pointermove(ev({clientY:572}));assert.equal(layers.style['--atlas-layers-height'],'196px','Upward drag expands the whole Layers panel, transferring space from the image');layer.handlers.pointercancel(ev());assert.equal(layer.capture,null);
layer.handlers.pointerdown(ev());layer.handlers.pointermove(ev({clientY:652}));assert.equal(layers.style['--atlas-layers-height'],'116px','Downward drag releases 30px for the preview image');layer.handlers.pointerup(ev());
assert.equal(col.attrs['aria-valuemin'],260);assert.equal(layer.attrs['aria-valuemin'],104);assert.equal(layer.attrs['aria-valuemax'],476);
layer.handlers.keydown(ev({key:'ArrowDown'}));assert.equal(layers.style['--atlas-layers-height'],'130px','Down arrow also transfers space to the image');
layer.handlers.pointerdown(ev());layer.handlers.pointermove(ev({clientY:2000}));assert.equal(layers.style['--atlas-layers-height'],'104px','Keep layer toolbar, status and a usable list visible');layer.handlers.pointercancel(ev());
layer.handlers.pointerdown(ev());layer.handlers.pointermove(ev({clientY:-2000}));assert.equal(layers.style['--atlas-layers-height'],'476px','Reserve space for the image and preview controls');layer.handlers.pointerup(ev());
row.handlers.pointerdown(ev());row.handlers.pointermove(ev({clientY:2000}));assert.equal(main.style['--atlas-ramp-height'],'164px','Gradient controls retain their measured minimum');row.handlers.pointerup(ev());
map['.studio-ramp-title'].rect.height=60;row.handlers.keydown(ev({key:'ArrowDown'}));assert.equal(main.style['--atlas-ramp-height'],'196px','Wrapping toolbar increases the minimum instead of clipping controls');
layer.handlers.keydown(ev({key:'Home'}));assert(!layers.style['--atlas-layers-height']);
preview.clientHeight=1000;layer.handlers.dblclick();flush();assert.equal(layers.style['--atlas-layers-default-height'],'300px','Reset uses the responsive reference proportion');
preview.clientHeight=500;layer.handlers.dblclick();flush();assert.equal(layers.style['--atlas-layers-default-height'],'150px','Shorter columns preserve the 300px preview/control reserve');
preview.clientHeight=350;layer.handlers.dblclick();flush();assert.equal(layers.style['--atlas-layers-default-height'],'104px','Keep layer controls visible when the reference fraction does not fit');
preview.clientHeight=776;layer.handlers.dblclick();flush();
wide=false;layer.handlers.dblclick();flush();assert(!layers.style['--atlas-layers-default-height'],'Compact layout uses natural Layers sizing');const columns=main.style['--atlas-columns'];col.handlers.keydown(ev({key:'ArrowLeft'}));assert.equal(main.style['--atlas-columns'],columns,'Compact layouts ignore column resizing');wide=true;
main.rect.width=2400;for(const n of [author,keys,preview,ramp])for(const key of ['width','height'])n.rect[key]*=2;
col.handlers.pointerdown(ev({clientX:800}));col.handlers.pointermove(ev({clientX:820}));assert(main.style['--atlas-columns'].includes('370fr')&&main.style['--atlas-columns'].includes('230fr'),'Displayed 20px drag at 2× scale exchanges 10 logical pixels');col.handlers.pointercancel(ev());
col.handlers.pointerdown(ev({button:2}));assert.equal(col.capture,null,'Right button does not start a resize');
const graph=new Node({left:22,top:100,width:360,height:250});let fits=0;Object.assign(c,{root:{style:main.style},$:s=>map[s],vfxLab:graph,fitStudioKeys(){fits++},drawLabPlane(){},drawColorWheel(){}});
vm.runInContext(source.slice(source.indexOf('function setStudioSize('),source.indexOf("for(const [name,kind] of [['sidebar-divider'")),c);c.setStudioSize('lab',300);assert.equal(author.style['--atlas-graph-height'],'300px');assert.equal(fits,1,'Manual graph resizing updates the live fitted budget');
assert(source.includes("'--atlas-graph-height'"),'Existing graph divider now sets an independently constrained height');
assert(source.includes('#preview-layers{height:var(--atlas-layers-height,var(--atlas-layers-default-height,auto));display:flex;flex-direction:column;box-sizing:border-box}'),'Manual height controls the whole Layers box so the image flex slot receives released space');
console.log('PASS: column and internal splitters, bounds, keyboard, reset, pointer capture/release/cancel and independent graph sizing.');
