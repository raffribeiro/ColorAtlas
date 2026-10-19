const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let bootstrap=fs.readFileSync('work/check_simple_random.cjs','utf8').split("console.log('PASS: full app")[0];
bootstrap=bootstrap.replace('resetDefaultExplosion,restore};',`resetDefaultExplosion,restore,previewDocument,randomPreviewLayers,
 setStack:stack=>{previewImages=stack;previewSelected=stack[1].id;previewSelection=new Set([stack[1].id]);previewRandomSelection=new Set([stack[1].id,stack[2].id]);applyPreviewSelection(stack[1]);},
 getStack:()=>previewDocument(previewImages,previewSelected)};`.replace(/\n/g,''));
if(process.env.ATLAS_TEST_SOURCE)bootstrap=bootstrap.replace("const file='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';",'const file='+JSON.stringify(process.env.ATLAS_TEST_SOURCE)+';');
bootstrap=bootstrap.replace("][0][1];","].find(m=>m[1].includes('const raw=JSON.parse'))[1];");
const h={require,console,process,structuredClone};vm.runInNewContext(bootstrap+';globalThis.app=context.inspectMunsell;globalThis.node=node;',h);
const app=h.app,state=app.state;
const map=i=>({layers:Object.fromEntries(['emission','smoke'].map(id=>[id,{colors:[{t:0,hex:'#102030'},{t:.23,hex:'#506070'},{t:1,hex:'#abcdef'}],alphas:[{t:0,a:.2},{t:1,a:.9}],preset:'custom',transition:'bands'}])),active:i===2?'smoke':'emission',view:'combined',split:.62});
for(const mode of ['perceptual','auto','true-random','colorplay','monochromatic']){
 const stack=[0,1,2].map(i=>({id:'image-'+i,name:'Image '+i,asset:null,visible:i!==2,opacity:.7,blend:'screen',map:map(i)}));
 app.setStack(stack);state.randomType=mode;const before=JSON.parse(JSON.stringify(app.getStack()));
 h.node('[data-action="random-all-layers"]').handlers.click();const after=JSON.parse(JSON.stringify(app.getStack()));
 assert.deepEqual(after.layers[0],before.layers[0],mode+': unselected image is unchanged');assert.equal(after.selected,'image-1');
 for(const index of [1,2]){
  for(const id of ['emission','smoke']){
   const ramp=after.layers[index].map.layers[id],old=before.layers[index].map.layers[id];
   assert.notDeepEqual(ramp.colors,old.colors,mode+': selected ramp changes');assert.equal(ramp.colors.length,old.colors.length);assert.deepEqual(ramp.alphas,old.alphas);
   assert.equal(ramp.transition,'smooth');assert(ramp.colors.every(k=>/^#[a-f0-9]{6}$/i.test(k.hex)));
  }
  for(const key of ['id','visible','opacity','blend'])assert.equal(after.layers[index][key],before.layers[index][key]);
  for(const key of ['active','view','split'])assert.equal(after.layers[index].map[key],before.layers[index].map[key]);
 }
 assert.deepEqual(JSON.parse(JSON.stringify(state.gradientColors)),after.layers[1].map.layers.emission.colors,'Editor returns to the active image after batch generation');
}
console.log('PASS: full app handler with real Random generators updates only selected images in five modes, preserves alpha/counts/metadata and returns to the active map.');
