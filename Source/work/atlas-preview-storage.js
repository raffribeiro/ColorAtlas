// Host-side storage keeps image assets outside the 16 KiB widget state.
(()=>{
 const frame=document.getElementById('codex-visualization'),key=location.pathname+location.search;
 let database,queue=Promise.resolve(),seeded=false,designSeeded=false;
 let tourActive=false,tourFramePending=false;
 function reportTourViewport(){
  if(!tourActive||tourFramePending)return;tourFramePending=true;
  requestAnimationFrame(()=>{tourFramePending=false;if(!tourActive)return;const r=frame.getBoundingClientRect(),top=r.top+(frame.clientTop||0),height=frame.clientHeight||r.height;frame.contentWindow.postMessage({channel:'color-atlas-tour-viewport',top:Math.max(0,-top),bottom:Math.min(height,innerHeight-top)},'*');});
 }
 window.addEventListener('message',e=>{if(e.source!==frame.contentWindow||e.data?.channel!=='color-atlas-tour-viewport')return;tourActive=e.data.active===true;reportTourViewport();});
 window.addEventListener('scroll',reportTourViewport,{passive:true,capture:true});
 window.addEventListener('resize',reportTourViewport,{passive:true});
 if(typeof ResizeObserver==='function')new ResizeObserver(reportTourViewport).observe(frame);

 const actions=['reload','read','write','preset-list','preset-read','preset-save','preset-delete','default-status','default-done','design-status','design-done'];
 function open(){if(!database)database=new Promise((resolve,reject)=>{try{const req=indexedDB.open('color-atlas-preview',2);req.onupgradeneeded=()=>{for(const name of ['stacks','presets'])if(!req.result.objectStoreNames.contains(name))req.result.createObjectStore(name);};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);req.onblocked=()=>reject(new Error('Blocked'));}catch(error){reject(error);}});return database;}
 async function store(action,payload,seed=false){
  if(action==='preset-save'&&payload?.id==='codex-use-esse'&&!seed)throw Error('Default is read-only');
  const preset=action.startsWith('preset-'),write=action==='write'||action==='preset-save'||action==='preset-delete'||action==='default-done'||action==='design-done';
  if((action==='write'||action==='preset-save')&&JSON.stringify(payload).length>16e6)throw new Error('Snapshot too large');
  if(preset&&action!=='preset-list'&&(!payload||typeof payload.id!=='string'||!/^[-A-Za-z0-9]{1,64}$/.test(payload.id)))throw new Error('Invalid id');
  if(action==='preset-save'&&(typeof payload.name!=='string'||!payload.name.trim()||payload.name.length>64||payload.doc?.version!==1||!Array.isArray(payload.doc.layers)||payload.doc.layers.length>8))throw new Error('Invalid preset');
  const db=await open();return new Promise((resolve,reject)=>{
   const tx=db.transaction(preset?'presets':'stacks',write?'readwrite':'readonly'),storage=tx.objectStore(preset?'presets':'stacks');let req,result=null;
   if(action==='preset-list'){
    result=[];req=storage.openCursor(IDBKeyRange.bound([key,''],[key,'\uffff']));
    req.onsuccess=()=>{const cursor=req.result;if(!cursor)return;const p=cursor.value;result.push({id:p.id,name:p.name});cursor.continue();};
   }else if(action==='preset-save')req=storage.put({id:payload.id,name:payload.name.trim(),doc:payload.doc},[key,payload.id]);
   else if(action==='preset-delete')req=storage.delete([key,payload.id]);
   else{const scope=action.startsWith('design-')?key+':design-seed-v1':action.startsWith('default-')?key+':default-cleanup-v1':key;req=write?storage.put((action==='default-done'||action==='design-done')?true:payload,scope):storage.get(preset?[key,payload.id]:scope);}
   tx.oncomplete=()=>resolve(write?null:action==='preset-list'?result:action==='preset-read'?req.result?.doc||null:req.result||null);
   tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });
 }
 window.addEventListener('message',e=>{
  const d=e.data;if(e.source!==frame.contentWindow||d?.channel!=='color-atlas-preview-store'||typeof d.id!=='string'||!actions.includes(d.action))return;
  const reply=(ok,payload)=>frame.contentWindow.postMessage({channel:d.channel,id:d.id,ok,payload},'*');
  // The tutorial restores the workspace, then asks for one reload so the editor reads it back.
  if(d.action==='reload'){queue.then(()=>{reply(true,null);setTimeout(()=>location.reload(),60);});return;}
  queue=queue.then(async()=>{if(!seeded&&typeof AtlasBuiltinPreview!=='undefined'){const list=await store('preset-list');if(list.find(p=>p.id==='codex-use-esse')?.name!=='Default')await store('preset-save',{id:'codex-use-esse',name:'Default',doc:AtlasBuiltinPreview},true);seeded=true;}if(!designSeeded&&typeof AtlasDesignPreview!=='undefined'){if(!await store('design-status')){const list=await store('preset-list');if(!list.some(p=>p.id==='temp-design'))await store('preset-save',{id:'temp-design',name:'Temp_Design',doc:AtlasDesignPreview});await store('design-done');}designSeeded=true;}return store(d.action,d.payload);}).then(value=>reply(true,value),()=>reply(false,null));
 });
})();
