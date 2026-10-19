const fs=require('fs'),vm=require('vm'),assert=require('assert');
const report=JSON.parse(fs.readFileSync('outputs/color-coverage/analysis.json','utf8'));
const page=fs.readFileSync('outputs/color-coverage/index.html','utf8'),script=page.match(/<script>([\s\S]*?)<\/script>/)[1];
const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{value:id==='threshold'?'covered025Pct':'',innerHTML:'',handlers:{},addEventListener(name,fn){this.handlers[name]=fn}});return nodes.get(id)};
const ctx={document:{getElementById:node}};vm.runInNewContext(script+';globalThis.testReport=report;',ctx);
assert.equal((node('hues').innerHTML.match(/<tr>/g)||[]).length,12);
assert.equal((node('heatmap').innerHTML.match(/<td /g)||[]).length,60);
assert.equal((node('gaps').innerHTML.match(/<article>/g)||[]).length,16);
assert.equal((node('chroma').innerHTML.match(/<tr>/g)||[]).length,5);
// Both measured thresholds now read 100%; use an isolated fixture to check switching.
ctx.testReport.hues[0].covered025Pct=73;ctx.testReport.hues[0].covered04Pct=87;node('threshold').handlers.change();assert(node('hues').innerHTML.includes('73.0%'));
const stringent=node('hues').innerHTML;node('threshold').value='covered04Pct';node('threshold').handlers.change();assert.notEqual(node('hues').innerHTML,stringent);assert(node('hues').innerHTML.includes('87.0%'));
assert(node('hues').innerHTML.includes(report.hues.find(h=>h.hue===10).covered04Pct.toFixed(1)+'%'));assert(node('chroma').innerHTML.includes(report.chroma.at(-1).covered04Pct.toFixed(1)+'%'));
assert.equal(report.templates,1086);assert.equal(report.samples,1086*257);
const presets=JSON.parse(fs.readFileSync('work/color-coverage-samples.json','utf8')).presets;
assert(presets.every(p=>p.coverageSamples.length>=p.colors.length));assert.equal(report.adaptivePathSamples,presets.reduce((s,p)=>s+p.coverageSamples.length,0));
console.log('PASS: report contains all hue/light/chroma regions and 16 visual gaps; threshold switching works; analysis includes all 1086 templates.');
