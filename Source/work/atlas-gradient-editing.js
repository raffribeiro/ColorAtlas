// Precise Gradient editing integration
function atlasGradientPoint(svg,e){
 const matrix=svg.getScreenCTM?.();if(matrix&&svg.createSVGPoint){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(matrix.inverse());}
 const box=svg.getBoundingClientRect(),v=svg.viewBox?.baseVal;if(!v?.width||!v?.height)return {x:e.clientX-box.left,y:e.clientY-box.top};const scale=Math.min(box.width/v.width,box.height/v.height);return{x:v.x+(e.clientX-box.left-(box.width-v.width*scale)/2)/scale,y:v.y+(e.clientY-box.top-(box.height-v.height*scale)/2)/scale};
}
function atlasNearestGradientKey(p,keys,g,selected){
 const distance=i=>Math.hypot(p.x-g.left-keys[i].t*g.width,p.y-84);if(selected>=0&&selected<keys.length&&distance(selected)<=8)return selected;let index=-1,best=13;keys.forEach((k,i)=>{const d=distance(i);if(d<best){index=i;best=d;}});return index;
}
// Gradient editing integration
let atlasConfirmDelete;
(()=>{
 const dialog=document.createElement('dialog');dialog.className='studio-png-dialog';dialog.setAttribute('aria-label','Confirm deletion');
 const header=document.createElement('header'),title=document.createElement('h2'),message=document.createElement('p'),footer=document.createElement('footer'),cancel=document.createElement('button'),confirm=document.createElement('button');title.textContent='Confirm deletion';header.append(title);cancel.type=confirm.type='button';cancel.className=confirm.className='btn';cancel.textContent='Cancel';confirm.textContent='Delete';footer.append(cancel,confirm);dialog.append(header,message,footer);root.append(dialog);let resolve=null,opener=null;
 const finish=value=>{const done=resolve;resolve=null;if(done)done(value);if(dialog.open)dialog.close();if(opener?.isConnected)opener.focus();};
 cancel.addEventListener('click',()=>finish(false));confirm.addEventListener('click',()=>finish(true));dialog.addEventListener('cancel',()=>finish(false));dialog.addEventListener('close',()=>finish(false));
 atlasConfirmDelete=(heading,detail)=>{if(resolve)return Promise.resolve(false);title.textContent=heading;message.textContent=detail;opener=document.activeElement;return new Promise(done=>{resolve=done;dialog.showModal();confirm.focus();});};
 let grabOffset=0;
 const local=e=>atlasGradientPoint(gradientSvg,e),position=x=>Math.max(0,Math.min(1,(x-gradientGeometry.left)/gradientGeometry.width));
 gradientSvg.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();e.stopImmediatePropagation();const p=local(e),g=e.target.closest?.('[data-gradient-kind]');let index=atlasNearestGradientKey(p,state.gradientColors,gradientGeometry,state.gradientSelection.kind==='color'?state.gradientSelection.index:-1);
  if(index<0&&g&&e.target.tagName?.toLowerCase()==='text'&&g.dataset.gradientKind==='color')index=Number(g.dataset.gradientIndex);
  if(index<0){if(state.gradientColors.length>=16){field('gradient-status').textContent='Maximum 16 color points.';return;}const t=position(p.x),sample=gradientSample(t);state.gradientColors.push({t,hex:rgbHex(sample.rgb.map(encodeSRGB))});state.gradientSelection={kind:'color',index:state.gradientColors.length-1};loadGradientColor();gradientChange();return;}
  state.gradientSelection={kind:'color',index};loadGradientColor();grabOffset=p.x-gradientGeometry.left-state.gradientColors[index].t*gradientGeometry.width;gradientDrag=e.pointerId;gradientSvg.setPointerCapture(e.pointerId);drawGradient();
 },true);
 gradientSvg.addEventListener('pointermove',e=>{if(e.pointerId!==gradientDrag)return;e.preventDefault();e.stopImmediatePropagation();gradientSelected().t=position(local(e).x-grabOffset);gradientChange();},true);
 for(const type of ['pointerup','pointercancel'])gradientSvg.addEventListener(type,e=>{if(e.pointerId!==gradientDrag)return;e.stopImmediatePropagation();gradientDrag=null;if(gradientSvg.hasPointerCapture(e.pointerId))gradientSvg.releasePointerCapture(e.pointerId);},true);
 const removePoint=async()=>{const q={...state.gradientSelection},keys=q.kind==='color'?state.gradientColors:state.gradientAlphas,key=keys[q.index];if(!key||keys.length<=2){field('gradient-status').textContent='Keep at least two points.';return;}if(!await atlasConfirmDelete('Delete selected point?','The selected gradient point will be removed. You can undo this change.'))return;const current=q.kind==='color'?state.gradientColors:state.gradientAlphas,index=keys.indexOf(key);if(current!==keys||index<0||keys.length<=2)return;keys.splice(index,1);state.gradientSelection={kind:q.kind,index:Math.min(index,keys.length-1)};loadGradientColor();gradientChange();};
 const allowed=new WeakSet();root.addEventListener('click',e=>{const button=e.target.closest?.('[data-action="gradient-remove"],[data-preview-action="remove"],[data-action="palette-remove"]');if(!button||button.disabled)return;if(allowed.has(button)){allowed.delete(button);return;}e.preventDefault();e.stopImmediatePropagation();if(button.dataset.action==='gradient-remove'){removePoint();return;}
  const isLayer=button.dataset.previewAction==='remove',target=isLayer?previewImages.find(p=>p.id===previewSelected):state.savedPalette?.[state.paletteSelected];if(!target)return;atlasConfirmDelete(isLayer?'Delete selected layer?':'Delete selected color?',isLayer?'The layer and its image will be removed. You can undo this change.':'The selected saved color will be removed.').then(ok=>{if(!ok)return;if(isLayer&&previewImages.find(p=>p.id===previewSelected)!==target)return;if(!isLayer&&state.savedPalette?.[state.paletteSelected]!==target)return;allowed.add(button);button.click();});
 },true);
 document.addEventListener('keydown',e=>{if(e.key!=='Delete'||e.ctrlKey||e.metaKey||e.altKey)return;const t=e.target;if(t?.isContentEditable||t?.closest?.('textarea,select,[contenteditable="true"],input:not([type="range"]):not([type="checkbox"]):not([type="radio"]):not([type="button"])')||root.querySelector('dialog[open]')||root.querySelector('.studio-main')?.hidden)return;e.preventDefault();removePoint();});
})();
// End Precise Gradient editing integration
