const fs=require('fs'),vm=require('vm'),assert=require('assert');
const file='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const html=fs.readFileSync(file,'utf8'),data=html.match(/<script type="application\/json" id="mp-data">([\s\S]*?)<\/script>/)[1];
const nodes=new Map();function node(k){if(k==='[data-field="vfx-doc-link"]')return null;if(!nodes.has(k))nodes.set(k,{value:'',textContent:'',innerHTML:'',style:{setProperty(k,v){this[k]=v}},parentElement:{hidden:true},clientWidth:k.includes('scene')?420:700,clientHeight:390,handlers:{},attrs:{},addEventListener(n,f){this.handlers[n]=f},setAttribute(n,v){this.attrs[n]=v},getBoundingClientRect(){return {left:0,top:0}},setPointerCapture(id){this.capture=id},hasPointerCapture(id){return this.capture===id},releasePointerCapture(){this.capture=null},select(){},appendChild(){},append(){},replaceChildren(){},focus(){},querySelector(){return null},contains(){return false},options:[]});return nodes.get(k);}
const root={getBoundingClientRect(){return {left:0,top:0,width:700}},querySelector:node,addEventListener(n,f){node("root").handlers[n]=f}};node('#mp-data').textContent=data;
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
const context={Image:class{constructor(){context.explosionImage=this}set src(v){}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},document:{getElementById(){return root},createElement:()=>node('created-'+Math.random()),body:{appendChild(){}},addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},structuredClone,window:{openai:{widgetState:{modelContent:{h:'5G',v:4,c:0,system:process.env.START_VFX?'vfx':'munsell'}},setWidgetState(){return Promise.resolve()}},addEventListener(){}},navigator:{},ResizeObserver:class{constructor(fn){}observe(){}},console};
vm.runInNewContext(script.replace('new ResizeObserver', 'globalThis.inspectMunsell={state,restore,gradientPresets,applyGradientPreset,renderStudioLibrary,rgbToLab,gradientSample,studioLibraryGroups:typeof studioLibraryGroups==="function"?studioLibraryGroups:null,libraryFolderIsOpen:typeof libraryFolderIsOpen==="function"?libraryFolderIsOpen:null}; new ResizeObserver'),context);




const app=context.inspectMunsell,added=app.gradientPresets.filter(p=>p.id.startsWith('stylized-material-'));
const names=['Enamel Pin · Cherry Badge','Enamel Pin · Ocean Emblem','Airbrush · Peach Chrome','Airbrush · Violet Boulevard','Acid Graphics · Toxic Tangerine','Acid Graphics · Electric Lilac','Candy Lacquer · Cherry Gloss','Candy Lacquer · Grape Glaze','Porcelain · Blue Porcelain','Porcelain · Rose Ceramic','Embroidery · Garden Stitch','Embroidery · Midnight Tapestry','Muted Storybook · Foxwood Tale','Muted Storybook · Moonlit Meadow','Graphic Noir · Crimson Detective','Graphic Noir · Amber Alley','Faded Packaging · Vintage Citrus','Faded Packaging · Seaside Label','Pearlescent Illustration · Opal Dream','Pearlescent Illustration · Shell Ballet','Clay Animation · Apricot Clay','Clay Animation · Moss Workshop','Festival Graphics · Summer Parade','Festival Graphics · Midnight Carnival'];
assert.equal(added.length,24,'Implement all 12 suggested directions and all 24 named templates');
assert.deepEqual(Array.from(added,p=>p.name).sort(),names.sort());
const original=JSON.parse(fs.readFileSync('work/templates-before-stylized-materials.json','utf8'));
const originalIds=new Set(original.map(p=>p.id));
assert.deepEqual(JSON.parse(JSON.stringify(app.gradientPresets.filter(p=>originalIds.has(p.id)))),original,'Preserve all 1022 pre-existing palettes exactly');
assert.equal(app.gradientPresets.length,1086);assert.equal(new Set(app.gradientPresets.map(p=>p.id)).size,1086);
assert.equal(app.studioLibraryGroups('').find(g=>g.key==='category:Creative').children.find(g=>g.label==='Stylized').presets.length,118);
const counts=new Set(added.map(p=>p.colors.length));assert(counts.size>=6&&counts.has(16),'Use varied point counts, including a detailed 16-point palette');
for(const p of added){
 assert(p.colors.length>=2&&p.colors.length<=16);assert.equal(p.colors.length,p.positions.length);
 assert.equal(p.category,'Creative');assert.equal(p.originalCategory,'Stylized');assert.equal(p.transition,'smooth');
 assert(p.colors.every(c=>/^#[0-9A-F]{6}$/.test(c)));assert.equal(p.positions[0],0);assert.equal(p.positions.at(-1),1);assert(p.positions.every((t,i)=>!i||t>p.positions[i-1]));
 app.applyGradientPreset(p.id);assert.equal(app.state.artistTransition,'smooth');
 assert.deepEqual(Array.from(app.state.gradientColors,k=>k.hex.toUpperCase()),Array.from(p.colors));
 assert.deepEqual(Array.from(app.state.gradientColors,k=>k.t),Array.from(p.positions),'Applying a preset keeps authored proportions');
 for(let i=0;i<=256;i++)assert(app.gradientSample(i/256).rgb.every(v=>Number.isFinite(v)&&v>=0&&v<=1));
 if(['Enamel Pin','Acid Graphics','Graphic Noir','Festival Graphics'].some(n=>p.name.startsWith(n)))for(let i=0;i<p.colors.length;i+=2)assert.equal(p.colors[i],p.colors[i+1],'Graphic styles hold solid-color regions');
 if(['Candy Lacquer','Airbrush','Clay Animation','Muted Storybook','Faded Packaging'].some(n=>p.name.startsWith(n))){const ls=p.colors.map(c=>app.rgbToLab(c).l);assert(ls.every((l,i)=>!i||l>=ls[i-1]-.3),'Shading ramps preserve increasing lightness');}
 if(p.name.startsWith('Graphic Noir'))assert(p.positions[1]>=.6,'Noir reserves most tonal space for deep ink');
 if(p.name.startsWith('Pearlescent Illustration'))assert(p.colors.every(c=>app.rgbToLab(c).l>=55),'Pearlescent palettes stay in a luminous range');
}
assert.equal(app.studioLibraryGroups('stylized materials').flatMap(g=>g.presets).length,24);
for(const family of ['enamel pin','airbrush','porcelain','embroidery','clay animation','festival graphics'])assert.equal(app.studioLibraryGroups(family).flatMap(g=>g.presets).filter(p=>p.id.startsWith('stylized-material-')).length,2);
app.restore({favoritePresets:['stylized-material-enamel-cherry','gamedev-poster-pop']});app.renderStudioLibrary();assert.deepEqual(Array.from(app.state.favoritePresets),['stylized-material-enamel-cherry','gamedev-poster-pop']);
console.log('PASS: 24 templates / 12 directions; 1086 total and 118 Stylized; originals, proportions, Smooth, sampled colors, tonal contracts, search and favorites.');
