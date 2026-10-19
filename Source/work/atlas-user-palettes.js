// My palettes: independent user-authored snapshots
function cleanUserPalettes(entries){
 if(!Array.isArray(entries))return [];
 const result=[],ids=new Set();
 for(const p of entries){
  if(!p||typeof p.id!=='string'||!/^user-[a-z0-9-]{1,80}$/.test(p.id)||ids.has(p.id)||typeof p.name!=='string'||!p.name.trim()||p.name.length>64||typeof p.description!=='string'||p.description.length>240||!p.layers||!['emission','smoke'].includes(p.activeLayer))continue;
  const keys=Object.keys(p.layers);if(!keys.length||keys.some(k=>!['emission','smoke'].includes(k))||!p.layers[p.activeLayer]||keys.some(k=>!validGradientLayer(p.layers[k])||!['smooth','bands'].includes(p.layers[k].transition)))continue;
  const layers=Object.fromEntries(keys.map(k=>[k,{colors:p.layers[k].colors.map(v=>({t:v.t,hex:v.hex.toUpperCase()})),alphas:p.layers[k].alphas.map(v=>({t:v.t,a:v.a})),transition:p.layers[k].transition}]));
  const entry={id:p.id,name:p.name.trim(),description:p.description,activeLayer:p.activeLayer,layers};
  if(new TextEncoder().encode(JSON.stringify([...result,entry])).length>8192)break;
  ids.add(p.id);result.push(entry);
 }
 return result;
}
function hasLibraryPreset(id){return libraryPresetIds.has(id)||state.userPalettes.some(p=>p.id===id);}
function userPaletteCard(p){return {...p,category:'My palettes',colors:p.layers[p.activeLayer].colors.map(k=>k.hex)};}
async function persistUserPalettes(){try{await remember(true);return window.openai?.statePersistence!=='none';}catch{return false;}}
async function saveUserPalette(name,description='',scope='both'){
 name=String(name).trim();description=String(description).trim();
 if(!name||name.length>64)throw new Error('Enter a palette name (1–64 characters).');
 if(description.length>240)throw new Error('Description must be at most 240 characters.');
 if(!['active','both'].includes(scope))throw new Error('Choose the active layer or both layers.');
 storeGradientLayer();
 const layers=Object.fromEntries((scope==='both'?['emission','smoke']:[state.gradientLayer]).map(k=>{const l=state.gradientLayers[k];return [k,{colors:l.colors.map(v=>({...v})),alphas:l.alphas.map(v=>({...v})),transition:l.transition==='bands'?'bands':'smooth'}];}));
 const palette={id:'user-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10),name,description,activeLayer:state.gradientLayer,layers};
 if(!Object.values(layers).every(validGradientLayer))throw new Error('The current gradient has invalid keys.');
 if(new TextEncoder().encode(JSON.stringify([...state.userPalettes,palette])).length>8192)throw new Error('My palettes is full. Delete an unused palette after exporting its key data.');
 state.userPalettes.push(palette);state.libraryFolders['category:My palettes']=true;
 renderStudioLibrary();const persisted=await persistUserPalettes();return {palette,persisted};
}
function applyUserPalette(id){
 const p=state.userPalettes.find(p=>p.id===id);if(!p)return false;
 storeGradientLayer();
 if(Object.keys(p.layers).length===1)state.gradientLayers[state.gradientLayer]={...structuredClone(p.layers[p.activeLayer]),preset:p.id};
 else for(const [k,layer] of Object.entries(p.layers))state.gradientLayers[k]={...structuredClone(layer),preset:p.id};
 const layer=state.gradientLayers[state.gradientLayer];state.gradientColors=layer.colors;state.gradientAlphas=layer.alphas;state.artistTransition=layer.transition;state.gradientPreset=p.id;
 state.gradientSelection={kind:'color',index:middleGradientIndex()};loadGradientColor();gradientChange(false);
 field('gradient-status').textContent=p.name;return true;
}
async function deleteUserPalette(id){
 if(!state.userPalettes.some(p=>p.id===id))return false;
 state.userPalettes=state.userPalettes.filter(p=>p.id!==id);state.favoritePresets=state.favoritePresets.filter(v=>v!==id);
 if(state.gradientPreset===id)state.gradientPreset='custom';
 for(const layer of Object.values(state.gradientLayers||{}))if(layer.preset===id)layer.preset='custom';
 renderStudioLibrary();return {persisted:await persistUserPalettes()};
}
const paletteSaveDialog=$('#palette-save-dialog'),paletteDeleteDialog=$('#palette-delete-dialog');
let paletteDeleteId=null,paletteDialogAnchor=null,paletteSaveRun=0,paletteDeleteRun=0;
function openSaveUserPalette(){
 paletteDialogAnchor=document.activeElement;$('[data-palette-save-submit]').disabled=false;
 $('#palette-save-name').value='';$('#palette-save-description').value='';$('#palette-save-status').textContent='';
 paletteSaveDialog.showModal();$('#palette-save-name').focus();
}
function openDeleteUserPalette(id,anchor=document.activeElement){
 const p=state.userPalettes.find(p=>p.id===id);if(!p)return;
 paletteDialogAnchor=anchor;paletteDeleteId=id;$('#palette-delete-name').textContent=p.name;
 $('#palette-delete-status').textContent='';$('[data-palette-delete-confirm]').disabled=false;paletteDeleteDialog.showModal();$('[data-palette-delete-cancel]').focus();
}
$('[data-action="gradient-save"]').addEventListener('click',openSaveUserPalette);
$('#palette-save-form').addEventListener('submit',async e=>{
 e.preventDefault();const button=$('[data-palette-save-submit]');if(button.disabled)return;const run=++paletteSaveRun;button.disabled=true;$('#palette-save-status').textContent='Saving…';
 try{
  const result=await saveUserPalette($('#palette-save-name').value,$('#palette-save-description').value,'active');
  if(run!==paletteSaveRun)return;
  field('user-palette-status').textContent=result.persisted?'':'Palette kept for this session only. Storage is unavailable; export its key data before closing.';
  if(result.persisted)paletteSaveDialog.close();else $('#palette-save-status').textContent=field('user-palette-status').textContent;
 }catch(error){if(run===paletteSaveRun){$('#palette-save-status').textContent=error.message;button.disabled=false;}}
});
$('[data-palette-delete-confirm]').addEventListener('click',async()=>{
 const button=$('[data-palette-delete-confirm]');if(button.disabled)return;const run=++paletteDeleteRun,id=paletteDeleteId;button.disabled=true;
 const result=await deleteUserPalette(id);if(run!==paletteDeleteRun)return;
 field('user-palette-status').textContent=result&&result.persisted?'Palette deleted.':'Deleted for this session only. Storage is unavailable; the palette may return after reopening.';
 if(result&&result.persisted)paletteDeleteDialog.close();else $('#palette-delete-status').textContent=field('user-palette-status').textContent;
});
for(const [dialog,closeSelectors] of [[paletteSaveDialog,['[data-palette-save-close]','[data-palette-save-cancel]']],[paletteDeleteDialog,['[data-palette-delete-close]','[data-palette-delete-cancel]']]]){
 for(const selector of closeSelectors)$(selector).addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{paletteSaveRun++;paletteDeleteRun++;(paletteDialogAnchor?.isConnected!==false?paletteDialogAnchor:$('[data-action="gradient-save"]'))?.focus?.({preventScroll:true});});
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
}
// End My palettes
