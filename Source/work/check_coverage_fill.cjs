const fs=require('fs'),vm=require('vm'),assert=require('assert');
const file='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const html=fs.readFileSync(file,'utf8'),data=html.match(/<script type="application\/json" id="mp-data">([\s\S]*?)<\/script>/)[1];
const nodes=new Map();function node(k){if(k==='[data-field="vfx-doc-link"]')return null;if(!nodes.has(k))nodes.set(k,{value:'',textContent:'',innerHTML:'',style:{setProperty(k,v){this[k]=v}},parentElement:{hidden:true},clientWidth:k.includes('scene')?420:700,clientHeight:390,handlers:{},attrs:{},addEventListener(n,f){this.handlers[n]=f},setAttribute(n,v){this.attrs[n]=v},getBoundingClientRect(){return {left:0,top:0}},setPointerCapture(id){this.capture=id},hasPointerCapture(id){return this.capture===id},releasePointerCapture(){this.capture=null},select(){},appendChild(){},append(){},replaceChildren(){},focus(){},querySelector(){return null},contains(){return false},options:[]});return nodes.get(k);}
const root={getBoundingClientRect(){return {left:0,top:0,width:700}},querySelector:node,addEventListener(n,f){node("root").handlers[n]=f}};node('#mp-data').textContent=data;
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
const context={Image:class{constructor(){context.explosionImage=this}set src(v){}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},document:{getElementById(){return root},createElement:()=>node('created-'+Math.random()),body:{appendChild(){}},addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},structuredClone,window:{openai:{widgetState:{modelContent:{h:'5G',v:4,c:0,system:process.env.START_VFX?'vfx':'munsell'}},setWidgetState(){return Promise.resolve()}},addEventListener(){}},navigator:{},ResizeObserver:class{constructor(fn){}observe(){}},console};
vm.runInNewContext(script.replace('new ResizeObserver', 'globalThis.inspectMunsell={state,restore,gradientPresets,applyGradientPreset,renderStudioLibrary,rgbToLab,gradientSample,studioLibraryGroups:typeof studioLibraryGroups==="function"?studioLibraryGroups:null,libraryFolderIsOpen:typeof libraryFolderIsOpen==="function"?libraryFolderIsOpen:null}; new ResizeObserver'),context);



const app=context.inspectMunsell,added=app.gradientPresets.filter(p=>p.id.startsWith('coverage-fill-'));
assert(added.length>0&&added.length<=60,'Fill remaining gaps with a bounded set of coherent palettes');
const original=JSON.parse(fs.readFileSync('work/templates-before-coverage-fill.json','utf8'));
assert.deepEqual(JSON.parse(JSON.stringify(app.gradientPresets.filter(p=>original.some(old=>old.id===p.id)))),original,'Preserve all 927 existing templates');
for(const p of added){
 assert(p.colors.length>=2&&p.colors.length<=16);assert.equal(p.colors.length,p.positions.length);
 assert(p.colors.every(c=>/^#[0-9A-F]{6}$/.test(c)));assert.equal(p.positions[0],0);assert.equal(p.positions.at(-1),1);
 assert(p.positions.every((t,i)=>!i||t>p.positions[i-1]));assert.equal(p.transition,'smooth');
 assert(p.category==='Creative');assert.equal(p.originalCategory,'Perceptual');assert(!/[áàãâéêíóôõúç]/i.test(p.name));
 app.applyGradientPreset(p.id);assert.equal(app.state.artistTransition,'smooth');
 assert.equal(app.state.gradientColors.length,p.colors.length);
 assert.deepEqual(Array.from(app.state.gradientColors,k=>k.hex.toUpperCase()),Array.from(p.colors));
 for(let i=0;i<=128;i++)assert(app.gradientSample(i/128).rgb.every(c=>Number.isFinite(c)&&c>=0&&c<=1));
}
assert.equal(app.studioLibraryGroups('').length,7);assert.equal(app.studioLibraryGroups('coverage fill').flatMap(g=>g.presets).length,added.length);
const audit=JSON.parse(fs.readFileSync('outputs/color-coverage/analysis.json','utf8'));
assert.equal(audit.templates,app.gradientPresets.length);assert.equal(audit.referenceCells,54198);
assert(audit.overall.covered025Pct>=99.9,'Same .025 criterion must reach at least 99.9% overall');
assert(audit.chroma.at(-1).covered025Pct>=99.5,'Close high-chroma gaps, not only the global average');
assert(audit.independentValidation.covered025Pct>=99.5,'Check an independent, shifted reference grid');
console.log(`PASS: ${added.length} gap-fill palettes, preserved 927 templates, valid 2–16 keys, Smooth/search/folders; ≥99.9% original grid and ≥99.5% independent grid.`);
