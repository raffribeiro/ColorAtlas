// Preview preset connection integration
(()=>{
 const render=renderPreviewPresets,open=openPreviewPreset,store=previewStore;
 renderPreviewPresets=function(...args){render(...args);presetAction('new').disabled=previewPresetBusy;};
 openPreviewPreset=async function(mode){if(mode==='new'&&!previewPresetsReady&&!previewPresetBusy){await refreshPreviewPresets();if(!previewPresetsReady){presetField('status').textContent='Browser storage unavailable. Allow local browser storage and reload.';return;}}return open(mode);};
 previewStore=async function(action,payload){if(action==='preset-save'&&payload.doc?.layers.some(p=>p.asset===null)){if(!previewDefaultThumb)throw Error('Reference image is still loading');const fields=await readPreviewImage(previewDefaultThumb);payload=structuredClone(payload);for(const p of payload.doc.layers)if(p.asset===null)p.asset=fields.asset;}return store(action,payload);};
 renderPreviewPresets();
})();
// End Preview preset connection integration
