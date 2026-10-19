const fs=require('node:fs'),vm=require('node:vm'),{performance}=require('node:perf_hooks');
const s=fs.readFileSync('work/atlas-attention.js','utf8'),c={srgbByteLinear:Array.from({length:256},(_,i)=>{const v=i/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;})};Object.assign(c,Function('srgbByteLinear',s+';return {attentionScores,attentionPeaks};')(c.srgbByteLinear));
const w=512,p=new Uint8ClampedArray(w*w*4);for(let y=0;y<w;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=(x*13+y*17)%256;p.set([v,255-v,(v*3)%256,255],i);}
const times=[];for(let i=0;i<4;i++){const t=performance.now(),scores=c.attentionScores(p,w,w),peaks=c.attentionPeaks(scores,w,w,p);times.push(Math.round(performance.now()-t));if(i===3)console.log('512 × 512 analysis milliseconds:',times,'foci:',peaks.length);}
