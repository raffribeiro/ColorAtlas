const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
assert(fs.existsSync('work/atlas-history-core.js'),'Undo/Redo must provide a ten-action history engine');
const c={};vm.createContext(c);vm.runInContext(fs.readFileSync('work/atlas-history-core.js','utf8'),c);
let value=0,deny=false;const h=c.createAtlasHistory({read:()=>({value}),apply:s=>{if(deny)throw Error('blocked');value=s.value},signature:s=>String(s.value),changed(){}});
assert.equal(h.undo(),false);value=1;h.commit('First');value=2;h.commit('Second');assert.equal(h.entries().length,2);h.undo();assert.equal(value,1);h.redo();assert.equal(value,2);
h.begin();for(let i=3;i<=20;i++){value=i;h.commit('Drag');}assert.equal(h.entries().length,2);h.end('Drag');assert.equal(h.entries().length,3,'One drag is one action');h.undo();assert.equal(value,2);h.redo();assert.equal(value,20);
for(let i=21;i<=35;i++){value=i;h.commit('Edit '+i);}assert.equal(h.entries().length,10);for(let i=0;i<10;i++)assert(h.undo());assert.equal(value,25);assert.equal(h.undo(),false);assert.equal(h.entries().length,10,'Undone actions remain visible');h.redo();assert.equal(value,26);value=99;h.commit('Branch');assert.equal(h.redo(),false);assert(h.entries().some(e=>e.label==='Branch'));
h.reset();assert.equal(h.entries().length,0);value=100;h.commit('Failure');deny=true;assert.throws(()=>h.undo());assert.equal(value,100);deny=false;assert(h.undo());assert.equal(value,99,'Failure keeps history intact');
console.log('PASS: Undo/Redo, ten-action bound, single drag, branching, startup reset and failed restore preserve history.');

// Snapshot signatures can include megabytes of base64. A stable current snapshot
// must be serialized once, not on every unrelated commit attempt.
let signatureCalls=0,live={value:0};
const cached=c.createAtlasHistory({read:()=>({...live}),apply:s=>{live={...s}},signature:s=>{signatureCalls++;return JSON.stringify(s)}});
assert.equal(signatureCalls,1,'Initialize current signature once');
cached.commit('No change');assert.equal(signatureCalls,2,'Only serialize the candidate');
live.value=1;cached.commit('Edit');assert.equal(signatureCalls,3);
cached.undo();assert.equal(live.value,0);cached.redo();assert.equal(live.value,1);
cached.reset();live.value=2;cached.commit('After reset');cached.undo();assert.equal(live.value,1);
console.log('PASS history reuses current signatures while preserving undo/redo and reset.');
