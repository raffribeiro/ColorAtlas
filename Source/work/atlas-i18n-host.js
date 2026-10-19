// Sandboxed frame cannot read file-scoped localStorage. The host validates the
// sender and stores only the language code, separately from scenes and undo.
(() => {
 const frame=document.getElementById('codex-visualization');
 const key='color-atlas-language:'+location.pathname+location.search;
 const allowed=new Set(['en','pt-BR','es','fr','de','it','ja','ko','zh-CN']);
 window.addEventListener('message',event=>{
  const data=event.data;
  if(event.source!==frame.contentWindow||data?.channel!=='color-atlas-language')return;
  if(data.action==='write'&&allowed.has(data.locale)){try{localStorage.setItem(key,data.locale);}catch{} }
  if(data.action==='read'){
   let locale='en';try{const saved=localStorage.getItem(key);if(allowed.has(saved))locale=saved;}catch{}
   frame.contentWindow.postMessage({channel:data.channel,action:'restore',locale},'*');
  }
 });
})();
