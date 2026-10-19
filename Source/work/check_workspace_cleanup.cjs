const fs=require('fs'),vm=require('vm'),assert=require('assert');
const file='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const html=fs.readFileSync(file,'utf8'),data=html.match(/<script type="application\/json" id="mp-data">([\s\S]*?)<\/script>/)[1];
const nodes=new Map();function node(k){if(k==='[data-field="vfx-doc-link"]'||['#random-harmony-range','#random-gradient-family','#gradient-layer'].includes(k))return null;if(!nodes.has(k))nodes.set(k,{dataset:{},value:'',textContent:'',innerHTML:'',style:{setProperty(k,v){this[k]=v}},parentElement:{hidden:true},clientWidth:k.includes('scene')?420:700,clientHeight:390,handlers:{},attrs:{},addEventListener(n,f){this.handlers[n]=f},setAttribute(n,v){this.attrs[n]=v},getBoundingClientRect(){return {left:0,top:0}},setPointerCapture(id){this.capture=id},hasPointerCapture(id){return this.capture===id},releasePointerCapture(){this.capture=null},select(){},appendChild(){},append(){},replaceChildren(){},focus(){},querySelector(){return null},contains(){return false},options:[]});return nodes.get(k);}
const root={getBoundingClientRect(){return {left:0,top:0,width:700}},querySelector:node,addEventListener(n,f){node("root").handlers[n]=f}};node('#mp-data').textContent=data;
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
const context={parent:{postMessage(){}},Image:class{constructor(){context.explosionImage=this}set src(v){}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},document:{getElementById(){return root},createElement:()=>node('created-'+Math.random()),body:{appendChild(){}},addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},structuredClone,window:{AtlasLabSurface:{svg:()=>''},AtlasNeutralAxis:{svg:()=>''},openai:{widgetState:{modelContent:{h:'5G',v:4,c:0,system:process.env.START_VFX?'vfx':'munsell'}},setWidgetState(){return Promise.resolve()}},addEventListener(){}},navigator:{},ResizeObserver:class{constructor(fn){}observe(){}},console};
vm.runInNewContext(script.replace('new ResizeObserver', 'globalThis.inspectMunsell={state,restore,update,drawSystem,drawGradient}; new ResizeObserver'),context);

const app=context.inspectMunsell;
assert.equal(app.state.system,'vfx','The public app always starts in VFX, including a restored legacy mode');
for(const mode of ['munsell','lab','labcart']){app.restore({system:mode,lab:{l:42,a:3,b:-8}});app.update();assert.equal(app.state.system,'vfx');assert.equal(app.state.lab.l,42,'Hidden-mode data is retained');assert.equal(node('[data-field="vfx-panel"]').hidden,false);assert.equal(node('[data-field="'+mode+'-panel"]').hidden,true);}
const markup=html.slice(html.indexOf('<div id="munsell-picker"'),html.indexOf('<script type="application/json" id="mp-data"'));
for(const id of ['mp-system','mp-vfx-engine'])assert(new RegExp('<select[^>]*id="'+id+'"[^>]*\\bhidden\\b').test(markup),id+' has no exposed selector');
for(const id of ['mp-system','mp-vfx-engine'])assert(new RegExp('<label[^>]*for="'+id+'"[^>]*\\bhidden\\b').test(markup));
assert(!markup.includes('data-action="gradient-code"'),'Code copy is offered only in the export popup');
assert(!markup.includes('Combined importance layers · neutral black backdrop'),'Remove the preview caption');
assert(/<input[^>]*id="lab-auto-rotate"[^>]*class="form-check-input"/.test(markup),'Rotation uses the same styled switch input as gamut lock');
assert(!html.includes("installIframeDropdown($('#mp-system')"),'Hidden modes do not get a custom menu');
for(const selector of ['<label[^>]*for="explosion-view"','<select[^>]*id="explosion-view"','<button[^>]*data-action="gradient-toggle-layer"']){
 const tag=markup.match(new RegExp(selector+'[^>]*>'))?.[0];
 assert(tag&&/\bhidden\b/.test(tag),'Redundant Preview label, view selector and importance switch stay out of the workspace and keyboard order');
}
assert(/<button[^>]*data-action="gradient-save"[^>]*>Save palette<\/button>/.test(markup),'Save palette remains visible');
assert(/#munsell-picker \[hidden\]\{display:none!important\}/.test(html),'Hidden grid controls cannot reserve a blank row');
const maps=JSON.stringify(app.state.gradientLayers);
for(const view of ['active','combined','emission','smoke']){
 app.restore({explosionView:view});app.drawGradient();
 assert.equal(app.state.explosionView,view,'Stored preview views still restore without the public selector');
}
assert.equal(JSON.stringify(app.state.gradientLayers),maps,'Removing inspection controls preserves both importance maps');
const alpha=JSON.stringify(app.state.gradientAlphas),colors=app.state.gradientColors.length;
app.drawGradient();assert(!node('.mp-gradient').innerHTML.includes('data-gradient-kind="alpha"'));
node('.mp-gradient').handlers.pointerdown({button:0,target:{closest(){return null}},clientX:150,clientY:8});
assert.equal(app.state.gradientColors.length,colors+1,'Clicking the upper ramp area adds a color, never an alpha key');assert.equal(JSON.stringify(app.state.gradientAlphas),alpha);
app.state.gradientSelection={kind:'alpha',index:0};app.drawGradient();assert.equal(app.state.gradientSelection.kind,'color','A legacy alpha selection cannot reveal alpha editing');
assert(!node('[data-field="gradient-keys"]').innerHTML.includes('Alpha '));assert.equal(JSON.stringify(app.state.gradientAlphas),alpha);
const code=fs.readFileSync('work/atlas-png-export.js','utf8');const embedded=html.split('// PNG export options\n')[1].split('// End PNG export options')[0];assert(!embedded.includes('gradient-code'));assert(code.includes("['png','unity','unreal']"),'All formats remain in the shared popup');
console.log('PASS: VFX-only workspace/restore, legacy data preserved, switches, removed redundant controls/caption, color-only ramp interaction and unchanged transparency.');
