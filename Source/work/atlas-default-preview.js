// Default Preview integration
(()=>{
 window.AtlasTourPreviewSnapshot=()=>{syncPreviewLayer();const doc=structuredClone(previewDocument(previewImages,previewSelected));doc.randomOn=[...previewRandomSelection];doc.previewZoom=window.AtlasPreviewCamera?.getZoom()??1;return doc;};
 const store=previewStore,restore=restorePreviewStack;let checked=false,chosen=null,usingBuiltin=false;const resume=window.AtlasOnboardingStore?.restorePreview;
 previewStore=async function(action,payload){
  if(action!=='read'||checked)return store(action,payload);checked=true;
  // Working images are local browser data, independent from named presets.
  // Never replace them on boot or clean up the user's saved presets.
  try{const saved=await store(action,payload);if(saved&&cleanPreviewDocument(saved)){chosen=saved;return chosen;}}catch{/* First launch or unavailable storage still has an embedded Preview. */}
  usingBuiltin=true;chosen=structuredClone(AtlasBuiltinPreview);return chosen;
 };
 restorePreviewStack=async function(doc,explicit=false,revision=previewRevision){
  const target=doc===chosen,result=await restore(doc,explicit,revision);
  if(target&&result){
   await refreshPreviewPresets();renderPreviewPresets(resume?.preset||(usingBuiltin?'codex-use-esse':undefined));if(previewPresetsReady)presetField('status').textContent='';}
  return result;
 };
})();
// End Default Preview integration
