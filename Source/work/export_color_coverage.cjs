// Export the current library through the app's actual Smooth interpolation.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const harness=fs.readFileSync('work/check_library_folders.cjs','utf8').split('const app=context.inspectMunsell;')[0];
const expose='globalThis.inspectMunsell={gradientPresets,blackbodyHex,gradientSample,rgbToLab}; new ResizeObserver';
const adapted=harness.replace(/globalThis\.inspectMunsell=\{[^;]*\}; new ResizeObserver/,expose)+'\nglobalThis.coverageApp=context.inspectMunsell;';
const sandbox={require,console,process,structuredClone};vm.runInNewContext(adapted,sandbox);const app=sandbox.coverageApp;
const samplesPerPreset=257;
const presets=app.gradientPresets.map(p=>{
 const temperatures=[1000,1800,2700,4000,5500,6500,9000,12000];
 const colors=p.id==='blackbody'?temperatures.map(app.blackbodyHex):p.colors;
 const positions=p.id==='blackbody'?temperatures.map(k=>(k-1000)/11000):colors.map((_,i)=>p.positions?.[i]??i/(colors.length-1));
 const keys=colors.map((hex,i)=>({hex,t:positions[i]}));
 assert(keys.length>=2&&keys.length<=16,p.id);assert(keys.every((k,i)=>!i||k.t>=keys[i-1].t));
 const stops=colors.map(hex=>{const q=app.rgbToLab(hex);return [q.l/100,q.a/250,q.b/250]});
 const samples=Array.from({length:samplesPerPreset},(_,i)=>app.gradientSample(i/(samplesPerPreset-1),keys,[{t:0,a:1},{t:1,a:1}],'smooth').rgb);
 const coverageSamples=[];
 for(let i=1;i<keys.length;i++){
  const steps=Math.max(1,Math.ceil(Math.hypot(...stops[i].map((v,j)=>v-stops[i-1][j]))/.001));
  for(let j=0;j<=steps;j++)coverageSamples.push(app.gradientSample(keys[i-1].t+(keys[i].t-keys[i-1].t)*j/steps,keys,[{t:0,a:1},{t:1,a:1}],'smooth').rgb);
 }
 return {id:p.id,name:p.name,category:p.category,dataType:p.dataType||'artistic',colors,positions,stops,samples,coverageSamples};
});
assert.equal(presets.length,1086);assert.equal(new Set(presets.map(p=>p.id)).size,presets.length);
fs.writeFileSync('work/color-coverage-samples.json',JSON.stringify({source:'/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html',samplesPerPreset,presets}));
console.log(`Exported ${presets.length} current templates and ${presets.length*samplesPerPreset} rendered linear-sRGB samples.`);
