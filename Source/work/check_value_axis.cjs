const fs=require('fs'),vm=require('vm'),assert=require('assert');
const file='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const html=fs.readFileSync(file,'utf8'),data=html.match(/<script type="application\/json" id="mp-data">([\s\S]*?)<\/script>/)[1];
const nodes=new Map();function node(k){if(!nodes.has(k))nodes.set(k,{value:'',textContent:'',innerHTML:'',style:{},parentElement:{hidden:true},clientWidth:k.includes('scene')?420:700,clientHeight:390,handlers:{},attrs:{},addEventListener(n,f){this.handlers[n]=f},setAttribute(n,v){this.attrs[n]=v},getBoundingClientRect(){return {left:0,top:0}},setPointerCapture(id){this.capture=id},hasPointerCapture(id){return this.capture===id},releasePointerCapture(){this.capture=null},select(){}});return nodes.get(k);}
const root={querySelector:node,addEventListener(n,f){node("root").handlers[n]=f}};node('#mp-data').textContent=data;
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
const context={document:{getElementById(){return root}},window:{openai:{widgetState:{modelContent:{h:'5G',v:4,c:0}},setWidgetState(){return Promise.resolve()}},addEventListener(){}},navigator:{},ResizeObserver:class{constructor(fn){}observe(){}},console};
vm.runInNewContext(script,context);
const scene=node('.mp-scene'),slider=node('#mp-value'),cx=210,base=342,z=26.5;
function event(y){return {pointerId:7,button:0,clientX:cx,clientY:y,preventDefault(){},type:'pointermove'}}
const down=event(base-4*z);down.type='pointerdown';scene.handlers.pointerdown(down);
scene.handlers.pointermove(event(base-8*z));assert.equal(slider.value,8);assert.equal(node('[data-field="notation"]').textContent,'N 8/');
scene.handlers.pointermove(event(-200));assert.equal(slider.value,10);
scene.handlers.pointermove(event(900));assert.equal(slider.value,0);
const up=event(base-3*z);up.type='pointerup';scene.handlers.pointerup(up);assert.equal(slider.value,3);assert.equal(scene.capture,null);
scene.handlers.click({});assert.equal(slider.value,3);
slider.value='7';slider.handlers.input();assert.match(scene.innerHTML,/Value 7 · arraste/);
console.log('PASS: drag updates Value; clamps 0–10; synchronizes notation and side slider; pointer release; suppresses trailing click.');
