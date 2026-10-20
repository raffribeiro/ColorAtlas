const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('work/atlas-library-io.js','utf8');
assert.match(source,/file\.size\s*>\s*MAX_LIBRARY_BYTES/,'size guard must run before file.text');
assert(source.indexOf('file.size > MAX_LIBRARY_BYTES')<source.indexOf('await file.text()'));
for(const path of ['work/atlas-library-io.js','work/atlas-onboarding.js']) {
 const s=fs.readFileSync(path,'utf8');
 assert.match(s,/e\.source\s*!==\s*parent/);
 assert.match(s,/typeof d\.ok\s*!==\s*'boolean'/);
}
const guard={};vm.createContext(guard);vm.runInContext(fs.readFileSync('work/atlas-image-guard.js','utf8'),guard);
const png=(w,h)=>{const a=new Uint8Array(24);a.set([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82]);new DataView(a.buffer).setUint32(16,w);new DataView(a.buffer).setUint32(20,h);return a;};
assert.equal(guard.previewImageHeader(png(8192,4096)).width,8192);
assert.equal(guard.previewImageDimensionsOK(8192,4096),false,'32 MP cap');
assert.equal(guard.previewImageDimensionsOK(8192,3906),true);
assert.equal(guard.previewImageDimensionsOK(8193,1),false);
assert.equal(guard.previewImageDimensionsOK(0,1),false);
assert.equal(guard.previewImageDimensionsOK(512,512),true);
assert.equal(guard.previewImageHeader(new Uint8Array(5)),null);
const jpeg=new Uint8Array([255,216,255,224,0,4,0,0,255,192,0,11,8,2,0,4,0,1,1,17,0]);
assert.equal(guard.previewImageHeader(jpeg).width,1024);
assert.equal(guard.previewImageHeader(jpeg).height,512);
const webp=new Uint8Array(30);webp.set(Buffer.from('RIFF'));webp.set(Buffer.from('WEBPVP8X'),8);webp[16]=10;webp[24]=255;webp[25]=3;webp[27]=255;webp[28]=1;
assert.equal(guard.previewImageHeader(webp).width,1024);
assert.equal(guard.previewImageHeader(webp).height,512);
for(let n=0;n<24;n++) assert.equal(guard.previewImageHeader(png(512,512).slice(0,n)),null);
console.log('PASS import size, message boundaries and image metadata regressions');
(async()=>{
 const messages=[],writes=[],calls=[];
 const ctx={MAX_LIBRARY_BYTES:64*1024*1024,FORMAT:'color-atlas-library',BUDGET:8192,BUILTIN:new Set(),TextEncoder,Set,Map,Date,JSON,Number,window:{AtlasPreviewValidation:{document:()=>true}},say:t=>messages.push(t),model:()=>({state:{},m:{}}),store:{replace:async x=>writes.push(x),get:()=>null,set:()=>{}},hostStore:async(action)=>{calls.push(action);return[];},setTimeout:()=>0};
 vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('async function importLibrary'),source.indexOf("bar.querySelector('[data-library-io=\"export\"]')")),ctx);
 let reads=0;
 await ctx.importLibrary({size:64*1024*1024+1,text:async()=>{reads++;throw Error();}});assert.equal(reads,0);assert.equal(writes.length,0);assert.equal(calls.length,0);
 for(const payload of [{palettes:{}},{favorites:{}},{previewPresets:{}},{previewPresets:[null]},{folders:[]},{favorites:Array(2049).fill('fire')},{palettes:Array(257).fill({id:'x'})},{previewPresets:Array(257).fill({name:'X',doc:{version:1,layers:[]}})},{previewPresets:[{name:'X',doc:{version:1,layers:[null]}}]}]){
  await ctx.importLibrary({size:1,text:async()=>JSON.stringify({format:ctx.FORMAT,version:1,...payload})});assert.equal(writes.length,0);assert.equal(calls.length,0);
 }
 ctx.window.AtlasPreviewValidation.document=()=>false;
 await ctx.importLibrary({size:1,text:async()=>JSON.stringify({format:ctx.FORMAT,version:1,previewPresets:[{name:'bad',doc:{version:1,layers:[]}}]})});assert.equal(writes.length,0);assert.equal(calls.length,0);
 ctx.window.AtlasPreviewValidation.document=()=>true;
 await ctx.importLibrary({size:1,text:async()=>JSON.stringify({format:ctx.FORMAT,version:1,palettes:[],favorites:['fire'],previewPresets:[]})});assert.equal(writes.length,1);assert.equal(writes[0].modelContent.favoritePresets[0],'fire');
 for(const path of ['work/atlas-library-io.js','work/atlas-onboarding.js']){
  const s=fs.readFileSync(path,'utf8'),listeners=new Set(),parent={postMessage:d=>sent=d};let sent;
  const c={parent,seq:0,requestSeq:0,Date,Error,Promise,setTimeout:()=>1,clearTimeout:()=>{},addEventListener:(t,f)=>listeners.add(f),removeEventListener:(t,f)=>listeners.delete(f)};vm.createContext(c);
  vm.runInContext(s.slice(s.indexOf('function hostStore('),s.indexOf('\n}',s.indexOf('function hostStore('))+2),c);
  const p=c.hostStore('read');let resolved=false;p.then(()=>resolved=true);
  const send=(from,d)=>{for(const f of listeners)f({source:from,data:d});};
  send({}, {channel:'color-atlas-preview-store',id:sent.id,ok:true,payload:'spoof'});
  send(parent,{channel:'color-atlas-preview-store',id:sent.id,ok:'yes',payload:'spoof'});
  send(parent,{channel:'color-atlas-preview-store',id:sent.id+'other',ok:true,payload:'spoof'});
  await Promise.resolve();assert.equal(resolved,false);assert.equal(listeners.size,1);
  send(parent,{channel:'color-atlas-preview-store',id:sent.id,ok:true,payload:'real'});assert.equal(await p,'real');assert.equal(listeners.size,0);
 }
 console.log('PASS oversized files unread; malformed/over-limit collections and scenes cause zero writes; valid import retained; spoofed/wrong-id/nonboolean replies ignored');
})().catch(error=>{console.error(error);process.exitCode=1;});
(async()=>{
 const g={Uint8Array,Number,Error};vm.createContext(g);vm.runInContext(fs.readFileSync('work/atlas-image-guard.js','utf8'),g);
 let reads=0;
 await assert.rejects(g.previewCheckImageFile({type:'image/png',size:20*1024*1024+1,arrayBuffer:async()=>{reads++;}}));assert.equal(reads,0);
 await assert.rejects(g.previewCheckImageFile({type:'image/svg+xml',size:1,arrayBuffer:async()=>{reads++;}}));assert.equal(reads,0);
 await assert.rejects(g.previewCheckImageFile({type:'image/png',size:24,arrayBuffer:async()=>png(20000,20000).buffer}));
 assert.equal((await g.previewCheckImageFile({type:'image/png',size:24,arrayBuffer:async()=>png(512,512).buffer})).width,512);
 const webpl=new Uint8Array(25);webpl.set(Buffer.from('RIFF'));webpl.set(Buffer.from('WEBPVP8L'),8);webpl[20]=47;webpl[21]=255;webpl[22]=195;webpl[23]=127;assert.equal(g.previewImageHeader(webpl).width,1024);assert.equal(g.previewImageHeader(webpl).height,512);
 let canvas=0,decodes=0;
 const layer=fs.readFileSync('work/atlas-preview-layers.js','utf8');
 const c={...g,Uint8Array,atob:s=>Buffer.from(s,'base64').toString('binary'),document:{createElement:()=>{canvas++;throw Error('canvas must not run');}},Image:class{set src(v){decodes++;this.width=this.naturalWidth=20000;this.height=this.naturalHeight=20000;this.onload();}}};vm.createContext(c);
 vm.runInContext(fs.readFileSync('work/atlas-image-guard.js','utf8'),c);
 vm.runInContext(layer.slice(layer.indexOf('function readPreviewImage('),layer.indexOf('function previewReferenceReady(')),c);
 await assert.rejects(c.readPreviewImage('blob:test'));assert.equal(canvas,0);assert.equal(decodes,1,'decoded dimensions rechecked');
 await assert.rejects(c.readPreviewImage('data:image/png;base64,'+Buffer.from(png(20000,20000)).toString('base64')));assert.equal(decodes,1,'invalid preset asset metadata rejected before decode');
 console.log('PASS image type/size rejected before read; PNG/JPEG/WebP dimension metadata; preset data URL checked before decode; decoded dimension guard before canvas');
})().catch(error=>{console.error(error);process.exitCode=1;});
{
 const layer=fs.readFileSync('work/atlas-preview-layers.js','utf8'),c={window:{},cleanPreviewDocument:()=>true,atob:s=>Buffer.from(s,'base64').toString('binary'),Uint8Array};vm.createContext(c);vm.runInContext(fs.readFileSync('work/atlas-image-guard.js','utf8'),c);vm.runInContext(layer.slice(layer.indexOf('window.AtlasPreviewValidation='),layer.indexOf('function readPreviewImage(')),c);
 const asset=(w,h)=>'data:image/png;base64,'+Buffer.from(png(w,h)).toString('base64');
 assert.equal(c.window.AtlasPreviewValidation.document({layers:[{asset:asset(512,512)}]}),true);
 assert.equal(c.window.AtlasPreviewValidation.document({layers:[{asset:asset(20000,20000)}]}),false);
 assert.equal(c.window.AtlasPreviewValidation.document({layers:[{asset:'data:image/png;base64,AA=='}]}),false);
 console.log('PASS imported scene asset metadata validated before any library writes');
}
(async()=>{
 const updates=[],calls=[],ctx={MAX_LIBRARY_BYTES:64*1024*1024,FORMAT:'color-atlas-library',BUDGET:8192,BUILTIN:new Set(),TextEncoder,window:{AtlasPreviewValidation:{document:()=>true,palette:p=>Boolean(p.name&&p.layers&&p.activeLayer)}},say:()=>{},model:()=>({state:{},m:{}}),store:{replace:async x=>updates.push(x),get:()=>null,set:()=>{}},hostStore:async action=>{calls.push(action);return[];},setTimeout:()=>0};vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('async function importLibrary'),source.indexOf("bar.querySelector('[data-library-io=\"export\"]')")),ctx);
 await ctx.importLibrary({size:1,text:async()=>JSON.stringify({format:ctx.FORMAT,version:1,palettes:[{id:'user-bad'}]})});assert.equal(updates.length,0,'malformed palette must never be imported');assert.equal(calls.length,0,'palette rejection precedes host requests');
 const target={id:'layer',asset:'original'},drop={previewImages:[target],previewStatus:()=>{},previewCheckImageFile:async()=>{throw Error('dimensions');},readPreviewImage:async()=>{throw Error('decode forbidden');},URL:{createObjectURL:()=>{throw Error('blob forbidden');},revokeObjectURL(){}},Map};let reads=0;drop.readPreviewImage=async()=>{reads++;return{};};vm.createContext(drop);const s=fs.readFileSync('work/atlas-layer-drop.js','utf8');vm.runInContext(s.slice(0,s.indexOf('(()=>{')),drop);await drop.atlasReplaceDroppedImage({type:'image/png',size:1},'layer');assert.equal(reads,0,'dropped image preflight must run before decoding');assert.equal(target.asset,'original');
 console.log('PASS malformed palette zero writes and dropped oversized metadata zero decodes');
})().catch(error=>{console.error(error);process.exitCode=1;});
(async()=>{
 const canonical=fs.readFileSync('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html','utf8'),ctx={window:{},TextEncoder,structuredClone};vm.createContext(ctx);
 vm.runInContext(canonical.match(/function validGradientLayer\(layer\)\{[^\n]+/)[0],ctx);
 vm.runInContext(canonical.slice(canonical.indexOf('function cleanUserPalettes('),canonical.indexOf('function hasLibraryPreset(')),ctx);
 const layer=fs.readFileSync('work/atlas-preview-layers.js','utf8');vm.runInContext(layer.slice(layer.indexOf('window.AtlasPreviewValidation='),layer.indexOf('function readPreviewImage(')),ctx);
 const palette={id:'user-valid',name:'Valid',description:'',activeLayer:'emission',layers:{emission:{colors:[{t:0,hex:'#000000'},{t:1,hex:'#FFFFFF'}],alphas:[{t:0,a:1},{t:1,a:1}],transition:'smooth'}}};
 assert.equal(ctx.window.AtlasPreviewValidation.palette(palette),true);
 for(const p of [{id:'user-bad'},{...palette,name:''},{...palette,activeLayer:'unknown'},{...palette,layers:{emission:{colors:[],alphas:[],transition:'smooth'}}}])assert.equal(ctx.window.AtlasPreviewValidation.palette(p),false);
 const updates=[],calls=[];Object.assign(ctx,{MAX_LIBRARY_BYTES:64*1024*1024,FORMAT:'color-atlas-library',BUDGET:8192,BUILTIN:new Set(),say:()=>{},model:()=>({state:{},m:{}}),store:{replace:async x=>updates.push(x),get:()=>null,set:()=>{}},hostStore:async action=>{calls.push(action);return[];},setTimeout:()=>0});
 vm.runInContext(source.slice(source.indexOf('async function importLibrary'),source.indexOf("bar.querySelector('[data-library-io=\"export\"]')")),ctx);
 await ctx.importLibrary({size:1,text:async()=>JSON.stringify({format:ctx.FORMAT,version:1,palettes:[palette]})});assert.equal(updates.length,1);assert.equal(updates[0].modelContent.userPalettes[0].id,palette.id);
 console.log('PASS exact core palette schema rejects malformed entries and imports a real complete palette');
})().catch(error=>{console.error(error);process.exitCode=1;});
