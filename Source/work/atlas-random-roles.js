// Scene-role Random integration
function atlasSceneRoles(stack,sample=previewGradientSample){
 const fields=stack.map(previewLayerGray),scores=stack.map(()=>0),colors=stack.map(()=>[0,0,0]),n=Math.max(0,...stack.map(p=>p.gray?.length||0));
 const active=stack.map(p=>p.visible&&p.opacity&&p.gray?.length===n&&p.alpha?.length===n),luts=stack.map((p,j)=>active[j]?Array.from({length:256},(_,i)=>{const m=p.map,v=sample(i/255,m.layers,m.view,m.active,m.split);return [...v.rgb,Math.round(v.alpha*255)/255];}):null);
 if(n){const side=Math.sqrt(n),grid=Math.min(32,Math.floor(side)),indices=[];
  if(Number.isInteger(side))for(let y=0;y<grid;y++)for(let x=0;x<grid;x++)indices.push(Math.floor((y+.5)*side/grid)*side+Math.floor((x+.5)*side/grid));
  else for(let i=0;i<Math.min(n,1024);i++)indices.push(Math.floor((i+.5)*n/Math.min(n,1024)));
  for(const i of indices){const values=stack.map((p,j)=>{if(!active[j])return null;const v=luts[j][fields[j][i]];return [v[0],v[1],v[2],v[3]*p.alpha[i]/255*p.opacity];});
   const compose=skip=>{let out=[0,0,0,0];for(let j=0;j<stack.length;j++)if(j!==skip&&values[j])out=previewOver(out,values[j],stack[j].blend);return out;};
   const full=compose(-1);for(let j=0;j<stack.length;j++){const v=values[j];if(!v||!v[3])continue;const without=compose(j),d=Math.hypot(...[0,1,2].map(k=>full[k]*full[3]-without[k]*without[3]),stack[j].blend==='add'?0:.25*(full[3]-without[3]));scores[j]+=d;for(let k=0;k<3;k++)colors[j][k]+=v[k]*d;}
  }
 }
 const total=scores.reduce((a,b)=>a+b,0),order=scores.map((score,j)=>({score,j})).filter(p=>p.score>1e-9&&stack[p.j].blend!=='add').sort((a,b)=>b.score-a.score||a.j-b.j),ranks=new Map(order.map((p,i)=>[p.j,Math.min(i,2)])),names=['dominant','secondary','accent'],targets=[.6,.3,.1];
 return new Map(stack.map((p,j)=>{const rank=p.blend==='add'&&active[j]?2:ranks.get(j);return [p.id,{score:scores[j],share:total?scores[j]/total:0,role:rank===undefined?'inactive':names[rank],target:rank===undefined?0:targets[rank],rgb:scores[j]?colors[j].map(v=>v/scores[j]):[0,0,0]}];}));
}
function atlasRolePalette(keys,info,reference,preserveHue=false,visibleChroma=false){
 const labs=keys.map(k=>rgbToLab(k.hex)),base=Math.atan2(labs.reduce((n,p)=>n+p.b,0),labs.reduce((n,p)=>n+p.a,0)),ref=reference?rgbToLab(rgbHex(reference.rgb.map(encodeSRGB))):null;
 const offset={dominant:0,secondary:30,accent:180}[info.role],angle=!preserveHue&&ref&&Math.hypot(ref.a,ref.b)>3?Math.atan2(ref.b,ref.a)+offset*Math.PI/180-base:0,factor={dominant:.55,secondary:.8,accent:1.1}[info.role],cap={dominant:22,secondary:38,accent:60}[info.role];
 return keys.map((key,i)=>{const lab=labs[i],c=Math.min(cap,Math.max(Math.hypot(lab.a,lab.b)*factor,visibleChroma?cap*.7*Math.sin(Math.PI*lab.l/100):0)),h=Math.atan2(lab.b,lab.a)+angle;let l=lab.l;if(info.role==='accent'&&ref&&c>1)l=ref.l<55?Math.max(l,Math.min(95,ref.l+18)):Math.min(l,Math.max(5,ref.l-18));const fit=fitLabToSRGB(l,c*Math.cos(h),c*Math.sin(h));return {...key,hex:labColor(fit.l,fit.a,fit.b).hex};});
}
function atlasAccentPalette(keys,random=Math.random){
 const profile=[[0,'#000000'],[.07,'#120202'],[.2,'#650b06'],[.4,'#cb2a08'],[.6,'#ff790c'],[.8,'#ffcc45'],[1,'#fff9dc']].map(([t,hex])=>{const p=rgbToLab(hex);return {t,c:Math.hypot(p.a,p.b)};});
 return keys.map(k=>{const p=rgbToLab(k.hex),h=Math.atan2(p.b,p.a);let i=profile.findIndex(q=>q.t>=k.t);if(i<1)i=1;const a=profile[i-1],b=profile[i],u=Math.max(0,Math.min(1,(k.t-a.t)/(b.t-a.t))),c=(a.c+(b.c-a.c)*u)*(.9+random()*.2),fit=fitLabToSRGB(p.l,c*Math.cos(h),c*Math.sin(h));return {...k,hex:labColor(fit.l,fit.a,fit.b).hex};});
}
const atlasNamedHarmony=['monochromatic','analogous','complementary','split','triadic','tetradic','warm','cool'];
function atlasHarmonyGroup(t,offsets){const group=t<.6?0:t<.9?1:2;return offsets.length===4?(group===0?0:group===2?3:t<.75?1:2):group%offsets.length;}
function atlasHarmonyBase(keys,mode){const offsets=harmonyOffsets(mode),labs=keys.map(k=>rgbToLab(k.hex));let x=0,y=0;keys.forEach((k,i)=>{const p=labs[i],c=Math.hypot(p.a,p.b),h=Math.atan2(p.b,p.a)-offsets[atlasHarmonyGroup(k.t,offsets)]*Math.PI/180;x+=c*Math.cos(h);y+=c*Math.sin(h);});return Math.atan2(y,x);}
function atlasHarmonyPalette(keys,mode,base){const offsets=harmonyOffsets(mode);return keys.map(k=>{const p=rgbToLab(k.hex),c=Math.hypot(p.a,p.b),h=base+offsets[atlasHarmonyGroup(k.t,offsets)]*Math.PI/180,fit=fitLabToSRGB(p.l,c*Math.cos(h),c*Math.sin(h));return {...k,hex:labColor(fit.l,fit.a,fit.b).hex};});}
// Role-aware generation adapter
(()=>{
 let plan=null,last=null;
 const render=renderPreviewLayerList;renderPreviewLayerList=function(...args){render(...args);if(!last)return;const rows=$('#preview-layer-list').children||[],images=[...previewImages].reverse();for(let i=0;i<images.length;i++){const r=last.get(images[i].id);if(rows[i]&&r?.target)rows[i].title='Last Random estimate: '+r.role+' · '+Math.round(r.share*100)+'% contribution · guide '+Math.round(r.target*100)+'%';}};
 const analyse=()=>atlasSceneRoles(previewImages),batch=randomPreviewLayers,generate=randomAllLayers;
 randomPreviewLayers=function(random=Math.random){if(!['auto','perceptual','colorplay',...atlasNamedHarmony].includes(state.randomType))return batch(random);syncPreviewLayer();const previous=plan;plan=analyse();last=plan;try{const result=batch(random),labels=previewImages.filter(p=>previewRandomSelection.has(p.id)).map(p=>{const r=plan.get(p.id);return r?.target?r.role+' ~'+Math.round(r.share*100)+'% (guide '+Math.round(r.target*100)+'%)':'no visible contribution';});if(labels.length)previewStatus('Random roles · '+labels.join(' · '));return result;}finally{plan=previous;}};
 randomAllLayers=function(random=Math.random,render=true){if(!['auto','perceptual','colorplay',...atlasNamedHarmony].includes(state.randomType))return generate(random,render);const scene=plan||analyse(),info=scene.get(previewSelected),ranked=[...scene.entries()].filter(([,r])=>r.target);if(!info?.target&&!atlasNamedHarmony.includes(state.randomType))return generate(random,render);const reference=ranked.filter(([id])=>!previewRandomSelection.has(id)).sort((a,b)=>b[1].score-a[1].score)[0]?.[1];storeGradientLayer();const bases=Object.fromEntries(importanceLayerDefinitions.map(({id})=>[id,state.gradientLayers[id].colors.map(k=>({...k}))]));generate(random,false);const named=atlasNamedHarmony.includes(state.randomType),strength=['auto','perceptual'].includes(state.randomType)?sourceBrightStrength():0;if(named&&scene.hue===undefined)scene.hue=atlasHarmonyBase(state.gradientLayers.emission.colors,state.randomType);for(const {id} of importanceLayerDefinitions){const p=state.gradientLayers[id];if(named)p.colors=atlasHarmonyPalette(p.colors,state.randomType,scene.hue);if(info?.target&&(named||previewImages.find(p=>p.id===previewSelected)?.blend!=='add'))p.colors=atlasRolePalette(p.colors,info,reference,true,true);if(info?.role==='accent')p.colors=atlasAccentPalette(p.colors,random);p.colors=brightSourcePalette(p.colors,id,strength);if(named)p.colors=atlasHarmonyPalette(p.colors,state.randomType,scene.hue);p.colors=atlasKeepLuminance(p.colors,bases[id],random);}state.gradientColors=state.gradientLayers[state.gradientLayer].colors;loadGradientColor();if(render){drawGradient();remember();}};
})();
// End Scene-role Random integration
