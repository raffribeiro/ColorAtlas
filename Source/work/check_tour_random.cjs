const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const s=fs.readFileSync('work/atlas-onboarding.js','utf8');
const row=s.split('\n').find(l=>l.includes("title: 'Roll the dice'"));
const button={},preset={value:'custom',disabled:false,dispatchEvent(){this.disabled=true;setTimeout(()=>{this.disabled=false},20)}},mode={value:'colorplay',dispatchEvent(){this.changed=true}};
const c={$:q=>q==='#preview-preset-select'?preset:q==='#random-type'?mode:q.includes('random-all-layers')?button:{textContent:''},preview(){},Event,setTimeout};vm.createContext(c);
const helper=s.match(/async function prepareRandom\(\) \{[\s\S]*?\n\}/);assert(helper,'Random preparation exists');vm.runInContext(helper[0]+';globalThis.step=('+row.trim().replace(/,$/,'')+');',c);
(async()=>{assert.equal(c.step.hand(),button);let ready=false;const task=c.prepareRandom().then(()=>ready=true);assert(!ready);assert.equal(preset.value,'codex-use-esse');await task;assert.equal(mode.value,'auto');assert(mode.changed);assert(!preset.disabled);console.log('PASS: Random uses Default, waits for preset loading, sets Harmonic and points at Random.');})();
