const fs=require('fs'),vm=require('vm'),assert=require('assert');
const file='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const html=fs.readFileSync(file,'utf8'),data=html.match(/<script type="application\/json" id="mp-data">([\s\S]*?)<\/script>/)[1];
const nodes=new Map();function node(k){if(k==='[data-field="vfx-doc-link"]')return null;if(!nodes.has(k))nodes.set(k,{value:'',textContent:'',innerHTML:'',style:{setProperty(k,v){this[k]=v}},parentElement:{hidden:true},clientWidth:k.includes('scene')?420:700,clientHeight:390,handlers:{},attrs:{},addEventListener(n,f){this.handlers[n]=f},setAttribute(n,v){this.attrs[n]=v},getBoundingClientRect(){return {left:0,top:0}},setPointerCapture(id){this.capture=id},hasPointerCapture(id){return this.capture===id},releasePointerCapture(){this.capture=null},select(){},appendChild(){},append(){},replaceChildren(){},focus(){},querySelector(){return null},contains(){return false},options:[]});return nodes.get(k);}
const root={getBoundingClientRect(){return {left:0,top:0,width:700}},querySelector:node,addEventListener(n,f){node("root").handlers[n]=f}};node('#mp-data').textContent=data;
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
const context={Image:class{constructor(){context.explosionImage=this}set src(v){}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},document:{getElementById(){return root},createElement:()=>node('created-'+Math.random()),body:{appendChild(){}},addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},structuredClone,window:{openai:{widgetState:{modelContent:{h:'5G',v:4,c:0,system:process.env.START_VFX?'vfx':'munsell'}},setWidgetState(){return Promise.resolve()}},addEventListener(){}},navigator:{},ResizeObserver:class{constructor(fn){}observe(){}},console};
vm.runInNewContext(script.replace('new ResizeObserver', 'globalThis.inspectMunsell={state,restore,gradientPresets,applyGradientPreset,renderStudioLibrary,rgbToLab,gradientSample,studioLibraryGroups:typeof studioLibraryGroups==="function"?studioLibraryGroups:null,libraryFolderIsOpen:typeof libraryFolderIsOpen==="function"?libraryFolderIsOpen:null}; new ResizeObserver'),context);



const app=context.inspectMunsell,added=app.gradientPresets.filter(p=>p.id.startsWith('stylized-extra-'));
assert.equal(added.length,24,'Add 24 original graphic palettes like Poster Pop');
const original=JSON.parse(fs.readFileSync('work/templates-before-stylized-expansion.json','utf8'));
assert.deepEqual(JSON.parse(JSON.stringify(app.gradientPresets.filter(p=>original.some(old=>old.id===p.id)))),original,'Preserve all 978 existing palettes');
assert.equal(app.gradientPresets.length,1086);
const folder=app.studioLibraryGroups('').find(g=>g.key==='category:Creative').children.find(g=>g.label==='Stylized');
assert.equal(folder.presets.length,118);assert(added.every(p=>folder.presets.some(q=>q.id===p.id)));
const counts=new Set(added.map(p=>p.colors.length));assert(counts.has(4)&&counts.has(16)&&counts.size>=5);
for(const p of added){
 assert.equal(p.category,'Creative');assert.equal(p.originalCategory,'Stylized');assert.equal(p.transition,'smooth');assert(!/[áàãâéêíóôõúç]/i.test(p.name));
 assert(p.colors.length>=2&&p.colors.length<=16);assert.equal(p.colors.length,p.positions.length);assert.equal(p.positions[0],0);assert.equal(p.positions.at(-1),1);assert(p.positions.every((t,i)=>!i||t>p.positions[i-1]));
 app.applyGradientPreset(p.id);assert.equal(app.state.artistTransition,'smooth');
 assert.equal(app.state.gradientColors.length,p.colors.length);
 for(let i=0;i<p.colors.length;i+=2){
  assert.equal(p.colors[i],p.colors[i+1],'Pairs deliberately hold solid color regions in Smooth mode');
  const t=(p.positions[i]+p.positions[i+1])/2,rgb=app.gradientSample(t).rgb;
  const lab=app.rgbToLab(p.colors[i]);assert(rgb.every(c=>Number.isFinite(c)&&c>=0&&c<=1));
  const encode=v=>Math.round(255*(v<=.0031308?v*12.92:1.055*Math.pow(v,1/2.4)-.055));
  const actual='#'+rgb.map(encode).map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();assert.equal(actual,p.colors[i]);
 }
}
for(const family of ['Poster Pop','Comic','Riso','Duotone','Screenprint','Retro','Cel'])assert(added.some(p=>p.name.startsWith(family+' ·')));
assert.equal(app.studioLibraryGroups('stylized expansion').flatMap(g=>g.presets).length,24);
assert.equal(app.studioLibraryGroups('riso').flatMap(g=>g.presets).filter(p=>p.id.startsWith('stylized-extra-')).length,4,'Family searches must not include unrelated new palettes');
app.restore({favoritePresets:['stylized-extra-poster-electric','gamedev-poster-pop']});app.renderStudioLibrary();
assert.deepEqual(Array.from(app.state.favoritePresets),['stylized-extra-poster-electric','gamedev-poster-pop']);
assert(node('[data-field="studio-library"]').innerHTML.includes('data-studio-favorite="stylized-extra-poster-electric" aria-pressed="true"'));
console.log('PASS: 24 graphic palettes, 118 Stylized entries, 1086 total, preserved old palettes, variable 4–16 keys, solid color plateaus in Smooth, search and favorites.');
