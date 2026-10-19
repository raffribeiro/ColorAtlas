// Graphic Design Random integration
function atlasGraphicPlan(random){
 const shuffle=values=>{for(let i=values.length-1;i>0;i--){const j=Math.min(i,Math.floor(random()*(i+1)));[values[i],values[j]]=[values[j],values[i]];}return values;};
 const harmonies=[['Monochromatic',[0,0,0]],['Analogous',[-30,0,30]],['Complementary',[0,0,180]],['Split complementary',[0,150,210]],['Triadic',[0,120,240]],['Analogous accent',[-25,25,180]]];
 const recipes=[['Editorial',['#172B4D','#FF6554','#F1D7A5'],[.4,1,.35]],['Swiss poster',['#18212A','#F04432','#E9C85A'],[.25,1,.65]],['Bauhaus',['#2255D9','#F03F32','#F1CF26'],[1,1,1]],['Retro',['#126B70','#EE7E32','#E7BD68'],[.8,1,.7]],['Digital',['#6333ED','#04C9D7','#A1E752'],[1,1,.9]],['Luxury',['#502247','#CCA343','#E6CBAA'],[.65,.85,.25]],['Botanical',['#245D49','#A6CB38','#F19C76'],[.7,1,.8]],['Playful',['#9134D9','#FC803B','#27CBB7'],[1,1,1]],['Duotone',['#253BC4','#DD39A1','#253BC4'],[1,1,.65]]];
 const pick=Math.min(harmonies.length+recipes.length-1,Math.floor(random()*(harmonies.length+recipes.length))),base=random()*360,turn=(random()-.5)*16;
 let hues,scales,family;
 if(pick<harmonies.length){const entry=harmonies[pick];family='Harmony: '+entry[0];hues=entry[1].map(h=>base+h);scales=[1,1,1];}
 else{const entry=recipes[pick-harmonies.length];family='Design: '+entry[0];hues=entry[1].map(hex=>{const p=rgbToLab(hex);return Math.atan2(p.b,p.a)*180/Math.PI+turn;});scales=entry[2];}
 const lights=shuffle([38+random()*10,58+random()*10,80+random()*8]);
 const regions=shuffle(hues.map((h,i)=>{const l=lights[i],c=hueChromaLimit(l,h)*(.8+random()*.17)*scales[i],rad=h*Math.PI/180,p=fitLabToSRGB(l,c*Math.cos(rad),c*Math.sin(rad));return {share:[.6,.3,.1][i],hue:h,chroma:scales[i],hex:labColor(p.l,p.a,p.b).hex};})).sort((a,b)=>rgbToLab(a.hex).l-rgbToLab(b.hex).l);
 regions.family=family;regions.tones={low:12+random()*8,high:90+random()*6,power:.85+random()*.3};return regions;
}
function atlasGraphicPalette(keys,plan,random=Math.random,accent=false){
 const low=Math.min(...keys.map(k=>k.t)),high=Math.max(...keys.map(k=>k.t)),v=plan.tones,second=[...new Set(keys.map(k=>k.t))].sort((a,b)=>a-b)[1];
 return keys.map(key=>{if(accent&&key.t===low)return {...key,hex:'#000000'};let end=0,region=accent?plan.find(r=>r.share===.1):plan.at(-1);for(const candidate of accent?[]:plan){end+=candidate.share;if(key.t<end){region=candidate;break;}}const h=region.hue*Math.PI/180,t=high>low?(key.t-low)/(high-low):.5,l=v.low+(v.high-v.low)*Math.pow(t,v.power),c=Math.min(accent&&key.t===second?5:Infinity,hueChromaLimit(l,h*180/Math.PI)*(.65+random()*.3)*(accent?Math.max(.9,region.chroma):region.chroma)),fit=fitLabToSRGB(l,c*Math.cos(h),c*Math.sin(h));return {...key,hex:labColor(fit.l,fit.a,fit.b).hex};});
}
(()=>{
 const modes={'graphic-design-smooth':'smooth','graphic-design-bands':'bands'},menu=$('#random-type');
 for(const [value,transition] of Object.entries(modes))if(menu&&!Array.from(menu.options||[]).some(o=>o.value===value)){const option=document.createElement('option');option.value=value;option.textContent='Graphic Design - '+(transition==='smooth'?'Smooth':'Bands');menu.append(option);}
 const restoreMode=data=>{const value=(data?.modelContent||data)?.randomType,mode=value==='graphic-design'?'graphic-design-bands':value;if(modes[mode]){state.randomType=mode;if(menu)menu.value=mode;}};
 const restoreState=restore;restore=function(data,...args){const result=restoreState(data,...args);restoreMode(data);return result;};restoreMode(window.openai?.widgetState);
 const generate=randomAllLayers;let plan=null;
 const batch=randomPreviewLayers;
 randomPreviewLayers=function(...args){const previous=plan;plan=null;try{return batch(...args);}finally{plan=previous;}};
 randomAllLayers=function(random=Math.random,render=true){
  const transition=modes[state.randomType]||(state.randomType==='graphic-design'?'bands':null);
  if(!transition){state.artistTransition='smooth';for(const {id} of importanceLayerDefinitions)state.gradientLayers[id].transition='smooth';return generate(random,render);}
  plan ||= atlasGraphicPlan(random);
  storeGradientLayer();for(const {id} of importanceLayerDefinitions){const p=state.gradientLayers[id];p.colors=atlasGraphicPalette(p.colors,plan,random,previewImages.find(p=>p.id===previewSelected)?.blend==='add');p.preset='custom';p.transition=transition;}
  state.gradientColors=state.gradientLayers[state.gradientLayer].colors;state.gradientSelection={kind:'color',index:Math.min(state.gradientColors.length-1,state.gradientSelection.index)};state.gradientPreset='custom';state.artistTransition=transition;loadGradientColor();if(render){drawGradient();remember();}
 };
})();
// End Graphic Design Random integration
