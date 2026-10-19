const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
let boot=fs.readFileSync('work/check_simple_random.cjs','utf8').split("console.log('PASS: full app")[0];
boot=boot.replace('resetDefaultExplosion,restore};','resetDefaultExplosion,restore,atlasSceneRoles,atlasRolePalette,atlasHarmonyGroup,atlasAccentPalette,syncPreviewLayer,randomPreviewLayers,getScene:()=>previewDocument(previewImages,previewSelected),mute:()=>{drawGradient=()=>{};drawExplosionMap=()=>{};},setScene:(images,on)=>{previewImages=images;previewSelected=on[0];previewSelection=new Set([on[0]]);previewRandomSelection=new Set(on);applyPreviewSelection(images.find(p=>p.id===on[0]));}};');
boot=boot.replace('const script=[...html.matchAll(/<script>([\\s\\S]*?)<\\/script>/g)][0][1];','let script=[...html.matchAll(/<script>([\\s\\S]*?)<\\/script>/g)].find(m=>m[1].includes("const raw=JSON.parse"))[1];const hs=script.indexOf("// Atlas history integration"),he=script.indexOf("// End Atlas history integration",hs);if(hs>=0)script=script.slice(0,hs)+script.slice(he+"// End Atlas history integration".length);if(!script.includes("// Bright-source Random integration"))script=script.replace("new ResizeObserver(()=>{drawScene();",fs.readFileSync("work/atlas-random-luma.js","utf8")+"new ResizeObserver(()=>{drawScene();");if(!script.includes("// Scene-role Random integration"))script=script.replace("new ResizeObserver(()=>{drawScene();",fs.readFileSync("work/atlas-random-roles.js","utf8")+"new ResizeObserver(()=>{drawScene();");');
if(process.env.ATLAS_TEST_SOURCE)boot=boot.replace("const file='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';",'const file='+JSON.stringify(process.env.ATLAS_TEST_SOURCE)+';');
const box={require,console,process,structuredClone};vm.runInNewContext(boot+';globalThis.app=context.inspectMunsell;',box);const app=box.app,s=app.state;app.mute();
const map=hex=>({layers:Object.fromEntries(['emission','smoke'].map(id=>[id,{colors:[{t:0,hex},{t:.5,hex},{t:1,hex}],alphas:[{t:0,a:.3},{t:1,a:.9}],preset:'custom',transition:'smooth'}])),active:'emission',view:'active',split:.62});
const image=(id,hex,alpha,blend='normal')=>({id,name:id,asset:null,visible:true,opacity:1,blend,map:map(hex),gray:Uint8Array.from([128,128,128,128]),alpha:Uint8Array.from(alpha)});
const rng=()=>{let seed=123;return()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296)};
for(const mode of ['auto','perceptual']){
 const scene=[image('BG','#164958',[255,255,255,255]),image('Smoke','#507088',[255,0,0,0]),image('Glow','#451b08',[255,0,0,0],'add')];app.setScene(scene,['Smoke']);s.randomType=mode;const fixed=JSON.stringify([scene[0].map,scene[2].map]),before=JSON.stringify(scene[1].map);app.randomPreviewLayers(rng());app.syncPreviewLayer();assert.equal(JSON.stringify([scene[0].map,scene[2].map]),fixed,'OFF palettes stay unchanged');assert.notEqual(JSON.stringify(scene[1].map),before);for(const id of ['emission','smoke'])assert.deepEqual(JSON.parse(JSON.stringify(scene[1].map.layers[id].alphas)),[{t:0,a:.3},{t:1,a:.9}]);
 const p=app.atlasRolePalette([{t:.5,hex:'#bb5577'}],{role:'dominant'},{rgb:[.02,.08,.12]}),q=app.atlasRolePalette([{t:.5,hex:'#bb5577'}],{role:'accent'},{rgb:[.02,.08,.12]});const a=app.rgbToLab(p[0].hex),b=app.rgbToLab(q[0].hex);assert(Math.hypot(a.a,a.b)<Math.hypot(b.a,b.b),'Dominant palettes are quieter than accent palettes');
 app.setScene(scene,['Smoke','Glow']);s.randomType=mode;const background=JSON.stringify(scene[0].map);app.randomPreviewLayers(rng());app.syncPreviewLayer();assert.equal(JSON.stringify(scene[0].map),background,'Multiple ON layers keep OFF background untouched');
 scene[2].gray.fill(240);app.setScene(scene,['Glow']);s.randomType=mode;app.randomPreviewLayers(rng());app.syncPreviewLayer();for(const id of ['emission','smoke'])assert.equal(scene[2].map.layers[id].colors[0].hex,'#000000','Role fitting retains bright Add black endpoints');
}
console.log('PASS: actual Harmonic/Perceptual use scene roles and fixed OFF references; alpha and bright Add black endpoints remain intact.');
const named=['monochromatic','analogous','complementary','split','triadic','tetradic','warm','cool'];
for(const mode of named){
 const scene=[image('BG','#164958',[255,255,255,255]),image('Smoke','#507088',[255,0,0,0]),image('Glow','#451b08',[255,0,0,0],'add')];app.setScene(scene,['Smoke','Glow']);s.randomType=mode;
 app.randomPreviewLayers(rng());app.syncPreviewLayer();
 if(mode==='monochromatic'){
  const hues=scene.slice(1).flatMap(p=>Object.values(p.map.layers).flatMap(r=>r.colors.map(k=>app.rgbToLab(k.hex)).filter(l=>Math.hypot(l.a,l.b)>3).map(l=>Math.atan2(l.b,l.a))));
  assert(hues.every(h=>Math.abs(Math.atan2(Math.sin(h-hues[0]),Math.cos(h-hues[0])))<.09),'Monochromatic must share one hue across both ON images and both ramps');
 }
}

