// Scoped inside the editor by the standalone exporter; no browser storage migration.
(()=>{
 const nav=root.querySelector('.studio-preview .studio-panel-title');if(!nav)return;nav.style.display='flex';nav.style.alignItems='center';nav.style.justifyContent='space-between';
 const controls=document.createElement('span');controls.className='atlas-history-controls';controls.style.cssText='display:flex;align-items:center;gap:4px;margin-left:auto';
 const make=(text,title)=>{const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=text;b.title=title;controls.append(b);return b;};
 const undo=make('Undo','Undo · Ctrl/Cmd+Z'),redo=make('Redo','Redo · Ctrl/Cmd+Shift+Z or Ctrl+Y');nav.append(controls);
 const keys=['gradientLayers','gradientLayer','gradientColors','gradientAlphas','gradientSelection','gradientPreset','artistTransition','vfx','vfxLock','randomType','explosionView','explosionSplit','explosionBloom','explosionGlow'];
 const read=()=>{storeGradientLayer();return {editor:structuredClone(Object.fromEntries(keys.map(k=>[k,state[k]]))),images:previewImages.map(({id,name,asset,visible,opacity,blend,map,gray,alpha,normalizeValues=false})=>({id,name,asset,visible,opacity,blend,normalizeValues,map:id===previewSelected?previewMapSnapshot():structuredClone(map),gray,alpha})),active:previewSelected,selection:[...previewSelection],random:[...previewRandomSelection]};};
 const signature=s=>JSON.stringify({...s,images:s.images.map(({gray,alpha,...p})=>p)});
 let pending=0,label='Edit',pointer=false,h;
 const sync=()=>{if(!h)return;undo.disabled=!h.canUndo();redo.disabled=!h.canRedo();};
 const apply=s=>{Object.assign(state,structuredClone(s.editor));previewImages=s.images.map(p=>({...p,map:structuredClone(p.map)}));previewSelected=s.active;previewSelection=new Set(s.selection);previewRandomSelection=new Set(s.random);previewTouched=true;previewRevision++;explosionRenderSignature=null;const p=previewImages.find(p=>p.id===previewSelected);if(p){explosionPixels=previewLayerGray(p);explosionAlpha=p.alpha;}state.gradientColors=state.gradientLayers[state.gradientLayer].colors;state.gradientAlphas=state.gradientLayers[state.gradientLayer].alphas;loadGradientColor();drawVfx();drawLabPlane();renderPreviewLayerList();$('#random-type').value=state.randomType;syncColorPlayControl();remember();savePreviewStack();};
 h=createAtlasHistory({read,apply,signature,changed:sync});
 const schedule=()=>{clearTimeout(pending);pending=setTimeout(()=>{if(lab3dDrag||colorWheelDrag||gradientDrag||pointer)return;h.commit(label);},0);};
 const rememberBefore=remember;remember=function(...args){const result=rememberBefore(...args);schedule();return result;};
 const changedBefore=previewChanged;previewChanged=function(...args){const result=changedBefore(...args);schedule();return result;};
 const restoreBefore=restorePreviewStack;restorePreviewStack=async function(...args){const restored=await restoreBefore(...args);if(restored){if(args[1]){label='Load Preview preset';schedule();}else h.reset();}return restored;};
 const actionLabel=e=>{const n=e.target.closest?.('[data-action],[data-preview-action],input,select');if(n?.dataset.previewAction)return n.dataset.previewAction==='rename-cancel'?'Edit':'Layer '+n.dataset.previewAction;const a=n?.dataset.action;if(a==='random-all-layers')return 'Random';if(a)return a.replaceAll('-',' ');return ({'preview-opacity':'Layer opacity','preview-blend':'Layer blend','preview-layer-name':'Rename layer','preview-layer-file':'Import / replace image','gradient-position':'Key position','explosion-bloom':'Bloom','random-type':'Random mode'})[n?.id]||'Color / layer edit';};
 const excluded=e=>e.target.closest?.('.atlas-history-controls,.studio-workspace-nav,dialog:not(#preview-preset-dialog),.mp-explosion-previews,[data-preview-camera]');
 root.addEventListener('pointerdown',e=>{if(excluded(e)||e.button!==0)return;if(pointer)h.end(label);label=actionLabel(e);pointer=true;h.begin();},true);
 document.addEventListener('pointerup',()=>{if(pointer){pointer=false;setTimeout(()=>h.end(label),0);}},true);
 document.addEventListener('pointercancel',()=>{if(pointer){pointer=false;setTimeout(()=>h.end(label),0);}},true);window.addEventListener('blur',()=>{if(pointer){pointer=false;h.end(label);}});
 for(const event of ['click','input','change'])root.addEventListener(event,e=>{if(excluded(e))return;label=actionLabel(e);schedule();},true);
 root.addEventListener('drop',()=>{label='Replace image';},true);
 const run=redoAction=>{clearTimeout(pending);try{redoAction?h.redo():h.undo();}catch{previewStatus('History could not be restored.');}};
 undo.addEventListener('click',()=>run(false));redo.addEventListener('click',()=>run(true));
 document.addEventListener('keydown',e=>{if(!(e.ctrlKey||e.metaKey)||e.altKey)return;const key=e.key.toLowerCase();if(key!=='z'&&key!=='y')return;const n=e.target;if(n.isContentEditable||n.tagName==='TEXTAREA'||n.tagName==='INPUT'&&!['range','checkbox','radio','button'].includes(n.type))return;e.preventDefault();run(key==='y'||e.shiftKey);});
 setTimeout(()=>{h.reset();sync();},0);window.AtlasHistory=h;
})();
