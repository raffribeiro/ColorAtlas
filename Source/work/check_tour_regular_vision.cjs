const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const s=fs.readFileSync('work/atlas-onboarding.js','utf8');
const row=s.split('\n').find(l=>l.includes("title: 'Attention and bloom'"));
let changes=0;const vision={value:'protanopia',dispatchEvent(e){assert.equal(e.type,'change');changes++}};
const c={$:q=>q==='#color-vision'?vision:null,preview(){},Event};vm.createContext(c);vm.runInContext('globalThis.step=('+row.trim().replace(/,$/,'')+');',c);
assert.equal(typeof c.step.before,'function','Attention and bloom resets vision on entry');
for(const mode of ['protanopia','grayscale']){vision.value=mode;c.step.before();assert.equal(vision.value,'normal');}
assert.equal(changes,2,'Notify the renderer on entry and re-entry');
console.log('PASS: Attention and bloom restores Regular Vision on entry and re-entry.');
