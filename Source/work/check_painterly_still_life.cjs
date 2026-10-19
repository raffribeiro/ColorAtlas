const fs=require('fs'),vm=require('vm'),assert=require('assert');
const file='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const html=fs.readFileSync(file,'utf8'),data=html.match(/<script type="application\/json" id="mp-data">([\s\S]*?)<\/script>/)[1];
const nodes=new Map();function node(k){if(k==='[data-field="vfx-doc-link"]')return null;if(!nodes.has(k))nodes.set(k,{value:'',textContent:'',innerHTML:'',style:{setProperty(k,v){this[k]=v}},parentElement:{hidden:true},clientWidth:k.includes('scene')?420:700,clientHeight:390,handlers:{},attrs:{},addEventListener(n,f){this.handlers[n]=f},setAttribute(n,v){this.attrs[n]=v},getBoundingClientRect(){return {left:0,top:0}},setPointerCapture(id){this.capture=id},hasPointerCapture(id){return this.capture===id},releasePointerCapture(){this.capture=null},select(){},appendChild(){},append(){},replaceChildren(){},focus(){},querySelector(){return null},contains(){return false},options:[]});return nodes.get(k);}
const root={getBoundingClientRect(){return {left:0,top:0,width:700}},querySelector:node,addEventListener(n,f){node("root").handlers[n]=f}};node('#mp-data').textContent=data;
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
const context={Image:class{constructor(){context.explosionImage=this}set src(v){}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},document:{getElementById(){return root},createElement:()=>node('created-'+Math.random()),body:{appendChild(){}},addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},structuredClone,window:{openai:{widgetState:{modelContent:{h:'5G',v:4,c:0,system:process.env.START_VFX?'vfx':'munsell'}},setWidgetState(){return Promise.resolve()}},addEventListener(){}},navigator:{},ResizeObserver:class{constructor(fn){}observe(){}},console};
vm.runInNewContext(script.replace('new ResizeObserver', 'globalThis.inspectMunsell={state,restore,gradientPresets,applyGradientPreset,renderStudioLibrary,rgbToLab,gradientSample,studioLibraryGroups:typeof studioLibraryGroups==="function"?studioLibraryGroups:null,libraryFolderIsOpen:typeof libraryFolderIsOpen==="function"?libraryFolderIsOpen:null}; new ResizeObserver'),context);






const app=context.inspectMunsell,added=app.gradientPresets.filter(p=>p.id.startsWith('painterly-still-'));
assert.equal(added.length,8,'Add a reference-inspired still-life ramp and seven painterly variants');
const original=JSON.parse(fs.readFileSync('work/templates-before-painterly-still-life.json','utf8')),ids=new Set(original.map(p=>p.id));
assert.deepEqual(JSON.parse(JSON.stringify(app.gradientPresets.filter(p=>ids.has(p.id)))),original);
assert.equal(app.gradientPresets.length,1086);assert.equal(new Set(app.gradientPresets.map(p=>p.id)).size,1086);
const folder=app.studioLibraryGroups('').find(g=>g.key==='category:Creative').children.find(g=>g.label==='Stylized');assert.equal(folder.presets.length,118);assert(added.every(p=>folder.presets.some(q=>q.id===p.id)));
assert(new Set(added.map(p=>p.colors.length)).size>=4,'Vary key counts to suit each palette');
for(const p of added){
 assert.equal(p.transition,'smooth');assert(p.colors.length>=2&&p.colors.length<=16);assert.equal(p.colors.length,p.positions.length);assert.equal(p.positions[0],0);assert.equal(p.positions.at(-1),1);assert(p.positions.every((t,i)=>!i||t>p.positions[i-1]));
 app.applyGradientPreset(p.id);assert.deepEqual(Array.from(app.state.gradientColors,k=>k.t),Array.from(p.positions));
 const ls=p.colors.map(c=>app.rgbToLab(c).l);assert(ls.every((l,i)=>!i||l>=ls[i-1]-.5),'Keep painted values ordered even when hues change');
 assert(ls.at(-1)>88&&ls[0]<45,'Use colored shadows and pale painted light');
 for(let i=0;i<=256;i++)assert(app.gradientSample(i/256).rgb.every(v=>Number.isFinite(v)&&v>=0&&v<=1));
}
const reference=added.find(p=>p.id==='painterly-still-tropical');for(const hex of ['#1E477C','#958697','#D0656A','#E7995F','#B1C9BC','#E5EAD4'])assert(reference.colors.includes(hex),'Retain representative colors sampled from the supplied painting');
assert.equal(app.studioLibraryGroups('painterly still life').flatMap(g=>g.presets).filter(p=>p.id.startsWith('painterly-still-')).length,8);
app.restore({favoritePresets:['painterly-still-tropical']});assert.deepEqual(Array.from(app.state.favoritePresets),['painterly-still-tropical']);assert.equal(app.state.explosionBloom,1);
console.log('PASS: eight painterly palettes in Stylized; sampled reference colors, value order, proportions, Smooth, search/favorites, 1086 total and unchanged originals.');
