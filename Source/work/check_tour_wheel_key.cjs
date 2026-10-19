const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const tour=fs.readFileSync('work/atlas-onboarding.js','utf8');
const helper=tour.slice(tour.indexOf('function selectKey(n)'),tour.indexOf('// Zoom the 3D view'));
for(const title of ['Paint with the wheel','The color solid']){
 const entry=tour.split('\n').find(line=>line.includes("title: '"+title+"'"));let selected=6,clicks=0;
 const rows=[1,4,6].map(n=>({textContent:' '+n+' #123456 Copy HEX',querySelector:()=>({click(){selected=n;clicks++}})}));
 const ctx={root:{querySelectorAll:s=>{assert.equal(s,'.studio-key-row');return rows}},preview(){},solid(){}};vm.createContext(ctx);
 vm.runInContext(helper+';globalThis.step=('+entry.trim().replace(/,$/,'')+');',ctx);
 assert.equal(typeof ctx.step.before,'function',title+' chooses its teaching key on entry');ctx.step.before();assert.equal(selected,4);selected=1;ctx.step.before();assert.equal(selected,4,title+' resets to key 4 on Back');assert.equal(clicks,2);assert(ctx.step.text.includes('<b>4</b>'),'Step explains the selected key');
}
console.log('PASS: wheel and color-solid tutorial steps select key 4 on entry/re-entry and explain the selection.');
