// Color Atlas adaptation: multiscale contrast (Itti), global color distance (Achanta).
// Original browser implementation; not a reproduction or a trained gaze predictor.
function attentionBlur(input,w,h,step=1){
 const temp=new Float32Array(w*h),out=new Float32Array(w*h),k=[1,4,6,4,1];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let v=0;for(let d=-2;d<=2;d++)v+=k[d+2]*input[y*w+Math.max(0,Math.min(w-1,x+d*step))];temp[y*w+x]=v/16;}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let v=0;for(let d=-2;d<=2;d++)v+=k[d+2]*temp[Math.max(0,Math.min(h-1,y+d*step))*w+x];out[y*w+x]=v/16;}
 return out;
}
function attentionScores(rgba,w,h){
 const pw=Math.min(96,w),ph=Math.min(96,h),n=pw*ph,channels=Array.from({length:4},()=>new Float32Array(n)),alpha=new Float32Array(n),global=new Float32Array(n),means=[0,0,0];
 // Area-average decoded, alpha-composited RGB on a fixed 18% linear gray ground.
 for(let y=0;y<ph;y++)for(let x=0;x<pw;x++){
  let r=0,g=0,b=0,a=0,count=0;
  for(let yy=Math.floor(y*h/ph);yy<Math.floor((y+1)*h/ph);yy++)for(let xx=Math.floor(x*w/pw);xx<Math.floor((x+1)*w/pw);xx++){
   const j=(yy*w+xx)*4,op=rgba[j+3]/255;r+=srgbByteLinear[rgba[j]]*op+.18*(1-op);g+=srgbByteLinear[rgba[j+1]]*op+.18*(1-op);b+=srgbByteLinear[rgba[j+2]]*op+.18*(1-op);a+=op;count++;
  }
  r/=count;g/=count;b/=count;const i=y*pw+x;alpha[i]=a/count;
  const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
  channels[0][i]=.2126*r+.7152*g+.0722*b;channels[1][i]=1.9779984951*l-2.428592205*m+.4505937099*s;channels[2][i]=.0259040371*l+.7827717662*m-.808675766*s;channels[3][i]=.2104542553*l+.793617785*m-.0040720468*s;
  means[0]+=channels[3][i]/n;means[1]+=channels[1][i]/n;means[2]+=channels[2][i]/n;
 }
 const pyramid=channels.map(c=>{const p=[attentionBlur(c,pw,ph)];for(let l=1;l<5;l++)p.push(attentionBlur(p[l-1],pw,ph,2**(l-1)));return p;});
 const maps=Array.from({length:4},()=>new Float32Array(n));
 const edge=input=>{const out=new Float32Array(n);for(let y=0;y<ph;y++)for(let x=0;x<pw;x++){const dx=input[y*pw+Math.min(pw-1,x+1)]-input[y*pw+Math.max(0,x-1)],dy=input[Math.min(ph-1,y+1)*pw+x]-input[Math.max(0,y-1)*pw+x];out[y*pw+x]=Math.hypot(dx,dy)/2;}return out;};
 const edges=pyramid[0].map(edge);
 for(let i=0;i<n;i++){
  for(let c=0;c<3;c++){const s=c+2;maps[0][i]+=Math.abs(pyramid[0][c][i]-pyramid[0][s][i])/3;maps[1][i]+=Math.hypot(pyramid[1][c][i]-pyramid[1][s][i],pyramid[2][c][i]-pyramid[2][s][i])/3;maps[2][i]+=Math.abs(edges[c][i]-edges[s][i])/3;}
  global[i]=Math.hypot(pyramid[3][0][i]-means[0],pyramid[1][0][i]-means[1],pyramid[2][0][i]-means[2]);maps[3][i]=global[i];
 }
 // Separate feature normalization keeps color-only contrast from being buried by luminance.
 const weights=[.35,.35,.15,.15],floors=[.001,.002,.001,.002],mixed=new Float32Array(n);
 maps.forEach((map,k)=>{let peak=0;for(let i=0;i<n;i++){map[i]*=alpha[i];peak=Math.max(peak,map[i]);}if(peak<=floors[k])return;for(let i=0;i<n;i++)mixed[i]+=weights[k]*map[i]/peak;});
 const smooth=attentionBlur(mixed,pw,ph),out=new Float32Array(w*h);let peak=0;for(let i=0;i<n;i++){smooth[i]*=alpha[i];peak=Math.max(peak,smooth[i]);}
 if(peak>0)for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,j=Math.min(ph-1,Math.floor(y*ph/h))*pw+Math.min(pw-1,Math.floor(x*pw/w));out[i]=rgba[i*4+3]?smooth[j]/peak:0;}
 return out;
}
function attentionPeaks(scores,w,h,rgba){
 const used=new Uint8Array(w*h),found=[],radius=Math.max(2,Math.min(w,h)*.12);let first=0;
 for(let rank=1;rank<=3;rank++){
  let best=0,at=-1;
  for(let i=0;i<scores.length;i++)if(!used[i]&&rgba[i*4+3]>=26&&scores[i]>best){
   const x=i%w,y=Math.floor(i/w),r=Math.max(1,Math.round(Math.min(w,h)/96));let maximum=true;
   for(let yy=Math.max(0,y-r);yy<=Math.min(h-1,y+r)&&maximum;yy++)for(let xx=Math.max(0,x-r);xx<=Math.min(w-1,x+r);xx++)if(scores[yy*w+xx]>scores[i]){maximum=false;break;}
   if(maximum){best=scores[i];at=i;}
  }
  if(at<0||best<.2*(first||best))break;if(rank===1)first=best;
  const x=at%w,y=Math.floor(at/w);found.push({x,y,score:best,rank});
  // Suppress the connected high-response region, then a minimum separation disk.
  const queue=[at];used[at]=1;
  for(let q=0;q<queue.length;q++){const i=queue[q],xx=i%w,yy=Math.floor(i/w);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=xx+dx,ny=yy+dy,j=ny*w+nx;if(nx>=0&&nx<w&&ny>=0&&ny<h&&!used[j]&&scores[j]>=best*.55){used[j]=1;queue.push(j);}}}
  for(let yy=Math.max(0,Math.floor(y-radius));yy<Math.min(h,y+radius+1);yy++)for(let xx=Math.max(0,Math.floor(x-radius));xx<Math.min(w,x+radius+1);xx++)if(Math.hypot(xx-x,yy-y)<=radius)used[yy*w+xx]=1;
 }
 return found;
}
function drawAttentionOverlay(ctx){
 const w=ctx.canvas.width,h=ctx.canvas.height,image=ctx.getImageData(0,0,w,h),scores=attentionScores(image.data,w,h),foci=attentionPeaks(scores,w,h,image.data),heat=document.createElement('canvas');heat.width=w;heat.height=h;
 const hc=heat.getContext('2d'),data=hc.createImageData(w,h);
 for(let i=0;i<scores.length;i++){const t=scores[i];data.data.set([Math.round(255*Math.min(1,Math.max(0,1.5-Math.abs(4*t-3)))),Math.round(255*Math.min(1,Math.max(0,1.5-Math.abs(4*t-2)))),Math.round(255*Math.min(1,Math.max(0,1.5-Math.abs(4*t-1)))),Math.round(image.data[i*4+3]*t*.55)],i*4);}
 hc.putImageData(data,0,0);ctx.save();ctx.globalCompositeOperation='source-over';ctx.filter='none';ctx.drawImage(heat,0,0);ctx.restore();
 for(const focus of foci){
  const scale=[1,.85,.72][focus.rank-1],x=Math.max(19,Math.min(w-19,focus.x)),y=Math.max(14,Math.min(h-14,focus.y));
  ctx.save();ctx.globalCompositeOperation='source-over';ctx.filter='none';ctx.translate(x,y);ctx.shadowColor='rgba(0,0,0,.95)';ctx.shadowBlur=5;ctx.beginPath();ctx.moveTo(-16*scale,0);ctx.bezierCurveTo(-8*scale,-13*scale,8*scale,-13*scale,16*scale,0);ctx.bezierCurveTo(8*scale,13*scale,-8*scale,13*scale,-16*scale,0);ctx.closePath();ctx.fillStyle='#0e1621';ctx.fill();ctx.strokeStyle=['#ffffff','#b8ddec','#9fb6ce'][focus.rank-1];ctx.lineWidth=2;ctx.stroke();ctx.shadowBlur=0;ctx.font='bold '+Math.round(12*scale)+'px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=ctx.strokeStyle;ctx.fillText(String(focus.rank),0,0);ctx.restore();
 }
 const legend=$('#attention-legend');if(legend)legend.textContent='1 Primary · 2 Secondary · 3 Tertiary · '+foci.length+' distinct focus'+(foci.length===1?'':'es')+'. Estimated saliency, not measured gaze.';
}
