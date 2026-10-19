const fs=require('fs'),vm=require('vm'),assert=require('assert');
const file='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const html=fs.readFileSync(file,'utf8');
assert(html.includes('<option value="colorplay">ColorPlay</option>'),'ColorPlay must be a selectable, persisted random mode');
assert(html.includes('id="colorplay-dialog"'),'ColorPlay needs a labeled context comparison');
// Reuse the existing full-app mock bootstrap rather than duplicating color math.
let bootstrap=fs.readFileSync('work/check_simple_random.cjs','utf8').split("console.log('PASS: full app")[0];
bootstrap=bootstrap.replace('resetDefaultExplosion,restore};','resetDefaultExplosion,restore,previewGradientSample,colorPlayContext,colorPlayBounds,colorPlayScore,chooseColorPlayCandidate,makeColorPlayPair,openColorPlayStudy,syncColorPlayControl,setImage:(p,a)=>{explosionPixels=p;explosionAlpha=a;},muteDraw:()=>{drawGradient=()=>{};}};');
const harness={require,process,console,structuredClone};vm.runInNewContext(bootstrap+';globalThis.app=context.inspectMunsell;globalThis.node=node;',harness);
const app=harness.app,state=app.state,node=harness.node;
const alpha=[{t:0,a:.3},{t:1,a:.8}],keys=[{t:0,hex:'#142139'},{t:.28,hex:'#4a5780'},{t:.71,hex:'#d1787a'},{t:1,hex:'#f8edd3'}];
state.gradientLayers={emission:{colors:structuredClone(keys),alphas:structuredClone(alpha),transition:'smooth'},smoke:{colors:structuredClone(keys),alphas:structuredClone(alpha),transition:'smooth'}};
state.gradientLayer='smoke';state.gradientColors=state.gradientLayers.smoke.colors;state.gradientAlphas=state.gradientLayers.smoke.alphas;state.explosionView='combined';state.explosionSplit=.62;
// Spatial rearrangement with the same histogram must affect the context score.
const image=pattern=>{const p=new Uint8Array(512*512),a=new Uint8Array(p.length).fill(255);for(let y=0;y<512;y++)for(let x=0;x<512;x++)p[y*512+x]=pattern(x,y);return[p,a]};
const blocks=image((x,y)=>x<256?35:220),checks=image((x,y)=>((x>>4)+(y>>4))%2?220:35);
const pair={emission:keys,smoke:keys};
const c1=app.colorPlayContext(...blocks),c2=app.colorPlayContext(...checks);
assert.equal(c1.samples.length,1024);assert.equal(c2.samples.length,1024);
assert(Math.abs(app.colorPlayScore(pair,c1)-app.colorPlayScore(pair,c2))>1e-4,'Adjacency matters even with equal coverage');
const transparent=app.colorPlayContext(blocks[0],new Uint8Array(blocks[0].length));assert.equal(transparent,null,'Invisible source pixels do not invent context');
const altered=blocks[0].slice();for(let i=0;i<altered.length;i++)if(i%512<256)altered[i]=255;
const halfAlpha=blocks[1].slice();for(let i=0;i<halfAlpha.length;i++)if(i%512<256)halfAlpha[i]=0;
assert.deepEqual(app.colorPlayContext(blocks[0],halfAlpha).histogram,app.colorPlayContext(altered,halfAlpha).histogram,'Hidden RGB never changes coverage');
// Shared mapping must preserve the renderer's active and combined alpha math.
for(const view of ['active','combined','emission','smoke'])for(const t of [0,.3,.62,.7,1]){
 const result=app.previewGradientSample(t,state.gradientLayers,view,'smoke',.62);
 if(view==='active')assert.deepEqual(result,app.gradientSample(t,keys,alpha,'smooth'));
 else {const x=Math.max(0,Math.min(1,(t-.62+.1)/.2)),m=x*x*(3-2*x),e=app.gradientSample(Math.max(0,Math.min(1,(t-.62)/.38)),keys,alpha,'smooth'),s=app.gradientSample(Math.max(0,Math.min(1,t/.62)),keys,alpha,'smooth'),ea=view==='smoke'?0:m*e.alpha,sa=view==='emission'?0:(1-m)*s.alpha;
  assert(Math.abs(result.alpha-ea-sa)<1e-12);result.rgb.forEach((v,i)=>assert(Math.abs(v-(ea+sa?(e.rgb[i]*ea+s.rgb[i]*sa)/(ea+sa):0))<1e-12));}
}
// Image distribution influences construction, not just a generic hue score.
const low=app.colorPlayContext(...image(x=>x<460?25:200)),high=app.colorPlayContext(...image(x=>x<460?200:25));
state.explosionView='active';
assert.notDeepEqual(app.colorPlayBounds(low,'smoke'),app.colorPlayBounds(high,'smoke'));
const seeded=()=>{let s=83;return ()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);};
app.setImage(...image(x=>x<460?25:200));const lowPair=app.makeColorPlayPair(seeded());
app.setImage(...image(x=>x<460?200:25));const highPair=app.makeColorPlayPair(seeded());
assert.notEqual(JSON.stringify(lowPair),JSON.stringify(highPair),'The same random sequence adapts to a different scalar distribution');
state.explosionView='combined';
let seed=53;const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
app.setImage(...checks);app.muteDraw();state.randomType='colorplay';const beforeAlpha=JSON.stringify(state.gradientLayers.smoke.alphas),positions=keys.map(k=>k.t);
app.randomAllLayers(rng);
assert.equal(state.gradientLayer,'smoke');assert.equal(state.explosionView,'combined');assert.equal(JSON.stringify(state.gradientAlphas),beforeAlpha);
for(const layer of Object.values(state.gradientLayers)){assert.deepEqual(Array.from(layer.colors,k=>k.t),positions);assert.equal(layer.transition,'smooth');assert(layer.colors.every(k=>/^#[a-f0-9]{6}$/i.test(k.hex)));}
app.restore({randomType:'colorplay',randomDefaultsVersion:1});assert.equal(state.randomType,'colorplay');app.drawSystem();assert.equal(node('#random-type').value,'colorplay');
assert.equal(node('[data-action="colorplay-study"]').hidden,false);
// Bounded shortlist keeps a little diversity and never selects a poor candidate.
const candidates=[{score:0,id:'poor'},{score:.9,id:'good'},{score:1,id:'best'}];
assert.notEqual(app.chooseColorPlayCandidate(candidates,()=>0).id,'poor');assert.notEqual(app.chooseColorPlayCandidate(candidates,()=>.999).id,'poor');
app.setImage(null,null);app.randomAllLayers(rng);assert(state.gradientColors.every(k=>/^#[a-f0-9]{6}$/i.test(k.hex)),'Loading/empty-image fallback is safe');
// Native comparison dialog is read-only, shares identical HEX and restores focus.
const dialog=node('#colorplay-dialog');dialog.showModal=function(){this.open=true;};dialog.close=function(){this.open=false;this.handlers.close();};
for(let i=0;i<2;i++)node('#colorplay-preview-'+i).getContext=()=>({createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)};},putImageData(data){node('#colorplay-preview-'+i).pixels=data;}});
node('[data-action="colorplay-study"]').focus=function(){this.focused=true;};
const saved=JSON.stringify(state);app.openColorPlayStudy();assert(dialog.open);assert.equal(JSON.stringify(state),saved);assert(node('#colorplay-context-note').textContent.includes('still loading'));
assert.equal(node('#colorplay-patch-0').style.backgroundColor,node('#colorplay-patch-1').style.backgroundColor);
assert.notEqual(node('#colorplay-ground-0').style.backgroundColor,node('#colorplay-ground-1').style.backgroundColor);
node('[data-action="colorplay-close"]').handlers.click();assert(!dialog.open);assert(node('[data-action="colorplay-study"]').focused);
app.setImage(...checks);app.openColorPlayStudy();assert(node('#colorplay-preview-0').pixels);assert(node('#colorplay-preview-1').pixels);assert.equal(JSON.stringify(state),saved);
dialog.getBoundingClientRect=()=>({left:100,right:500,top:100,bottom:500});dialog.handlers.click({target:dialog,clientX:50,clientY:50});assert(!dialog.open);
state.randomType='perceptual';app.syncColorPlayControl();assert(node('[data-action="colorplay-study"]').hidden);
console.log('PASS: ColorPlay context, spatial adjacency, alpha weighting, shared preview math, image-dependent construction, shortlist diversity, persistence and editor invariants.');
