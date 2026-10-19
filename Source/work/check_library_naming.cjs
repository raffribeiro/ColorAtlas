const fs=require('fs'),vm=require('vm'),assert=require('assert');
const file='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const html=fs.readFileSync(file,'utf8'),data=html.match(/<script type="application\/json" id="mp-data">([\s\S]*?)<\/script>/)[1];
const nodes=new Map();function node(k){if(k==='[data-field="vfx-doc-link"]')return null;if(!nodes.has(k))nodes.set(k,{dataset:{},value:'',textContent:'',innerHTML:'',style:{setProperty(k,v){this[k]=v}},parentElement:{hidden:true},clientWidth:k.includes('scene')?420:700,clientHeight:390,handlers:{},attrs:{},addEventListener(n,f){this.handlers[n]=f},setAttribute(n,v){this.attrs[n]=v},getBoundingClientRect(){return {left:0,top:0}},setPointerCapture(id){this.capture=id},hasPointerCapture(id){return this.capture===id},releasePointerCapture(){this.capture=null},select(){},appendChild(){},append(){},replaceChildren(){},focus(){},querySelector(){return null},contains(){return false},options:[]});return nodes.get(k);}
const root={getBoundingClientRect(){return {left:0,top:0,width:700}},querySelector:node,addEventListener(n,f){node("root").handlers[n]=f}};node('#mp-data').textContent=data;
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('const raw=JSON.parse'));
const context={Image:class{constructor(){context.explosionImage=this}set src(v){}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},document:{getElementById(){return root},createElement:()=>node('created-'+Math.random()),body:{appendChild(){}},addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},structuredClone,window:{openai:{widgetState:{modelContent:{h:'5G',v:4,c:0,system:process.env.START_VFX?'vfx':'munsell'}},setWidgetState(){return Promise.resolve()}},addEventListener(){}},navigator:{},ResizeObserver:class{constructor(fn){}observe(){}},console};
vm.runInNewContext(script.replace('new ResizeObserver', 'globalThis.inspectMunsell={state,restore,gradientPresets,applyGradientPreset,renderStudioLibrary,libraryMatches,templateCategories,studioLibraryGroups:typeof studioLibraryGroups==="function"?studioLibraryGroups:null,libraryFolderIsOpen:typeof libraryFolderIsOpen==="function"?libraryFolderIsOpen:null}; new ResizeObserver'),context);

const app=context.inspectMunsell;

const baseline=JSON.parse(fs.readFileSync('work/library-naming-baseline.json','utf8'));const fire=baseline.find(p=>p.id==='fire');fire.positions=[0,.072,.2,.4,.6,.8,1];fire.colors=['#000000','#120202','#650B06','#CB2A08','#FF790C','#FFCC45','#FFF9DC'];
assert.equal(app.gradientPresets.find(p=>p.id==='holy').name,'Light · Soft Gold','Replace religious labels with visual descriptions');
const denied=/\b(?:holy|sacred|divine|hellfire|heaven|angel|demon(?:ic)?|devil|god|goddess|spirit(?:s)?|soul(?:s|steel)?|religious|occult|curse(?:d)?|witchcraft|voodoo|totem|ritual|blessing|temple|cathedral|vampir(?:e|o)|hextech|riot|gameboy|risograph|riso|valorant|overwatch|warcraft|diablo|starcraft|jinx|ahri|yasuo|yone|akali|ekko|caitlyn|thresh|viego|kaisa|aurelion|morgana|teemo|seraphine|jhin|arthas|illidan|tyrael|kerrigan|protoss|terran|sorcery|sorceress|necromancy|necromancia|infernal|enchantress|undead|undeath|wraith|haunted|arcane|magic|mana|fae|runic|runes|fel|incense|sagrado|magia|maldição|espírito|orphism)\b/i;
const editable=new Set(['name','category','originalCategory','description','searchAliases','movement','artist','workTitle']);
const stable=p=>Object.fromEntries(Object.entries(p).filter(([k])=>!editable.has(k)));
assert.equal(app.gradientPresets.length,1086);
const policy=JSON.parse(fs.readFileSync('work/library-naming-policy.json','utf8'));
for(const [id,patch] of Object.entries(policy.patches)){const actual=app.gradientPresets.find(p=>p.id===id);for(const [key,value] of Object.entries(patch))assert.equal(actual[key],value,'Reviewed metadata stays synchronized: '+id+' '+key);}
assert.deepEqual(Array.from(app.gradientPresets,p=>p.id),baseline.map(p=>p.id),'Preserve preset order and identities');
for(const p of app.gradientPresets){
 const publicText=[p.name,p.description,p.searchAliases,p.originalCategory,p.movement].filter(Boolean).join(' ');
 assert(!denied.test(publicText),p.id+' has a retired religious, branded or character reference');
 assert(!p.artist&&!p.workTitle,'Keep named people/artworks out of bundled preset metadata');
 assert.deepEqual(JSON.parse(JSON.stringify(stable(p))),stable(baseline.find(q=>q.id===p.id)),'Names alone must not alter colors, stop positions, coverage, interpolation or review data: '+p.id);
}
assert.equal(app.gradientPresets.find(p=>p.id==='trope-env-temple').category,'World','Put environment palettes with environments');
assert.equal(app.gradientPresets.find(p=>p.id==='gamedev-demon-skin').category,'World','Group surface colors with materials');
assert.deepEqual(Array.from(app.templateCategories,p=>p[1]),['Effects','Nature & materials','Color studies','Data & diagnostics','Art studies','Design studies','Color & experiments']);
assert.equal(app.studioLibraryGroups('').flatMap(g=>g.children.flatMap(t=>t.presets)).length,1086,'Every preset remains reachable');
for(const query of ['holy','vampire','demon','ritual','valorant','jinx','gameboy'])assert.equal(app.studioLibraryGroups(query).length,0,'Retired tags do not remain searchable: '+query);
assert(app.studioLibraryGroups('soft gold').some(g=>g.presets.some(p=>p.id==='holy')),'Neutral names are searchable');
app.state.favoritePresets=['holy','lol-jinx'];app.renderStudioLibrary();const visible=node('[data-field="studio-library"]').innerHTML;
assert(visible.includes('Light · Soft Gold')&&visible.includes('Cobalt &amp; Magenta · Bright Accents'),'Saved favorites show reviewed names');
app.applyGradientPreset('holy');assert.equal(app.state.gradientPreset,'holy','Legacy saved IDs still select their unchanged colors');
app.applyGradientPreset('fire');assert.deepEqual(Array.from(app.state.gradientColors,k=>({t:k.t,hex:k.hex.toUpperCase()})),fire.colors.map((hex,i)=>({t:fire.positions[i],hex})), 'Applying Fire uses authored positions and all seven colors');
console.log('PASS: all 1086 public preset names/tags/descriptions/categories audited; neutral search and legacy favorites work; colors, identities and coverage unchanged.');
