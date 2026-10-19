const fs=require('fs'),vm=require('vm'),assert=require('assert');
const file='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const html=fs.readFileSync(file,'utf8'),data=html.match(/<script type="application\/json" id="mp-data">([\s\S]*?)<\/script>/)[1];
const nodes=new Map();function node(k){if(k==='[data-field="vfx-doc-link"]')return null;if(!nodes.has(k))nodes.set(k,{dataset:{},value:'',textContent:'',innerHTML:'',style:{setProperty(k,v){this[k]=v}},parentElement:{hidden:true},clientWidth:k.includes('scene')?420:700,clientHeight:390,handlers:{},attrs:{},addEventListener(n,f){this.handlers[n]=f},setAttribute(n,v){this.attrs[n]=v},getBoundingClientRect(){return {left:0,top:0}},setPointerCapture(id){this.capture=id},hasPointerCapture(id){return this.capture===id},releasePointerCapture(){this.capture=null},select(){},appendChild(){},append(){},replaceChildren(){},focus(){},querySelector(){return null},contains(){return false},options:[]});return nodes.get(k);}
const root={getBoundingClientRect(){return {left:0,top:0,width:700}},querySelector:node,addEventListener(n,f){node("root").handlers[n]=f}};node('#mp-data').textContent=data;
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('const raw=JSON.parse'));
const context={Image:class{constructor(){context.explosionImage=this}set src(v){}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},document:{getElementById(){return root},createElement:()=>node('created-'+Math.random()),body:{appendChild(){}},addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},structuredClone,window:{openai:{widgetState:{modelContent:{h:'5G',v:4,c:0,system:process.env.START_VFX?'vfx':'munsell'}},setWidgetState(){return Promise.resolve()}},addEventListener(){}},navigator:{},ResizeObserver:class{constructor(fn){}observe(){}},console};
vm.runInNewContext(script.replace('new ResizeObserver', 'globalThis.inspectMunsell={state,restore,gradientPresets,applyGradientPreset,renderStudioLibrary,studioLibraryGroups:typeof studioLibraryGroups==="function"?studioLibraryGroups:null,libraryFolderIsOpen:typeof libraryFolderIsOpen==="function"?libraryFolderIsOpen:null}; new ResizeObserver'),context);

