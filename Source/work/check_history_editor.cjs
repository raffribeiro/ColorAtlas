const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let boot=fs.readFileSync('work/check_simple_random.cjs','utf8').split("console.log('PASS: full app")[0];
boot=boot.replace('resetDefaultExplosion,restore};','resetDefaultExplosion,restore,previewDocument,quietPreview:()=>{drawExplosionMap=()=>{};},normalize:enabled=>atlasNormalizeSelectedValues(enabled),effective:()=>[...previewLayerGray(previewImages[0])],dropImage:()=>{drawExplosionMap=()=>{};readPreviewImage=async()=>({gray:Uint8Array.from([40]),alpha:Uint8Array.from([255]),asset:"data:image/png;base64,TEST"});return atlasReplaceDroppedImage({type:"image/png",size:4},previewSelected);},getStack:()=>previewDocument(previewImages,previewSelected),getRandom:()=>[...previewRandomSelection],setStack:stack=>{previewImages=stack;previewSelected=stack[0].id;previewSelection=new Set([stack[0].id]);previewRandomSelection=new Set([stack[0].id]);applyPreviewSelection(stack[0]);}};');
boot=boot.replace('const script=[...html.matchAll(/<script>([\\s\\S]*?)<\\/script>/g)][0][1];','let script=[...html.matchAll(/<script>([\\s\\S]*?)<\\/script>/g)].find(m=>m[1].includes("const raw=JSON.parse"))[1];if(!script.includes("// Atlas history integration"))script=script.replace("new ResizeObserver(()=>{drawScene();",fs.readFileSync("work/atlas-history-core.js","utf8")+fs.readFileSync("work/atlas-history-ui.js","utf8")+"new ResizeObserver(()=>{drawScene();");');
boot=boot.replace('vm.runInNewContext(script.replace',`const tasks=new Map(),docEvents={};let seq=0;
context.setTimeout=(fn,ms)=>{tasks.set(++seq,{fn,ms});return seq};context.clearTimeout=id=>tasks.delete(id);
const makeHistoryNode=()=>({children:[],dataset:{},handlers:{},attrs:{},style:{setProperty(){}},addEventListener(k,f){this.handlers[k]=f},setAttribute(k,v){this.attrs[k]=v},append(...nodes){this.children.push(...nodes)},replaceChildren(){this.children=[]},focus(){},showModal(){this.open=true},close(){this.open=false;this.handlers.close?.()},querySelector(s){return this.parts?.[s]||null},set innerHTML(v){this.parts={ol:makeHistoryNode(),button:makeHistoryNode()}},get innerHTML(){return ''}});
context.document.createElement=()=>makeHistoryNode();context.document.addEventListener=(k,f)=>docEvents[k]=f;context.window.addEventListener=()=>{};
context.URL={createObjectURL:()=> 'blob:test',revokeObjectURL(){}};root.append=()=>{};node('.studio-workspace-nav').prepend=()=>{};
vm.runInNewContext(script.replace`);
if(process.env.ATLAS_TEST_SOURCE)boot=boot.replace("const file='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';",'const file='+JSON.stringify(process.env.ATLAS_TEST_SOURCE)+';');
if(process.env.ATLAS_RANDOM_PERF)boot=boot.replace('vm.runInNewContext(script.replace', 'script=script.replace("new ResizeObserver(()=>{drawScene();",fs.readFileSync("work/atlas-random-performance.js","utf8")+"new ResizeObserver(()=>{drawScene();");vm.runInNewContext(script.replace');
if(process.env.ATLAS_GRAPHIC_DESIGN)boot=boot.replace('vm.runInNewContext(script.replace', 'script=script.replace("new ResizeObserver(()=>{drawScene();",fs.readFileSync("work/atlas-graphic-design.js","utf8")+"new ResizeObserver(()=>{drawScene();");vm.runInNewContext(script.replace');
if(process.env.ATLAS_NORMALIZE)boot=boot.replace('vm.runInNewContext(script.replace', 'script=script.replace("new ResizeObserver(()=>{drawScene();",fs.readFileSync("work/atlas-normalize-values.js","utf8")+"new ResizeObserver(()=>{drawScene();");vm.runInNewContext(script.replace');
const box={require,console,process,structuredClone};vm.runInNewContext(boot+';globalThis.h={app:context.inspectMunsell,history:context.window.AtlasHistory,node,tasks,docEvents};',box);
const {app,history:h,node,tasks,docEvents}=box.h;
const flush=()=>{for(let i=0;i<20;i++){const due=[...tasks].filter(([,t])=>t.ms===0);if(!due.length)return;for(const[id,t]of due){tasks.delete(id);t.fn();}}assert.fail('History capture loop');};flush();
const keys=[{t:0,hex:'#132435'},{t:1,hex:'#dedede'}],alpha=[{t:0,a:.3},{t:1,a:.8}];
const map={layers:Object.fromEntries(['emission','smoke'].map(id=>[id,{colors:structuredClone(keys),alphas:structuredClone(alpha),preset:'custom',transition:'smooth'}])),active:'emission',view:'active',split:.62};
app.setStack([{id:'test',name:'Smoke',asset:null,visible:true,opacity:1,blend:'normal',map}]);if(process.env.ATLAS_GRAPHIC_DESIGN)app.state.randomType=process.env.ATLAS_GRAPHIC_MODE||'graphic-design-bands';h.reset();const initial=JSON.stringify(app.getStack());
node('[data-action="random-all-layers"]').handlers.click();flush();assert.equal(h.entries().length,1);assert.notEqual(JSON.stringify(app.getStack()),initial);h.undo();flush();assert.equal(JSON.stringify(app.getStack()),initial,'Undo restores real Random maps and metadata');h.redo();flush();assert.equal(h.entries().length,1,'Restoration never creates a phantom action');
const randomized=JSON.stringify(app.getStack());node('#preview-opacity').handlers.input({target:{value:35}});flush();assert.equal(h.entries().length,2);h.undo();flush();assert.equal(JSON.stringify(app.getStack()),randomized,'Layer opacity undo preserves maps');h.redo();flush();assert.equal(app.getStack().layers[0].opacity,.35);
const key=(key,extra={})=>({key,ctrlKey:true,metaKey:false,altKey:false,shiftKey:false,target:{tagName:'DIV'},preventDefault(){this.prevented=true},...extra});
docEvents.keydown(key('z'));flush();assert.equal(app.getStack().layers[0].opacity,1);docEvents.keydown(key('z',{shiftKey:true}));flush();assert.equal(app.getStack().layers[0].opacity,.35);
const native=key('z',{target:{tagName:'INPUT',type:'text'}});docEvents.keydown(native);assert(!native.prevented,'Text fields retain native Undo');
console.log('PASS: actual Random and layer opacity restore atomically, no phantom history, Ctrl+Z/redo and native text Undo.');

