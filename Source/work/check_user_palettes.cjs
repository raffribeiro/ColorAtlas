const fs=require('fs'),vm=require('vm'),assert=require('assert');
const file='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const html=fs.readFileSync(file,'utf8'),data=html.match(/<script type="application\/json" id="mp-data">([\s\S]*?)<\/script>/)[1];
const nodes=new Map();function node(k){if(k==='[data-field="vfx-doc-link"]')return null;if(!nodes.has(k))nodes.set(k,{dataset:{},value:'',textContent:'',innerHTML:'',style:{setProperty(k,v){this[k]=v}},parentElement:{hidden:true},clientWidth:k.includes('scene')?420:700,clientHeight:390,handlers:{},attrs:{},addEventListener(n,f){this.handlers[n]=f},setAttribute(n,v){this.attrs[n]=v},getBoundingClientRect(){return {left:0,top:0}},setPointerCapture(id){this.capture=id},hasPointerCapture(id){return this.capture===id},releasePointerCapture(){this.capture=null},select(){},appendChild(){},append(){},replaceChildren(){},focus(){},querySelector(){return null},contains(){return false},options:[]});return nodes.get(k);}
const root={getBoundingClientRect(){return {left:0,top:0,width:700}},querySelector:node,addEventListener(n,f){node("root").handlers[n]=f}};node('#mp-data').textContent=data;
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
const context={parent:{postMessage(){}},CSS:{escape:value=>value},Image:class{constructor(){context.explosionImage=this}set src(v){}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},document:{getElementById(){return root},createElement:()=>node('created-'+Math.random()),body:{appendChild(){}},addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},structuredClone,window:{AtlasLabSurface:{svg:()=>''},AtlasNeutralAxis:{svg:()=>''},openai:{widgetState:{modelContent:{h:'5G',v:4,c:0,system:process.env.START_VFX?'vfx':'munsell'}},setWidgetState(value){context.savedState=value;return Promise.resolve()}},addEventListener(){}},navigator:{},ResizeObserver:class{constructor(fn){}observe(){}},TextEncoder,console};
vm.runInNewContext(script.replace('new ResizeObserver', 'globalThis.inspectMunsell={state,restore,gradientPresets,renderStudioLibrary,saveUserPalette,applyUserPalette,deleteUserPalette,openDeleteUserPalette,openSaveUserPalette}; new ResizeObserver'),context);



