const fs=require('fs'),vm=require('vm'),assert=require('assert');
const file='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const html=fs.readFileSync(file,'utf8'),data=html.match(/<script type="application\/json" id="mp-data">([\s\S]*?)<\/script>/)[1];
const nodes=new Map();function node(k){if(k==='[data-field="vfx-doc-link"]'||['#random-harmony-range','#random-gradient-family','#gradient-layer'].includes(k))return null;if(!nodes.has(k))nodes.set(k,{dataset:{},value:'',textContent:'',innerHTML:'',style:{setProperty(k,v){this[k]=v}},parentElement:{hidden:true},clientWidth:k.includes('scene')?420:700,clientHeight:390,handlers:{},attrs:{},addEventListener(n,f){this.handlers[n]=f},setAttribute(n,v){this.attrs[n]=v},getBoundingClientRect(){return {left:0,top:0}},setPointerCapture(id){this.capture=id},hasPointerCapture(id){return this.capture===id},releasePointerCapture(){this.capture=null},select(){},appendChild(){},append(){},replaceChildren(){},focus(){},querySelector(){return null},contains(){return false},options:[]});return nodes.get(k);}
const root={getBoundingClientRect(){return {left:0,top:0,width:700}},querySelector:node,addEventListener(n,f){node("root").handlers[n]=f}};node('#mp-data').textContent=data;
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
const context={parent:{postMessage(){}},Image:class{constructor(){context.explosionImage=this}set src(v){}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},document:{getElementById(){return root},createElement:()=>node('created-'+Math.random()),body:{appendChild(){}},addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},structuredClone,window:{AtlasLabSurface:{svg:()=>''},AtlasNeutralAxis:{svg:()=>''},openai:{widgetState:{modelContent:{h:'5G',v:4,c:0,system:process.env.START_VFX?'vfx':'munsell'}},setWidgetState(){return Promise.resolve()}},addEventListener(){}},navigator:{},ResizeObserver:class{constructor(fn){}observe(){}},console};
vm.runInNewContext(script.replace('new ResizeObserver', 'globalThis.inspectMunsell={state,restore,resetDefaultExplosion,drawHotBloom,gradientPresets,applyGradientPreset,renderStudioLibrary,rgbToLab,gradientSample,studioLibraryGroups:typeof studioLibraryGroups==="function"?studioLibraryGroups:null,libraryFolderIsOpen:typeof libraryFolderIsOpen==="function"?libraryFolderIsOpen:null}; new ResizeObserver'),context);




const app=context.inspectMunsell;
assert.equal(app.state.explosionBloom,1,'Post-process bloom starts at 100%, rather than 200%');
assert(/id="explosion-bloom"[^>]*value="1"/.test(html),'The initial slider markup matches 100%');
assert(/id="explosion-bloom"[^>]*max="7"/.test(html),'Bloom slider reaches 700%');
for(const value of [0,1,2,4,6,7]){app.restore({explosionBloom:value});assert.equal(app.state.explosionBloom,value,'Restore preserves '+value*100+'%');}
for(const [value,expected] of [[-1,0],[9,7]]){app.restore({explosionBloom:value});assert.equal(app.state.explosionBloom,expected,'Restore clamps bloom to 0–700%');}
for(const invalid of [NaN,Infinity,-Infinity,'6',null]){app.restore({explosionBloom:invalid});assert.equal(app.state.explosionBloom,7,'Invalid restoration preserves prior valid bloom');}
// Inspect the real renderer without allocating or filtering full-size canvases.
const source={data:new Uint8ClampedArray([255,255,255,255])},passes=[];
context.document.createElement=()=>({width:512,height:512,getContext:()=>({createImageData:()=>({data:new Uint8ClampedArray(4)}),putImageData(){}})});
const renderer={getImageData:()=>source,save(){},restore(){},drawImage(){passes.push({alpha:this.globalAlpha,filter:this.filter,operation:this.globalCompositeOperation});}};
app.state.explosionGlow=0;app.state.explosionBloom=0;app.drawHotBloom(renderer);assert.equal(passes.length,0,'Zero bloom draws no extra passes');
app.state.explosionBloom=1;app.drawHotBloom(renderer);assert.equal(passes.length,2,'100% uses two screen passes');
passes.length=0;app.state.explosionBloom=7;app.drawHotBloom(renderer);
assert.equal(passes.length,12,'700% remains bounded at twelve screen passes');
assert(passes.every(p=>Number.isFinite(p.alpha)&&p.alpha>0&&p.alpha<=1&&p.operation==='screen'),'Every pass has valid finite canvas alpha');
assert.equal(passes.filter(p=>p.filter==='blur(10px)').length,7);assert.equal(passes.filter(p=>p.filter==='blur(3px)').length,5);
app.resetDefaultExplosion();assert.equal(app.state.explosionBloom,1,'Resetting the authored preview returns bloom to 100%');
if(process.env.START_VFX){assert.equal(node('#explosion-bloom').value,1);assert.equal(node('[data-field="explosion-bloom-value"]').textContent,'100%');}
console.log('PASS: 100% startup/reset; 0–700% slider/restoration, invalid bounds and bounded renderer passes.');