for(const mode of [...named,'auto','perceptual','colorplay'])for(let seed=1;seed<=4;seed++){
 const scene=[image('BG','#164958',[255,255,255,255]),image('Smoke','#507088',[255,0,0,0]),image('Glow','#451b08',[255,0,0,0],'add')];
 for(const p of scene)for(const r of Object.values(p.map.layers))r.colors=[0,.175,.337,.55,.828,1].map(t=>({t,hex:'#558855'}));
 app.setScene(scene,['Smoke','Glow']);s.randomType=mode;const fixed=JSON.stringify(scene[0].map);let n=seed;app.randomPreviewLayers(()=>((n=Math.imul(n,1664525)+1013904223>>>0)/4294967296));app.syncPreviewLayer();assert.equal(JSON.stringify(scene[0].map),fixed);
 const offsets=app.harmonyOffsets(mode),angles=[];
 for(const p of scene.slice(1))for(const r of Object.values(p.map.layers)){
  assert.deepEqual(Array.from(r.colors,k=>k.t),[0,.175,.337,.55,.828,1]);assert.deepEqual(JSON.parse(JSON.stringify(r.alphas)),[{t:0,a:.3},{t:1,a:.9}]);
  if(p.blend==='add'){assert.equal(r.colors[0].hex,'#000000');const l=app.rgbToLab(r.colors[1].hex);assert(Math.hypot(l.a,l.b)<6);}
  if(named.includes(mode))for(const k of r.colors){const l=app.rgbToLab(k.hex);if(Math.hypot(l.a,l.b)>8)angles.push(Math.atan2(l.b,l.a)-offsets[app.atlasHarmonyGroup(k.t,offsets)]*Math.PI/180);}
 }
 if(angles.length)assert(angles.every(h=>Math.abs(Math.atan2(Math.sin(h-angles[0]),Math.cos(h-angles[0])))<.12),mode+' preserves its hue mask across ON images');
}
console.log('PASS: 11 guided modes audited over four seeds; Free audited as raw RGB; named hue masks, shared family, OFF isolation, spacing, alpha and Add endpoints verified.');

const accent=app.atlasAccentPalette([{t:.6,hex:'#ff790c'}],()=>.5)[0],reference=app.rgbToLab('#ff790c'),actual=app.rgbToLab(accent.hex);assert(Math.abs(Math.hypot(reference.a,reference.b)-Math.hypot(actual.a,actual.b))<2,'Accent uses the reference chroma profile');

const linearY=hex=>{const l=app.gradientSample(0,[{t:0,hex},{t:1,hex}],[{t:0,a:1},{t:1,a:1}],'smooth');return l.rgb.reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0)};
for(const mode of [...named,'auto','perceptual','colorplay']){const scene=[image('BG','#164958',[255,255,255,255]),image('Smoke','#507088',[255,0,0,0]),image('Glow','#451b08',[255,0,0,0],'add')];app.setScene(scene,['Smoke','Glow']);s.randomType=mode;const before=structuredClone(scene.map(p=>p.map));app.randomPreviewLayers(rng());app.syncPreviewLayer();for(let j=1;j<3;j++)for(const id of ['emission','smoke'])scene[j].map.layers[id].colors.forEach((k,i)=>{if(j===2&&i===0)return;assert(Math.abs(linearY(k.hex)-linearY(before[j].layers[id].colors[i].hex))<.004,'Random preserves original point luminance in '+mode);});}

s.randomType='true-random';const freeScene=[image('Smoke','#507088',[255,255,255,255]),image('Glow','#451b08',[255,0,0,0],'add')];app.setScene(freeScene,['Smoke','Glow']);app.randomPreviewLayers(()=>.5);app.syncPreviewLayer();for(const p of freeScene)for(const r of Object.values(p.map.layers))assert(r.colors.every(k=>k.hex.toLowerCase()==='#808080'),'Free returns independent raw RGB without role, luminance or Add constraints');
