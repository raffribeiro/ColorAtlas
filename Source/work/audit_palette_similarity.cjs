// Offline analysis only: reads the app's real presets and gradient evaluator.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html','utf8');
const harness=fs.readFileSync('work/check_library_naming.cjs','utf8').split('const baseline=')[0];
const runtime={require,process,console,structuredClone};
vm.runInNewContext(harness+'globalThis.presets=JSON.parse(JSON.stringify(app.gradientPresets));',runtime);
const math={};vm.createContext(math);
const fragments=[
 source.slice(source.indexOf('function oklabLinear('),source.indexOf('function toLch(')),
 source.slice(source.indexOf('function gradientSample('),source.indexOf('function gradientSelected(')),
 source.slice(source.indexOf('const encodeSRGB='),source.indexOf('\n',source.indexOf('function rgbHex('))),
 source.slice(source.indexOf('function blackbodyHex('),source.indexOf('const gradientPresets='))
];
vm.runInContext(fragments.join('\n'),math);
const linearLab=([r,g,b])=>{
 const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
 return [100*(.2104542553*l+.793617785*m-.0040720468*s),100*(1.9779984951*l-2.428592205*m+.4505937099*s),100*(.0259040371*l+.7827717662*m-.808675766*s)];
};
const sample=(p,t,mode)=>math.gradientSample(t,p.keys,[{t:0,a:1},{t:1,a:1}],mode).rgb;
const presets=runtime.presets.map(p=>{
 const temperatures=[1000,1800,2700,4000,5500,6500,9000,12000];
 const keys=p.id==='blackbody'?temperatures.map(k=>({t:(k-1000)/11000,hex:math.blackbodyHex(k)})):p.colors.map((hex,i)=>({t:p.positions?.[i]??i/(p.colors.length-1),hex:hex.toLowerCase()}));
 const q={...p,keys};q.samples={};
 for(const mode of ['smooth','bands'])q.samples[mode]=Float64Array.from(Array.from({length:257},(_,i)=>linearLab(sample(q,i/256,mode))).flat());
 return q;
});
assert.equal(presets.length,1086);assert(presets.every(p=>Object.values(p.samples).every(a=>[...a].every(Number.isFinite))));
const metric=(a,b)=>{let sum=0,max=0;for(let i=0;i<a.length;i+=3){const d=Math.hypot(a[i]-b[i],a[i+1]-b[i+1],a[i+2]-b[i+2]);sum+=d;max=Math.max(max,d);}return {mean:sum/(a.length/3),max};};
assert.deepEqual(metric(presets[0].samples.smooth,presets[0].samples.smooth),{mean:0,max:0});
assert.deepEqual(metric(presets[0].samples.smooth,presets[1].samples.smooth),metric(presets[1].samples.smooth,presets[0].samples.smooth));
const signatures=presets.map(p=>JSON.stringify(p.keys.map(k=>[k.t,k.hex.toLowerCase()]))),groups=new Map();
signatures.forEach((key,i)=>{if(!groups.has(key))groups.set(key,[]);groups.get(key).push(i);});
const label=p=>({id:p.id,name:p.name,category:p.category,theme:p.originalCategory});
const exact=[...groups.values()].filter(g=>g.length>1).map(g=>g.map(i=>label(presets[i])));
const pairs=[],smoothOnly=[];
for(let a=0;a<presets.length;a++)for(let b=a+1;b<presets.length;b++){
 if(signatures[a]===signatures[b])continue;
 const p=presets[a],q=presets[b],smooth=metric(p.samples.smooth,q.samples.smooth);
 if(smooth.mean>1||smooth.max>2)continue;
 const bands=metric(p.samples.bands,q.samples.bands);
 // Check every key and either side of a boundary, so narrow bands are not missed.
 const positions=[...new Set([...p.keys,...q.keys].flatMap(k=>[Math.max(0,k.t-1e-8),k.t,Math.min(1,k.t+1e-8)]))];
 for(const mode of ['smooth','bands'])for(const t of positions){const aa=linearLab(sample(p,t,mode)),bb=linearLab(sample(q,t,mode)),d=Math.hypot(...aa.map((v,i)=>v-bb[i]));(mode==='smooth'?smooth:bands).max=Math.max((mode==='smooth'?smooth:bands).max,d);}
 if(smooth.max>2)continue;
 const entry={a:label(p),b:label(q),smooth,bands};
 if(bands.mean<=1&&bands.max<=2)pairs.push(entry);else smoothOnly.push(entry);
}
pairs.sort((a,b)=>a.smooth.mean-b.smooth.mean);smoothOnly.sort((a,b)=>a.smooth.mean-b.smooth.mean);
const report={count:presets.length,method:{samples:257,distance:'Euclidean OKLab × 100 after the actual evaluator clips to linear sRGB',thresholds:{mean:1,max:2},boundaryChecks:'All stops and both sides, Smooth and Bands',scope:'Bundled presets only; user palettes and saved IDs remain unchanged',limitations:'Editorial screening thresholds, not a validated perceptual equivalence claim. Pair similarity is not transitive; no automatic merging.'},exact,near:pairs,smoothOnly};
fs.writeFileSync('outputs/palette-similarity-audit.json',JSON.stringify(report,null,2)+'\n');
const csv=v=>'"'+String(v??'').replaceAll('"','""')+'"';
const rows=[['kind','name_a','name_b','mean_smooth','max_smooth','mean_bands','max_bands']];
for(const g of exact)for(let i=1;i<g.length;i++)rows.push(['exact',g[0].name,g[i].name,0,0,0,0]);
for(const [kind,list] of [['near',pairs],['smooth-only',smoothOnly]])for(const p of list)rows.push([kind,p.a.name,p.b.name,p.smooth.mean,p.smooth.max,p.bands.mean,p.bands.max]);
fs.writeFileSync('outputs/palette-similarity-audit.csv',rows.map(r=>r.map(csv).join(',')).join('\n')+'\n');
const esc=v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const ramp=id=>{const p=presets.find(p=>p.id===id),stops=Array.from({length:257},(_,i)=>math.rgbHex(sample(p,i/256,'smooth').map(v=>v<=.0031308?12.92*v:1.055*v**(1/2.4)-.055))+' '+(i/256*100).toFixed(4)+'%');return '<div class="ramp" style="background:linear-gradient(90deg,'+stops.join(',')+')"></div>';};
const card=(title,items,note='')=>'<section><h3>'+esc(title)+'</h3>'+items.map(p=>'<p>'+esc(p.name)+' <small>'+esc(p.theme||p.category)+'</small></p>'+ramp(p.id)).join('')+'<small>'+esc(note)+'</small></section>';
const cards=exact.map((g,i)=>card('Identical gradient '+(i+1),g));
cards.push(...pairs.slice(0,24).map(p=>card('Nearly identical',[p.a,p.b],'OKLab × 100: Smooth mean '+p.smooth.mean.toFixed(3)+', max '+p.smooth.max.toFixed(3)+'; Bands max '+p.bands.max.toFixed(3))));
const html='<!doctype html><html lang="en"><meta charset="utf-8"><title>Color Atlas — Palette similarity audit</title><style>body{background:#111820;color:#dce7f0;font:16px/1.6 system-ui;margin:40px auto;max-width:1040px;padding:0 24px}h1{font-size:28px}small{color:#a4b4c2}section{border:1px solid #35465a;padding:20px;border-radius:8px;margin:20px 0}p{margin:12px 0 6px}.ramp{height:34px;border-radius:3px}h3{margin:0 0 12px}</style><h1>Palette similarity audit</h1><p>'+presets.length+' bundled presets. '+exact.length+' exact groups ('+exact.reduce((n,g)=>n+g.length-1,0)+' redundant entries), '+pairs.length+' near-identical pairs in Smooth and Bands, '+smoothOnly.length+' pairs close in Smooth but distinct in Bands.</p><p>Colors below come from the app’s actual Smooth gradient evaluator. This is an offline comparison, not a screenshot. Pair thresholds: mean ≤ 1 and maximum ≤ 2 in Euclidean OKLab × 100, including every stop boundary. These are editorial screening criteria, not a guarantee of perceptual equivalence. No presets were merged.</p>'+cards.join('')+'<p>The full pair list is in palette-similarity-audit.csv and palette-similarity-audit.json.</p></html>';
fs.writeFileSync('outputs/palette-similarity-audit.html',html);
console.log(JSON.stringify({count:report.count,exactGroups:exact.length,exactRedundant:exact.reduce((n,g)=>n+g.length-1,0),nearPairs:pairs.length,smoothOnlyPairs:smoothOnly.length,examples:pairs.slice(0,12)},null,2));
