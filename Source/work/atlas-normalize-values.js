// Image value normalization integration
function atlasNormalizeSelectedValues(enabled){
 const layer=previewImages.find(p=>p.id===previewSelected);if(!layer?.gray||!layer?.alpha)return false;
 if(!!layer.normalizeValues===enabled)return false;
 syncPreviewLayer();layer.normalizeValues=enabled;
 explosionPixels=previewLayerGray(layer);explosionAlpha=layer.alpha;
 previewChanged();remember();return true;
}
(()=>{
 const heading=root.querySelector('.preview-layer-heading>div');if(!heading)return;
 const label=document.createElement('label'),input=document.createElement('input');
 label.style.cssText='display:flex;align-items:center;gap:6px;font-size:11px;cursor:pointer';
 input.type='checkbox';input.dataset.previewAction='normalize-values';
 input.setAttribute('aria-label','Normalize values');
 label.title='Expand this layer’s visible values to black and white; turn off to restore originals';
 label.append(input,'Normalize values');heading.append(label);
 input.addEventListener('change',()=>atlasNormalizeSelectedValues(input.checked));
 const render=renderPreviewLayerList;renderPreviewLayerList=function(...args){
  render(...args);const p=previewImages.find(p=>p.id===previewSelected);
  input.disabled=!p?.gray||!p?.alpha;input.checked=!!p?.normalizeValues;
 };renderPreviewLayerList();
})();
// End Image value normalization integration