(async()=>{
const app=context.inspectMunsell, library=node('[data-field="studio-library"]');
assert(library.innerHTML.includes('category:My palettes'),'My palettes is always discoverable');
assert(library.innerHTML.includes('data-studio-folder="category:My palettes" open'),'My palettes starts expanded even when empty');
const before=JSON.stringify([app.state.gradientColors,app.state.gradientAlphas,app.state.artistTransition]);
app.state.artistTransition='bands';
const saved=await app.saveUserPalette('<Fire & Ice>','A personal study','both');
assert(saved.persisted);assert.equal(app.state.userPalettes.length,1);assert.equal(saved.palette.name,'<Fire & Ice>');
assert.equal(saved.palette.layers.emission.transition,'bands');assert(saved.palette.layers.smoke);
assert(library.innerHTML.includes('&lt;Fire &amp; Ice&gt;'));assert(!library.innerHTML.includes('<Fire & Ice>'));
assert.equal((library.innerHTML.match(/data-studio-delete=/g)||[]).length,1,'Only user palettes can be deleted');
const snapshot=JSON.stringify(saved.palette.layers);app.state.gradientColors[0].hex='#123456';
assert.equal(JSON.stringify(saved.palette.layers),snapshot,'Saved gradients are independent snapshots');
app.applyUserPalette(saved.palette.id);assert.equal(app.state.artistTransition,'bands');
assert.equal(JSON.stringify(app.state.gradientColors),JSON.stringify(saved.palette.layers.emission.colors));
app.state.gradientColors[0].hex='#654321';assert.equal(JSON.stringify(saved.palette.layers),snapshot);
const editingBeforeStar=JSON.stringify([app.state.gradientColors,app.state.gradientAlphas]);
const star={dataset:{studioFavorite:saved.palette.id},closest(){return {dataset:{studioFolder:'category:My palettes'}}}};
library.handlers.click({target:{closest(selector){return selector==='[data-studio-favorite]'?star:null}}});
assert.equal(JSON.stringify([app.state.gradientColors,app.state.gradientAlphas]),editingBeforeStar,'Favoriting a user palette does not load it');app.renderStudioLibrary();assert(app.state.favoritePresets.includes(saved.palette.id));
node('#studio-search').value='personal study';app.renderStudioLibrary();assert(library.innerHTML.includes('data-studio-preset="'+saved.palette.id+'"'));node('#studio-search').value='';
const restored=JSON.parse(JSON.stringify(context.savedState));
app.state.userPalettes=[];app.restore(restored);app.renderStudioLibrary();assert.equal(app.state.userPalettes[0].name,'<Fire & Ice>');
const valid=JSON.parse(JSON.stringify(app.state.userPalettes[0]));app.restore({userPalettes:[valid,valid,{...valid,id:'fire'},{...valid,id:'user-bad',layers:{emission:{colors:[],alphas:[]}}}]});assert.equal(app.state.userPalettes.length,1,'Restore validates, deduplicates and rejects reserved IDs');
const dialog=node('#palette-delete-dialog');dialog.showModal=()=>{dialog.open=true};dialog.close=()=>{dialog.open=false};
library.handlers.click({target:{closest(selector){return selector==='[data-studio-delete]'?{dataset:{studioDelete:valid.id}}:null}}});assert(dialog.open);assert.equal(app.state.userPalettes.length,1,'Opening delete only asks for confirmation');
node('[data-palette-delete-cancel]').handlers.click();assert(!dialog.open);assert.equal(app.state.userPalettes.length,1);
const saveDialog=node('#palette-save-dialog');saveDialog.showModal=()=>{saveDialog.open=true};saveDialog.close=()=>{saveDialog.open=false;saveDialog.handlers.close?.()};
let focused=0;context.document.activeElement={focus(){focused++},isConnected:true};
node('[data-action="gradient-save"]').handlers.click();assert(saveDialog.open);assert(!html.includes('id="palette-save-scope"'));
node('#palette-save-name').value='From the dialog';node('#palette-save-description').value='UI path';
await node('#palette-save-form').handlers.submit({preventDefault(){}});assert(!saveDialog.open);assert(focused>0);assert.deepEqual(Object.keys(app.state.userPalettes.find(p=>p.name==='From the dialog').layers).sort(),[app.state.gradientLayer]);
await app.deleteUserPalette(app.state.userPalettes.find(p=>p.name==='From the dialog').id);
const current=JSON.stringify([app.state.gradientColors,app.state.gradientAlphas]);
assert.equal(await app.deleteUserPalette('fire'),false,'Built-in palettes cannot be deleted');
app.openDeleteUserPalette(valid.id);await node('[data-palette-delete-confirm]').handlers.click();assert(!dialog.open);assert.equal(app.state.userPalettes.length,0);assert(!app.state.favoritePresets.includes(valid.id));assert.equal(JSON.stringify([app.state.gradientColors,app.state.gradientAlphas]),current,'Deletion preserves current editing');
await assert.rejects(()=>app.saveUserPalette('   ','','active'),/name/i);
context.window.openai.setWidgetState=()=>Promise.reject(new Error('Storage denied'));
const session=await app.saveUserPalette('Session only','','active');assert.equal(session.persisted,false);assert(app.state.userPalettes.some(p=>p.id===session.palette.id));
assert.equal(Object.keys(session.palette.layers).length,1);
app.openSaveUserPalette();node('#palette-save-name').value='Failure shown';
await node('#palette-save-form').handlers.submit({preventDefault(){}});assert(saveDialog.open);assert(node('#palette-save-status').textContent.includes('session only'));assert(node('[data-palette-save-submit]').disabled,'Failed persistence must not duplicate entries on repeat clicks');
const countAfterFailure=app.state.userPalettes.length;await node('#palette-save-form').handlers.submit({preventDefault(){}});assert.equal(app.state.userPalettes.length,countAfterFailure,'Repeated submissions do not duplicate a pending or session-only save');node('[data-palette-save-cancel]').handlers.click();
context.window.openai.setWidgetState=value=>{app.restore(JSON.parse(JSON.stringify(value)));return Promise.resolve()};
let full=false;for(let i=0;i<100;i++){try{await app.saveUserPalette('Palette '+i,'x'.repeat(240),'both')}catch(e){assert(/full|capacity/i.test(e.message));full=true;break;}}
assert(full,'Library enforces a safe storage budget');assert(new TextEncoder().encode(JSON.stringify(app.state.userPalettes)).length<=8192);
context.window.openai.widgetState=restored;
const collapsedState=structuredClone(restored);collapsedState.modelContent.libraryFolders['category:My palettes']=false;
const fresh={...context,window:{...context.window,openai:{...context.window.openai,widgetState:collapsedState}}};
vm.runInNewContext(script.replace('new ResizeObserver','globalThis.reopenedPaletteApp={state,applyUserPalette};new ResizeObserver'),fresh);
assert.equal(fresh.reopenedPaletteApp.state.libraryFolders['category:My palettes'],true,'My palettes opens by default on reopening');
assert.equal(fresh.reopenedPaletteApp.state.userPalettes[0].name,'<Fire & Ice>','Full app initialization restores My palettes');
fresh.reopenedPaletteApp.applyUserPalette(saved.palette.id);assert.equal(JSON.stringify(fresh.reopenedPaletteApp.state.gradientColors),JSON.stringify(saved.palette.layers.emission.colors));console.log('PASS: My palettes, independent layer snapshots, restore validation, search/favorites, confirmed deletion, session-only storage feedback and capacity guard.');
})().catch(e=>{console.error(e);process.exitCode=1});
