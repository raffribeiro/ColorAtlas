// Save current Preview preset integration
(()=>{
 const button=document.createElement('button');button.type='button';button.className='btn';button.textContent='Save';button.dataset.previewPreset='save';button.title='Save changes to the selected Preview preset';presetAction('new').insertAdjacentElement('afterend',button);
 const render=renderPreviewPresets,dialog=presetField('dialog'),form=presetField('form');let pending=null;
 const selected=()=>previewPresets.find(p=>p.id===presetField('select').value),editable=p=>p&&p.id!=='codex-use-esse';
 renderPreviewPresets=function(...args){render(...args);button.disabled=previewPresetBusy||!previewPresetsReady||!editable(selected());};
 button.addEventListener('click',()=>{
  const p=selected();if(previewPresetBusy||!previewPresetsReady||!editable(p))return;
  syncPreviewLayer();const doc=structuredClone(previewDocument(previewImages,previewSelected));doc.previewZoom=window.AtlasPreviewCamera?.getZoom()??1;doc.randomOn=[...previewRandomSelection];pending={id:p.id,name:p.name,doc};
  previewPresetMode='save';previewPresetAnchor=button;presetField('title').textContent='Save Preview preset?';presetField('help').textContent='Replace the saved settings of “'+p.name+'” with the current Preview?';presetField('name-row').hidden=true;presetField('name').required=false;presetField('message').textContent='';presetAction('confirm').textContent='Save';presetAction('confirm').disabled=false;dialog.showModal();presetAction('cancel').focus();
 });
 form.addEventListener('submit',async e=>{
  if(previewPresetMode!=='save')return;e.preventDefault();e.stopImmediatePropagation();if(previewPresetBusy||!pending)return;
  const target=pending;if(!editable(target)||!previewPresets.some(p=>p.id===target.id)){presetField('message').textContent='This preset is no longer available.';return;}
  previewPresetBusy=true;renderPreviewPresets();presetAction('confirm').disabled=true;
  try{await previewStore('preset-save',target);pending=null;presetField('status').textContent='Preset saved';if(dialog.open)dialog.close();previewPresetBusy=false;renderPreviewPresets(target.id);}
  catch{presetField('message').textContent='Could not save changes. Try again.';}
  finally{previewPresetBusy=false;presetAction('confirm').disabled=false;renderPreviewPresets();}
 },true);
 dialog.addEventListener('close',()=>{pending=null;});renderPreviewPresets();
})();
// End Save current Preview preset integration
