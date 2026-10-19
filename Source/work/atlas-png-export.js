// PNG export options
const pngExportDialog=$('#png-export-dialog'),pngExportForm=$('#png-export-form'),pngExportButton=$('[data-action="gradient-png"]');
let gradientExportOpener=pngExportButton,gradientExportRun=0;
function pngExportOptions(){
 const format=$('#png-export-format-unity').checked?'unity':$('#png-export-format-unreal').checked?'unreal':'png';
 const interpolation=$('#png-export-linear').checked?'linear-rgb':'oklab';
 const width=Number($('#png-export-width').value),height=Number($('#png-export-height').value);
 if(format==='png'&&(!Number.isInteger(width)||width<1||width>4096))throw new Error('Width must be a whole number from 1 to 4096.');
 if(format==='png'&&(!Number.isInteger(height)||height<1||height>1024))throw new Error('Height must be a whole number from 1 to 1024.');
 const name=$('#png-export-name').value.trim().replace(/\.png$/i,'').replace(/[<>:"/\\|?*\x00-\x1f]/g,'-').replace(/[. ]+$/g,'').slice(0,80)||'gradient-map';
 return {format,interpolation,width,height,name:name+'.png',alpha:$('#png-export-alpha').checked,layers:$('#png-export-layer-current').checked?[state.gradientLayer]:['emission','smoke']};
}
function pngExportLayers(options){
 return options.layers.map(id=>id===state.gradientLayer?{colors:state.gradientColors,alphas:state.gradientAlphas,transition:state.artistTransition}:state.gradientLayers[id]);
}
function sampleExportGradient(t,layer,interpolation='oklab'){
 const transition=layer.transition||'smooth',sample=gradientSample(t,layer.colors,layer.alphas,transition);
 if(interpolation!=='linear-rgb'||transition==='bands')return sample;
 const keys=[...layer.colors].sort((a,b)=>a.t-b.t);
 const decodeKey=k=>k.hex.match(/[a-f0-9]{2}/gi).map(v=>decodeSRGB(parseInt(v,16)/255));
 let right=keys.findIndex(k=>k.t>=t);
 if(right<=0)return {...sample,rgb:decodeKey(keys[right<0?keys.length-1:0])};
 const a=keys[right-1],b=keys[right],u=(t-a.t)/(b.t-a.t||1),rgb0=decodeKey(a),rgb1=decodeKey(b);
 return {...sample,rgb:rgb0.map((v,i)=>v+(rgb1[i]-v)*u)};
}
function gradientExportData(options){
 const layers=pngExportLayers(options).map((layer,i)=>({id:options.layers[i],name:importanceLayerName(options.layers[i]),interpolation:layer.transition==='bands'?'constant':options.interpolation==='linear-rgb'?'linear':'oklab',colors:[...layer.colors].sort((a,b)=>a.t-b.t).map(k=>({time:k.t,rgb:k.hex.match(/[a-f0-9]{2}/gi).map(v=>decodeSRGB(parseInt(v,16)/255))})),alphas:[...layer.alphas].sort((a,b)=>a.t-b.t).map(k=>({time:k.t,alpha:options.alpha?k.a:1}))}));
 if(options.format==='unity'&&layers.every(l=>l.colors.length<=8&&l.alphas.length<=8)){
  const text=layers.map((l,i)=>{
   const name=layers.length===1?'gradient':l.id==='emission'?'importance01':'importance02';
   const mode=l.interpolation==='constant'?'Fixed':l.interpolation==='oklab'?'PerceptualBlend':'Blend';
   return (mode==='PerceptualBlend'?'// Unity 6+: perceptual OKLab interpolation. Keys are linear-sRGB.\n':'// Linear-sRGB keys; '+(mode==='Fixed'?'discrete bands.':'linear RGB interpolation.')+'\n')+'var '+name+' = new Gradient();\n'+name+'.mode = GradientMode.'+mode+';\n'+(mode==='PerceptualBlend'?name+'.colorSpace = ColorSpace.Linear;\n':'')+name+'.SetKeys(\n  new GradientColorKey[] { '+l.colors.map(k=>'new GradientColorKey(new Color('+k.rgb.map(v=>v.toFixed(6)+'f').join(', ')+', 1f), '+k.time.toFixed(6)+'f)').join(', ')+' },\n  new GradientAlphaKey[] { '+l.alphas.map(k=>'new GradientAlphaKey('+k.alpha.toFixed(6)+'f, '+k.time.toFixed(6)+'f)').join(', ')+' }\n);';
  }).join('\n\n');
  return {text,kind:'unity'};
 }
 const hint=(options.format==='unity'?'More than 8 keys in a layer: JSON preserves every key. Use PNG or a custom evaluator in Unity. ':'Unreal JSON is descriptive data, not an automatic asset import. ')+(layers.some(l=>l.interpolation==='oklab')?'Smooth layers require a custom OKLab evaluator or the perceptual PNG; a native linear RGB curve will differ.':'Use linear RGB interpolation for Smooth and constant interpolation for Bands.');
 const payload={version:1,exportHint:hint,colorSpace:'linear-sRGB',...(layers.length===1?{interpolation:layers[0].interpolation,colors:layers[0].colors,alphas:layers[0].alphas}:{layers})};
 return {text:JSON.stringify(payload,null,2),kind:'json'};
}
function paintGradientPNG(canvas,options,layers=pngExportLayers(options)){
 canvas.width=options.width;canvas.height=options.height*layers.length;
 const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(canvas.width,canvas.height);
 for(let row=0;row<layers.length;row++){
  const layer=layers[row];
  for(let x=0;x<canvas.width;x++){
   const sample=sampleExportGradient(canvas.width===1?0:x/(canvas.width-1),layer,options.interpolation);
   const rgba=[...sample.rgb.map(v=>Math.round(encodeSRGB(v)*255)),options.alpha?Math.round(sample.alpha*255):255];
   for(let y=0;y<options.height;y++)pixels.data.set(rgba,((row*options.height+y)*canvas.width+x)*4);
  }
 }
 ctx.putImageData(pixels,0,0);return canvas;
}
function updatePNGExportPreview(){
 try{
  const options=pngExportOptions(),layers=pngExportLayers(options),isPNG=options.format==='png';
  paintGradientPNG($('#png-export-preview'),{...options,width:256,height:24},layers);
  $('#png-export-title').textContent=isPNG?'Export PNG':'Export gradient data';
  $('#png-export-dimensions').hidden=!isPNG;$('#png-export-name-row').hidden=!isPNG;
  $('#png-export-summary').textContent=isPNG?options.width+' × '+options.height*options.layers.length+' px · '+(options.alpha?'RGBA':'RGB · opaque'):'Linear-sRGB color keys · '+(options.alpha?'authored alpha':'opaque alpha');
  const data=isPNG?null:gradientExportData(options);
  $('[data-action="png-export-download"]').textContent=isPNG?'Download PNG':data.kind==='unity'?'Copy Unity C#':'Copy JSON';
  const bands=layers.every(l=>l.transition==='bands');
  $('#png-export-interpolation-note').textContent=bands?'Bands preserves discrete steps in every format; the Smooth interpolation choice is unused.':options.interpolation==='oklab'?'Perceptual follows the editor’s Smooth ramp. Unity C# uses PerceptualBlend and ColorSpace.Linear (Unity 6+). Unreal requires a custom OKLab evaluator or a PNG.':'Linear RGB changes Smooth intermediate colors for compatibility. Unity C# uses Blend; it can differ from the editor’s OKLab ramp.';
  $('#png-export-layer-note').textContent=(options.layers.length===2?'Importance 01 first · Importance 02 second. '+(isPNG?'Height applies to each layer.':'Separate gradients are exported.'):'Gradient of '+importanceLayerName(state.gradientLayer)+'.')+(data?.kind==='json'&&options.format==='unity'?' More than 8 keys: all keys will be copied as JSON.':'');
  $('#png-export-error').textContent='';
 }catch(error){$('#png-export-error').textContent=error.message;}
}
function openGradientExport(format,opener){
 gradientExportRun++;gradientExportOpener=opener;$('[data-action="png-export-download"]').disabled=false;
 for(const id of ['png','unity','unreal'])$('#png-export-format-'+id).checked=id===format;
 $('#png-export-layer-label').textContent=importanceLayerName(state.gradientLayer);
 updatePNGExportPreview();if(!pngExportDialog.open)pngExportDialog.showModal();
}
pngExportButton.addEventListener('click',()=>openGradientExport('png',pngExportButton));
pngExportForm.addEventListener('input',updatePNGExportPreview);
pngExportForm.addEventListener('change',updatePNGExportPreview);
for(const selector of ['[data-action="png-export-cancel"]','[data-action="png-export-close"]'])$(selector).addEventListener('click',()=>pngExportDialog.close());
pngExportDialog.addEventListener('close',()=>{gradientExportRun++;$('[data-action="png-export-download"]').disabled=false;gradientExportOpener.focus();});
pngExportDialog.addEventListener('click',event=>{
 if(event.target!==pngExportDialog)return;
 const r=pngExportDialog.getBoundingClientRect();
 if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)pngExportDialog.close();
});
pngExportForm.addEventListener('submit',event=>{
 event.preventDefault();const submit=$('[data-action="png-export-download"]');if(submit.disabled)return;
 let options;
 try{
  options=pngExportOptions();
  if(options.format!=='png'){
   const data=gradientExportData(options);pngExportDialog.close();copyCode(data.text,{target:gradientExportOpener});return;
  }
  const canvas=paintGradientPNG(document.createElement('canvas'),options),run=++gradientExportRun;submit.disabled=true;
  canvas.toBlob(blob=>{
   if(run!==gradientExportRun)return;submit.disabled=false;if(!pngExportDialog.open)return;
   if(!blob){$('#png-export-error').textContent='PNG could not be generated. Please try again.';return;}
   const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=options.name;
   try{link.click();field('gradient-status').textContent='Exported '+options.width+' × '+options.height*options.layers.length+' PNG.';pngExportDialog.close();}
   finally{setTimeout(()=>URL.revokeObjectURL(url),1000);}
  },'image/png');
 }catch(error){submit.disabled=false;$('#png-export-error').textContent=error.message;}
});
// End PNG export options
