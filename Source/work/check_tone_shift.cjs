const fs=require('fs'),vm=require('vm'),assert=require('assert');
const file='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const html=fs.readFileSync(file,'utf8'),data=html.match(/<script type="application\/json" id="mp-data">([\s\S]*?)<\/script>/)[1];
const nodes=new Map();function node(k){if(k==='[data-field="vfx-doc-link"]')return null;if(!nodes.has(k))nodes.set(k,{value:'',textContent:'',innerHTML:'',style:{setProperty(k,v){this[k]=v}},parentElement:{hidden:true},clientWidth:k.includes('scene')?420:700,clientHeight:390,handlers:{},attrs:{},addEventListener(n,f){this.handlers[n]=f},setAttribute(n,v){this.attrs[n]=v},getBoundingClientRect(){return {left:0,top:0}},setPointerCapture(id){this.capture=id},hasPointerCapture(id){return this.capture===id},releasePointerCapture(){this.capture=null},select(){},appendChild(){},append(){},replaceChildren(){},focus(){},querySelector(){return null},contains(){return false},options:[]});return nodes.get(k);}
const root={getBoundingClientRect(){return {left:0,top:0,width:700}},querySelector:node,addEventListener(n,f){node("root").handlers[n]=f}};node('#mp-data').textContent=data;
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
const context={Image:class{constructor(){context.explosionImage=this}set src(v){}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},document:{getElementById(){return root},createElement:()=>node('created-'+Math.random()),body:{appendChild(){}},addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},structuredClone,window:{openai:{widgetState:{modelContent:{h:'5G',v:4,c:0,system:process.env.START_VFX?'vfx':'munsell'}},setWidgetState(){return Promise.resolve()}},addEventListener(){}},navigator:{},ResizeObserver:class{constructor(fn){}observe(){}},console};
vm.runInNewContext(script.replace('new ResizeObserver', 'globalThis.inspectMunsell={state,restore,gradientPresets,applyGradientPreset,renderStudioLibrary,rgbToLab,gradientSample,studioLibraryGroups:typeof studioLibraryGroups==="function"?studioLibraryGroups:null,libraryFolderIsOpen:typeof libraryFolderIsOpen==="function"?libraryFolderIsOpen:null}; new ResizeObserver'),context);







const app=context.inspectMunsell,added=app.gradientPresets.filter(p=>p.id.startsWith('painterly-tone-'));
assert.equal(added.length,8,'Add eight Tone Shift palettes inspired by the new painting references');
const original=JSON.parse(fs.readFileSync('work/templates-before-tone-shift.json','utf8')),ids=new Set(original.map(p=>p.id));
assert.deepEqual(JSON.parse(JSON.stringify(app.gradientPresets.filter(p=>ids.has(p.id)))),original,'Preserve the existing library');
assert.equal(app.gradientPresets.length,1086);assert.equal(new Set(app.gradientPresets.map(p=>p.id)).size,1086);
const folder=app.studioLibraryGroups('').find(g=>g.key==='category:Creative').children.find(g=>g.label==='Stylized');assert.equal(folder.presets.length,118);assert(added.every(p=>folder.presets.some(q=>q.id===p.id)));
const L=rgb=>{const [r,g,b]=rgb,l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);return .2104542553*l+.793617785*m-.0040720468*s};
assert(new Set(added.map(p=>p.colors.length)).size>=4,'Use distinct key counts according to hue changes');
const samples=[];
for(const p of added){
 assert.equal(p.transition,'smooth');assert(p.colors.length>=2&&p.colors.length<=16);assert.equal(p.colors.length,p.positions.length);assert.equal(p.positions[0],0);assert.equal(p.positions.at(-1),1);assert(p.positions.every((t,i)=>!i||t>p.positions[i-1]));
 app.applyGradientPreset(p.id);assert.deepEqual(Array.from(app.state.gradientColors,k=>k.t),Array.from(p.positions));
 assert(p.colors.every((hex,i)=>Math.abs(app.rgbToLab(hex).l-(24+70*p.positions[i]))<.35),'Gamut fitting/HEX encoding preserve authored OKLab lightness');
 const ls=Array.from({length:257},(_,i)=>{const rgb=app.gradientSample(i/256).rgb;assert(rgb.every(v=>Number.isFinite(v)&&v>=0&&v<=1));const l=L(rgb);assert(Math.abs(l-(.24+.7*i/256))<.0035,'Smooth interpolation preserves the same lightness profile despite hue changes');return l});
 assert(ls.every((l,i)=>!i||l>=ls[i-1]-.0002));samples.push(ls);
}
for(let i=0;i<257;i++)assert(Math.max(...samples.map(s=>s[i]))-Math.min(...samples.map(s=>s[i]))<.005,'Variant palettes retain matching tonal relationships');
assert.equal(app.studioLibraryGroups('painterly tone shift').flatMap(g=>g.presets).filter(p=>p.id.startsWith('painterly-tone-')).length,8);
app.restore({favoritePresets:['painterly-tone-peach-periwinkle']});assert.deepEqual(Array.from(app.state.favoritePresets),['painterly-tone-peach-periwinkle']);assert.equal(app.state.explosionBloom,1);
console.log('PASS: eight Tone Shift palettes in Stylized; shared sampled OKLab lightness, gamut fit, Smooth, proportions, search/favorites, 1086 total and preserved originals.');
