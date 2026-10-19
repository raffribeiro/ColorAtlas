// Random performance integration
// Same ColorPlay score and RNG sequence; reuse conversions within each scored view.
colorPlayViewScore=function(lut,context,background){
 const bg=background.match(/[a-f0-9]{2}/gi).map(s=>parseInt(s,16)),cache=new Map(),colors=context.samples.map(p=>{const s=lut[p.v],bytes=colorPlayComposite(s,p.alpha,bg),key=bytes[0]*65536+bytes[1]*256+bytes[2];let lab=cache.get(key);if(!lab){const q=rgbToLab('#'+bytes.map(v=>v.toString(16).padStart(2,'0')).join(''));lab={q:[q.l/100,q.a/250,q.b/250],c:Math.hypot(q.a,q.b)/250};cache.set(key,lab);}return {q:lab.q,c:lab.c,a:s.alpha*p.alpha};});
 let mass=0,chroma=0,edge=0,edges=0,extreme=0;
 for(let i=0;i<colors.length;i++){const p=colors[i];mass+=p.a;chroma+=p.c*p.a;for(const j of [i%context.size<context.size-1?i+1:-1,i+context.size<colors.length?i+context.size:-1])if(j>=0){const n=colors[j],w=Math.min(p.a,n.a),d=Math.hypot(p.q[0]-n.q[0],p.q[1]-n.q[1],p.q[2]-n.q[2]);edges+=w;edge+=Math.min(d/.15,1)*w;extreme+=Math.max(0,d-.30)*w;}}
 if(mass<1e-8)return 0;const mean=chroma/mass,accent=colors.reduce((sum,p)=>sum+(p.c>mean+.03?p.a:0),0)/mass,area=Math.max(0,1-Math.abs(accent-.16)/.20);return .65*(edges?edge/edges:0)+.35*area-(edges?extreme/edges:0);
};
(()=>{
 const random=randomPreviewLayers;
 randomPreviewLayers=function(...args){
  if(!previewImages.some(p=>previewRandomSelection.has(p.id)))return random(...args);
  const gradient=drawGradient,plane=drawLabPlane,preview=drawExplosionMap,save=remember;let paint=false,plot=false,image=false,persist=false;
  drawGradient=()=>{storeGradientLayer();paint=true;};drawLabPlane=()=>{plot=true;};drawExplosionMap=()=>{image=true;};remember=()=>{persist=true;return Promise.resolve();};
  try{return random(...args);}finally{drawGradient=gradient;drawLabPlane=plane;drawExplosionMap=preview;remember=save;if(paint)gradient();else if(image)preview();if(plot)plane();if(persist)save();}
 };
})();
// End Random performance integration
