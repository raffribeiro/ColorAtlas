const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const s=fs.readFileSync('work/atlas-onboarding.js','utf8');
const docs={},tutorial={};const c={$:q=>q.includes('documentation')?docs:tutorial};vm.createContext(c);
for(const name of ['GUIDE','FINAL']){const line=s.split('\n').find(l=>l.startsWith('const '+name+' = '));assert(line,name+' popup exists');vm.runInContext(line+';globalThis.'+name+'='+name,c);}
assert.equal(c.GUIDE.target(),docs);assert.equal(c.FINAL.target(),tutorial);assert(!c.GUIDE.split&&!c.FINAL.split);
assert(s.includes("seq.push({ kind: 'guide' }, { kind: 'final' })"));
console.log('PASS: ending shows Documentation then Tutorial, each with one target.');
