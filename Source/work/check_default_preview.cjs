const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const builtin=JSON.parse(fs.readFileSync('work/default-preview.json'));
(async()=>{
 for(const scenario of ['saved','first-launch','offline','invalid','tour-resume','saved-empty']){
  const saved={...structuredClone(builtin),selected:'user-layer',layers:[{...structuredClone(builtin.layers[0]),id:'user-layer',name:'My uploaded image',asset:'local-upload'}]},calls=[],selected=[],restored=[];
  if(scenario==='saved-empty'){saved.layers=[];saved.selected=null;}
  const status={textContent:'Storage unavailable'};let asked=0;
  const c={structuredClone,AtlasBuiltinPreview:builtin,previewRevision:0,previewPresetsReady:scenario!=='offline',cleanPreviewDocument:d=>d?.version===1&&Array.isArray(d.layers)?d:null,window:{AtlasOnboardingStore:{restorePreview:scenario==='tour-resume'?{preset:'my-preset'}:null}},atlasConfirmDelete:async()=>{asked++;return true;},previewStore:async(a,p)=>{calls.push([a,p]);if(scenario==='offline')throw Error('Storage unavailable');if(a==='read')return scenario==='first-launch'?null:scenario==='invalid'?{bad:true}:saved;if(a==='preset-list')return[{id:'codex-use-esse',name:'Default'},{id:'user-preset',name:'My preset'}];return null;},restorePreviewStack:async d=>{restored.push(d);return true;},refreshPreviewPresets:async()=>{},renderPreviewPresets:id=>selected.push(id),presetField:()=>status};
  vm.createContext(c);vm.runInContext(fs.readFileSync('work/atlas-default-preview.js','utf8'),c);
  const doc=await c.previewStore('read');assert(doc,'A builtin fallback is available when no saved working scene can be read');
  const expectSaved=['saved','tour-resume','saved-empty'].includes(scenario);assert.deepEqual(doc,expectSaved?saved:builtin,scenario+' restores the right working stack');
  if(!expectSaved){assert.deepEqual(doc.layers.map(x=>x.name),['BG','Explosion_Smoke','Explosion_Emissive']);assert.equal(doc.layers[2].blend,'add');assert.equal(doc.layers[2].map.layers.emission.colors[0].hex,'#000000');}
  await c.restorePreviewStack(doc);assert.equal(restored[0],doc);assert.equal(asked,0,'Normal boot never prompts to delete saved presets');assert(!calls.some(([a])=>['preset-delete','default-done','default-status','write'].includes(a)),'Boot does not delete or overwrite library data');
  assert.equal(selected[0],scenario==='tour-resume'?'my-preset':expectSaved?undefined:'codex-use-esse','Tour preset selection is retained; builtin is selected only for builtin fallback');
  assert.equal(status.textContent,scenario==='offline'?'Storage unavailable':'','Storage errors remain visible');
 }
 console.log('PASS: saved uploads and intentional empty scenes resume; first-launch/invalid/offline fallback; tutorial selection restored; zero cleanup prompts/deletions/writes; builtin order/Add retained.');
})().catch(error=>{console.error(error);process.exitCode=1;});
