(()=>{
 const pending=new Map();let seq=0;
 window.AtlasDesktopReply=(id,value,error)=>{const p=pending.get(id);if(!p)return;pending.delete(id);clearTimeout(p.timer);error?p.reject(Error(error)):p.resolve(value);};
 window.AtlasDesktopCall=(action,payload)=>new Promise((resolve,reject)=>{const id=String(++seq),timer=setTimeout(()=>{pending.delete(id);reject(Error('Data storage timed out'));},15000);pending.set(id,{resolve,reject,timer});window.webkit.messageHandlers.atlas.postMessage({id,action,payload});});
 const cached={...window.AtlasDesktopInitial};window.AtlasDesktopStorage={getItem:k=>cached[k]??null,setItem:(k,v)=>{cached[k]=String(v);return window.AtlasDesktopCall('settings-set',{key:k,value:String(v)});},removeItem:k=>{delete cached[k];return window.AtlasDesktopCall('settings-delete',{key:k});}};
 let queue=Promise.resolve();const actions=['read','write','preset-list','preset-read','preset-save','preset-delete'];
 window.addEventListener('message',e=>{const d=e.data;const frame=document.getElementById('codex-visualization');if(!frame||e.source!==frame.contentWindow||d?.channel!=='color-atlas-preview-store'||!actions.includes(d.action)||typeof d.id!=='string')return;const reply=(ok,payload)=>frame.contentWindow.postMessage({channel:d.channel,id:d.id,ok,payload},'*');queue=queue.then(()=>window.AtlasDesktopCall(d.action,d.payload??null)).then(v=>reply(true,v),()=>reply(false,null));});
})();
