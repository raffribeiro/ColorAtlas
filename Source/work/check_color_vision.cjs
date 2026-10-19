const fs=require('fs'),vm=require('vm'),assert=require('assert');
const file='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const html=fs.readFileSync(file,'utf8'),data=html.match(/<script type="application\/json" id="mp-data">([\s\S]*?)<\/script>/)[1];
const nodes=new Map();function node(k){if(k==='[data-field="vfx-doc-link"]')return null;if(!nodes.has(k))nodes.set(k,{dataset:{},value:'',textContent:'',innerHTML:'',style:{setProperty(k,v){this[k]=v}},parentElement:{hidden:true,style:{setProperty(){}},setAttribute(){}},clientWidth:k.includes('scene')?420:700,clientHeight:390,handlers:{},attrs:{},addEventListener(n,f){this.handlers[n]=f},setAttribute(n,v){this.attrs[n]=v},getBoundingClientRect(){return {left:0,top:0}},setPointerCapture(id){this.capture=id},hasPointerCapture(id){return this.capture===id},releasePointerCapture(){this.capture=null},select(){},appendChild(){},append(){},replaceChildren(){},focus(){},querySelector(){return null},contains(){return false},options:[]});return nodes.get(k);}
const root={getBoundingClientRect(){return {left:0,top:0,width:700}},querySelector:node,addEventListener(n,f){node("root").handlers[n]=f}};node('#mp-data').textContent=data;
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
const context={parent:{postMessage(){}},Image:class{constructor(){context.explosionImage=this}set src(v){}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},document:{getElementById(){return root},createElement:()=>node('created-'+Math.random()),body:{appendChild(){}},addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},structuredClone,window:{openai:{widgetState:{modelContent:{h:'5G',v:4,c:0,system:process.env.START_VFX?'vfx':'munsell'}},setWidgetState(value){context.savedState=value;return Promise.resolve()}},addEventListener(){}},navigator:{},ResizeObserver:class{constructor(fn){}observe(){}},console};
vm.runInNewContext(script.replace('new ResizeObserver', 'globalThis.inspectMunsell={state,restore,drawSystem,gradientSample,simulateColorVisionPixels,drawExplosionMap,setPreviewTestPixels(v,a){explosionPixels=v;explosionAlpha=a;Object.assign(previewImages[0],{gray:v,alpha:a});explosionRenderSignature=null;explosionImageBuffer=null;}}; new ResizeObserver'),context);

