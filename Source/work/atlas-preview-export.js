// Preview composition PNG export integration
(()=>{
 const root=document.getElementById('munsell-picker'),actions=root.querySelector('.preview-layer-heading>div'),button=document.createElement('button');button.type='button';button.className='btn';button.textContent='Export Preview';button.dataset.previewAction='export';button.title='Download the full Preview composition as PNG';actions.append(button);
 button.addEventListener('click',async()=>{
  if(button.disabled)return;
  if(!previewImages.length){previewStatus('Add an image before exporting Preview.');return;}
  if(previewImages.some(p=>!p.gray||!p.alpha)){previewStatus('Wait for Preview images to finish loading.');return;}
  button.disabled=true;let url=null;
  try{
   syncPreviewLayer();const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas unavailable');const pixels=ctx.createImageData(512,512);previewComposite(pixels.data,previewImages);ctx.putImageData(pixels,0,0);drawHotBloom(ctx);applyColorVisionPreview(ctx,state.colorVision);
   const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('PNG encoding failed')),'image/png'));url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='color-atlas-preview.png';document.body.append(link);try{link.click();}finally{link.remove();}
  }catch{previewStatus('Could not export Preview. Try again.');}
  finally{if(url){const released=url;setTimeout(()=>URL.revokeObjectURL(released),1000);}button.disabled=false;}
 });
})();
// End Preview composition PNG export integration
