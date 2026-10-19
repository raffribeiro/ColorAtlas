root.addEventListener('click',e=>{const target=e.target.closest('[data-copy-hex]');if(!target)return;const hex=(target.getAttribute('data-copy-hex')||target.textContent).match(/#[a-f0-9]{6}/i)?.[0];if(!hex)return;e.stopPropagation();copyCode(hex.toUpperCase(),{x:e.clientX,y:e.clientY,target});},true);
let copyToastTimer,copyRequest=0,manualCopyAnchor=null;
function showCopied(anchor,text=''){
 const toast=field('copy-toast'),box=root.getBoundingClientRect(),targetBox=anchor?.target?.getBoundingClientRect?.()||box;
 const x=Number.isFinite(anchor?.x)&&anchor.x>0?anchor.x:targetBox.left+(targetBox.width||80)/2;
 const y=Number.isFinite(anchor?.y)&&anchor.y>0?anchor.y:targetBox.top+24;
 toast.textContent=/^#[a-f0-9]{6}$/i.test(text)?'Copied '+text.toUpperCase():'Copied to clipboard';
 toast.hidden=false;window.AtlasMotion?.copied(toast);toast.style.left=`${Math.max(40,Math.min(box.width-40,x-box.left))}px`;toast.style.top=`${Math.max(32,y-box.top-12)}px`;
 clearTimeout(copyToastTimer);copyToastTimer=setTimeout(()=>{toast.hidden=true},2200);
}
function copySelectedText(text){
 let input=null;const previous=document.activeElement,selection=document.getSelection?.(),ranges=[];
 for(let i=0;i<(selection?.rangeCount||0);i++)ranges.push(selection.getRangeAt(i).cloneRange());
 const start=previous?.selectionStart,end=previous?.selectionEnd;
 try{
  input=document.createElement('textarea');input.value=text;input.readOnly=true;input.tabIndex=-1;input.setAttribute('aria-hidden','true');
  Object.assign(input.style,{position:'fixed',left:'-10000px',top:'0',width:'1px',height:'1px',opacity:'0'});
  const dialog=$('#clipboard-dialog');(dialog?.open?dialog:document.body).appendChild(input);
  input.focus({preventScroll:true});input.select();input.setSelectionRange(0,text.length);
  return document.execCommand('copy')===true;
 }catch{return false;}
 finally{
  input?.remove?.();
  if(previous?.isConnected!==false){previous?.focus?.({preventScroll:true});if(Number.isInteger(start)&&Number.isInteger(end))previous?.setSelectionRange?.(start,end);}
  if(selection&&ranges.length){try{selection.removeAllRanges();for(const range of ranges)selection.addRange(range);}catch{}}
 }
}
function offerManualCopy(text,anchor){
 const dialog=$('#clipboard-dialog'),input=$('#clipboard-text');manualCopyAnchor=anchor?.target||document.activeElement;
 input.value=text;$('#clipboard-manual-status').textContent='Automatic copy was unavailable. Press ⌘C or Ctrl+C, then paste where you need it.';
 if(!dialog.open)dialog.showModal();input.focus({preventScroll:true});input.select();input.setSelectionRange(0,text.length);
}
async function copyCode(text,anchor){
 const request=++copyRequest;field('copy-toast').hidden=true;field('copy-status').textContent='';
 // Opaque embedded origins may lack Clipboard API access. Try the selection
 // copy synchronously while the initiating click still has user activation.
 let copied=copySelectedText(text);
 if(!copied){try{await navigator.clipboard.writeText(text);copied=true;}catch{}}
 if(request!==copyRequest)return copied;
 field('copy-status').textContent=copied?'Copied to clipboard':'Automatic copy unavailable';
 if(copied){const dialog=$('#clipboard-dialog');if(dialog?.open)dialog.close();showCopied(anchor,text);}
 else offerManualCopy(text,anchor);
 return copied;
}
const clipboardDialog=$('#clipboard-dialog');
if(clipboardDialog){
 $('[data-action="clipboard-close"]').addEventListener('click',()=>clipboardDialog.close());
 $('[data-action="clipboard-close-secondary"]').addEventListener('click',()=>clipboardDialog.close());
 $('[data-action="clipboard-retry"]').addEventListener('click',()=>copyCode($('#clipboard-text').value,{target:manualCopyAnchor}));
 clipboardDialog.addEventListener('close',()=>{copyRequest++;manualCopyAnchor?.focus?.({preventScroll:true});});
 clipboardDialog.addEventListener('click',e=>{if(e.target!==clipboardDialog)return;const r=clipboardDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)clipboardDialog.close();});
}
