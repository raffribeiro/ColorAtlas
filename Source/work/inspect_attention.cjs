// Standalone algorithm study, not a browser screenshot or visual app acceptance.
const fs=require('node:fs'),sharp=require('/Users/raffribeiro/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const source=fs.readFileSync('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html','utf8');
const math=source.slice(source.indexOf('function oklabLinear('),source.indexOf('function toLch(')),evalCode=source.slice(source.indexOf('function gradientSample('),source.indexOf('function gradientSelected('));
const colors=['#241511','#70231A','#BD3C16','#F56818','#FF9E36','#FFC56B','#FFE2A6','#FFF4D8'].map((hex,i)=>({hex,t:i/7})),alpha=[{t:0,a:1},{t:1,a:1}];
const evaluate=Function(math+evalCode+';return t=>gradientSample(t,'+JSON.stringify(colors)+','+JSON.stringify(alpha)+',"smooth");')();
const linear=Array.from({length:256},(_,i)=>{const v=i/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});
const {attentionScores,attentionPeaks}=Function('srgbByteLinear',fs.readFileSync('work/atlas-attention.js','utf8')+';return {attentionScores,attentionPeaks};')(linear);
(async()=>{
 const {data}=await sharp('outputs/default-explosion.webp').resize(512,512).ensureAlpha().raw().toBuffer({resolveWithObject:true});const gray=Array.from({length:512*512},(_,i)=>.2126*data[i*4]+.7152*data[i*4+1]+.0722*data[i*4+2]);let low=255,high=0;for(const v of gray){low=Math.min(low,v);high=Math.max(high,v);}
 const rgba=new Uint8ClampedArray(data.length),encode=v=>Math.round(255*(v<=.0031308?v*12.92:1.055*v**(1/2.4)-.055));
 for(let i=0;i<gray.length;i++){const sample=evaluate(Math.round((gray[i]-low)*255/(high-low))/255);rgba.set([...sample.rgb.map(encode),data[i*4+3]],i*4);}
 const scores=attentionScores(rgba,512,512),peaks=attentionPeaks(scores,512,512,rgba),overlay=new Uint8ClampedArray(rgba);
 for(let i=0;i<scores.length;i++){const t=scores[i],a=t*.55,heat=[3,2,1].map(k=>255*Math.min(1,Math.max(0,1.5-Math.abs(4*t-k))));for(let k=0;k<3;k++)overlay[i*4+k]=Math.round(rgba[i*4+k]*(1-a)+heat[k]*a);}
 const eyes=Buffer.from('<svg width="512" height="512">'+peaks.map(p=>'<g transform="translate('+p.x+' '+p.y+')"><path d="M-16 0Q0-20 16 0Q0 20-16 0" fill="#111820" stroke="white" stroke-width="2"/><text text-anchor="middle" y="4" font-size="12" font-family="sans-serif" font-weight="bold" fill="white">'+p.rank+'</text></g>').join('')+'</svg>');
 const before=await sharp(Buffer.from(rgba),{raw:{width:512,height:512,channels:4}}).png().toBuffer(),after=await sharp(Buffer.from(overlay),{raw:{width:512,height:512,channels:4}}).composite([{input:eyes}]).png().toBuffer();
 await sharp({create:{width:1048,height:560,channels:4,background:'#111820'}}).composite([{input:before,left:8,top:40},{input:after,left:528,top:40},{input:Buffer.from('<svg width="1048" height="35"><text x="8" y="24" font-size="16" fill="white">Reference study · mapped ramp</text><text x="528" y="24" font-size="16" fill="white">Estimated saliency · ranked distinct foci</text></svg>'),left:0,top:0}]).png().toFile('work/attention-reference-study.png');
 fs.writeFileSync('work/attention-reference-check.json',JSON.stringify({fixture:'Sharp-resized reference, Smooth fire palette, no bloom or vision filter; not browser acceptance',opaquePixels:rgba.length/4,peaks},null,2)+'\n');console.log('Reference-study foci:',peaks);
})();
