const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const script=fs.readFileSync('work/atlas-documentation-examples.js','utf8');assert(script.includes('munsell(fig)'),'Munsell needs an interactive example');
const raw=JSON.parse(fs.readFileSync('work/munsell-colors.json')),before=JSON.stringify(raw),nodes={},outputs={H:{dataset:{},textContent:'5R · Red'},V:{dataset:{},textContent:'5'},C:{dataset:{},textContent:'6'}},read={},reset={handlers:{},addEventListener(k,f){this.handlers[k]=f}};let paints=0;const texts=[];
for(const [id,type,value] of [['H','range','0'],['V','range','5'],['C','range','6']])nodes[id]={type,value,dataset:{k:id},handlers:{},attrs:{},getAttribute(k){return this.attrs[k]??null},removeAttribute(k){delete this.attrs[k]},setAttribute(k,v){this.attrs[k]=v},addEventListener(k,f){this.handlers[k]=f}};
const ctx={canvas:{width:640,height:430},fillRect(){paints++},beginPath(){},moveTo(){},lineTo(){},stroke(){},fill(){},arc(...args){assert(args.every(Number.isFinite),'Canvas coordinates remain finite')},fillText(text,x,y){texts.push({text,x,y})},setLineDash(){},closePath(){}};
const fig={querySelector(s){if(s==='[data-doc-reset]')return reset;let m;if((m=s.match(/data-k="(.*?)"/)))return nodes[m[1]];if((m=s.match(/data-o="(.*?)"/)))return outputs[m[1]];if(s.includes('data-r='))return read;if(s.includes('data-c='))return {getContext:()=>ctx};},querySelectorAll:s=>Object.values(s==='[data-k]'?nodes:outputs)};
const panel={},root={querySelector:s=>s==='#atlas-documentation'?panel:s==='#mp-data'?{textContent:JSON.stringify(raw)}:null};
const c={document:{getElementById:()=>root}};vm.createContext(c);vm.runInContext(script.replace('const started = new WeakSet();','globalThis.mount=examples.munsell;return;const started = new WeakSet();'),c);c.mount(fig);assert(read.innerHTML.includes('5R 5/6'));assert(read.innerHTML.toLowerCase().includes(raw.samples['5R']['5']['6'][0]));
for(const family of ['R','YR','Y','GY','G','BG','B','PB','P','RP'])for(let v=1;v<=9;v++){
 nodes.H.value=String(['R','YR','Y','GY','G','BG','B','PB','P','RP'].indexOf(family));nodes.V.value=String(v);nodes.C.value='100';nodes.H.handlers.input();const allowed=Object.entries(raw.samples['5'+family][v]).filter(([,p])=>!p[1]).map(([n])=>+n),max=Math.max(0,...allowed);
 assert(outputs.H.textContent.startsWith('5'+family+' · '));assert(nodes.H.attrs['aria-valuetext'].startsWith('5'+family+' · '));assert.equal(+nodes.C.max,max);assert.equal(+nodes.C.value,max);assert.equal(String(outputs.C.textContent),String(max));assert.equal(nodes.C.disabled,max===0);
 if(max)assert(read.innerHTML.toLowerCase().includes(raw.samples['5'+family][v][max][0]));
 nodes.C.value='0';nodes.C.handlers.input();assert(read.innerHTML.includes('N '+v));assert(read.innerHTML.toLowerCase().includes(raw.neutrals[v]));
}
assert(paints>90);assert.equal(JSON.stringify(raw),before,'Demo never modifies shared Munsell samples');
console.log('PASS: Munsell demo renders real samples, 90 hue/value combinations, in-gamut chroma bounds, live notation/readouts and hue-independent neutral values.');

const hueAnchors=()=>Object.fromEntries(texts.filter(t=>['R','YR','Y','GY','G','BG','B','PB','P','RP'].includes(t.text)).slice(-10).map(t=>[t.text,[t.x,t.y]]));
nodes.V.value='5';nodes.H.value='0';nodes.C.value='6';nodes.H.handlers.input();const anchors=hueAnchors();nodes.H.value='5';nodes.H.handlers.input();assert.deepEqual(hueAnchors(),anchors,'Hue sectors stay fixed while selection changes');assert(texts.some(t=>t.text==='5BG · Blue-Green'),'Chosen hue is identified by name in the diagram');

// Reset restores dependent chroma bounds and every visible readout without
// mounting the example again or creating another input/reset listener.
const listeners=Object.values(nodes).map(n=>n.handlers.input),resetListener=reset.handlers.click;
for(let i=0;i<3;i++){
 nodes.H.value='7';nodes.V.value='1';nodes.C.value='100';nodes.H.handlers.input();
 reset.handlers.click();
 assert.equal(nodes.H.value,'0');assert.equal(nodes.V.value,'5');assert.equal(+nodes.C.value,6);
 assert(read.innerHTML.includes('5R 5/6'));assert(outputs.H.textContent.startsWith('5R · Red'));
 assert.equal(String(outputs.V.textContent),'5');assert.equal(String(outputs.C.textContent),'6');
 assert.equal(+nodes.C.max,Math.max(...Object.entries(raw.samples['5R']['5']).filter(([,p])=>!p[1]).map(([n])=>+n)));
 assert.equal(reset.handlers.click,resetListener);assert.deepEqual(Object.values(nodes).map(n=>n.handlers.input),listeners);
}
console.log('PASS: repeated Reset example restores initial Munsell controls, dynamic chroma range and readouts without new listeners.');