const markup=html.slice(0,html.indexOf('<style>'));
assert(markup.includes('id="color-vision"'),'Preview must have a color vision dropdown');
const choices=[...markup.match(/<select id="color-vision"[\s\S]*?<\/select>/)[0].matchAll(/<option value="([^"]+)"/g)].map(m=>m[1]);
assert.deepEqual(choices,['normal','protanopia','deuteranopia','tritanopia','protanomaly','deuteranomaly','tritanomaly','grayscale']);
assert(html.includes("installIframeDropdown($('#color-vision'),'Color vision')"),'Use the iframe-safe HTML menu');
const app=context.inspectMunsell,s=app.state;
assert.equal(s.colorVision,'normal');
const encode=n=>Math.round((n<=.0031308?12.92*n:1.055*n**(1/2.4)-.055)*255);
const fixtures={protanopia:[.152286,.114503,0],deuteranopia:[.367322,.280085,0],tritanopia:[1,0,.004733],protanomaly:[.458064,.092785,0],deuteranomaly:[.547494,.181692,0],tritanomaly:[1,0,.006379],grayscale:[.2126,.2126,.2126]};
for(const [mode,linear] of Object.entries(fixtures)){
 const pixels=new Uint8ClampedArray([255,0,0,123,128,128,128,45,0,0,0,255,255,255,255,255]);
 app.simulateColorVisionPixels(pixels,mode);
 assert.deepEqual(Array.from(pixels.slice(0,4)),[...linear.map(encode),123],mode+' linear red reference');
 assert.deepEqual(Array.from(pixels.slice(4,8)),[128,128,128,45],mode+' neutral and alpha preserved');
 assert.deepEqual(Array.from(pixels.slice(8)),[0,0,0,255,255,255,255,255]);
}
for(const mode of ['normal','invalid','constructor','__proto__']){const p=new Uint8ClampedArray([25,120,220,50]);app.simulateColorVisionPixels(p,mode);assert.deepEqual(Array.from(p),[25,120,220,50]);}
// Color mode is a view preference; it must not change the gradient or exported samples.
const colors=JSON.stringify(s.gradientLayers),sample=JSON.stringify(app.gradientSample(.42));
for(const mode of choices){node('#color-vision').value=mode;node('#color-vision').handlers.change();assert.equal(s.colorVision,mode);assert.equal(context.savedState.modelContent.colorVision,mode);assert.equal(JSON.stringify(s.gradientLayers),colors);assert.equal(JSON.stringify(app.gradientSample(.42)),sample);}
app.restore({colorVision:'deuteranopia'});app.drawSystem();assert.equal(node('#color-vision').value,'deuteranopia');app.restore({colorVision:'bad'});assert.equal(s.colorVision,'deuteranopia');
// Exercise real preview rendering, cache invalidation and restoring the original image.
let buffer,puts=0;
const canvasCtx={createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)}},putImageData(img){buffer={data:img.data.slice()};puts++},getImageData(){return {data:buffer.data.slice()}}};
node('[data-field="explosion-mapped"]').getContext=()=>canvasCtx;let regular;node('#vision-compare-original').getContext=()=>({putImageData(img){regular=img.data.slice();}});
s.gradientLayers=null;s.gradientColors=[{t:0,hex:'#ff0000'},{t:1,hex:'#ff0000'}];s.gradientAlphas=[{t:0,a:1},{t:1,a:1}];s.explosionBloom=0;s.explosionGlow=0;node('#attention-toggle').checked=false;
app.setPreviewTestPixels(new Uint8Array([100]),new Uint8Array([177]));
function setMode(mode){node('#color-vision').value=mode;node('#color-vision').handlers.change();return Array.from(buffer.data.slice(0,4));}
assert.deepEqual(setMode('normal'),[255,0,0,177]);
assert.deepEqual(setMode('protanopia'),[...fixtures.protanopia.map(encode),177]);assert.deepEqual(Array.from(regular.slice(0,4)),[255,0,0,177],'Regular comparison captures mapped RGB and source alpha before simulation');
const count=puts;app.drawExplosionMap();assert.equal(puts,count,'Unchanged preview uses cache');
assert.deepEqual(setMode('normal'),[255,0,0,177],'Normal restores original pixels, without accumulated filters');
assert(html.indexOf('drawHotBloom(ctx);syncVisionComparison(ctx);applyColorVisionPreview(ctx,state.colorVision);')>=0,'Simulate the completed bloom before attention overlay');
console.log('PASS: 8 preview choices, linear RGB references, neutral/alpha preservation, persistence, unchanged gradients, redraw/cache and Normal restoration.');

// The hidden source canvas must still initialize the full-resolution preview.
const sourcePixels=new Uint8ClampedArray(512*512*4);
for(let i=0;i<sourcePixels.length;i+=4)sourcePixels.set([100,100,100,255],i);
sourcePixels.set([200,200,200,123],0);
node('[data-field="explosion-gray"]').getContext=()=>({drawImage(){},getImageData(){return {data:sourcePixels}},putImageData(){}});
context.explosionImage.onload();
assert.deepEqual(Array.from(buffer.data.slice(0,4)),[255,0,0,123]);
assert.deepEqual(Array.from(buffer.data.slice(4,8)),[255,0,0,255]);
console.log('PASS: image loading through the hidden source canvas preserves full-resolution preview and alpha.');
