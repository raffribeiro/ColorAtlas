/* Context help is read-only UI. One delegated listener set covers rebuilt controls;
   only an active tooltip reads geometry. Its temporary removal observer stops
   on dismissal; there is no render loop or saved state. */
(() => {
 'use strict';
 const root=document.getElementById('munsell-picker');
 if(!root||window.AtlasContextHelp)return;
 const CONTROL='button,input:not([type="hidden"]),select,textarea,summary,a[href],[role="button"],[role="slider"],[role="separator"],svg.mp-vfx-lab,svg.mp-lab-plane,svg.mp-gradient,[data-field="color-wheel"],canvas[data-field="explosion-mapped"],[data-field$="divider"],.mp-explosion-previews canvas,[data-doc-example] canvas,[data-doc-example] svg';
 const rules=[];
 const add=(selector,text)=>rules.push([selector,text]);
 const actions={
  'gradient-add':'Add a color key to the current gradient. Select it to edit its color and position.',
  'gradient-remove':'Remove the selected color key. At least two keys remain; Undo restores a removed key.',
  'gradient-save':'Save the current gradient in My palettes for reuse.',
  'gradient-png':'Export this gradient as a PNG or engine color keys. Choose dimensions and format in the export window.',
  'random-all-layers':'Generate new palettes for layers whose dice toggle is ON, using the chosen Random mode. Undo restores the previous colors.',
  'apply-hex':'Apply the pasted HEX color to the selected key.',
  'lab-reset-zoom':'Restore the default 3D camera angle, position and zoom without changing colors.',
  'wheel-reset-view':'Restore the color wheel’s default position and zoom without changing colors.',
  'png-export-download':'Download the PNG or copy the engine data in the format chosen above.',
  'png-export-close':'Close export and return to the editor.', 'png-export-cancel':'Cancel export and return to the editor.',
  'clipboard-retry':'Try copying the prepared color or gradient data to the clipboard again.',
  'clipboard-close':'Close the clipboard window.', 'clipboard-close-secondary':'Close the clipboard window.',
  'colorplay-study':'Compare candidate palettes on your image to choose a useful color direction.',
  'colorplay-close':'Close the palette comparison and return to the editor.',
  'copy':'Copy the selected color to the clipboard.', 'vfx-copy':'Copy the selected color to the clipboard.',
  'gradient-random':'Generate a new gradient using the current Random mode.',
  'gradient-toggle-layer':'Switch the gradient being edited.',
  'gradient-alpha':'Edit this gradient key’s transparency.',
  'gradient-apply':'Apply the selected gradient preset.',
  'gradient-blackbody':'Create a heat-inspired dark-to-bright gradient.',
  'copy-triad':'Copy this color combination to the clipboard.', 'copy-triad-header':'Copy this color combination to the clipboard.',
  'palette-add':'Add the selected color to the palette.', 'palette-remove':'Remove the selected saved palette.',
  'palette-update':'Replace the saved palette with the current colors.', 'palette-copy':'Copy the palette colors.', 'palette-triad':'Create a related color combination.'
 };
 for(const [key,text] of Object.entries(actions))add(`[data-action="${key}"]`,text);
 const ids={
  'studio-search':'Search library presets by name or color mood, such as fire, ice or smoke.',
  'lab-auto-rotate':'Rotate the 3D color graph automatically. Turn this off to keep the camera still.',
  'mp-vfx-lock':'Keep color edits inside the range your sRGB screen can display.',
  'mp-vfx-l':'Change the selected color’s lightness from Black to White. Hue and chroma may be limited near the ends.',
  'mp-vfx-a':'Move the selected color along the Green–Red axis at the current lightness.',
  'mp-vfx-b':'Move the selected color along the Blue–Yellow axis at the current lightness.',
  'vfx-saturation':'Change color strength relative to the strongest sRGB color available at this hue and lightness.',
  'paste-hex':'Paste a HEX color, then press Apply to recolor the selected key.',
  'gradient-position':'Move the selected key along the gradient. Dark image values use the left; bright values use the right.',
  'artist-transition':'Choose Smooth for continuous color blending or Bands for hard color steps.',
  'random-type':'Choose a palette-generation style. The choice takes effect when you press Random.',
  'preview-preset-select':'Load a saved Preview scene, including its images, gradients and layer settings.',
  'preview-preset-name':'Name the Preview scene you are saving.',
  'preview-blend':'Choose how this layer mixes with the layers below it. Add suits luminous accents; Normal covers them.',
  'preview-opacity':'Change how strongly the selected layer contributes to the Preview.',
  'preview-layer-name':'Rename the selected image layer.',
  'color-vision':'Simulate color-vision differences in the Preview. This does not change the gradient colors.',
  'attention-toggle':'Show estimated areas of primary, secondary and tertiary visual attention in the Preview.',
  'explosion-bloom':'Add glow around bright areas in the Preview. The exported gradient is unchanged.',
  'atlas-doc-search':'Find a control, task or term in Documentation and jump to the matching section.',
  'png-export-name':'Choose the filename for the exported PNG.',
  'png-export-width':'Choose the horizontal resolution of the exported gradient image.',
  'png-export-height':'Choose the height of each exported gradient row.',
  'png-export-alpha':'Include authored transparency in the export. Turn off for opaque colors.',
  'png-export-linear':'Blend Smooth gradients in Linear RGB for compatible engine interpolation.',
  'png-export-perceptual':'Blend Smooth gradients in OKLab to follow the editor’s perceptual transition.',
  'png-export-format-png':'Export a gradient texture as a PNG image.',
  'png-export-format-unity':'Prepare gradient color keys for Unity.',
  'png-export-format-unreal':'Prepare gradient color keys for Unreal.',
  'png-export-layer-current':'Export only the currently edited gradient.',
  'png-export-layer-both':'Export both importance gradients together.'
 };
 for(const [key,text] of Object.entries(ids))add('#'+key,text);
 const layer={add:'Add a PNG, JPEG or WebP image as a new Preview layer.',replace:'Replace the image on this layer while keeping its settings.',rename:'Give the selected image layer a different name.',remove:'Remove the selected image layer from the Preview.',up:'Move the selected layer forward in the stack.',down:'Move the selected layer backward in the stack.',export:'Download the full Preview composition as a PNG image.','normalize-values':'Stretch this layer’s original dark-to-light range across the whole gradient. Turn off to keep the image’s original value range.','rename-cancel':'Cancel renaming this image layer.'};
 for(const [key,text] of Object.entries(layer))add(`[data-preview-action="${key}"]`,text);
 const preset={new:'Save this Preview scene as a new named preset.',save:'Save changes to the selected Preview preset.',delete:'Delete the selected saved Preview preset.',cancel:'Cancel without saving a Preview preset.',confirm:'Save the Preview preset with the entered name.'};
 for(const [key,text] of Object.entries(preset))add(`[data-preview-preset="${key}"]`,text);
 add('[data-preview-camera="reset"]','Fit the image in the Preview and reset pan and zoom.');
 add('[data-library-io="export"]','Save My palettes, favorites and Preview presets together in a library backup file.');
 add('[data-library-io="import"]','Add palettes, favorites and Preview presets from a Color Atlas library backup.');
 add('[data-studio-delete]','Delete this saved palette from My palettes.');
 add('[data-studio-folder]','Expand or collapse this library folder.');
 add('[data-studio-preset]','Apply this library palette to the selected layer’s gradient. Undo returns to the previous palette.');
 add('[data-studio-favorite],[data-favorite],.studio-favorite,.studio-star','Add or remove this palette from Favorites.');
 add('[data-gradient-select]','Select this color key to edit it in the wheel, 3D graph and sliders.');
 add('[data-gradient-copy]','Copy this key’s HEX color to the clipboard.');
 add('.preview-layer-random','Include or exclude this image layer when you press Random. ON layers receive new palettes.');
 add('.preview-layer-row input[type="checkbox"]','Show or hide this image layer in the Preview without removing it.');
 add('.preview-layer-row button','Select this image layer to edit its gradient and settings. Shift-click adds it to the selection.');
 add('[data-studio-view="editor"]','Return to the color editor with your current workspace intact.');
 add('[data-studio-view="documentation"]','Read the guide and try interactive examples without changing your workspace.');
 add('.atlas-tour-tab','Replay the guided tutorial. Your workspace is restored when you finish or leave it.');
 add('[data-doc-link]','Open this topic in Documentation.');
 add('[data-doc-previous]','Read the previous Documentation topic.');
 add('[data-doc-next]','Read the next Documentation topic.');
 add('[data-doc-section],[data-doc-anchor],[data-doc-section-link]','Jump to this section of the current Documentation topic.');
 add('[data-doc-result],.atlas-docs-search-hit','Open this matching section in Documentation.');
 add('[data-doc-reset]','Restore this example’s starting settings. Your editor workspace is unaffected.');
 add('[data-field="vfx-hex"],[data-field="lab-hex"]','Copy the selected key’s HEX color to the clipboard.');
 add('svg.mp-vfx-lab,svg.mp-lab-plane','Drag the selected color circle to recolor it at its current lightness. Drag elsewhere to rotate; scroll to zoom and middle-drag to pan.');
 add('[data-field="color-wheel"]','Drag inside the color area to change hue and chroma at the selected key’s lightness. Scroll to zoom and middle-drag to pan.');
 add('svg.mp-gradient','Drag a color marker to change its gradient position. Click empty ramp space to add a key.');
 add('canvas[data-field="explosion-mapped"],.mp-explosion-previews canvas','See your gradient applied to the image. Scroll to zoom, middle-drag to pan, and use Reset view to fit.');
 add('[role="separator"],[data-field$="divider"]','Drag this divider to resize the adjacent panels.');
 let tip=null,target=null,timer=0,suppressedTitle=null,temporaryLabel=null,removalObserver=null,pressed=false,source='',lastPointer=null;
 const tidy=value=>String(value||'').replace(/\s+/g,' ').trim();
 function label(el){return tidy(window.AtlasI18n?.sourceLabel(el)||el.getAttribute('aria-label')||el.labels?.[0]?.textContent||el.getAttribute('title')||el.textContent||el.getAttribute('placeholder'));}
 function describeEnglish(el){
  if(!el)return null;
  const custom=el.getAttribute('data-context-help');if(custom)return {text:custom,source:'metadata'};
  for(const [selector,text] of rules)if(el.matches(selector))return {text,source:selector};
  const name=label(el);
  if(/favorit/i.test(name))return {text:'Add or remove this palette from Favorites.',source:'favorite-label'};
  if(/^(Undo|Redo)/i.test(name))return {text:/^Undo/i.test(name)?'Undo the last edit. Use Ctrl/Cmd+Z.':'Restore the last undone edit. Use Ctrl/Cmd+Shift+Z or Ctrl+Y.',source:'history-label'};
  if(/^Copy\s+#?[0-9a-f]{6}|^Copy HEX$/i.test(name))return {text:'Copy this color’s HEX value to the clipboard.',source:'copy-label'};
  if(el.tagName==='SUMMARY')return {text:el.closest('.studio-library')?'Expand or collapse this library group to browse its palettes.':'Expand or collapse this additional explanation.',source:'disclosure'};
  if(el.closest('[data-doc-example]')){
   const reset=/reset/i.test(name);let text;
   if(reset)text='Restore this interactive example’s starting settings.';
   else if(el.matches('canvas,svg'))text=el.closest('[data-doc-example="slice"]')?'Click or drag in the color slice to choose hue and chroma at this lightness. Your editor workspace is unaffected.':'This illustration updates when you change the example controls below. Your editor workspace is unaffected.';
   else if(el.matches('input[type="color"]'))text=`Choose the ${name||'example'} color and compare the result below.`;
   else if(el.matches('input[type="checkbox"]'))text=`Turn ${name||'this example option'} on or off to compare the result.`;
   else if(el.matches('select'))text=`Choose ${name||'an example setting'} and compare the result.`;
   else text=`Adjust ${name||'this example setting'} and watch the example update.`;
   return {text,source:'example-control'};
  }
  if(el.closest('dialog')&&el.matches('button'))return {text:/cancel|close/i.test(name)?'Close this window without applying further changes.':/delete|remove/i.test(name)?'Confirm removal of the selected item.':/save/i.test(name)?'Save the entered settings and return to the editor.':name,source:'dialog-action'};
  const title=tidy(el===target&&suppressedTitle!==null?suppressedTitle:el.getAttribute('title'));
  if(title)return {text:title,source:'title'};
  const text=el.matches('select')?`Choose ${name||'an option'} using this menu.`:el.matches('input[type="checkbox"]')?`Turn ${name||'this option'} on or off.`:el.matches('input,textarea')?`Set ${name||'this value'}.`:name?`${name}.`: 'Use this control to adjust the current view.';
  return {text,source:'fallback'};
 }
 function control(node){if(!(node instanceof Element))return null;const el=node.closest(CONTROL);return el&&root.contains(el)?el:null;}
 function describe(el){const info=describeEnglish(el);return info?{...info,text:window.AtlasI18n?.t(info.text)||info.text}:info;}
 function blocked(){return pressed||root.dataset.tour==='on'||document.hidden;}
 function ensureTip(){
  if(tip)return;
  tip=document.createElement('div');tip.id='atlas-context-help';tip.className='atlas-context-help';tip.setAttribute('role','tooltip');tip.hidden=true;
  // Manual popover joins the top layer above native modal dialogs, without focus.
  if(typeof tip.showPopover==='function')tip.setAttribute('popover','manual');
  document.body.append(tip);
 }
 function hide(){
  clearTimeout(timer);timer=0;
  removalObserver?.disconnect();
  if(target){
   if(temporaryLabel!==null&&target.getAttribute('aria-label')===temporaryLabel)target.removeAttribute('aria-label');
   const tokens=(target.getAttribute('aria-describedby')||'').split(/\s+/).filter(t=>t&&t!=='atlas-context-help');
   if(tokens.length)target.setAttribute('aria-describedby',tokens.join(' '));else target.removeAttribute('aria-describedby');
   if(suppressedTitle!==null&&!target.hasAttribute('title'))target.setAttribute('title',suppressedTitle);
  }
  if(tip){if(tip.matches(':popover-open'))tip.hidePopover();tip.hidden=true;}
  target=null;suppressedTitle=null;temporaryLabel=null;lastPointer=null;
 }
 function show(){
  timer=0;if(!target?.isConnected||blocked())return hide();
  const r=target.getBoundingClientRect();if(!r.width||!r.height)return hide();
  const info=describe(target);ensureTip();tip.lang=window.AtlasI18n?.locale||'en';tip.textContent=info.text;tip.dataset.source=info.source;
  // Observe only the target's ancestor child lists while a tooltip is open.
  // This catches removed rows/dialogs without watching every SVG redraw.
  if(typeof MutationObserver==='function'){
   if(!removalObserver)removalObserver=new MutationObserver(()=>{if(target&&!target.isConnected)hide();});
   for(let parent=target.parentElement;parent;parent=parent.parentElement){removalObserver.observe(parent,{childList:true});if(parent===root)break;}
  }
  tip.hidden=false;
  if(tip.hasAttribute('popover')){try{tip.showPopover();}catch{tip.removeAttribute('popover');}}
  const tokens=new Set((target.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean));tokens.add(tip.id);target.setAttribute('aria-describedby',[...tokens].join(' '));
  const view=window.visualViewport,w=view?.width||innerWidth,h=view?.height||innerHeight,vx=view?.offsetLeft||0,vy=view?.offsetTop||0;
  const box=tip.getBoundingClientRect(),x=Math.max(vx+8,Math.min(r.left+r.width/2-box.width/2,vx+w-box.width-8));
  let y=r.bottom+9;if(y+box.height>vy+h-8)y=r.top-box.height-9;
  tip.style.left=x+'px';tip.style.top=Math.max(vy+8,Math.min(y,vy+h-box.height-8))+'px';
 }
 function schedule(el,kind,e){
  if(el===target){if(kind==='focus'||source!=='focus')source=kind;return;}
  hide();if(!el||blocked())return;
  target=el;source=kind;
  // Suppress only the hovered control's native title and restore it on exit.
  suppressedTitle=el.hasAttribute('title')?el.getAttribute('title'):null;
  if(suppressedTitle!==null){
   // Native title can be an icon-only control's accessible name. Keep that name
   // while replacing only its browser tooltip, then restore attributes on exit.
   if(!el.getAttribute('aria-label')&&!el.getAttribute('aria-labelledby')&&!el.labels?.length&&!tidy(el.textContent)){
    temporaryLabel=suppressedTitle;el.setAttribute('aria-label',temporaryLabel);
   }
   el.removeAttribute('title');
  }
  lastPointer=e?{x:e.clientX,y:e.clientY}:null;
  timer=setTimeout(show,650);
 }
 root.addEventListener('pointerover',e=>{if(e.pointerType==='touch'||e.buttons)return;pressed=false;schedule(control(e.target),'pointer',e);});
 root.addEventListener('pointerout',e=>{if(source==='pointer'&&target&&!target.contains(e.relatedTarget))hide();});
 root.addEventListener('pointermove',e=>{
  if(e.buttons){hide();return;}
  pressed=false;
  if(source!=='pointer'||!target||!lastPointer||!timer)return;
  if(Math.hypot(e.clientX-lastPointer.x,e.clientY-lastPointer.y)>5){clearTimeout(timer);lastPointer={x:e.clientX,y:e.clientY};timer=setTimeout(show,650);}
 });
 root.addEventListener('focusin',e=>{if(e.target.matches?.(':focus-visible'))schedule(control(e.target),'focus');});
 root.addEventListener('focusout',e=>{if(source==='focus'&&target===control(e.target))hide();});
 document.addEventListener('pointerdown',()=>{pressed=true;hide();},true);
 document.addEventListener('pointerup',()=>{pressed=false;},true);
 document.addEventListener('pointercancel',()=>{pressed=false;hide();},true);
 document.addEventListener('keydown',e=>{if(e.key==='Tab')pressed=false;else hide();},true);
 document.addEventListener('scroll',hide,true);document.addEventListener('visibilitychange',hide);
 window.addEventListener('resize',hide);window.addEventListener('blur',()=>{pressed=false;hide();});
 window.visualViewport?.addEventListener('resize',hide);window.visualViewport?.addEventListener('scroll',hide);
 function coverage(scope=root){
  const visible=el=>!!el.getClientRects().length&&!el.closest('[hidden],[inert]')&&getComputedStyle(el).visibility!=='hidden';
  return [...scope.querySelectorAll(CONTROL)].filter(visible).map(el=>({element:el,label:label(el),...describe(el)}));
 }
 window.AtlasContextHelp=Object.freeze({describe,coverage,hide,delay:650});
})();
