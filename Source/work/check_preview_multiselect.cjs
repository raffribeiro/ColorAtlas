const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const box={require,console,structuredClone,setImmediate,queueMicrotask};
vm.runInNewContext(fs.readFileSync('work/check_preview_layers_ui.cjs','utf8').split('(async()=>{')[0]+'\nglobalThis.h={c,get,tick,timers};',box);
const {c,get,tick}=box.h;
const source=fs.readFileSync(process.env.ATLAS_TEST_SOURCE||'/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html','utf8');
const start=source.indexOf('function randomAllLayers('),end=source.indexOf('// Render choices',start);
vm.runInContext(source.slice(start,end),c);
let calls=[],serial=0,draws=0;
const generated=keys=>keys.map(k=>({...k,hex:'#'+(++serial).toString(16).padStart(6,'0')}));
Object.assign(c,{
 importanceLayerDefinitions:[{id:'emission'},{id:'smoke'}],
 unrestrictedRandomGradient:generated,buildDiscriminationRamp:options=>generated(c.state.gradientLayers[options.layer].colors),
 directedPalette:generated,harmonyOffsets:()=>[0,120,240],huePeakLightness:()=>60,paletteCandidateScore:()=>1,
 makeColorPlayPair(){return Object.fromEntries(['emission','smoke'].map(id=>[id,generated(c.state.gradientLayers[id].colors)]))},
 drawGradient(){draws++;c.syncPreviewLayer()}
});
const random=c.randomAllLayers;c.randomAllLayers=(...args)=>{calls.push(vm.runInContext('previewSelected',c));random(...args)};
const selected=()=>get('#preview-layer-list').children.filter(row=>row.dataset.selected==='true');
const clickIndex=(index,shiftKey=false)=>get('#preview-layer-list').children[index].children[1].handlers.click({shiftKey});
(async()=>{
 c.initializePreviewLayers();await tick();
 const file=get('#preview-layer-file');
 for(const name of ['Second.png','Third.png']){get('[data-preview-action="add"]').handlers.click();file.files=[{name,type:'image/png',size:10}];await file.handlers.change({target:file});}
 const ids=[...vm.runInContext('previewImages.map(p=>p.id)',c)];
 for(const row of get('#preview-layer-list').children)if(row.children[2]['aria-pressed']==='true')row.children[2].handlers.click();
 clickIndex(0);clickIndex(1,true);
 assert.equal(vm.runInContext('previewRandomSelection.size',c),0,'Click and Shift-selection must not enable Random');
 for(const index of [0,1])get('#preview-layer-list').children[index].children[2].handlers.click();

 assert.equal(selected().length,2,'Shift-click must keep the first layer selected and add the clicked layer');
 get('#preview-layer-list').children[0].children[2].handlers.click();assert.equal(selected().length,2,'Toggling a die does not change selection highlighting');get('#preview-layer-list').children[0].children[2].handlers.click();
 assert.equal(vm.runInContext('previewSelected',c),ids[1],'Last added layer is active for editing');
 assert(selected().every(row=>row.children[1]['aria-pressed']==='true'),'Both rows expose selection to keyboard/screen-reader users');
 assert.equal(typeof c.randomPreviewLayers,'function','Random needs a selected-image dispatcher');
 for(const mode of ['true-random','perceptual','colorplay','auto']){
  c.syncPreviewLayer();const before=structuredClone(vm.runInContext('previewDocument(previewImages,previewSelected)',c));
  c.state.randomType=mode;calls=[];draws=0;c.randomPreviewLayers(()=>.3);
  const after=vm.runInContext('previewDocument(previewImages,previewSelected)',c);
  assert.deepEqual(calls,[ids[1],ids[2]],'Random runs once per selected image, in stack order');
  assert.equal(after.selected,ids[1]);assert.equal(selected().length,2,'Random retains the multi-selection');
  assert.equal(JSON.stringify(after.layers[0]),JSON.stringify(before.layers[0]),'Unselected image and both palettes remain unchanged');
  for(const index of [1,2])for(const ramp of ['emission','smoke']){
   assert.notEqual(JSON.stringify(after.layers[index].map.layers[ramp].colors),JSON.stringify(before.layers[index].map.layers[ramp].colors));
   assert.equal(JSON.stringify(after.layers[index].map.layers[ramp].alphas),JSON.stringify(before.layers[index].map.layers[ramp].alphas));
  }
  assert.equal(draws,0,'Batch generation does not repaint the full preview per layer');
  assert.equal(JSON.stringify(c.state.gradientColors),JSON.stringify(after.layers[1].map.layers.emission.colors),'Editor retains the active map');
 }
 clickIndex(0,true);assert.equal(selected().length,1,'Shift-click toggles an already-selected layer off');assert.equal(vm.runInContext('previewSelected',c),ids[1],'Removing another row retains the active layer');
 clickIndex(0,true);clickIndex(1,true);assert.equal(selected().length,1);assert.equal(vm.runInContext('previewSelected',c),ids[2],'Removing the active layer moves editing to a selected layer');
 clickIndex(0,true);assert.equal(selected().length,1,'The final selected row remains editable');
 clickIndex(2);assert.equal(selected().length,1,'A plain click resets the selection');
 calls=[];c.randomPreviewLayers(()=>.4);assert.deepEqual(calls,[ids[1],ids[2]],'Plain selection does not change enabled Random dice');
 clickIndex(1,true);const beforeOrder=[...vm.runInContext('previewRandomSelection',c)];get('[data-preview-action="up"]').handlers.click();assert.deepEqual([...vm.runInContext('previewRandomSelection',c)],beforeOrder,'Reordering keeps selection attached to image IDs');
 const dispatch=source.match(/\$\('\[data-action="random-all-layers"\]'\)\.addEventListener\('click',\(\)=>randomPreviewLayers\(\)\);/);assert(dispatch,'The visible Random button must use selected-image dispatch');vm.runInContext(dispatch[0],c);calls=[];get('[data-action="random-all-layers"]').handlers.click();assert.equal(calls.length,2,'The actual Random button targets both selected images');
 const doc=vm.runInContext('previewDocument(previewImages,previewSelected)',c);await c.restorePreviewStack(doc,true,vm.runInContext('previewRevision',c));assert.equal(selected().length,1,'Reload/preset restore selects only the saved active layer');
 get('[data-preview-action="remove"]').handlers.click();get('[data-preview-action="remove"]').handlers.click();get('[data-preview-action="remove"]').handlers.click();assert.equal(selected().length,0,'Deleting the last image clears selection');
 assert.equal(vm.runInContext('previewRandomSelection.size',c),0);
 console.log('PASS: click/Shift selection and dice are independent; Random targets only enabled dice, preserves alpha/active maps and survives reorder/reset safely.');
})().catch(error=>{console.error(error);process.exitCode=1});
