// Default Preview integration
(()=>{
 window.AtlasTourPreviewSnapshot=()=>{syncPreviewLayer();const doc=structuredClone(previewDocument(previewImages,previewSelected));doc.randomOn=[...previewRandomSelection];doc.previewZoom=window.AtlasPreviewCamera?.getZoom()??1;return doc;};
 const store=previewStore,restore=restorePreviewStack;let checked=false,chosen=null;const resume=window.AtlasOnboardingStore?.restorePreview;
 previewStore=async function(action,payload){
  if(action!=='read'||checked)return store(action,payload);checked=true;
  chosen=resume?await store(action,payload):structuredClone(AtlasBuiltinPreview);return chosen;
 };
 restorePreviewStack=async function(doc,explicit=false,revision=previewRevision){
  const target=doc===chosen,result=await restore(doc,explicit,revision);
  if(target&&result){
   if(!resume)try{if(!await store('default-status')){const list=await store('preset-list');if(!Array.isArray(list))throw Error('Storage unavailable');const others=list.filter(p=>p.id!=='codex-use-esse'&&p.id!=='temp-design');if(!others.length||await atlasConfirmDelete('Delete other Preview presets?','Keep only Default and delete '+others.length+' other Preview presets?')){for(const p of others)await store('preset-delete',{id:p.id});await store('default-done');}}}catch{/* Keep the embedded default available when browser storage fails. */}
   await refreshPreviewPresets();renderPreviewPresets(resume?.preset||'codex-use-esse');if(previewPresetsReady)presetField('status').textContent='';}
  return result;
 };
})();
// End Default Preview integration