const app=context.inspectMunsell;
assert.equal(typeof app.studioLibraryGroups,'function','Library must group palettes into collapsible category/theme folders');
const groups=app.studioLibraryGroups('');
assert.equal(groups.length,7);
assert.equal(groups.reduce((n,g)=>n+g.children.length,0),48);
const all=groups.flatMap(g=>g.children.flatMap(t=>t.presets));
assert.equal(all.length,1086);assert.equal(new Set(all.map(p=>p.id)).size,1086);
assert(groups.find(g=>g.key==='category:Art').children.every(g=>g.presets.every(p=>p.category==='Art')));
assert(groups.find(g=>g.key==='category:Design').children.every(g=>g.presets.every(p=>p.category==='Design')));
assert.equal(groups.find(g=>g.key==='category:Art').children.length,8,'Merge five-palette art movements into related families');
assert.equal(groups.find(g=>g.key==='category:Design').children.length,4,'Merge small design movements by approach');
for(const group of groups)for(const child of group.children){assert(child.presets.length>=8,child.label+' should not be an isolated tiny folder');assert(child.presets.length<=48,child.label+' should not be an oversized catch-all');}
const before=JSON.parse(fs.readFileSync('work/library-naming-baseline.json','utf8'));
for(const p of all){const original=before.find(q=>q.id===p.id);assert.deepEqual(JSON.parse(JSON.stringify(p.colors??null)),original.colors??null,'Reorganization must preserve colors');assert.deepEqual(JSON.parse(JSON.stringify(p.positions??null)),original.positions??null,'Reorganization must preserve key positions');}
assert(groups.find(g=>g.key==='category:World').children.some(t=>t.label==='Birds & insects'));
assert(groups.find(g=>g.key==='category:World').children.some(t=>t.label==='Flowers & petals'));
assert(groups.find(g=>g.key==='category:World').children.find(t=>t.label==='Birds & insects').presets.some(p=>p.id==='coverage-animal-gouldian'),'Mixed legacy nature studies place birds with birds');
assert(groups.find(g=>g.key==='category:World').children.find(t=>t.label==='Flowers & petals').presets.every(p=>!p.id.startsWith('coverage-animal')),'Flowers contain no animal studies');
const previousFolders=JSON.parse(fs.readFileSync('work/library-folders-baseline.json','utf8'));
for(const group of previousFolders)for(const theme of group.children){const foundIds=new Set(app.studioLibraryGroups(theme.label).flatMap(g=>g.presets.map(p=>p.id)));assert(theme.presets.every(p=>foundIds.has(p.id)),'Previous theme remains searchable: '+theme.label);}
const query='Quiet Olive Portrait',found=app.studioLibraryGroups(query.toLowerCase());
assert.equal(found.length,1);assert.equal(found[0].key,'category:Art');assert.equal(found[0].children.length,1);assert.equal(found[0].children[0].label,'Classical & romantic');assert.equal(found[0].children[0].presets.length,1);
node('#studio-search').value=query;node('#studio-search').handlers.input();
let library=node('[data-field="studio-library"]').innerHTML;
assert(library.includes('<details'));assert(library.includes('<summary'));assert(library.includes('Quiet Olive Portrait'));assert(!library.includes('Primary Totem'));assert(!library.includes('Cobalt Night Spiral'));
const key='category:Art',presets=groups.find(g=>g.key===key).presets;
node('#studio-search').value='';node('#studio-search').handlers.input();
node('[data-field="studio-library"]').handlers.toggle({target:{dataset:{studioFolder:key},open:false}});
app.renderStudioLibrary();assert.equal(app.libraryFolderIsOpen(key,presets,''),false);
app.applyGradientPreset('art-design-1');assert.equal(app.libraryFolderIsOpen(key,presets,''),false,'Editing/selection preserves an explicitly collapsed folder');
assert.equal(app.libraryFolderIsOpen(key,presets,'olive'),true,'Search temporarily opens matching folders');
node('[data-field="studio-library"]').handlers.toggle({target:{dataset:{studioFolder:key},open:true}});
app.renderStudioLibrary();assert.equal(app.libraryFolderIsOpen(key,presets,''),true);
app.restore({libraryFolders:{[key]:false,'category:Design':true,'theme:Art:Renaissance':'bad'}});assert.equal(app.libraryFolderIsOpen(key,presets,''),false);assert.equal(app.state.libraryFolders['category:Design'],true);assert(!Object.hasOwn(app.state.libraryFolders,'theme:Art:Renaissance'));
node('#studio-search').value='zzzz-no-palette-match';node('#studio-search').handlers.input();assert(node('[data-field="studio-library"]').innerHTML.includes('No palettes found'));
node('#studio-search').value='';node('#studio-search').handlers.input();
node('[data-field="studio-library"]').handlers.click({target:{closest(){return {dataset:{studioPreset:'fire'}}}}});assert.equal(app.state.gradientPreset,'fire');
const header=html.match(/<div class="viz-row studio-topbar">([\s\S]*?)<\/h2>/)[1];
assert(!header.includes('<svg'),'Remove old brand symbol');assert(header.includes('class="studio-brand"'));assert(html.includes('in oklab'));assert(html.includes('oklch('));
assert(app.studioLibraryGroups('Renaissance').some(g=>g.children.some(t=>t.label==='Classical & romantic')),'Original movement names stay searchable');
assert(app.studioLibraryGroups('effect families').some(g=>g.children.length>1),'Old large theme stays searchable across the new folders');
assert(app.studioLibraryGroups('transitions & signals').some(g=>g.children.some(t=>t.label==='Transitions & signals')),'New folder labels are searchable');
console.log('PASS: all 1086 palettes in 7 categories with 8–48 entries per theme, consolidated Art/Design families, preserved colors/positions, old/new theme search, collapse, empty state, selection and wordmark.');
