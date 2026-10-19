// Bright-source Random integration
function sourceBrightStrength(){
 if(!explosionPixels||!explosionAlpha||explosionPixels.length!==explosionAlpha.length)return 0;
 let weight=0,total=0;for(let i=0;i<explosionPixels.length;i++){const a=explosionAlpha[i]/255;weight+=a;total+=explosionPixels[i]*a;}
 return weight?Math.max(0,Math.min(1,(total/weight/255-.65)/.15)):0;
}
function atlasKeepLuminance(keys,base,random=()=>.5){
 const y=hex=>{const v=hex.match(/[a-f0-9]{2}/gi).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722;};
 return keys.map((k,i)=>{if(!base[i]||(previewImages.find(p=>p.id===previewSelected)?.blend==='add'&&k.t===Math.min(...keys.map(k=>k.t))))return k;const target=y(base[i].hex),p=rgbToLab(k.hex),c=Math.min(previewImages.find(p=>p.id===previewSelected)?.blend==='add'&&k.t===[...new Set(keys.map(k=>k.t))].sort((a,b)=>a-b)[1]?5:Infinity,Math.hypot(p.a,p.b)*(.75+random()*.5)),h=Math.atan2(p.b,p.a),color=l=>{const q=fitLabToSRGB(l,c*Math.cos(h),c*Math.sin(h));return labColor(q.l,q.a,q.b).hex;};let lo=0,hi=100;for(let j=0;j<18;j++){const mid=(lo+hi)/2;if(y(color(mid))<target)lo=mid;else hi=mid;}return {...k,hex:color((lo+hi)/2)};});
}
function atlasVaryAddFamily(base,generated,random){
 const labs=base.map(k=>rgbToLab(k.hex)),fresh=generated.map(k=>rgbToLab(k.hex)),hue=points=>Math.atan2(points.reduce((n,p)=>n+p.b,0),points.reduce((n,p)=>n+p.a,0)),turn=hue(fresh)-hue(labs);
 return base.map((key,i)=>{const p=labs[i];if(key.hex.toLowerCase()==='#000000')return {...key};const l=Math.max(0,Math.min(100,p.l+(random()-.5)*8)),c=Math.hypot(p.a,p.b)*(.85+random()*.3),h=Math.atan2(p.b,p.a)+turn+(random()-.5)*12*Math.PI/180,fit=fitLabToSRGB(l,c*Math.cos(h),c*Math.sin(h));return {...key,hex:labColor(fit.l,fit.a,fit.b).hex};});
}
function brightSourcePalette(keys,layer,strength){
 const black=previewImages.find(p=>p.id===previewSelected)?.blend==='add',low=Math.min(...keys.map(k=>k.t)),positions=[...new Set(keys.map(k=>k.t))].sort((a,b)=>a-b),second=positions[1];
 const luma=hex=>hex.match(/[a-f0-9]{2}/gi).reduce((sum,v,i)=>sum+parseInt(v,16)/255*[.2126,.7152,.0722][i],0);
 return keys.map(key=>{
  if(black&&key.t===low)return {...key,hex:'#000000'};
  if(black){const lab=rgbToLab(key.hex),c=Math.hypot(lab.a,lab.b),h=Math.atan2(lab.b,lab.a),desired=key.t===second?Math.min(c,5):c,fit=fitLabToSRGB(lab.l,desired*Math.cos(h),desired*Math.sin(h));key={...key,hex:labColor(fit.l,fit.a,fit.b).hex};}
  const t=state.explosionView==='active'?key.t:layer==='emission'?state.explosionSplit+(1-state.explosionSplit)*key.t:state.explosionSplit*key.t,target=t*strength;
  if(luma(key.hex)>=target)return key;
  const lab=rgbToLab(key.hex);let lo=lab.l,hi=100,hex=key.hex;
  const color=l=>{const fit=fitLabToSRGB(l,lab.a,lab.b);return labColor(fit.l,fit.a,fit.b).hex;};
  for(let i=0;i<10;i++){const mid=(lo+hi)/2;if(luma(color(mid))>=target)hi=mid;else lo=mid;}
  hex=color(hi);return {...key,hex};
 });
}
(()=>{
 const generate=randomAllLayers;
 randomAllLayers=function(random=Math.random,render=true){
  if(state.randomType==='true-random')return generate(random,render);
  const strength=['auto','perceptual'].includes(state.randomType)?sourceBrightStrength():0;
  storeGradientLayer();const bases=Object.fromEntries(importanceLayerDefinitions.map(({id})=>[id,state.gradientLayers[id].colors.map(k=>({...k}))])),positions=Object.fromEntries(importanceLayerDefinitions.map(({id})=>[id,state.gradientLayers[id].colors.map(k=>k.t)]));
  generate(random,false);
  for(const {id} of importanceLayerDefinitions){const keys=state.gradientLayers[id].colors,base=positions[id];if(keys.length===base.length){keys.forEach((k,i)=>k.t=base[i]);if(['auto','perceptual'].includes(state.randomType)&&previewImages.find(p=>p.id===previewSelected)?.blend==='add')state.gradientLayers[id].colors=atlasVaryAddFamily(bases[id],keys,random);}}
  for(const {id} of importanceLayerDefinitions)state.gradientLayers[id].colors=brightSourcePalette(state.gradientLayers[id].colors,id,strength);
  for(const {id} of importanceLayerDefinitions)state.gradientLayers[id].colors=atlasKeepLuminance(state.gradientLayers[id].colors,bases[id]);
  state.gradientColors=state.gradientLayers[state.gradientLayer].colors;loadGradientColor();
  if(render){drawGradient();remember();}
 };
})();
// End Bright-source Random integration
