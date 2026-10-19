// Preview image stack: metadata and assets are separate from widget/palette state.
let previewImages=[],previewSelected=null,previewRevision=0,previewTouched=false,previewLoaded=false,previewSaveTimer=0,previewFileAction='add',previewDefaultFields=null,previewDefaultThumb='',previewSequence=0;
const previewRequests=new Map();
let previewSelection=new Set(),previewRandomSelection=new Set(),previewRenameTarget=null;
const previewStatus=text=>{const n=$('#preview-layer-status');n.textContent=text;n.hidden=['','Restored locally','Saved locally'].includes(text);};
function previewStore(action,payload){
 return new Promise((resolve,reject)=>{
  const id=Date.now().toString(36)+'-'+(++previewSequence),timer=setTimeout(()=>{previewRequests.delete(id);reject(new Error('Storage unavailable'));},5000);
  previewRequests.set(id,{resolve,reject,timer});parent.postMessage({channel:'color-atlas-preview-store',id,action,payload},'*');
 });
}
window.addEventListener('message',e=>{
 if(e.source!==parent||e.data?.channel!=='color-atlas-preview-store')return;
 const request=previewRequests.get(e.data.id);if(!request)return;clearTimeout(request.timer);previewRequests.delete(e.data.id);
 e.data.ok?request.resolve(e.data.payload):request.reject(new Error('Storage unavailable'));
});
function savePreviewStack(){
 if(!previewLoaded||lab3dDrag||colorWheelDrag||gradientDrag)return;clearTimeout(previewSaveTimer);
 previewSaveTimer=setTimeout(()=>{const revision=previewRevision;previewStore('write',previewDocument(previewImages,previewSelected)).then(()=>{if(revision===previewRevision)previewStatus('Saved locally');}).catch(()=>previewStatus('Session only · local storage unavailable'));},350);
}
function syncPreviewLayer(){
 const p=previewImages.find(p=>p.id===previewSelected);if(!p)return;
 const map=previewMapSnapshot();if(JSON.stringify(p.map)===JSON.stringify(map))return;
 p.map=map;previewRevision++;savePreviewStack();
}
function previewChanged(){previewTouched=true;previewRevision++;explosionRenderSignature=null;renderPreviewLayerList();drawExplosionMap();savePreviewStack();}
function newPreviewLayer(name,asset,map=previewMapSnapshot()){
 return {id:Date.now().toString(36)+'-'+(++previewSequence),name:name.slice(0,80),asset,visible:true,opacity:1,blend:'normal',map};
}
function applyPreviewSelection(next){
 const m=structuredClone(next.map);state.gradientLayers=m.layers;state.gradientLayer=m.active;state.explosionView=m.view;state.explosionSplit=m.split;
 const layer=state.gradientLayers[m.active];state.gradientColors=layer.colors;state.gradientAlphas=layer.alphas;state.gradientPreset=layer.preset||'custom';state.artistTransition=layer.transition==='bands'?'bands':'smooth';
 state.gradientSelection={kind:'color',index:middleGradientIndex()};if(next.gray){explosionPixels=previewLayerGray(next);explosionAlpha=next.alpha;}loadGradientColor();
}
function selectPreviewLayer(id,add=false){
 if(!previewImages.some(p=>p.id===id))return;
 syncPreviewLayer();
 if(!add)previewSelection=new Set([id]);
 else if(previewSelection.has(id)&&previewSelection.size>1){previewSelection.delete(id);id=id===previewSelected?[...previewSelection][0]:previewSelected;}
 else previewSelection.add(id);
 previewSelected=id;applyPreviewSelection(previewImages.find(p=>p.id===id));drawVfx();drawLabPlane();previewChanged();remember();
}
function randomPreviewLayers(random=Math.random){
 const targets=previewImages.filter(p=>previewRandomSelection.has(p.id));
 if(!targets.length){previewStatus('Enable a layer die for Random.');return;}
 if(targets.length===1&&targets[0].id===previewSelected)return randomAllLayers(random);
 syncPreviewLayer();const active=previewSelected;
 try{for(const p of targets){previewSelected=p.id;applyPreviewSelection(p);randomAllLayers(random,false);syncPreviewLayer();}}
 finally{previewSelected=active;applyPreviewSelection(previewImages.find(p=>p.id===active));}
 drawVfx();drawLabPlane();previewChanged();remember();
}
function renderPreviewLayerList(){
 const list=$('#preview-layer-list');list.replaceChildren();
 for(const p of [...previewImages].reverse()){
  const row=document.createElement('div');row.className='preview-layer-row';row.dataset.selected=String(previewSelection.has(p.id));row.dataset.active=String(p.id===previewSelected);
  const visible=document.createElement('input');visible.type='checkbox';visible.checked=p.visible;visible.setAttribute('aria-label','Show '+p.name);visible.addEventListener('change',()=>{p.visible=visible.checked;previewChanged();});
  const button=document.createElement('button');button.type='button';button.setAttribute('aria-pressed',String(previewSelection.has(p.id)));button.title='Click to edit · Shift-click to select';button.addEventListener('click',e=>selectPreviewLayer(p.id,!!e?.shiftKey));
  const thumb=document.createElement('img');thumb.alt='';if(p.asset||previewDefaultThumb)thumb.src=p.asset||previewDefaultThumb;else thumb.hidden=true;
  const name=document.createElement('span');name.textContent=p.name;button.append(thumb,name);const dice=document.createElement('button');dice.type='button';dice.className='preview-layer-random';
  const syncDice=()=>{const enabled=previewRandomSelection.has(p.id);dice.innerHTML='<svg width=12 height=12 viewBox="0 0 12 12" aria-hidden=true><path d="M1 1h10v10H1zM3 3h1m4 0h1M6 6h1M3 9h1m4 0h1" fill=none stroke=currentColor /></svg>'+(enabled?'ON':'OFF');dice.setAttribute('aria-pressed',String(enabled));dice.setAttribute('aria-label','Random: '+p.name);dice.title=(enabled?'Exclude from':'Include in')+' Random';};syncDice();
  dice.addEventListener('click',()=>{previewRandomSelection.has(p.id)?previewRandomSelection.delete(p.id):previewRandomSelection.add(p.id);previewTouched=true;previewRevision++;syncDice();});
  row.append(visible,button,dice);list.append(row);
 }
 if(!previewImages.length){const empty=document.createElement('p');empty.textContent='Add an image to begin.';list.append(empty);}
 const selected=previewImages.find(p=>p.id===previewSelected),index=previewImages.indexOf(selected);
 $('#preview-blend').disabled=$('#preview-opacity').disabled=!selected;
 $('#preview-blend').value=selected?.blend||'normal';$('#preview-opacity').value=Math.round((selected?.opacity??1)*100);$('#preview-opacity-value').textContent=$('#preview-opacity').value+'%';
 for(const action of ['replace','rename','remove','up','down'])$('[data-preview-action="'+action+'"]').disabled=!selected||(action==='up'&&index===previewImages.length-1)||(action==='down'&&index===0);
 $('[data-preview-action="add"]').disabled=previewImages.length>=8;
}
function readPreviewImage(url){
 return new Promise((resolve,reject)=>{const image=new Image();image.onerror=()=>reject(new Error('Image could not be read'));image.onload=()=>{
  try{const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d'),scale=Math.min(512/image.width,512/image.height);ctx.drawImage(image,(512-image.width*scale)/2,(512-image.height*scale)/2,image.width*scale,image.height*scale);const pixels=ctx.getImageData(0,0,512,512),fields=previewImageFields(pixels.data);ctx.putImageData(pixels,0,0);resolve({...fields,asset:canvas.toDataURL('image/png')});}catch(error){reject(error);}
 };image.src=url;});
}
function previewReferenceReady(url){
 previewDefaultFields={gray:explosionPixels,alpha:explosionAlpha};previewDefaultThumb=url;
 for(const p of previewImages)if(p.asset===null)Object.assign(p,previewDefaultFields);
 const selected=previewImages.find(p=>p.id===previewSelected);if(selected?.gray){explosionPixels=previewLayerGray(selected);explosionAlpha=selected.alpha;}
 renderPreviewLayerList();explosionRenderSignature=null;
}
async function restorePreviewStack(doc,explicit=false,revision=previewRevision){
 const clean=cleanPreviewDocument(doc);if(!clean)throw new Error('Invalid layer stack');
 const layers=await Promise.all(clean.layers.map(async p=>({...p,...(p.asset===null?previewDefaultFields||{}:await readPreviewImage(p.asset))})));
 if(explicit?previewRevision!==revision:previewTouched)return false;
 previewImages=layers;previewSelected=clean.selected;previewSelection=new Set(layers.length?[clean.selected]:[]);previewRandomSelection=new Set(clean.randomOn??previewSelection);const selected=previewImages.find(p=>p.id===previewSelected);
 if(selected){applyPreviewSelection(selected);drawVfx();drawLabPlane();}
 previewRevision++;explosionRenderSignature=null;renderPreviewLayerList();drawExplosionMap();return true;
}
function initializePreviewLayers(){
 initializePreviewPresets();
 const closeRename=()=>{$('#preview-layer-rename').hidden=true;previewRenameTarget=null;$('[data-preview-action="rename"]').focus();};
 $('[data-preview-action="rename"]').addEventListener('click',()=>{const p=previewImages.find(p=>p.id===previewSelected);if(!p)return;previewRenameTarget=p.id;$('#preview-layer-name').value=p.name;$('#preview-layer-rename').hidden=false;$('#preview-layer-name').focus();$('#preview-layer-name').select();});
 $('[data-preview-action="rename-cancel"]').addEventListener('click',closeRename);
 $('#preview-layer-name').addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeRename();}});
 $('#preview-layer-rename').addEventListener('submit',e=>{e.preventDefault();const name=$('#preview-layer-name').value.trim(),p=previewImages.find(p=>p.id===previewRenameTarget);if(!p){closeRename();return;}if(!name||name.length>80){previewStatus('Use 1–80 characters for the layer name.');return;}p.name=name;closeRename();previewChanged();});
 const initial=newPreviewLayer('Reference',null);previewImages=[initial];previewSelected=initial.id;previewSelection=new Set([initial.id]);previewRandomSelection=new Set(previewSelection);
 renderPreviewLayerList();
 const inspecting=e=>e.target?.closest?.('#atlas-splash, .preview-camera-controls, .mp-explosion-previews');
 root.addEventListener('input',e=>{if(e.isTrusted&&!inspecting(e))previewTouched=true;},true);root.addEventListener('pointerdown',e=>{if(e.isTrusted&&!inspecting(e)){previewTouched=true;clearTimeout(previewSaveTimer);}},true);
 const loading=previewStore('read').then(async doc=>{if(doc&&!previewTouched)await restorePreviewStack(doc);if(doc&&previewTouched){previewStatus('Session only · reload to restore saved layers');return;}previewLoaded=true;if(previewTouched)savePreviewStack();else previewStatus(doc?'Restored locally':'');}).catch(()=>{previewLoaded=false;previewStatus('Session only · local storage unavailable');});
 window.AtlasStartup?.waitFor(loading);
 for(const action of ['add','replace'])$('[data-preview-action="'+action+'"]').addEventListener('click',()=>{previewFileAction=action;$('#preview-layer-file').click();});
 $('#preview-layer-file').addEventListener('change',async e=>{
  const file=e.target.files[0];e.target.value='';if(!file)return;const action=previewFileAction,target=previewSelected,map=previewMapSnapshot();
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>20*1024*1024){previewStatus('Choose a PNG, JPEG or WebP up to 20 MB.');return;}
  const url=URL.createObjectURL(file);previewStatus('Reading image…');
  try{const fields=await readPreviewImage(url);syncPreviewLayer();let layer;
   if(action==='replace'){layer=previewImages.find(p=>p.id===target);if(!layer)return;layer.name=file.name.slice(0,80);Object.assign(layer,fields);}
   else{if(previewImages.length>=8)return;layer=newPreviewLayer(file.name,fields.asset,map);Object.assign(layer,fields);previewImages.push(layer);}
   selectPreviewLayer(layer.id);previewStatus('Image ready');
  }catch{previewStatus('Image could not be read.');}finally{URL.revokeObjectURL(url);}
 });
 $('[data-preview-action="remove"]').addEventListener('click',()=>{
  const index=previewImages.findIndex(p=>p.id===previewSelected);if(index<0)return;previewRandomSelection.delete(previewSelected);previewImages.splice(index,1);previewSelected=null;previewSelection.clear();
  if(previewImages.length)selectPreviewLayer(previewImages[Math.min(index,previewImages.length-1)].id);else previewChanged();
 });
 for(const [action,delta] of [['up',1],['down',-1]])$('[data-preview-action="'+action+'"]').addEventListener('click',()=>{const i=previewImages.findIndex(p=>p.id===previewSelected),j=i+delta;if(i<0||j<0||j>=previewImages.length)return;[previewImages[i],previewImages[j]]=[previewImages[j],previewImages[i]];previewChanged();});
 $('#preview-blend').addEventListener('change',e=>{const p=previewImages.find(p=>p.id===previewSelected);if(!p||!['normal','multiply','screen','overlay','add'].includes(e.target.value))return;p.blend=e.target.value;previewChanged();});
 $('#preview-opacity').addEventListener('input',e=>{const p=previewImages.find(p=>p.id===previewSelected);if(!p)return;p.opacity=Math.max(0,Math.min(1,Number(e.target.value)/100));previewChanged();});
}
// End Preview image stack.
