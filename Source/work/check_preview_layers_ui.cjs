const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const layerCss=fs.readFileSync('work/atlas-preview-layers.css','utf8');
assert(/#preview-layer-list\{[^}]*overflow-y:auto;overflow-x:hidden/.test(layerCss),'Layer hover/pan must not create a horizontal scrollbar; vertical scrolling stays available');
assert(/#preview-layer-list button span\{[^}]*min-width:0[^}]*text-overflow:ellipsis/.test(layerCss),'Long layer names shrink and truncate within the available column');
class Node{
 constructor(){this.children=[];this.dataset={};this.handlers={};this.style={setProperty(){}};this.value='';}
 addEventListener(k,f){this.handlers[k]=f}setAttribute(k,v){this[k]=v}append(...a){this.children.push(...a)}replaceChildren(...a){this.children=[...a]}click(){this.clicked=true}
}
const nodes=new Map(),get=s=>{if(!nodes.has(s))nodes.set(s,new Node());return nodes.get(s)};
const layer=hex=>({colors:[{t:0,hex},{t:1,hex}],alphas:[{t:0,a:1},{t:1,a:1}],transition:'smooth',preset:'custom'});
const state={gradientLayers:{emission:layer('#ff0000'),smoke:layer('#333333')},gradientLayer:'emission',explosionView:'active',explosionSplit:.72,artistTransition:'smooth',gradientPreset:'custom'};state.gradientColors=state.gradientLayers.emission.colors;state.gradientAlphas=state.gradientLayers.emission.alphas;
let painted=0,writes=[],fail=false,requestHandler;const timers=new Map();let nextTimer=0,revoked=0;
let encodedPixels;
const makeCanvas=()=>{let image={data:Uint8ClampedArray.from([255,0,0,255,0,255,0,128,0,0,255,0])},written=false;return {width:512,height:512,getContext:()=>({drawImage(){},getImageData:()=>image,putImageData(value){image=value;written=true}}),toDataURL(){assert(written,'Grayscale pixels are written before the stored image is encoded');encodedPixels=[...image.data];return 'data:image/png;base64,AA=='}}};
const c={state,structuredClone,root:new Node(),$:get,explosionPixels:Uint8Array.from([0,255]),explosionAlpha:Uint8Array.from([255,255]),explosionRenderSignature:null,lab3dDrag:null,colorWheelDrag:null,gradientDrag:null,
 window:{addEventListener(k,f){if(k==='message')requestHandler=f}},parent:{postMessage(d){queueMicrotask(()=>requestHandler({source:c.parent,data:{channel:d.channel,id:d.id,ok:!fail,payload:d.action==='read'?null:d.action==='preset-list'?[]:(writes.push(d.payload),null)}}))}},
 setTimeout(fn,ms){timers.set(++nextTimer,{fn,ms});return nextTimer},clearTimeout(id){timers.delete(id)},Date,
 document:{createElement(tag){if(tag==='canvas')return makeCanvas();return new Node()}},
 Image:class{constructor(){this.width=this.height=512}set src(v){queueMicrotask(()=>this.onload())}},URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){revoked++}},
 storeGradientLayer(){state.gradientLayers[state.gradientLayer]={colors:state.gradientColors,alphas:state.gradientAlphas,transition:state.artistTransition,preset:state.gradientPreset}},validGradientLayer:p=>!!p&&p.colors?.length>=2&&p.alphas?.length>=2,middleGradientIndex:()=>0,loadGradientColor(){},drawLabPlane(){},drawVfx(){c.syncPreviewLayer();painted++},drawExplosionMap(){painted++},remember(){c.savePreviewStack()},encodeSRGB:v=>v,
};vm.createContext(c);vm.runInContext(fs.readFileSync('work/atlas-preview-layers-bundle.js','utf8'),c);
const tick=()=>new Promise(r=>setImmediate(r));
(async()=>{
 c.initializePreviewLayers();c.previewReferenceReady('data:image/png;base64,AA==');await tick();
 assert.equal(vm.runInContext('previewImages.length',c),1);const first=vm.runInContext('previewSelected',c);
 get('[data-preview-action="add"]').handlers.click();assert(get('#preview-layer-file').clicked,'Add opens the image chooser');
 const file=get('#preview-layer-file');file.files=[{name:'Second.png',type:'image/png',size:10}];await file.handlers.change({target:file});
 assert.equal(vm.runInContext('previewImages.length',c),2);const second=vm.runInContext('previewSelected',c);assert.notEqual(first,second);assert.equal(revoked,1);
 assert.deepEqual(encodedPixels,[54,54,54,255,182,182,182,128,18,18,18,0],'Imported asset is grayscale, including transparent RGB');
 assert.deepEqual([...vm.runInContext('previewImages[1].gray',c)],[54,182,18]);assert.deepEqual([...vm.runInContext('previewImages[1].alpha',c)],[255,128,0]);
 state.gradientColors[0].hex='#0000ff';state.gradientColors[1].hex='#0000ff';c.syncPreviewLayer();c.selectPreviewLayer(first);assert.equal(state.gradientColors[0].hex,'#ff0000');c.selectPreviewLayer(second);assert.equal(state.gradientColors[0].hex,'#0000ff','Selection restores its own Gradient Map');
 get('#preview-blend').handlers.change({target:{value:'multiply'}});assert.equal(vm.runInContext('previewImages[1].blend',c),'multiply');get('#preview-opacity').handlers.input({target:{value:40}});assert.equal(vm.runInContext('previewImages[1].opacity',c),.4);
 get('[data-preview-action="down"]').handlers.click();assert.equal(vm.runInContext('previewImages[0].id',c),second,'Backward changes composition order');
 const row=get('#preview-layer-list').children.find(n=>n.dataset.selected==='true');row.children[0].checked=false;row.children[0].handlers.change();assert.equal(vm.runInContext('previewImages[0].visible',c),false);
 const before=JSON.stringify(state.gradientColors);get('[data-preview-action="replace"]').handlers.click();file.files=[{name:'Replaced.png',type:'image/png',size:10}];await file.handlers.change({target:file});assert.equal(JSON.stringify(state.gradientColors),before,'Replacing image preserves its map');
 assert.deepEqual(encodedPixels,[54,54,54,255,182,182,182,128,18,18,18,0],'Replacement also stores grayscale RGB');
 const doc=vm.runInContext('previewDocument(previewImages,previewSelected)',c);assert(c.cleanPreviewDocument(doc));assert(!JSON.stringify(doc).includes('_lut'));assert(!JSON.stringify(doc).includes('"gray"'));
 for(const [id,t] of [...timers])if(t.ms===350){timers.delete(id);t.fn()}await tick();assert(writes.length);assert.equal(get('#preview-layer-status').textContent,'Saved locally');
 state.gradientColors[0].hex='#00ff00';vm.runInContext('previewTouched=false',c);await c.restorePreviewStack(doc);assert.equal(state.gradientColors[0].hex,'#0000ff');
 assert.deepEqual(encodedPixels,[54,54,54,255,182,182,182,128,18,18,18,0],'Older imported assets convert on restore too');
 c.lab3dDrag={};c.savePreviewStack();assert(![...timers.values()].some(t=>t.ms===350),'Live drag does not schedule a storage write');c.lab3dDrag=null;
 fail=true;c.savePreviewStack();for(const [id,t] of [...timers])if(t.ms===350){timers.delete(id);t.fn()}await tick();assert(get('#preview-layer-status').textContent.startsWith('Session only'));
 get('[data-preview-action="remove"]').handlers.click();get('[data-preview-action="remove"]').handlers.click();assert.equal(vm.runInContext('previewImages.length',c),0);assert(painted>5);
 timers.clear();let pendingRead;c.parent.postMessage=d=>{pendingRead=d};vm.runInContext('previewLoaded=false;previewTouched=false',c);c.initializePreviewLayers();
 const fresh=vm.runInContext('previewSelected',c);
 c.root.handlers.pointerdown({isTrusted:true,target:{closest:selector=>selector.includes('#atlas-splash')?{}:null}});
 assert.equal(vm.runInContext('previewTouched',c),false,'Skip on the splash must not cancel saved-layer restoration during warmup');
 for(const targetClass of ['.preview-camera-controls','.mp-explosion-previews']){
  const target={closest:selector=>selector.includes(targetClass)?{}:null};
  const pendingTimer=c.setTimeout(()=>{},350);
  c.root.handlers.pointerdown({isTrusted:true,target});c.root.handlers.input({isTrusted:true,target});
  assert.equal(vm.runInContext('previewTouched',c),false,'Preview camera interaction must not cancel saved-layer restoration');
  assert(timers.has(pendingTimer),'Preview camera interaction must preserve pending scene writes');c.clearTimeout(pendingTimer);
 }
 c.root.handlers.pointerdown({isTrusted:true});
 requestHandler({source:c.parent,data:{channel:pendingRead.channel,id:pendingRead.id,ok:true,payload:doc}});await tick();
 assert.equal(vm.runInContext('previewSelected',c),fresh,'Input during restore preserves the current session');
 assert.equal(vm.runInContext('previewLoaded',c),false,'Input during restore cannot overwrite an older saved stack');
 assert(![...timers.values()].some(t=>t.ms===350));assert(get('#preview-layer-status').textContent.includes('reload to restore'));
 console.log('PASS: real image import/replacement, independent map selection, visibility/order/blend/opacity, remove, persistence acknowledgements and failure feedback.');
})().catch(e=>{console.error(e);process.exitCode=1});
