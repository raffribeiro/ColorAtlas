const fs=require('fs'),vm=require('vm'),assert=require('assert');
const file='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const html=fs.readFileSync(file,'utf8'),data=html.match(/<script type="application\/json" id="mp-data">([\s\S]*?)<\/script>/)[1];
const nodes=new Map();function node(k){if(k==='[data-field="vfx-doc-link"]')return null;if(!nodes.has(k))nodes.set(k,{value:'',textContent:'',innerHTML:'',style:{setProperty(k,v){this[k]=v}},parentElement:{hidden:true},clientWidth:k.includes('scene')?420:700,clientHeight:390,handlers:{},attrs:{},addEventListener(n,f){this.handlers[n]=f},setAttribute(n,v){this.attrs[n]=v},getBoundingClientRect(){return {left:0,top:0}},setPointerCapture(id){this.capture=id},hasPointerCapture(id){return this.capture===id},releasePointerCapture(){this.capture=null},select(){},appendChild(){},append(){},replaceChildren(){},focus(){},querySelector(){return null},contains(){return false},options:[]});return nodes.get(k);}
const root={getBoundingClientRect(){return {left:0,top:0,width:700}},querySelector:node,addEventListener(n,f){node("root").handlers[n]=f}};node('#mp-data').textContent=data;
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
const context={Image:class{constructor(){context.explosionImage=this}set src(v){}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},document:{getElementById(){return root},createElement:()=>node('created-'+Math.random()),body:{appendChild(){}},addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},structuredClone,window:{openai:{widgetState:{modelContent:{h:'5G',v:4,c:0,system:process.env.START_VFX?'vfx':'munsell'}},setWidgetState(){return Promise.resolve()}},addEventListener(){}},navigator:{},ResizeObserver:class{constructor(fn){}observe(){}},console};
vm.runInNewContext(script.replace('new ResizeObserver', 'globalThis.inspectMunsell={state,restore,gradientPresets,applyGradientPreset,renderStudioLibrary,rgbToLab,gradientSample,studioLibraryGroups:typeof studioLibraryGroups==="function"?studioLibraryGroups:null,libraryFolderIsOpen:typeof libraryFolderIsOpen==="function"?libraryFolderIsOpen:null}; new ResizeObserver'),context);


const app=context.inspectMunsell,added=app.gradientPresets.filter(p=>p.id.startsWith('gamut-'));
assert.equal(added.length,40,'Add all 40 new palette directions spanning the five audited color gaps');
assert.equal(app.gradientPresets.length,1022);
const original=JSON.parse(fs.readFileSync('work/templates-before-gamut-expansion.json','utf8'));
assert.deepEqual(JSON.parse(JSON.stringify(app.gradientPresets.filter(p=>original.some(old=>old.id===p.id)))),original,'Preserve every pre-existing palette and its proportions');
const counts=new Set(added.map(p=>p.colors.length));assert(counts.has(2)&&counts.has(16)&&counts.size>=8,'Point counts must follow palette needs');
for(const p of added){
 assert(p.colors.length>=2&&p.colors.length<=16);assert(p.colors.every(c=>/^#[0-9A-F]{6}$/.test(c)));
 assert.equal(p.positions.length,p.colors.length);assert.equal(p.positions[0],0);assert.equal(p.positions.at(-1),1);assert(p.positions.every((v,i)=>!i||v>p.positions[i-1]));
 assert(['Effects','World','Creative'].includes(p.category));assert(!/[áàãâéêíóôõúç]/i.test(p.name));assert.equal(p.transition,'smooth');
 assert(p.colors.some(c=>{const lab=app.rgbToLab(c);return Math.hypot(lab.a,lab.b)/250>=.22}),p.name+' needs at least one actual high-chroma anchor');
 app.applyGradientPreset(p.id);assert.equal(app.state.artistTransition,'smooth');assert.equal(app.state.gradientColors.length,p.colors.length);assert.deepEqual(Array.from(app.state.gradientColors,k=>k.hex.toUpperCase()),Array.from(p.colors,c=>c.toUpperCase()));
 assert.deepEqual(Array.from(app.state.gradientColors,k=>k.t),Array.from(p.positions));
 for(let i=0;i<=128;i++){const rgb=app.gradientSample(i/128).rgb;assert(rgb.every(c=>Number.isFinite(c)&&c>=0&&c<=1));}
}
for(const c of ['#F005FE','#C516FC','#8809FE','#5606EC','#0306F4','#0B03C1','#2CF722','#FB5BFD'])assert(added.some(p=>p.colors.includes(c)),c+' audit gap anchor');
assert.equal(app.studioLibraryGroups('').length,7,'Use existing library folders');
assert.equal(app.studioLibraryGroups('gamut expansion').flatMap(g=>g.presets).length,40,'All new templates are searchable');
app.restore({favoritePresets:['gamut-magenta-plasma','fire']});app.renderStudioLibrary();assert.deepEqual(Array.from(app.state.favoritePresets),['gamut-magenta-plasma','fire']);
assert(node('[data-field="studio-library"]').innerHTML.includes('data-studio-favorite="gamut-magenta-plasma" aria-pressed="true"'));
console.log('PASS: 40 new high-chroma templates, 1022 total, variable 2–16 points, existing templates unchanged, Smooth sampling, search and favorites.');
