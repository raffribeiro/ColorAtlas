const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html','utf8');
// Extract the live copy path, including its existing root delegation.
const source=html.slice(html.indexOf("root.addEventListener('click',e=>{const target=e.target.closest('[data-copy-hex]')"),html.indexOf("$('[data-action=\"copy\"]').addEventListener"));
function fixture({exec=true,api='missing'}={}){
 const nodes=new Map(),timers=[];let clipboard=null,selected=null,attached=null,calls=0,legacy=exec;
 function node(k){if(!nodes.has(k))nodes.set(k,{textContent:k==='key'?'Copy HEX':'',value:'',hidden:true,style:{},parentElement:{hidden:true},handlers:{},setAttribute(){},addEventListener(n,f){this.handlers[n]=f;},appendChild(el){attached=el;},focus(){document.activeElement=this;},select(){selected=this;},setSelectionRange(){},remove(){attached=null;},getBoundingClientRect(){return {left:100,top:100,width:60,right:500,bottom:500};},showModal(){this.open=true;},close(){this.open=false;this.handlers.close?.();},isConnected:true});return nodes.get(k);}
 const document={activeElement:null,body:{appendChild(el){attached=el;}},createElement(){return node('temporary');},execCommand(command){calls++;assert.equal(command,'copy');assert(selected&&selected===attached,'Copy must select an attached, focusable field, outside hidden editor sections');if(legacy instanceof Error)throw legacy;if(legacy){clipboard=selected.value;return true;}return false;},getSelection(){return null;}};
 const root={getBoundingClientRect(){return {left:0,top:0,width:900};},addEventListener(n,fn){node('root').handlers[n]=fn;}};
 const navigator={};if(api!=='missing')navigator.clipboard={writeText(text){if(api==='reject')return Promise.reject(new Error('NotAllowedError'));if(api==='pending')return new Promise(resolve=>{node('pending').resolve=()=>{clipboard=text;resolve();};});clipboard=text;return Promise.resolve();}};
 const context={root,document,navigator,window:{},$:node,field:n=>node(n),setTimeout(fn){timers.push(fn);return timers.length;},clearTimeout(){}};vm.createContext(context);vm.runInContext(source,context);return {context,node,timers,enableLegacy(){legacy=true;},get clipboard(){return clipboard;},get attached(){return attached;},get calls(){return calls;}};
}
(async()=>{
 const f=fixture(),button=f.node('key');await f.context.copyCode('#FF58BC',{target:button});
 assert.equal(f.clipboard,'#FF58BC');assert(f.node('copy-toast').textContent.includes('#FF58BC'),'Success feedback must name the exact copied HEX');assert(!f.node('copy-toast').hidden);assert.equal(f.attached,null,'Temporary selection field is removed');
 assert(f.node('clipboard-dialog').open!==true,'Successful copy never opens manual options');
 const fallback=fixture({exec:false,api:'reject'});await fallback.context.copyCode('#00CD91',{target:fallback.node('key')});
 assert(fallback.node('#clipboard-dialog').open,'Failure must offer visible manual copying in VFX mode');assert.equal(fallback.node('#clipboard-text').value,'#00CD91');assert(fallback.node('copy-toast').hidden,'Never show Copied on failure');
 fallback.enableLegacy();fallback.node('[data-action="clipboard-retry"]').handlers.click();await Promise.resolve();assert.equal(fallback.clipboard,'#00CD91');assert(!fallback.node('#clipboard-dialog').open,'Successful retry closes manual options');
 const modern=fixture({exec:false,api:'resolve'});await modern.context.copyCode('line one\nline two',{target:modern.node('key')});assert.equal(modern.clipboard,'line one\nline two','Multiline engine data survives clipboard fallback');assert(!modern.node('#clipboard-dialog').open);
 const waiting=fixture({exec:false,api:'pending'});const pending=waiting.context.copyCode('#ABCDEF',{target:waiting.node('key')});assert(waiting.node('copy-toast').hidden,'No success until writeText resolves');waiting.node('pending').resolve();await pending;assert(!waiting.node('copy-toast').hidden);
 const missing=fixture({exec:new Error('blocked')});await missing.context.copyCode('#123456',{target:missing.node('key')});assert(missing.node('#clipboard-dialog').open,'Unsupported copy APIs must still expose the value');
 missing.node('[data-action="clipboard-close-secondary"]').handlers.click();assert(!missing.node('#clipboard-dialog').open);assert.equal(missing.context.document.activeElement,missing.node('key'),'Closing restores the initiating control');
 const cancel=fixture({exec:false,api:'pending'});const canceled=cancel.context.copyCode('#111111',{target:cancel.node('key')});cancel.node('#clipboard-dialog').handlers.close();cancel.node('pending').resolve();await canceled;assert(cancel.node('copy-toast').hidden,'Dismissal invalidates stale asynchronous UI feedback');
 // Delegated key clicks copy data-copy-hex rather than the current selected color.
 const d=fixture(),key=d.node('key');key.getAttribute=()=> '#ff58bc';key.getBoundingClientRect=()=>({left:100,top:100,width:60});let stopped=false;
 d.node('root').handlers.click({target:{closest:()=>key},stopPropagation(){stopped=true;},clientX:110,clientY:100});await Promise.resolve();assert.equal(d.clipboard,'#FF58BC');assert(stopped);
 assert(html.includes('<dialog id="clipboard-dialog"'),'Manual copying needs a labeled native dialog outside hidden panels');
 console.log('PASS: selected row HEX reaches copy operation, success only after acknowledgement, synchronous attached-field fallback, API rejection/missing/pending cases and multiline manual copying.');
})().catch(e=>{console.error(e);process.exitCode=1;});
