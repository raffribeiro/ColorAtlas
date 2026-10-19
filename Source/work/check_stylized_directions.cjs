const fs=require('fs'),vm=require('vm'),assert=require('assert');
const file='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const html=fs.readFileSync(file,'utf8'),data=html.match(/<script type="application\/json" id="mp-data">([\s\S]*?)<\/script>/)[1];
const nodes=new Map();function node(k){if(k==='[data-field="vfx-doc-link"]')return null;if(!nodes.has(k))nodes.set(k,{value:'',textContent:'',innerHTML:'',style:{setProperty(k,v){this[k]=v}},parentElement:{hidden:true},clientWidth:k.includes('scene')?420:700,clientHeight:390,handlers:{},attrs:{},addEventListener(n,f){this.handlers[n]=f},setAttribute(n,v){this.attrs[n]=v},getBoundingClientRect(){return {left:0,top:0}},setPointerCapture(id){this.capture=id},hasPointerCapture(id){return this.capture===id},releasePointerCapture(){this.capture=null},select(){},appendChild(){},append(){},replaceChildren(){},focus(){},querySelector(){return null},contains(){return false},options:[]});return nodes.get(k);}
const root={getBoundingClientRect(){return {left:0,top:0,width:700}},querySelector:node,addEventListener(n,f){node("root").handlers[n]=f}};node('#mp-data').textContent=data;
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
const context={Image:class{constructor(){context.explosionImage=this}set src(v){}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},document:{getElementById(){return root},createElement:()=>node('created-'+Math.random()),body:{appendChild(){}},addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},structuredClone,window:{openai:{widgetState:{modelContent:{h:'5G',v:4,c:0,system:process.env.START_VFX?'vfx':'munsell'}},setWidgetState(){return Promise.resolve()}},addEventListener(){}},navigator:{},ResizeObserver:class{constructor(fn){}observe(){}},console};
vm.runInNewContext(script.replace('new ResizeObserver', 'globalThis.inspectMunsell={state,restore,gradientPresets,applyGradientPreset,renderStudioLibrary,rgbToLab,gradientSample,studioLibraryGroups:typeof studioLibraryGroups==="function"?studioLibraryGroups:null,libraryFolderIsOpen:typeof libraryFolderIsOpen==="function"?libraryFolderIsOpen:null}; new ResizeObserver'),context);



const app=context.inspectMunsell,added=app.gradientPresets.filter(p=>p.id.startsWith('stylized-direction-'));
const names=['Paper Cut · Citrus Layers','Paper Cut · Forest Collage','Rubber Hose · Ink & Butter','Rubber Hose · Cherry Cartoon','Cyanotype · Prussian Paper','Cyanotype · Midnight Blueprint','Ink Wash · Indigo Bleed','Ink Wash · Sepia Mist','Chalk & Pastel · Dusty Carnival','Chalk & Pastel · Lavender Peach','Solarization · Copper Inversion','Solarization · Electric Sunset','Foil Print · Midnight Gold','Foil Print · Emerald Copper','Stained Glass · Jewel Window','Stained Glass · Crimson Cathedral','Photographic Negative · Candy Negative','Photographic Negative · Alien Portrait','Limited Animation · Peach Shadow','Limited Animation · Mint Midnight'];
assert.equal(added.length,20,'Implement all 10 directions and their 20 suggested templates');
assert.deepEqual(Array.from(added,p=>p.name).sort(),names.sort());
const original=JSON.parse(fs.readFileSync('work/templates-before-stylized-directions.json','utf8'));
assert.deepEqual(JSON.parse(JSON.stringify(app.gradientPresets.filter(p=>original.some(old=>old.id===p.id)))),original,'Preserve every existing palette');
assert.equal(app.gradientPresets.length,1086);assert.equal(new Set(app.gradientPresets.map(p=>p.id)).size,1086);
const folder=app.studioLibraryGroups('').find(g=>g.key==='category:Creative').children.find(g=>g.label==='Stylized');assert.equal(folder.presets.length,118);
const counts=new Set(added.map(p=>p.colors.length));assert(counts.size>=6&&counts.has(16));
for(const p of added){
 assert(p.colors.length>=2&&p.colors.length<=16);assert.equal(p.colors.length,p.positions.length);
 assert.equal(p.category,'Creative');assert.equal(p.originalCategory,'Stylized');assert.equal(p.transition,'smooth');assert(!/[áàãâéêíóôõúç]/i.test(p.name));
 assert(p.colors.every(c=>/^#[0-9A-F]{6}$/.test(c)));assert.equal(p.positions[0],0);assert.equal(p.positions.at(-1),1);assert(p.positions.every((t,i)=>!i||t>p.positions[i-1]));
 app.applyGradientPreset(p.id);assert.equal(app.state.artistTransition,'smooth');assert.deepEqual(Array.from(app.state.gradientColors,k=>k.hex.toUpperCase()),Array.from(p.colors));
 for(let i=0;i<=128;i++)assert(app.gradientSample(i/128).rgb.every(v=>Number.isFinite(v)&&v>=0&&v<=1));
 const ls=p.colors.map(c=>app.rgbToLab(c).l);
 if(p.name.startsWith('Solarization')){const dirs=ls.slice(1).map((l,i)=>Math.sign(l-ls[i])).filter(d=>d);assert(dirs.some(d=>d>0)&&dirs.some(d=>d<0),'Solarization intentionally inverts the lightness path');}
 if(p.name.startsWith('Photographic Negative'))assert(ls[0]>ls.at(-1)+30,'Negative palettes reverse overall lightness');
 if(['Cyanotype','Ink Wash'].some(n=>p.name.startsWith(n)))assert(ls.every((l,i)=>!i||l>=ls[i-1]-.3),'Wash/print ramps preserve tonal progression');
 if(['Paper Cut','Rubber Hose','Foil Print','Stained Glass','Limited Animation'].some(n=>p.name.startsWith(n)))for(let i=0;i<p.colors.length;i+=2)assert.equal(p.colors[i],p.colors[i+1]);
}
assert.equal(app.studioLibraryGroups('stylized directions').flatMap(g=>g.presets).length,20);
assert.equal(app.studioLibraryGroups('paper cut').flatMap(g=>g.presets).filter(p=>p.id.startsWith('stylized-direction-')).length,2);
app.restore({favoritePresets:['stylized-direction-paper-citrus','gamedev-poster-pop']});app.renderStudioLibrary();assert.deepEqual(Array.from(app.state.favoritePresets),['stylized-direction-paper-citrus','gamedev-poster-pop']);
console.log('PASS: all 20 proposed templates / 10 directions, 118 Stylized entries, 1086 total; preserved originals, varied key counts, Smooth/search/favorites, tonal wash/negative/solarization contracts.');
