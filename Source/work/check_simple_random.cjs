const fs=require('fs'),vm=require('vm'),assert=require('assert');
const file='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const html=fs.readFileSync(file,'utf8'),data=html.match(/<script type="application\/json" id="mp-data">([\s\S]*?)<\/script>/)[1];
const nodes=new Map();function node(k){if(k==='[data-field="vfx-doc-link"]'||['#random-harmony-range','#random-gradient-family','#gradient-layer'].includes(k))return null;if(!nodes.has(k))nodes.set(k,{dataset:{},value:'',textContent:'',innerHTML:'',style:{setProperty(k,v){this[k]=v}},parentElement:{hidden:true},clientWidth:k.includes('scene')?420:700,clientHeight:390,handlers:{},attrs:{},addEventListener(n,f){this.handlers[n]=f},setAttribute(n,v){this.attrs[n]=v},getBoundingClientRect(){return {left:0,top:0}},setPointerCapture(id){this.capture=id},hasPointerCapture(id){return this.capture===id},releasePointerCapture(){this.capture=null},select(){},appendChild(){},append(){},replaceChildren(){},focus(){},querySelector(){return null},contains(){return false},options:[]});return nodes.get(k);}
const root={getBoundingClientRect(){return {left:0,top:0,width:700}},querySelector:node,addEventListener(n,f){node("root").handlers[n]=f}};node('#mp-data').textContent=data;
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
const context={parent:{postMessage(){}},Image:class{constructor(){context.explosionImage=this}set src(v){}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},document:{getElementById(){return root},createElement:()=>node('created-'+Math.random()),body:{appendChild(){}},addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},structuredClone,window:{AtlasLabSurface:{svg:()=>''},AtlasNeutralAxis:{svg:()=>''},openai:{widgetState:{modelContent:{h:'5G',v:4,c:0,system:process.env.START_VFX?'vfx':'munsell'}},setWidgetState(){return Promise.resolve()}},addEventListener(){}},navigator:{},ResizeObserver:class{constructor(fn){}observe(){}},console};
vm.runInNewContext(script.replace('new ResizeObserver', 'globalThis.inspectMunsell={state,triadColors,update,labColor,rgbToLab,toLch,setLch,lchColors,drawSystem,vfxColors,hsvRGB,engineColorCode,fitLabToSRGB,vfxAxisRange,gradientSample,gradientSelected,gradientPresets,applyGradientPreset,randomAllLayers,randomHarmoniousGradient,harmonyOffsets,hueChromaLimit,bloomHighlight,imageCoverageBoundaries,paletteCandidateScore,resetDefaultExplosion,restore}; new ResizeObserver'),context);
console.log('PASS: full app initializes with mock DOM, including dropdown, template library and Gradient Lab event handlers.');
const markup=html.slice(0,html.indexOf('<style>'));
assert(markup.includes('id="random-type"'),'One random-type dropdown must replace theme, look and coverage controls');
for(const id of ['random-effect-theme','random-color-look','artist-harmony','artist-coverage'])assert(!markup.includes('id="'+id+'"'));
const optionHTML=markup.match(/<select id="random-type"[\s\S]*?<\/select>/)[0];
const types=[...optionHTML.matchAll(/<option value="([^"]+)"/g)].map(m=>m[1]);
assert.deepEqual(types,['colorplay','auto','true-random','perceptual','monochromatic','analogous','complementary','split','triadic','tetradic','warm','cool']);
const app=context.inspectMunsell,state=app.state;
assert.equal(state.randomType,'perceptual','Perceptual must be the startup random mode');
assert(/<option value="perceptual" selected>/.test(optionHTML),'Native select matches the startup mode');
assert.equal(state.randomDefaultsVersion,1);
app.restore({randomType:'auto'});assert.equal(state.randomType,'perceptual','Upgrade the older Harmonic default');
app.restore({randomType:'auto',randomDefaultsVersion:1});assert.equal(state.randomType,'auto','Explicit Harmonic choice in the new version is preserved');
app.restore({randomType:'analogous'});assert.equal(state.randomType,'analogous','Other saved modes stay editable');
app.restore({randomType:'perceptual'});app.drawSystem();assert.equal(node('#random-type').value,'perceptual');
state.system='vfx';state.explosionView='combined';state.gradientLayer='smoke';
state.gradientLayers.smoke.alphas=[{t:0,a:.2},{t:1,a:.8}];state.gradientAlphas=state.gradientLayers.smoke.alphas;
const alpha=JSON.stringify(state.gradientLayers.smoke.alphas),counts=Object.fromEntries(Object.entries(state.gradientLayers).map(([k,p])=>[k,p.colors.length]));
let seed=83;const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
for(const type of types.filter(t=>t!=='colorplay')){node('#random-type').value=type;node('#random-type').handlers.change();assert.equal(state.randomType,type);app.randomAllLayers(rng);assert.equal(state.gradientLayer,'smoke');assert.equal(state.explosionView,'combined');assert.equal(JSON.stringify(state.gradientAlphas),alpha);assert.equal(state.artistTransition,'smooth');for(const [layer,p] of Object.entries(state.gradientLayers)){assert.equal(p.transition,'smooth');assert.equal(p.colors.length,counts[layer]);assert(p.colors.every(k=>Number.isFinite(k.t)&&/^#[a-f0-9]{6}$/i.test(k.hex)));assert.equal(p.colors[0].t,0);assert.equal(p.colors.at(-1).t,1);if(type!=='true-random'){const labs=p.colors.map(k=>app.rgbToLab(k.hex));assert(labs.every((q,i)=>!i||q.l>=labs[i-1].l-.2),type+' ordered lightness');if(type==='monochromatic'){const hues=labs.filter(q=>Math.hypot(q.a,q.b)>2).map(q=>Math.atan2(q.b,q.a));assert(hues.every(h=>Math.abs(Math.atan2(Math.sin(h-hues[0]),Math.cos(h-hues[0])))<.08));}}}}
app.restore({randomType:'triadic'});app.drawSystem();assert.equal(state.randomType,'triadic');assert.equal(node('#random-type').value,'triadic');app.restore({randomType:'fire'});assert.equal(state.randomType,'triadic');
console.log('PASS: simplified random controls, existing modes plus ColorPlay controls, persistence, both layers, alpha and Smooth behavior.');

for(const count of [2,16]){for(const layer of ['emission','smoke'])state.gradientLayers[layer].colors=Array.from({length:count},(_,i)=>({t:i/(count-1),hex:i===0?'#101020':'#eff0ff'}));state.gradientColors=state.gradientLayers[state.gradientLayer].colors;for(const type of types){node('#random-type').value=type;node('#random-type').handlers.change();app.randomAllLayers(rng);for(const p of Object.values(state.gradientLayers))assert.equal(p.colors.length,count);}}
console.log('PASS: every random type also supports 2-key and 16-key gradients.');

app.restore({randomHarmonyRange:'bold'});assert(!('randomHarmonyRange' in state),'Removed range preference does not survive restore');
const beforeAlphas=JSON.stringify(state.gradientAlphas);
for(const [first,mode] of [[0,'soft'],[.4,'wide'],[.9,'bold']]){let calls=0;app.randomHarmoniousGradient(()=>calls++===0?first:.5);assert(node('[data-field="gradient-status"]').textContent.includes(' · '+mode+' · '),'Automatic harmonic range still explores '+mode);assert(state.gradientColors.every(k=>/^#[a-f0-9]{6}$/i.test(k.hex)));}
assert.equal(JSON.stringify(state.gradientAlphas),beforeAlphas);
console.log('PASS: no harmony range control or restored preference; automatic soft/wide/bold generation still works and preserves alpha.');

for(const [second,family] of [[0,'sequential'],[.45,'accent'],[.65,'diverging'],[.9,'cyclic']]){let calls=0;app.randomHarmoniousGradient(()=>{calls++;return calls===2?second:.5});assert(node('[data-field="gradient-status"]').textContent.includes('Random '+family+' · '),'Automatic structure explores '+family);assert.equal(state.gradientColors.length,family==='diverging'?15:16);}
const initialLayer=state.gradientLayer,storedLayers=JSON.stringify(state.gradientLayers);
node('[data-action="gradient-toggle-layer"]').handlers.click();assert.notEqual(state.gradientLayer,initialLayer);
assert(node('[data-action="gradient-toggle-layer"]').attrs['aria-label'].includes(state.gradientLayer==='emission'?'Importance 01':'Importance 02'));
node('[data-action="gradient-toggle-layer"]').handlers.click();assert.equal(state.gradientLayer,initialLayer);assert.equal(JSON.stringify(state.gradientLayers),storedLayers,'Toggle preserves both layer palettes after the dropdown removal');
console.log('PASS: automatic gradient structures and accessible two-layer toggle without removed menus.');
