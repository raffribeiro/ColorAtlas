const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html','utf8');
const a=source.includes('function attentionBlur(')?source.indexOf('function attentionBlur('):source.indexOf('function attentionScores('),b=source.indexOf("$('#color-vision').value",a);
const context={srgbByteLinear:Array.from({length:256},(_,i)=>{const c=i/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}),Float32Array,Float64Array,Uint8Array,Uint8ClampedArray,Math,$:()=>null};
vm.createContext(context);vm.runInContext(source.slice(a,b),context);
const w=96,h=96;
function image(color=[110,110,110,255]){const p=new Uint8ClampedArray(w*h*4);for(let i=0;i<w*h;i++)p.set(color,i*4);return p;}
function patch(p,x,y,r,c){for(let j=y-r;j<=y+r;j++)for(let i=x-r;i<=x+r;i++)p.set(c,(j*w+i)*4);}
function score(p){const s=context.attentionScores(p,w,h);assert.equal(s.length,w*h);assert(s.every(x=>Number.isFinite(x)&&x>=0&&x<=1));return s;}
assert(score(image([255,255,255,255])).every(x=>x===0),'Uniform white has no contrast focus');
assert(score(image([0,0,0,0])).every(x=>x===0));
const p=image([0,148,0,255]);patch(p,48,48,7,[255,0,0,255]);
assert(score(p)[48*w+48]>.35,'Isoluminant hue feature is retained');
const hidden=image([0,0,0,0]),hidden2=image([255,15,230,0]);
assert.deepEqual(Array.from(score(hidden)),Array.from(score(hidden2)),'Invisible RGB cannot affect saliency');
const three=image([70,70,70,255]);patch(three,20,20,5,[255,255,255,255]);patch(three,75,22,5,[230,30,30,255]);patch(three,48,75,5,[30,220,240,255]);
const s=score(three),f=context.attentionPeaks(s,w,h,three);
assert.equal(f.length,3,'Three distinct regions produce primary, secondary and tertiary eyes');
assert.deepEqual(Array.from(f,v=>v.rank),[1,2,3]);assert(f.every((v,i)=>i===0||f[i-1].score>=v.score));
for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)assert(Math.hypot(f[i].x-f[j].x,f[i].y-f[j].y)>w*.12);
assert.equal(context.attentionPeaks(score(hidden),w,h,hidden).length,0);
const one=image();patch(one,48,48,8,[255,255,255,255]);assert.equal(context.attentionPeaks(score(one),w,h,one).length,1,'Do not fabricate three eyes within one focus');
let eyes=0,depth=0;const labels=[];
const canvas={width:w,height:h};const ctx={canvas,getImageData:()=>({data:three}),save:()=>depth++,restore:()=>depth--,translate:()=>eyes++,fillText:t=>labels.push(t)};
for(const k of ['beginPath','moveTo','bezierCurveTo','closePath','fill','stroke','arc','drawImage'])ctx[k]=()=>{};
context.document={createElement:()=>({getContext:()=>({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData:()=>{}})})};
context.drawAttentionOverlay(ctx);assert.equal(eyes,3);assert.deepEqual(labels,['1','2','3']);assert.equal(depth,0);
assert(source.includes('Primary')&&source.includes('Secondary')&&source.includes('Tertiary'));
console.log('PASS: real embedded saliency, flat/transparent images, hue contrast, three distinct ranked eyes and canvas integration.');
