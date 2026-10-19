// Reproduce the outer iframe width/height feedback without browser access.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('outputs/munsell-color-picker.html','utf8');
const source=fs.readFileSync('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html','utf8');
const fit=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('function fit(){pending=false;'));
for(const viewport of [1099,1289,1744,2560]){
 const frame={style:{height:'900px'},addEventListener(){}},queue=[];
 const context={innerWidth:viewport,innerHeight:980,document:{getElementById(){return frame}},requestAnimationFrame(fn){queue.push(fn)},addEventListener(){},MutationObserver:class{constructor(fn){context.mutation=fn}observe(){}}};
 if(fit)vm.runInNewContext(fit,context);
 for(let i=0;i<20;i++){
  queue.splice(0).forEach(fn=>fn());
  const logicalWidth=parseFloat(frame.style.width)||viewport-24;
  // A growing square preview increases natural document height after width changes.
  frame.style.height=(400+logicalWidth*.6)+'px';
  context.mutation?.([{attributeName:'style'}]);
 }
 assert((parseFloat(frame.style.width)||viewport-24)<=viewport-24+1,'Height updates must not enlarge logical width or shrink the entire app at '+viewport+'px');
 assert(!frame.style.transform||frame.style.transform==='none','Preserve control/text size');
}
const viewportStyle=html.match(/<style id="color-atlas-viewport">([\s\S]*?)<\/style>/)?.[1];
assert(viewportStyle,'Export has explicit viewport layout');
assert(/overflow-y:auto/.test(viewportStyle),'Short viewports retain accessible scrolling');
assert(/width:100%/.test(viewportStyle)&&/transform:none/.test(viewportStyle));
assert.equal((html.match(/id="color-atlas-viewport"/g)||[]).length,1,'Fit/export patch remains idempotent');
assert(source.includes('id="color-atlas-responsive-workspace"'),'Constrain workspace and square preview separately');
assert(source.includes('--studio-preview-height'),'Preview uses the whole available rectangular slot');
assert(/max-width:1920px/.test(source),'Ultra-wide workspace has a readable bound');
assert(source.includes('aspect-ratio:1 / 1'),'Square image proportions are retained');
// Regression: removing the caption must not leave the preview at its 260px fallback.
const previewFit=source.match(/<script id="color-atlas-preview-fit">([\s\S]*?)<\/script>/)[1];
let size,imageSide,caption=null;
let manual='';
const layers={style:{getPropertyValue(){return manual}}};
const area={clientWidth:460,clientHeight:420,style:{setProperty(name,value){if(name==='--studio-preview-height')size=parseFloat(value);else {assert.equal(name,'--studio-preview-image-size');imageSide=parseFloat(value)}}}};
const picker={querySelector(selector){return selector==='#preview-layers'?layers:selector.endsWith('figcaption')?caption:area}};
const ctx={window:{},document:{getElementById(){return picker}},ResizeObserver:class{observe(){}},addEventListener(){},requestAnimationFrame(){}};
vm.runInNewContext(previewFit,ctx);ctx.fitStudioPreview();assert.equal(size,420,'caption-free image fills the available height');
for(const [width,height,expected] of [[700,650,650],[280,500,500],[400,64,64],[400,0,0]]){
 area.clientWidth=width;area.clientHeight=height;ctx.fitStudioPreview();assert.equal(size,expected,'Frame follows available height');assert.equal(imageSide,Math.max(width,height),'Square image covers the entire rectangular frame');
}
caption={getBoundingClientRect(){return {height:24}}};area.clientWidth=460;area.clientHeight=420;ctx.fitStudioPreview();assert.equal(size,388,'caption space is reserved when a caption exists');
caption=null;area.clientWidth=740;area.clientHeight=560;manual='';ctx.fitStudioPreview();assert.equal(size,560,'Initial preview uses the full available slot without a startup-only ceiling');
manual='250px';ctx.fitStudioPreview();assert.equal(size,560,'First divider interaction with no geometry change must not jump');
area.clientHeight=561;ctx.fitStudioPreview();assert.equal(size,561,'One pixel of released space grows the image by one pixel');
area.clientHeight=620;ctx.fitStudioPreview();assert.equal(size,620,'Moving the divider down grows the actual square image');
area.clientHeight=900;ctx.fitStudioPreview();assert.equal(size,900,'Canvas fills a tall slot without limiting it to width');
manual='';ctx.fitStudioPreview();assert.equal(size,900,'Reset keeps the same fitting rule instead of reinstating a smaller cap');
console.log('PASS: no fullscreen width/height feedback at 1099/1289/1744/2560px; readable controls, small-window scroll fallback, full-width rectangular preview and idempotent export.');
