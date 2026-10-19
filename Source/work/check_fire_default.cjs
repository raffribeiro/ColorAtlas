const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const expected=[{t:0,hex:'#000000'},{t:.072,hex:'#120202'},{t:.2,hex:'#650B06'},{t:.4,hex:'#CB2A08'},{t:.6,hex:'#FF790C'},{t:.8,hex:'#FFCC45'},{t:1,hex:'#FFF9DC'}];
const c={};vm.createContext(c);const source=fs.readFileSync('work/atlas-preset-data.js','utf8');vm.runInContext('globalThis.fire=('+source.match(/\{id:\x27fire\x27[^\n]+/)[0].replace(/,$/,'')+');',c);
assert.deepEqual(Array.from(c.fire.colors,(hex,i)=>({t:c.fire.positions?.[i],hex:hex.toUpperCase()})),expected);
const doc=JSON.parse(fs.readFileSync('work/default-preview.json')),layer=doc.layers.find(p=>p.id==='default-emissive');assert.equal(layer.blend,'add');assert.equal(layer.map.layers.emission.preset,'fire');assert.deepEqual(layer.map.layers.emission.colors,expected);assert.equal(layer.map.layers.emission.transition,'smooth');assert.deepEqual(layer.map.layers.emission.alphas,[{t:0,a:1},{t:1,a:1}]);
console.log('PASS: library Fire and Add emissive default share all seven colors and authored positions, with opaque Smooth mapping.');
