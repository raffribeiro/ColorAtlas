// Independent image Gradient Maps; linear-sRGB blend and source-over alpha.
function previewBlend(b,s,mode){
 if(mode==='multiply')return b*s;if(mode==='screen')return b+s-b*s;
 if(mode==='overlay')return b<=.5?2*b*s:1-2*(1-b)*(1-s);
 if(mode==='add')return Math.min(1,b+s);return s;
}
function previewOver(b,s,mode){
 const ab=b[3],as=s[3],a=as+ab*(1-as);
 return [0,1,2].map(i=>a?((1-as)*ab*b[i]+as*((1-ab)*s[i]+ab*previewBlend(b[i],s[i],mode)))/a:0).concat(a);
}
// Keep imported bytes immutable; cache only the derived scalar field.
function previewLayerGray(p){
 if(!p.normalizeValues||!p.gray||!p.alpha)return p.gray;
 if(p._normalSource!==p.gray||p._normalAlpha!==p.alpha){
  let low=255,high=0;for(let i=0;i<p.gray.length;i++)if(p.alpha[i]){low=Math.min(low,p.gray[i]);high=Math.max(high,p.gray[i]);}
  p._normalSource=p.gray;p._normalAlpha=p.alpha;p._normalGray=p.gray;
  if(high>low&&(low!==0||high!==255)){p._normalGray=new Uint8Array(p.gray);for(let i=0;i<p.gray.length;i++)if(p.alpha[i])p._normalGray[i]=Math.round((p.gray[i]-low)*255/(high-low));}
 }
 return p._normalGray;
}
let previewLinearBuffer;
function previewComposite(out,stack,sample=previewGradientSample){
 if(!previewLinearBuffer||previewLinearBuffer.length!==out.length)previewLinearBuffer=new Float32Array(out.length);
 const dst=previewLinearBuffer;dst.fill(0);
 for(const layer of stack){
  if(!layer.visible||!layer.opacity||!layer.gray||!layer.alpha)continue;
  const key=JSON.stringify(layer.map);
  if(layer._mapKey!==key){layer._mapKey=key;layer._lut=Array.from({length:256},(_,i)=>{const m=layer.map,p=sample(i/255,m.layers,m.view,m.active,m.split);return [...p.rgb,Math.round(p.alpha*255)/255];});}
  const lut=layer._lut,gray=previewLayerGray(layer);
  for(let i=0;i<layer.gray.length;i++){
   const p=lut[gray[i]],as=p[3]*layer.alpha[i]/255*layer.opacity;if(!as)continue;
   const k=i*4,ab=dst[k+3],a=as+ab*(1-as);
   for(let j=0;j<3;j++)dst[k+j]=((1-as)*ab*dst[k+j]+as*((1-ab)*p[j]+ab*previewBlend(dst[k+j],p[j],layer.blend)))/a;
   dst[k+3]=a;
  }
 }
 for(let i=0;i<out.length;i+=4){for(let j=0;j<3;j++)out[i+j]=Math.round(encodeSRGB(Math.max(0,Math.min(1,dst[i+j])))*255);out[i+3]=Math.round(dst[i+3]*255);}
 return out;
}
function previewImageFields(rgba){
 const gray=new Uint8Array(rgba.length/4),alpha=new Uint8Array(gray.length);
 for(let i=0;i<gray.length;i++){const k=i*4;gray[i]=Math.round(.2126*rgba[k]+.7152*rgba[k+1]+.0722*rgba[k+2]);alpha[i]=rgba[k+3];rgba[k]=rgba[k+1]=rgba[k+2]=gray[i];}
 return {gray,alpha};
}
function previewMapSnapshot(){storeGradientLayer();return structuredClone({layers:state.gradientLayers,active:state.gradientLayer,view:state.explosionView,split:state.explosionSplit});}
function previewDocument(stack,selected){return {version:1,selected,layers:stack.map(({id,name,asset,visible,opacity,blend,map,normalizeValues=false})=>({id,name,asset,visible,opacity,blend,map,normalizeValues}))};}
function cleanPreviewDocument(doc){
 if(doc?.version!==1||!Array.isArray(doc.layers)||doc.layers.length>8)return null;
 const ids=new Set(),modes=['normal','multiply','screen','overlay','add'];
 for(const p of doc.layers){
  if(typeof p.id!=='string'||p.id.length>64||ids.has(p.id)||typeof p.name!=='string'||p.name.length>80||!modes.includes(p.blend)||typeof p.visible!=='boolean'||!Number.isFinite(p.opacity)||p.opacity<0||p.opacity>1)return null;
  if(p.asset!==null&&(typeof p.asset!=='string'||p.asset.length>3e6||!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(p.asset)))return null;
  if(p.normalizeValues!==undefined&&typeof p.normalizeValues!=='boolean')return null;
  const m=p.map;if(!m||!['emission','smoke'].includes(m.active)||!['active','combined','emission','smoke'].includes(m.view)||!Number.isFinite(m.split)||m.split<.15||m.split>.9||!validGradientLayer(m.layers?.emission)||!validGradientLayer(m.layers?.smoke))return null;
  ids.add(p.id);
 }
 if(doc.randomOn!==undefined&&(!Array.isArray(doc.randomOn)||doc.randomOn.length>8||doc.randomOn.some(id=>!ids.has(id))))return null;
 if(doc.layers.length&&!ids.has(doc.selected))return null;
 return structuredClone(doc);
}
