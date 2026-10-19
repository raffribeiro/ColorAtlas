const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html','utf8');
assert(html.includes('<dialog id="png-export-dialog"'),'Export PNG needs an accessible modal instead of an immediate download');
const source=html.split('// PNG export options\n')[1]?.split('// End PNG export options')[0];assert(source);
const nodes=new Map(),downloads=[],timers=[];let lastPixels;
function node(k){if(!nodes.has(k))nodes.set(k,{value:'',checked:false,disabled:false,open:false,handlers:{},addEventListener(e,f){this.handlers[e]=f},focus(){this.focused=true},showModal(){this.open=true},close(){this.open=false;this.handlers.close?.()},getBoundingClientRect(){return{left:100,right:500,top:100,bottom:500}},getContext(){return{createImageData(w,h){return{width:w,height:h,data:new Uint8ClampedArray(w*h*4)}},putImageData(p){lastPixels=p}}}});return nodes.get(k);}
node('#png-export-width').value='256';node('#png-export-height').value='16';node('#png-export-name').value='gradient-map';node('#png-export-alpha').checked=true;node('#png-export-layer-current').checked=true;
const state={gradientLayer:'smoke',gradientColors:[{rgb:[0,1,0]},{rgb:[0,0,1]}],gradientAlphas:[{a:.2},{a:.8}],artistTransition:'bands',gradientLayers:{emission:{colors:[{rgb:[1,0,0]},{rgb:[1,1,1]}],alphas:[{a:0},{a:1}],transition:'smooth'},smoke:{colors:[{rgb:[1,0,1]},{rgb:[1,0,1]}],alphas:[{a:1},{a:1}],transition:'smooth'}}};
const before=JSON.stringify(state),context={$:node,field:k=>node('[data-field="'+k+'"]'),state,importanceLayerName:k=>k==='smoke'?'Importance 02':'Importance 01',encodeSRGB:x=>x,gradientSample(t,c,a,mode){const w=mode==='bands'&&t<1?0:t;return{rgb:c[0].rgb.map((v,i)=>v+(c[1].rgb[i]-v)*w),alpha:a[0].a+(a[1].a-a[0].a)*w}},document:{createElement(tag){if(tag==='canvas')return{...node('canvas'),toBlob(cb){cb({png:true})}};return{click(){downloads.push({name:this.download,url:this.href})}}}},URL:{createObjectURL:()=> 'blob:png',revokeObjectURL:url=>context.revoked=url},setTimeout(fn){timers.push(fn)}};
vm.runInNewContext(source,context);
node('[data-action="gradient-png"]').handlers.click();assert(node('#png-export-dialog').open);assert.equal(downloads.length,0,'Opening options must never start a download');assert.equal(node('#png-export-layer-label').textContent,'Importance 02');
let prevented=0;node('#png-export-form').handlers.submit({preventDefault(){prevented++}});
assert.equal(downloads.length,1);assert.equal(downloads[0].name,'gradient-map.png');assert.equal(lastPixels.width,256);assert.equal(lastPixels.height,16);assert.deepEqual([...lastPixels.data.slice(0,4)],[0,255,0,51]);assert.deepEqual([...lastPixels.data.slice(-4)],[0,0,255,204]);assert(!node('#png-export-dialog').open);assert(node('[data-action="gradient-png"]').focused);timers.pop()();assert.equal(context.revoked,'blob:png');
node('#png-export-layer-current').checked=false;node('#png-export-width').value='3';node('#png-export-height').value='2';node('#png-export-alpha').checked=false;node('#png-export-name').value='my/ramp.png';
node('[data-action="gradient-png"]').handlers.click();node('#png-export-form').handlers.submit({preventDefault(){}});
assert.equal(lastPixels.height,4,'Both layers are stacked with the chosen height per layer');assert.deepEqual([...lastPixels.data.slice(0,4)],[255,0,0,255]);assert.deepEqual([...lastPixels.data.slice(24,28)],[0,255,0,255]);assert.deepEqual([...lastPixels.data.slice(28,32)],[0,255,0,255],'Active Bands interpolation retained');assert.equal(downloads.at(-1).name,'my-ramp.png');assert.equal(JSON.stringify(state),before,'Export must preserve selection and both palettes');
for(const v of ['0','4097','2.5','NaN','']){node('#png-export-width').value=v;node('[data-action="gradient-png"]').handlers.click();node('#png-export-form').handlers.submit({preventDefault(){}});assert.equal(downloads.length,2,'Invalid dimensions cannot download');assert(node('#png-export-dialog').open);assert(node('#png-export-error').textContent);}
node('#png-export-width').value='1';node('#png-export-height').value='1';node('#png-export-layer-current').checked=true;node('#png-export-form').handlers.submit({preventDefault(){}});assert.equal(lastPixels.width,1);assert.equal(lastPixels.height,1);assert.deepEqual([...lastPixels.data],[0,255,0,255]);
node('[data-action="gradient-png"]').handlers.click();node('[data-action="png-export-cancel"]').handlers.click();assert(!node('#png-export-dialog').open);assert.equal(downloads.length,3,'Cancel never downloads');
let pendingBlob;const originalCreate=context.document.createElement;context.document.createElement=tag=>tag==='canvas'?{...node('canvas'),toBlob(cb){pendingBlob=cb}}:originalCreate(tag);
node('[data-action="gradient-png"]').handlers.click();node('#png-export-form').handlers.submit({preventDefault(){}});assert(node('[data-action="png-export-download"]').disabled);
node('#png-export-form').handlers.submit({preventDefault(){}});assert.equal(downloads.length,3,'Repeated submit while encoding cannot download twice');
node('[data-action="png-export-cancel"]').handlers.click();pendingBlob({png:true});assert.equal(downloads.length,3,'Closing during encoding aborts the download');assert(!node('[data-action="png-export-download"]').disabled);
node('[data-action="gradient-png"]').handlers.click();node('#png-export-form').handlers.submit({preventDefault(){}});pendingBlob(null);assert(node('#png-export-dialog').open);assert(node('#png-export-error').textContent.includes('could not be generated'));assert(!node('[data-action="png-export-download"]').disabled);
// Closing and reopening must invalidate an older encoder callback.
node('#png-export-form').handlers.submit({preventDefault(){}});const staleBlob=pendingBlob;
node('[data-action="png-export-cancel"]').handlers.click();
node('[data-action="gradient-png"]').handlers.click();
assert(!node('[data-action="png-export-download"]').disabled,'Reopening must allow a new export');
staleBlob({png:true});assert.equal(downloads.length,3,'Reopening cannot revive a canceled download');
node('#png-export-form').handlers.submit({preventDefault(){}});const latestBlob=pendingBlob;
staleBlob({png:true});assert(node('[data-action="png-export-download"]').disabled,'A stale callback cannot unlock a new export');
latestBlob(null);assert(!node('[data-action="png-export-download"]').disabled);
node('#png-export-dialog').handlers.click({target:node('#png-export-dialog'),clientX:50,clientY:50});assert(!node('#png-export-dialog').open,'Backdrop closes options');
assert(prevented);console.log('PASS: modal opens without downloading; configurable PNG size/name/alpha, both-layer order, live active palette, Bands, pixel endpoints, validation, cancel/focus, URL cleanup and no editor mutation.');
