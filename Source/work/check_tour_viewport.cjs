const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');const listeners={},messages=[];
const child={postMessage:d=>messages.push(d)},frame={contentWindow:child,getBoundingClientRect:()=>({top:-500,height:3300})};
const c={document:{getElementById:()=>frame},location:{pathname:'/app',search:''},innerHeight:900,requestAnimationFrame:f=>{f();return 1},window:{addEventListener:(n,f)=>(listeners[n]??=[]).push(f)},Promise};vm.createContext(c);vm.runInContext(fs.readFileSync('work/atlas-preview-storage.js','utf8'),c);
const send=source=>listeners.message.forEach(f=>f({source,data:{channel:'color-atlas-tour-viewport',active:true}}));
send({});assert.equal(messages.length,0);send(child);assert.equal(messages.length,1,'subscription receives viewport');assert.equal(messages[0].top,500);assert.equal(messages[0].bottom,1400);console.log('PASS: host reports visible iframe coordinates only to its own subscribed child.');
