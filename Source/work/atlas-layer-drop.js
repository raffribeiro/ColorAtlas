// Layer image drop integration
const atlasLayerDropRuns=new Map();
async function atlasReplaceDroppedImage(file,id){
 if(!file||!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>20*1024*1024){previewStatus('Choose a PNG, JPEG or WebP up to 20 MB.');return;}
 const target=previewImages.find(p=>p.id===id);if(!target)return;
 const run=(atlasLayerDropRuns.get(id)||0)+1;atlasLayerDropRuns.set(id,run);previewStatus('Reading image…');
 let url;
 try{
  await previewCheckImageFile(file);
  if(previewImages.find(p=>p.id===id)!==target||atlasLayerDropRuns.get(id)!==run)return;
  url=URL.createObjectURL(file);
  const fields=await readPreviewImage(url),layer=previewImages.find(p=>p.id===id);if(layer!==target||atlasLayerDropRuns.get(id)!==run)return;syncPreviewLayer();Object.assign(layer,fields);if(id===previewSelected){explosionPixels=previewLayerGray(layer);explosionAlpha=layer.alpha;}previewChanged();remember();previewStatus('Image replaced');
 }catch(error){if(atlasLayerDropRuns.get(id)===run)previewStatus(error.message==='dimensions'?'Choose an image up to 8192 px per side and 32 megapixels.':'Image could not be read. Current image retained.');}finally{if(url)URL.revokeObjectURL(url);}
}
(()=>{
 const list=$('#preview-layer-list'),render=renderPreviewLayerList;let highlighted=null,dragging=false;
 const style=document.createElement('style');style.textContent='.preview-layer-row[data-drop-hint="true"]{position:relative;outline:1px dashed #526477;outline-offset:-1px}.preview-layer-row[data-drop-hint="true"]::after{content:"Drag here";position:absolute;right:4px;top:4px;bottom:4px;width:82px;display:flex;align-items:center;justify-content:center;background:rgba(15,23,32,.92);color:#dbe6f3;font:500 12px system-ui;pointer-events:none;border-radius:4px}.preview-layer-row[data-drop-hover="true"]::after{background:rgba(33,49,66,.96);color:#fff}.preview-layer-row[data-drop-hover="true"]{outline:1px solid #829bb9}';root.append(style);
 const clearHover=()=>{if(highlighted)highlighted.dataset.dropHover='false';highlighted=null;};
 const hint=value=>{dragging=value;for(const row of list.children||[])if(row.dataset.dropId)row.dataset.dropHint=String(value);if(!value)clearHover();};
 renderPreviewLayerList=function(...args){clearHover();render(...args);const images=[...previewImages].reverse();for(let i=0;i<images.length;i++){const row=list.children?.[i];if(row){row.dataset.dropId=images[i].id;row.dataset.dropHint=String(dragging);row.title=(row.title?row.title+' · ':'')+'Drop an image to replace';}}};renderPreviewLayerList();
 const files=e=>Array.from(e.dataTransfer?.types||[]).includes('Files');
 root.addEventListener('dragenter',e=>{if(files(e)){e.preventDefault();hint(true);}});
 root.addEventListener('dragover',e=>{if(!files(e))return;e.preventDefault();hint(true);clearHover();const row=e.target.closest?.('.preview-layer-row');if(row?.dataset.dropId){highlighted=row;row.dataset.dropHover='true';e.dataTransfer.dropEffect='copy';}else e.dataTransfer.dropEffect='none';});
 root.addEventListener('dragleave',e=>{if(e.relatedTarget&&root.contains?.(e.relatedTarget))return;const r=root.getBoundingClientRect?.();if(r&&e.clientX>=r.left&&e.clientX<r.right&&e.clientY>=r.top&&e.clientY<r.bottom)return;hint(false);});
 root.addEventListener('drop',e=>{if(!files(e))return;e.preventDefault();const row=e.target.closest?.('.preview-layer-row'),id=row?.dataset.dropId;hint(false);if(!id){previewStatus('Drop an image onto a layer row.');return;}if(e.dataTransfer.files.length!==1){previewStatus('Drop one image at a time.');return;}atlasReplaceDroppedImage(e.dataTransfer.files[0],id);});
 document.addEventListener('dragend',()=>hint(false));document.addEventListener('drop',()=>hint(false),true);document.addEventListener('keydown',e=>{if(e.key==='Escape')hint(false);});window.addEventListener('blur',()=>hint(false));
})();
// End Layer image drop integration
