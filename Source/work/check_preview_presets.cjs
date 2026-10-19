const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
assert(!fs.readFileSync('work/atlas-preview-presets.html','utf8').includes('data-preview-preset="load"'),'Presets load on selection without a Load button');
const setup=fs.readFileSync('work/check_preview_layers_ui.cjs','utf8').split('(async()=>{')[0];
const box={require,console,structuredClone,setImmediate,queueMicrotask};vm.runInNewContext(setup+'\nglobalThis.h={c,get,tick,timers};',box);
const {c,get,tick}=box.h;
assert.equal(typeof c.initializePreviewPresets,'function','Preview must provide named layer-stack presets');
(async()=>{
 c.root.querySelector=get;let cameraZoom=2.25,cameraPan=19,resets=0;get('[data-preview-camera="reset"]').click=()=>{cameraZoom=1.6;cameraPan=0;resets++;};c.window.AtlasPreviewCamera={getZoom:()=>cameraZoom,setZoom:value=>{cameraZoom=value}};
 const saved=new Map();let deny=false,reads=[];c.previewStore=async(action,payload)=>{
  if(deny)throw Error('Storage unavailable');
  if(action==='preset-list')return [...saved.values()].map(({id,name})=>({id,name}));
  if(action==='preset-save'){saved.set(payload.id,structuredClone(payload));return null;}
  if(action==='preset-read'){reads.push(payload.id);return structuredClone(saved.get(payload.id)?.doc);}
  if(action==='preset-delete'){saved.delete(payload.id);return null;}
  return null;
 };
 const dialog=get('#preview-preset-dialog');dialog.showModal=()=>{dialog.open=true};dialog.close=()=>{dialog.open=false;dialog.handlers.close?.()};get('#preview-preset-name').focus=()=>{};get('[data-preview-preset="new"]').focus=()=>{};get('[data-preview-preset="delete"]').focus=()=>{};get('[data-preview-preset="cancel"]').focus=()=>{};
 c.initializePreviewLayers();c.previewReferenceReady('data:image/png;base64,AA==');await tick();
 const image=get('#preview-layer-file');get('[data-preview-action="add"]').handlers.click();image.files=[{name:'Glow.png',type:'image/png',size:5}];await image.handlers.change({target:image});
 get('#preview-blend').handlers.change({target:{value:'screen'}});get('#preview-opacity').handlers.input({target:{value:45}});
 const current=vm.runInContext('previewSelected',c);c.syncPreviewLayer();const snapshot=structuredClone(vm.runInContext('previewDocument(previewImages,previewSelected)',c));snapshot.previewZoom=2.25;snapshot.randomOn=[snapshot.layers[0].id];
 get('[data-preview-preset="new"]').handlers.click();assert(dialog.open);get('#preview-preset-name').value='  Glow scene  ';
 await get('#preview-preset-form').handlers.submit({preventDefault(){}});assert(!dialog.open);assert.equal(saved.size,1);
 assert.equal(reads.length,0,'Saving/rebuilding the dropdown must not load a preset');get('#preview-preset-select').value='';await get('#preview-preset-select').handlers.change();assert.equal(reads.length,0,'Placeholder selection retains current Preview');
 for(const randomOn of [null,'all',['missing'],Array(9).fill(snapshot.selected)])assert.equal(c.cleanPreviewDocument({...snapshot,randomOn}),null,'Malformed Random targets are rejected before scene mutation');
 const preset=[...saved.values()][0];assert.equal(preset.name,'Glow scene');assert.deepEqual(JSON.parse(JSON.stringify(preset.doc)),JSON.parse(JSON.stringify(snapshot)),'Snapshot includes images, order, opacity/blend, both maps, alpha, transition and selected layer');
 c.selectPreviewLayer(current);c.state.gradientColors[0].hex='#00ff00';c.syncPreviewLayer();assert.notEqual(preset.doc.layers[1].map.layers.emission.colors[0].hex,'#00ff00','Saved maps are independent of future edits');
 get('[data-preview-action="remove"]').handlers.click();assert.equal(vm.runInContext('previewImages.length',c),1);
 cameraZoom=.8;get('#preview-preset-select').value=preset.id;await get('#preview-preset-select').handlers.change();assert.equal(get('#preview-preset-status').textContent,'','Successful preset loading is quiet');assert.equal(cameraZoom,1.6,'Selecting a preset uses Reset view instead of saved zoom');assert.equal(cameraPan,0);assert.equal(resets,1);assert.deepEqual([...vm.runInContext('previewRandomSelection',c)],snapshot.randomOn,'Preset restores each die independently of the active image');
 preset.doc.randomOn=[];await get('#preview-preset-select').handlers.change();assert.equal(vm.runInContext('previewRandomSelection.size',c),0,'All-OFF preset stays all OFF');
 delete preset.doc.randomOn;await get('#preview-preset-select').handlers.change();assert.deepEqual([...vm.runInContext('previewRandomSelection',c)],[snapshot.selected],'Legacy presets enable only the active image');preset.doc.randomOn=snapshot.randomOn;
 assert.equal(vm.runInContext('previewImages.length',c),2);assert.equal(vm.runInContext('previewSelected',c),snapshot.selected);assert.equal(c.state.gradientColors[0].hex,snapshot.layers[1].map.layers.emission.colors[0].hex);assert.equal(vm.runInContext('previewImages[1].blend',c),'screen');assert.equal(vm.runInContext('previewImages[1].opacity',c),.45);
 delete preset.doc.previewZoom;cameraZoom=2;await get('#preview-preset-select').handlers.change();assert.equal(cameraZoom,1.6,'Legacy presets also use Reset view');preset.doc.previewZoom=2.25;saved.set(preset.id,preset);cameraZoom=1.37;
 const store=c.previewStore;let resume;c.previewStore=(action,payload)=>action==='preset-read'?new Promise(resolve=>{resume=resolve;}):store(action,payload);
 const waiting=get('#preview-preset-select').handlers.change();await tick();assert(get('#preview-preset-select').disabled,'Disable selection during atomic load');c.state.gradientColors[0].hex='#112244';c.syncPreviewLayer();
 const edited=JSON.stringify(vm.runInContext('previewDocument(previewImages,previewSelected)',c));resume(preset.doc);await waiting;assert.equal(JSON.stringify(vm.runInContext('previewDocument(previewImages,previewSelected)',c)),edited,'Edits during loading prevent the delayed preset from overwriting the workspace');assert.equal(cameraZoom,1.37,'Superseded preset loads retain current zoom');c.previewStore=store;
 get('#preview-preset-select').value=preset.id;const Image=c.Image;c.Image=class{set src(value){queueMicrotask(()=>this.onerror());}};await get('#preview-preset-select').handlers.change();c.Image=Image;
 assert.equal(JSON.stringify(vm.runInContext('previewDocument(previewImages,previewSelected)',c)),edited,'Image decode failure preserves the entire current composition');assert.equal(cameraZoom,1.37,'Failed preset loads retain current zoom');
 assert.equal(get('#preview-preset-select').value,preset.id,'Failed loads retain the preset selection for deletion');assert(!get('[data-preview-preset="delete"]').disabled,'A failed preset remains deletable');assert(!get('#preview-preset-select').disabled,'Selection recovers after failed loading');
 const live=JSON.stringify(vm.runInContext('previewDocument(previewImages,previewSelected)',c));
 get('[data-preview-preset="delete"]').handlers.click();assert(dialog.open);get('[data-preview-preset="cancel"]').handlers.click();assert.equal(saved.size,1,'Cancel keeps the preset');
 get('[data-preview-preset="delete"]').handlers.click();await get('#preview-preset-form').handlers.submit({preventDefault(){}});assert.equal(saved.size,0);assert.equal(JSON.stringify(vm.runInContext('previewDocument(previewImages,previewSelected)',c)),live,'Deleting a preset preserves the current workspace');
 get('[data-preview-preset="new"]').handlers.click();get('#preview-preset-name').value=' ';await get('#preview-preset-form').handlers.submit({preventDefault(){}});assert.equal(saved.size,0);assert(dialog.open,'Invalid name is recoverable');
 get('#preview-preset-name').value='Failure';deny=true;await get('#preview-preset-form').handlers.submit({preventDefault(){}});assert.equal(saved.size,0);assert(dialog.open,'Failed writes retain the dialog');assert(get('#preview-preset-message').textContent);
 get('[data-preview-preset="cancel"]').handlers.click();deny=false;
 const bad={id:'bad',name:'Bad',doc:{version:1,selected:'missing',layers:[{}]}};saved.set('bad',bad);await c.refreshPreviewPresets();get('#preview-preset-select').value='bad';await get('#preview-preset-select').handlers.change();assert.equal(JSON.stringify(vm.runInContext('previewDocument(previewImages,previewSelected)',c)),live,'Malformed presets never replace the workspace');
 console.log('PASS: named Preview presets create/select-to-load/delete, image and independent-map snapshots, metadata restoration, cancel, name validation, storage errors and atomic failure behavior.');
})().catch(error=>{console.error(error);process.exitCode=1});
