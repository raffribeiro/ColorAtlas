const fs=require('fs'),vm=require('vm'),assert=require('assert');
const file='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const html=fs.readFileSync(file,'utf8'),data=html.match(/<script type="application\/json" id="mp-data">([\s\S]*?)<\/script>/)[1];
const nodes=new Map();function node(k){if(k==='[data-field="vfx-doc-link"]')return null;if(!nodes.has(k))nodes.set(k,{value:'',textContent:'',innerHTML:'',style:{setProperty(k,v){this[k]=v}},parentElement:{hidden:true},clientWidth:k.includes('scene')?420:700,clientHeight:390,handlers:{},attrs:{},addEventListener(n,f){this.handlers[n]=f},setAttribute(n,v){this.attrs[n]=v},getBoundingClientRect(){return {left:0,top:0}},setPointerCapture(id){this.capture=id},hasPointerCapture(id){return this.capture===id},releasePointerCapture(){this.capture=null},select(){},appendChild(){},append(){},replaceChildren(){},focus(){},querySelector(){return null},contains(){return false},options:[]});return nodes.get(k);}
const root={getBoundingClientRect(){return {left:0,top:0,width:700}},querySelector:node,addEventListener(n,f){node("root").handlers[n]=f}};node('#mp-data').textContent=data;
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
const context={Image:class{constructor(){context.explosionImage=this}set src(v){}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},document:{getElementById(){return root},createElement:()=>node('created-'+Math.random()),body:{appendChild(){}},addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},structuredClone,window:{openai:{widgetState:{modelContent:{h:'5G',v:4,c:0,system:process.env.START_VFX?'vfx':'munsell'}},setWidgetState(){return Promise.resolve()}},addEventListener(){}},navigator:{},ResizeObserver:class{constructor(fn){}observe(){}},console};
vm.runInNewContext(script.replace('new ResizeObserver', 'globalThis.inspectMunsell={state,restore,gradientPresets,applyGradientPreset,renderStudioLibrary,rgbToLab,gradientSample,studioLibraryGroups:typeof studioLibraryGroups==="function"?studioLibraryGroups:null,libraryFolderIsOpen:typeof libraryFolderIsOpen==="function"?libraryFolderIsOpen:null}; new ResizeObserver'),context);





const app=context.inspectMunsell,added=app.gradientPresets.filter(p=>p.id.startsWith('chromatic-edge-'));
assert.equal(added.length,12,'Provide 12 painterly chromatic-edge palettes');
const original=JSON.parse(fs.readFileSync('work/templates-before-chromatic-edge.json','utf8')),ids=new Set(original.map(p=>p.id));
assert.deepEqual(JSON.parse(JSON.stringify(app.gradientPresets.filter(p=>ids.has(p.id)))),original);
assert.equal(app.gradientPresets.length,1086);assert.equal(new Set(app.gradientPresets.map(p=>p.id)).size,1086);
assert.equal(app.studioLibraryGroups('').find(g=>g.key==='category:Creative').children.find(g=>g.label==='Stylized').presets.length,118);
const lab=rgb=>{const [r,g,b]=rgb,l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);return {l:.2104542553*l+.793617785*m-.0040720468*s,c:Math.hypot(1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s)}};
assert(new Set(added.map(p=>p.colors.length)).size>=4);
for(const p of added){
 assert.equal(p.category,'Creative');assert.equal(p.originalCategory,'Stylized');assert.equal(p.transition,'smooth');
 assert(p.colors.length>=2&&p.colors.length<=16);assert.equal(p.colors.length,p.positions.length);assert.equal(p.positions[0],0);assert.equal(p.positions.at(-1),1);assert(p.positions.every((t,i)=>!i||t>p.positions[i-1]));
 app.applyGradientPreset(p.id);assert.equal(app.state.artistTransition,'smooth');assert.deepEqual(Array.from(app.state.gradientColors,k=>k.t),Array.from(p.positions));
 const samples=Array.from({length:257},(_,i)=>{const rgb=app.gradientSample(i/256).rgb;assert(rgb.every(v=>Number.isFinite(v)&&v>=0&&v<=1));return {t:i/256,...lab(rgb)}});
 assert(samples.every((s,i)=>!i||s.l>=samples[i-1].l-.001),'Keep smooth, ascending lightness without artificial dark bands');
 const peak=samples.reduce((a,b)=>a.c>b.c?a:b);assert(peak.t>=.4&&peak.t<=.65,'Chroma peaks at the authored light-shadow boundary');
 assert(peak.c>.085,'The boundary must have clearly colored chroma');
 const shadow=samples.filter(s=>s.t<=.28),light=samples.filter(s=>s.t>=.76);
 for(const region of [shadow,light])assert(peak.c>Math.max(...region.map(s=>s.c))*1.6,'Boundary chroma exceeds both shadow and light');
 assert(peak.c>samples[0].c*2&&peak.c>samples.at(-1).c*3);
}
assert.equal(app.studioLibraryGroups('chromatic edge').flatMap(g=>g.presets).filter(p=>p.id.startsWith('chromatic-edge-')).length,12);
assert.equal(app.studioLibraryGroups('limiar saturado').flatMap(g=>g.presets).filter(p=>p.id.startsWith('chromatic-edge-')).length,12);
app.restore({favoritePresets:['chromatic-edge-jade-silk']});assert.deepEqual(Array.from(app.state.favoritePresets),['chromatic-edge-jade-silk']);
assert.equal(app.state.explosionBloom,1,'Keep the recently requested 100% bloom default');
console.log('PASS: 12 chromatic-edge ramps, 1086 templates, 118 Stylized; sampled chroma peaks, monotonic lightness, proportions, preserved originals, search, favorites and 100% bloom.');
