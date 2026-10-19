// Named Preview snapshots; persisted separately from the active image stack.
const presetField=name=>$('#preview-preset-'+name),presetAction=name=>$('[data-preview-preset="'+name+'"]');
let previewPresets=[],previewPresetsReady=false,previewPresetBusy=false,previewPresetMode='new',previewPresetTarget='',previewPresetAnchor;
function renderPreviewPresets(selected=presetField('select').value){
 const select=presetField('select'),option=(value,text)=>{const n=document.createElement('option');n.value=value;n.textContent=text;return n;};
 const entries=previewPresets.length?previewPresets:[{id:'codex-use-esse',name:'Default'}];select.replaceChildren(...entries.map(p=>option(p.id,p.name)));
 select.value=entries.some(p=>p.id===selected)?selected:(entries.find(p=>p.id==='codex-use-esse')||entries[0]).id;select.disabled=previewPresetBusy||!previewPresetsReady;
 for(const action of ['new','delete'])presetAction(action).disabled=previewPresetBusy||!previewPresetsReady||(action!=='new'&&!previewPresets.some(p=>p.id===select.value));
}
async function refreshPreviewPresets(){
 try{const list=await previewStore('preset-list');if(!Array.isArray(list))throw Error();previewPresets=list.filter(p=>typeof p.id==='string'&&p.id.length<=64&&typeof p.name==='string'&&p.name.length<=64).sort((a,b)=>a.name.localeCompare(b.name));previewPresetsReady=true;renderPreviewPresets();}
 catch{previewPresetsReady=false;renderPreviewPresets();presetField('status').textContent='Preset storage unavailable';}
}
function openPreviewPreset(mode){
 if(previewPresetBusy||!previewPresetsReady)return;
 const p=previewPresets.find(p=>p.id===presetField('select').value);if(mode==='delete'&&!p)return;
 previewPresetMode=mode;previewPresetTarget=p?.id||'';previewPresetAnchor=presetAction(mode);
 presetField('title').textContent=mode==='new'?'New Preview preset':'Delete Preview preset?';
 presetField('help').textContent=mode==='new'?'Save images, layers, Gradient Maps and Preview zoom.':'Delete “'+p.name+'”? Your current Preview stays unchanged.';
 presetField('name-row').hidden=mode!=='new';presetField('name').required=mode==='new';presetField('name').value='';presetField('message').textContent='';
 presetAction('confirm').textContent=mode==='new'?'Save preset':'Delete preset';presetAction('confirm').disabled=false;
 presetField('dialog').showModal();(mode==='new'?presetField('name'):presetAction('cancel')).focus();
}
function initializePreviewPresets(){
 const dialog=presetField('dialog'),select=presetField('select');
 for(const action of ['new','delete'])presetAction(action).addEventListener('click',()=>openPreviewPreset(action));
 presetAction('cancel').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>previewPresetAnchor?.focus?.({preventScroll:true}));
 presetField('form').addEventListener('submit',async e=>{
  e.preventDefault();if(previewPresetBusy)return;
  const name=presetField('name').value.trim();if(previewPresetMode==='new'&&(!name||name.length>64)){presetField('message').textContent='Enter a name (1–64 characters).';return;}
  const deleting=previewPresetMode==='delete',id=deleting?previewPresetTarget:'preset-'+Date.now().toString(36)+'-'+(++previewSequence);
  syncPreviewLayer();const doc=structuredClone(previewDocument(previewImages,previewSelected));doc.previewZoom=window.AtlasPreviewCamera?.getZoom()??1;doc.randomOn=[...previewRandomSelection];
  previewPresetBusy=true;renderPreviewPresets();presetAction('confirm').disabled=true;
  try{
   await previewStore(deleting?'preset-delete':'preset-save',deleting?{id}:{id,name,doc});
   previewPresets=deleting?previewPresets.filter(p=>p.id!==id):[...previewPresets,{id,name}];
   presetField('status').textContent=deleting?'Preset deleted':'Preset saved locally';
   previewPresetBusy=false;renderPreviewPresets(deleting?'':id);if(dialog.open)dialog.close();
  }catch{presetField('message').textContent='Could not save changes. Try again.';}
  finally{previewPresetBusy=false;renderPreviewPresets();presetAction('confirm').disabled=false;}
 });
 select.addEventListener('change',async()=>{
  const id=select.value;if(previewPresetBusy)return;if(!previewPresets.some(p=>p.id===id)){renderPreviewPresets();return;}
  syncPreviewLayer();const revision=previewRevision;previewPresetBusy=true;renderPreviewPresets();presetField('status').textContent='Loading preset…';
  try{const doc=await previewStore('preset-read',{id});const loaded=await restorePreviewStack(doc,true,revision);if(!loaded){presetField('status').textContent='Preview changed; select a preset again.';return;}root.querySelector('[data-preview-camera="reset"]')?.click();previewTouched=true;savePreviewStack();remember();presetField('status').textContent='';}
  catch{presetField('status').textContent='Could not load preset. Current Preview retained.';}
  finally{previewPresetBusy=false;renderPreviewPresets();}
 });
 renderPreviewPresets();const ready=refreshPreviewPresets();window.AtlasStartup?.waitFor(ready);
}
