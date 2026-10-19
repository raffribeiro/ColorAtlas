const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const boot=fs.readFileSync('work/check_role_random.cjs','utf8').split('const map=hex')[0],box={require,console,process,structuredClone};
vm.runInNewContext(boot+';globalThis.a=app;',box);const a=box.a;a.state.system="vfx";
const doc=JSON.parse(fs.readFileSync('work/default-preview.json','utf8'));
const gray=Uint8Array.from({length:512*512},(_,i)=>64+i%128),alpha=new Uint8Array(gray.length).fill(255);
const y=hex=>{const v=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722;};
for(const mode of ['auto','perceptual','colorplay','monochromatic','analogous','complementary','split','triadic','tetradic','warm','cool']){
 const scene=structuredClone(doc.layers).map(p=>({...p,gray,alpha})),smoke=scene.find(p=>p.name==='Explosion_Smoke');
 a.setScene(scene,[smoke.id]);a.state.randomType=mode;
 const original=structuredClone(smoke.map),fixed=JSON.stringify(scene.filter(p=>p!==smoke).map(p=>p.map)),cs=[],hues=[];
 let seed=73;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
 for(let n=0;n<16;n++){
  const previous=structuredClone(smoke.map);a.randomPreviewLayers(random);a.syncPreviewLayer();
  assert.equal(JSON.stringify(scene.filter(p=>p!==smoke).map(p=>p.map)),fixed,'OFF layers unchanged');
  for(const id of ['emission','smoke']){
   const ramp=smoke.map.layers[id],base=original.layers[id];
   assert.deepEqual(Array.from(ramp.colors,k=>k.t),Array.from(base.colors,k=>k.t));
   assert.equal(JSON.stringify(ramp.alphas),JSON.stringify(base.alphas));
   ramp.colors.forEach((k,i)=>assert(Math.abs(y(k.hex)-y(previous.layers[id].colors[i].hex))<.008,'Point luminance '+mode+' iteration '+n+' '+id+' '+i+' '+k.hex+' vs '+previous.layers[id].colors[i].hex));
  }
  const ramp=smoke.map.layers[smoke.map.active].colors;
  const color=a.gradientSample(.35,ramp,[{t:0,a:1},{t:1,a:1}],'smooth');
  const hex='#'+color.rgb.map(x=>Math.round((x<=.0031308?12.92*x:1.055*x**(1/2.4)-.055)*255).toString(16).padStart(2,'0')).join('');
  const p=a.rgbToLab(hex);cs.push(Math.hypot(p.a,p.b));hues.push(Math.atan2(p.b,p.a));
 }
 const median=[...cs].sort((a,b)=>a-b)[8],spread=Math.max(...hues.flatMap(h=>hues.map(q=>Math.abs(Math.atan2(Math.sin(h-q),Math.cos(h-q))))));
 console.log(mode,'mid-smoke median chroma',median.toFixed(1),'hue spread degrees',Math.round(spread*180/Math.PI));
 assert(median>=10,'Smoke must retain visible midtone chroma across repeated Random');
 assert(spread>(['warm','cool'].includes(mode)?Math.PI/12:Math.PI/2),'Smoke must explore distinct hue families');
}
console.log('PASS: repeated guided Smoke Random varies hue/chroma while retaining luminance, spacing, alpha and OFF layers.');
