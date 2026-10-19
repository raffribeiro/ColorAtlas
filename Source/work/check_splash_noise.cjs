const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html','utf8');
const svg=source.match(/<svg class="splash-noise"[\s\S]*?<\/svg>/)[0];
assert(svg.includes('result="grayscale"'),'Perlin background must produce a grayscale field before applying chroma');
assert(svg.includes('in="grayscale"')&&svg.includes('data-splash-ramp="oklab"'),'Apply the OKLab ramp to grayscale intensities');
assert(!svg.includes('<ellipse')&&!svg.includes('feDisplacementMap'),'Noise determines the blobs instead of distorting precolored ellipses');
const turbulence=svg.match(/<feTurbulence\b[^>]+>/)[0];
assert(turbulence.includes('numOctaves="1"'),'Single octave avoids tiny noisy details');
const frequencies=[...svg.match(/values="([^\"]+)"/)[1].matchAll(/[\d.]+/g)].map(m=>+m[0]);
assert(frequencies.every(v=>v>=.001&&v<=.003),'Low frequencies form broad patches');
assert(svg.includes('values="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0 1"'),'The same scalar supplies R/G/B, with opaque alpha');
const ramp=JSON.parse(fs.readFileSync('work/atlas-splash-ramp.json','utf8'));
const ctx={};vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('function oklabLinear('),source.indexOf('function toLch(')),ctx);
const tables=['R','G','B'].map(ch=>svg.match(new RegExp('<feFunc'+ch+' type="table" tableValues="([^\"]+)"'))[1].split(' ').map(Number));
assert(tables.every(t=>t.length===65),'Dense tables provide smooth color mapping');
for(let i=0;i<65;i++){
 const t=i/64,j=Math.max(0,ramp.findLastIndex(k=>k.t<=t)),left=ramp[j],right=ramp[Math.min(j+1,ramp.length-1)],f=right.t>left.t?(t-left.t)/(right.t-left.t):0;
 const lab=left.lab.map((x,k)=>x+(right.lab[k]-x)*f),rgb=ctx.oklabLinear(lab[0]*100,lab[1]*250,lab[2]*250);
 for(let ch=0;ch<3;ch++){
  const x=Math.max(0,Math.min(1,rgb[ch])),expected=x<=.0031308?12.92*x:1.055*x**(1/2.4)-.055;
  assert(Math.abs(tables[ch][i]-expected)<.000001,'Lookup color matches actual editor OKLab math');
 }
 assert(lab[0]<=.28,'Background maximum OKLab lightness is reduced to 0.28');
}
assert(source.includes(fs.readFileSync('work/atlas-splash-noise.svg','utf8').trim()),'Generated noise graphic is embedded exactly');
console.log('PASS: broad single-octave grayscale Perlin, opaque neutral source, 65-sample OKLab chroma mapping matching editor math and synchronized SVG.');
