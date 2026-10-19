// ColorPlay contextual generation
// Albers-inspired experiments; the scores and thresholds below are app heuristics.
const colorPlayBackgrounds=['#151b23','#e4e8ed'];
function previewGradientSample(t,layers,view=state.explosionView,active=state.gradientLayer,split=state.explosionSplit){
 if(!layers)return gradientSample(t);
 const sample=(id,u)=>{const p=layers[id];return gradientSample(u,p.colors,p.alphas,p.transition||'smooth');};
 if(view==='active')return sample(active,t);
 const e=sample('emission',Math.max(0,Math.min(1,(t-split)/(1-split)))),s=sample('smoke',Math.max(0,Math.min(1,t/split))),x=Math.max(0,Math.min(1,(t-split+.1)/.2)),mask=x*x*(3-2*x),ea=view==='smoke'?0:mask*e.alpha,sa=view==='emission'?0:(1-mask)*s.alpha,total=ea+sa;
 return {rgb:e.rgb.map((v,i)=>total?(v*ea+s.rgb[i]*sa)/total:0),alpha:total};
}
function colorPlayContext(pixels=explosionPixels,alphas=explosionAlpha){
 if(!pixels||!alphas||pixels.length!==512*512||alphas.length!==pixels.length)return null;
 const size=32,step=16,samples=[],histogram=new Float64Array(256);let total=0;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  let alpha=0,value=0;
  for(let dy=0;dy<step;dy++)for(let dx=0;dx<step;dx++){const i=(y*step+dy)*512+x*step+dx,a=alphas[i]/255;alpha+=a;value+=pixels[i]*a;histogram[pixels[i]]+=a;total+=a;}
  samples.push({v:alpha?Math.round(value/alpha):0,alpha:alpha/(step*step)});
 }
 return total?{size,samples,histogram,total}:null;
}
function colorPlayBounds(context,layer){
 if(!context)return [.6,.9];
 const hist=new Float64Array(256);let total=0;
 for(let i=0;i<256;i++){
  const t=i/255,split=state.explosionSplit,x=Math.max(0,Math.min(1,(t-split+.1)/.2)),mask=x*x*(3-2*x),active=state.explosionView==='active';
  const u=active?t:layer==='emission'?Math.max(0,Math.min(1,(t-split)/(1-split))):Math.max(0,Math.min(1,t/split));
  const weight=context.histogram[i]*(active?1:layer==='emission'?mask:1-mask);
  hist[Math.round(u*255)]+=weight;total+=weight;
 }
 if(!total)return [.6,.9];
 const quantile=f=>{let sum=0;for(let i=0;i<256;i++){sum+=hist[i];if(sum>=total*f)return i/255;}return 1;};
 const b1=Math.max(.12,Math.min(.82,quantile(.70))),b2=Math.max(b1+.08,Math.min(.98,quantile(.92)));
 return [b1,b2];
}
function colorPlayLayers(pair){return Object.fromEntries(importanceLayerDefinitions.map(({id})=>[id,{colors:pair[id],alphas:state.gradientLayers[id].alphas,transition:'smooth'}]));}
function colorPlayLUT(layers,view=state.explosionView,active=state.gradientLayer){
 return Array.from({length:256},(_,v)=>{const s=previewGradientSample(v/255,layers,view,active);return {rgb:s.rgb.map(c=>Math.round(encodeSRGB(c)*255)),alpha:Math.round(s.alpha*255)/255};});
}
function colorPlayComposite(sample,sourceAlpha,background){const a=sample.alpha*sourceAlpha;return sample.rgb.map((v,i)=>Math.round(v*a+background[i]*(1-a)));}
function colorPlayViewScore(lut,context,background){
 const bg=background.match(/[a-f0-9]{2}/gi).map(s=>parseInt(s,16));
 const colors=context.samples.map(p=>{const s=lut[p.v],bytes=colorPlayComposite(s,p.alpha,bg),q=rgbToLab('#'+bytes.map(v=>v.toString(16).padStart(2,'0')).join(''));return {q:[q.l/100,q.a/250,q.b/250],a:s.alpha*p.alpha,c:Math.hypot(q.a,q.b)/250};});
 let mass=0,chroma=0,edge=0,edges=0,extreme=0;
 for(let i=0;i<colors.length;i++){
  const p=colors[i];mass+=p.a;chroma+=p.c*p.a;
  for(const j of [i%context.size<context.size-1?i+1:-1,i+context.size<colors.length?i+context.size:-1])if(j>=0){const n=colors[j],w=Math.min(p.a,n.a),d=Math.hypot(...p.q.map((v,k)=>v-n.q[k]));edges+=w;edge+=Math.min(d/.15,1)*w;extreme+=Math.max(0,d-.30)*w;}
 }
 if(mass<1e-8)return 0;
 const mean=chroma/mass,accent=colors.reduce((sum,p)=>sum+(p.c>mean+.03?p.a:0),0)/mass;
 const area=Math.max(0,1-Math.abs(accent-.16)/.20);
 return .65*(edges?edge/edges:0)+.35*area-(edges?extreme/edges:0);
}
function colorPlayScore(pair,context){
 if(!context)return .20*paletteCandidateScore(pair);
 const layers=colorPlayLayers(pair),lut=colorPlayLUT(layers);
 let score=Math.min(...colorPlayBackgrounds.map(bg=>colorPlayViewScore(lut,context,bg)));
 // In Active view, give the other generated layer a smaller independent check.
 if(state.explosionView==='active'){const other=state.gradientLayer==='emission'?'smoke':'emission',second=colorPlayLUT(layers,'active',other);score=.75*score+.25*Math.min(...colorPlayBackgrounds.map(bg=>colorPlayViewScore(second,context,bg)));}
 return score+.20*paletteCandidateScore(pair);
}
function chooseColorPlayCandidate(candidates,random=Math.random){const sorted=[...candidates].sort((a,b)=>b.score-a.score),shortlist=sorted.filter(c=>c.score>=sorted[0].score-.12).slice(0,4);return shortlist[Math.min(shortlist.length-1,Math.floor(random()*shortlist.length))];}
function makeColorPlayPair(random=Math.random){
 const context=colorPlayContext(),bounds=Object.fromEntries(importanceLayerDefinitions.map(({id})=>[id,colorPlayBounds(context,id)])),candidates=[];
 for(let attempt=0;attempt<16;attempt++){
  const modes=['analogous','complementary','split','triadic'],mode=modes[Math.min(3,Math.floor(random()*4))],base=random()*360,offsets=harmonyOffsets(mode),plan={base,offsets,bounds,bright:false,chroma:22+random()*36,smoke:.45+random()*.5,power:.8+random()*.4,focus:2,peaks:offsets.map(offset=>huePeakLightness(base+offset))},pair={};
  for(const {id} of importanceLayerDefinitions)pair[id]=directedPalette(state.gradientLayers[id].colors,plan,id);
  candidates.push({pair,score:colorPlayScore(pair,context)});
 }
 return chooseColorPlayCandidate(candidates,random).pair;
}
function syncColorPlayControl(){const button=$('[data-action="colorplay-study"]');if(button)button.hidden=state.randomType!=='colorplay';}
function openColorPlayStudy(){
 storeGradientLayer();const dialog=$('#colorplay-dialog'),context=colorPlayContext(),lut=colorPlayLUT(state.gradientLayers);
 const selected=state.gradientSelection.kind==='color'?state.gradientColors[state.gradientSelection.index]:state.gradientColors[Math.floor(state.gradientColors.length/2)],hex=selected.hex;
 for(let i=0;i<2;i++){
  const ground=state.gradientColors[i?state.gradientColors.length-1:0].hex;
  $('#colorplay-ground-'+i).style.backgroundColor=ground;$('#colorplay-patch-'+i).style.backgroundColor=hex;
  $('#colorplay-ground-'+i).setAttribute('aria-label','Surround '+ground+', identical center '+hex);
  const canvas=$('#colorplay-preview-'+i);canvas.hidden=!context;
  if(context){canvas.width=canvas.height=512;const ctx=canvas.getContext('2d'),image=ctx.createImageData(512,512),bg=colorPlayBackgrounds[i].match(/[a-f0-9]{2}/gi).map(s=>parseInt(s,16));for(let j=0;j<explosionPixels.length;j++)image.data.set([...colorPlayComposite(lut[explosionPixels[j]],explosionAlpha[j]/255,bg),255],j*4);ctx.putImageData(image,0,0);}
 }
 $('#colorplay-hex').textContent=hex.toUpperCase();
 $('#colorplay-context-note').textContent=context?'Same palette on dark and light backgrounds. Opaque regions look identical. Bloom and analysis filters are omitted.':'The reference image is still loading or has no visible pixels. ColorPlay uses ramp relationships until it is available.';
 dialog.showModal();$('[data-action="colorplay-close"]').focus();
}
if($('#colorplay-dialog')){
 $('[data-action="colorplay-study"]').addEventListener('click',openColorPlayStudy);
 $('[data-action="colorplay-close"]').addEventListener('click',()=>$('#colorplay-dialog').close());
 $('#colorplay-dialog').addEventListener('close',()=>{$('[data-action="colorplay-study"]').focus();});
 $('#colorplay-dialog').addEventListener('click',e=>{if(e.target!==$('#colorplay-dialog'))return;const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();});
}
// End ColorPlay contextual generation