const ui=fs.readFileSync('work/atlas-history-ui.js','utf8');assert(ui.includes(".studio-preview .studio-panel-title"),'Undo/Redo belong in Preview');assert(!ui.includes("make('History'"),'History control is removed');

if(process.env.ATLAS_TEST_SOURCE)(async()=>{h.reset();const before=JSON.stringify(app.getStack());await app.dropImage();flush();assert.equal(h.entries().length,1,'Image drop records one action');assert.notEqual(JSON.stringify(app.getStack()),before);h.undo();flush();assert.equal(JSON.stringify(app.getStack()),before,'Image drop Undo restores the prior asset and map');h.redo();flush();assert.equal(app.getStack().layers[0].asset,'data:image/png;base64,TEST');console.log('PASS: dropped image replacement Undo/Redo restores real asset data.');})();

if(process.env.ATLAS_NORMALIZE){
 app.quietPreview();app.setStack([{id:'normal',name:'Test',asset:null,gray:Uint8Array.from([100,200]),alpha:Uint8Array.from([255,255]),visible:true,opacity:1,blend:'normal',map}]);h.reset();
 app.normalize(true);flush();assert.equal(h.entries().length,1);assert.equal(app.getStack().layers[0].normalizeValues,true);assert.deepEqual(Array.from(app.effective()),[0,255]);
 h.undo();flush();assert.equal(app.getStack().layers[0].normalizeValues,false);assert.deepEqual(Array.from(app.effective()),[100,200]);
 h.redo();flush();assert.equal(app.getStack().layers[0].normalizeValues,true);assert.deepEqual(Array.from(app.effective()),[0,255]);assert.equal(h.entries().length,1);
 app.normalize(false);flush();assert.equal(h.entries().length,2);h.undo();flush();assert.equal(app.getStack().layers[0].normalizeValues,true);
 console.log('PASS: actual editor normalization flag and effective pixels restore atomically through Undo/Redo.');
}
