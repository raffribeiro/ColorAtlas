// Lightweight intensity saliency heuristic, inspired by multiscale center-surround contrast.
function attentionScores(rgba,w,h){
 const n=w*h,l=new Float32Array(n),sat=new Float64Array((w+1)*(h+1));
 for(let y=0;y<h;y++){let row=0;for(let x=0;x<w;x++){const i=y*w+x,j=i*4;l[i]=(.2126*srgbByteLinear[rgba[j]]+.7152*srgbByteLinear[rgba[j+1]]+.0722*srgbByteLinear[rgba[j+2]])*rgba[j+3]/255;row+=l[i];sat[(y+1)*(w+1)+x+1]=sat[y*(w+1)+x+1]+row;}}
 const mean=(x,y,r)=>{const x0=Math.max(0,x-r),x1=Math.min(w,x+r+1),y0=Math.max(0,y-r),y1=Math.min(h,y+r+1),stride=w+1;return (sat[y1*stride+x1]-sat[y0*stride+x1]-sat[y1*stride+x0]+sat[y0*stride+x0])/((x1-x0)*(y1-y0));};
 const out=new Float32Array(n);let peak=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,local=mean(x,y,3),c1=Math.abs(local-mean(x,y,14)),c2=Math.abs(local-mean(x,y,42));out[i]=(.25*local+.4*c1+.35*c2)*(rgba[i*4+3]/255);peak=Math.max(peak,out[i]);}
 if(peak>0)for(let i=0;i<n;i++)out[i]/=peak;return out;
}
function drawAttentionOverlay(ctx){
 const image=ctx.getImageData(0,0,512,512),scores=attentionScores(image.data,512,512),heat=document.createElement('canvas');heat.width=heat.height=512;const hc=heat.getContext('2d'),data=hc.createImageData(512,512);
 for(let i=0;i<scores.length;i++){const t=scores[i],r=Math.min(1,Math.max(0,1.5-Math.abs(4*t-3))),g=Math.min(1,Math.max(0,1.5-Math.abs(4*t-2))),b=Math.min(1,Math.max(0,1.5-Math.abs(4*t-1)));data.data.set([Math.round(r*255),Math.round(g*255),Math.round(b*255),Math.round(image.data[i*4+3]*(.2+.65*t))],i*4);}
 hc.putImageData(data,0,0);ctx.save();ctx.globalCompositeOperation='source-over';ctx.filter='blur(5px)';ctx.drawImage(heat,0,0);ctx.restore();
 // Mark the strongest visible saliency peak; no marker for an empty image.
 let peak=-1,best=0;for(let i=0;i<scores.length;i++)if(scores[i]>best){best=scores[i];peak=i;}
 if(peak>=0){const x=peak%512,y=Math.floor(peak/512);ctx.save();ctx.globalCompositeOperation='source-over';ctx.filter='none';ctx.translate(x,y);ctx.shadowColor='rgba(0,0,0,.9)';ctx.shadowBlur=6;ctx.beginPath();ctx.moveTo(-16,0);ctx.bezierCurveTo(-8,-13,8,-13,16,0);ctx.bezierCurveTo(8,13,-8,13,-16,0);ctx.closePath();ctx.fillStyle='rgba(10,15,22,.9)';ctx.fill();ctx.strokeStyle='#ffffff';ctx.lineWidth=2.5;ctx.stroke();ctx.shadowBlur=0;ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fillStyle='#ffffff';ctx.fill();ctx.restore();}

}
