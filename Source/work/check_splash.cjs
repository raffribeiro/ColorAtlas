const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const path='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const source=fs.readFileSync(path,'utf8');
const match=source.match(/<script id="atlas-splash-ui">([\s\S]*?)<\/script>/);
assert(match,'App must include the startup splash module');
function harness(reduced=false,unsupported=false,random=()=>0){
 const timers=new Map(),frames=new Map(),events={},button={focused:false,focus(){this.focused=true}};
 const percent={textContent:'0%'},status={textContent:''},fill={style:{}},progress={attrs:{},setAttribute(k,v){this.attrs[k]=String(v)},querySelector(){return fill}};
 const panel={hidden:true,showModal(){if(unsupported)throw new Error('Unsupported modal');this.open=true},close(){this.open=false;events.close?.()},addEventListener(k,f){events[k]=f},querySelector(selector){return selector==='[data-splash-percent]'?percent:selector==='[data-splash-status]'?status:selector==='.splash-progress'?progress:button}};
 let id=0,restored=0;
 const root={attrs:{},setAttribute(k,v){this.attrs[k]=v},removeAttribute(k){delete this.attrs[k]}};let paused=0,boots=0;const noise={pauseAnimations(){paused++}};
 const doc={getElementById(){return root},querySelector(selector){return selector==='.splash-noise'?noise:panel},activeElement:{focus(){restored++}}};const window={};
 vm.runInNewContext(match[1],{window,Math:{random,round:Math.round,floor:Math.floor},document:doc,matchMedia:()=>({matches:reduced}),setTimeout(fn,ms){timers.set(++id,{fn,ms});return id},clearTimeout(k){timers.delete(k)},requestAnimationFrame(fn){frames.set(++id,fn);return id},cancelAnimationFrame(k){frames.delete(k)}});
 assert(window.AtlasStartup,'Loading must control when the editor initializes');window.AtlasStartup.run(()=>boots++);
 return {panel,timers,frames,events,button,status,percent,progress,fill,window,root,paint(){const q=[...frames.values()];frames.clear();q.forEach(fn=>fn());},async ready(){await new Promise(setImmediate);for(let i=0;i<2;i++){this.paint();await new Promise(setImmediate);}},get boots(){return boots},get paused(){return paused},get restored(){return restored},finish(){const item=[...timers][0];if(item){timers.delete(item[0]);item[1].fn();return item[1].ms}}};
}
(async()=>{
let h=harness();assert(h.panel.open,'Automatically show a modal without touching saved state');assert(h.button.focused,'Skip is immediately keyboard accessible');assert.equal(h.boots,0,'Editor remains uninitialized during the splash');assert.equal(h.root.attrs['data-boot'],'loading');
const pool=JSON.parse(fs.readFileSync('work/atlas-splash-phrases.json','utf8'));
assert.equal(pool.length,20,'Exactly twenty loading jokes');assert.equal(new Set(pool).size,20,'Each phrase is distinct');
const phrases=pool.slice(0,3);
let elapsed=0;
for(let step=0;step<phrases.length;step++){
 assert(h.panel.open,'Each step stays visible');assert.equal(h.status.textContent,phrases[step],'Show a distinct playful loading phrase');
 assert.equal(h.progress.attrs['aria-valuenow'],String([10,43,100][step]),'Accessible progress matches the current step');
 assert.equal(h.percent.textContent,`${[10,43,100][step]}%`,'Visible percentage matches the bar and accessible step value');
 assert.equal(h.progress.attrs['aria-valuetext'],phrases[step]);assert.equal(h.fill.style.transform,`scaleX(${[10,43,100][step]/100})`,'Bar advances in three steps');
 assert.equal(h.timers.size,1,'Only one pending step timer');
 if(step===2)assert.equal(h.boots,1,'Editor initializes at the last loading step, behind the visible splash');
 elapsed+=h.finish();
}
assert(h.panel.open&&h.root.attrs['data-boot']==='loading','Keep the splash visible while initial rendering settles');await h.ready();
assert.equal(elapsed,660,'Minimum timing: three 220ms phases');assert.equal(h.boots,1,'Initialize editor exactly once when loading finishes');assert(!h.root.attrs['data-boot']);assert.equal(h.paused,1,'Stop Perlin animation on completion');assert(!h.panel.open);assert.equal(h.timers.size,0);assert.equal(h.restored,1,'Restore focus after automatic dismissal');
const seen=new Set();
for(let first=0;first<pool.length;first++){
 let draws=0;h=harness(false,false,()=>{const i=draws++;return i===1?(first+.5)/pool.length:0});
 assert.equal(h.status.textContent,pool[first],'Each phrase can be drawn at startup');
 const selected=[];for(let i=0;i<3;i++){selected.push(h.status.textContent);seen.add(h.status.textContent);h.finish();}
 await h.ready();assert.equal(new Set(selected).size,3,'Never repeat a phrase within one opening');assert(draws>=3,'Draw bounded randomized phases');assert(!h.panel.open);
}
assert.equal(seen.size,20,'All twenty phrases are reachable');
const counts=new Set(),patterns=new Set(),durations=new Set();
for(let seed=1;seed<=30;seed++){
 let n=seed*9137;h=harness(false,false,()=>((n=Math.imul(n,1664525)+1013904223>>>0)/4294967296));
 const values=[],selected=[];let elapsed=0;
 while(true){const value=Number(h.progress.attrs['aria-valuenow']);values.push(value);selected.push(h.status.textContent);assert.equal(h.percent.textContent,value+'%');assert.equal(h.fill.style.transform,`scaleX(${value/100})`);const delay=h.finish();assert(delay>=220&&delay<=420);elapsed+=delay;if(value===100)break;assert(values.length<7);}
 await h.ready();assert(values.length>=3&&values.length<=6);assert.equal(new Set(selected).size,values.length);assert(values.every((v,i)=>v>0&&(!i||v>values[i-1])));assert(!h.panel.open);assert.equal(h.boots,1);counts.add(values.length);patterns.add(values.join(','));durations.add(elapsed);
}
assert(counts.size>=3&&[...counts].some(n=>n>3),'Openings vary count and can exceed three phases');assert(patterns.size>10&&durations.size>10,'Percentages and timing vary across openings');

h=harness(false,false,()=>1-Number.EPSILON);assert.equal(h.status.textContent,pool.at(-1),'Upper random boundary remains in range');h.panel.close();
h=harness();h.finish();h.events.click({target:{closest:()=>true}});assert(h.panel.open,'Skip still covers the initial render');await h.ready();assert(!h.panel.open);assert.equal(h.timers.size,0,'Skip midway clears the next step timer');assert.equal(h.restored,1);assert.equal(h.boots,1,'Skip initializes the editor');assert.equal(h.paused,1);assert.equal(h.finish(),undefined,'No late step runs after Skip');
h=harness();h.events.cancel({preventDefault(){}});await h.ready();assert(!h.panel.open,'Escape dismisses');assert.equal(h.boots,1);assert.equal(h.timers.size,0);
h=harness();h.panel.close();assert.equal(h.timers.size,0,'Native close releases timer');h.panel.close();assert.equal(h.boots,1,'Repeated close never reinitializes the app');assert.equal(h.restored,1);
h=harness(false,true);assert(!h.panel.open&&h.panel.hidden,'Unavailable native modal leaves the editor unobstructed');assert.equal(h.timers.size,0);assert.equal(h.boots,1,'Unsupported modal starts the app without delay');
h=harness(true);assert(!h.panel.open,'Reduced motion bypasses the decorative delay');assert.equal(h.timers.size,0);assert.equal(h.boots,1,'Reduced motion starts the app immediately');
// Regression: warm up behind the splash, wait for image/font work, then allow two layout frames.
h=harness();let resolveAsset;h.window.AtlasStartup.waitFor(new Promise(resolve=>{resolveAsset=resolve;}));
h.finish();h.finish();assert.equal(h.boots,1);assert(h.panel.open);h.finish();await new Promise(setImmediate);
assert.equal(h.frames.size,0,'Do not reveal while a startup asset remains pending');assert(h.panel.open);assert.equal(h.root.attrs['data-boot'],'loading');
resolveAsset();await new Promise(setImmediate);assert.equal(h.frames.size,1);
h.paint();assert(h.panel.open,'The first layout frame remains covered');assert.equal(h.frames.size,1);
h.paint();assert(!h.panel.open,'Reveal after the second layout frame');assert.equal(h.timers.size,0);
h=harness();h.window.AtlasStartup.waitFor(Promise.reject(new Error('Image unavailable')));h.events.click({target:{closest:()=>true}});await h.ready();assert(!h.panel.open,'Failed assets never trap the app behind loading');
h=harness();let late;h.window.AtlasStartup.waitFor(new Promise(resolve=>{late=resolve;}));h.events.click({target:{closest:()=>true}});
h.events.click({target:{closest:()=>true}});assert.equal(h.boots,1,'Repeated Skip does not reinitialize');assert.equal(h.timers.size,1);
assert.equal(h.finish(),1500,'Unresponsive storage/image work has a bounded readiness fallback');await h.ready();assert(!h.panel.open);
late();await h.ready();assert.equal(h.frames.size,0,'Late completion never schedules a second reveal');assert.equal(h.restored,1);
h=harness();h.events.click({target:{closest:()=>true}});await new Promise(setImmediate);assert.equal(h.frames.size,1);h.panel.close();assert.equal(h.frames.size,0,'Native close cancels pending reveal frames');assert.equal(h.timers.size,0);assert.equal(h.boots,1);
assert(source.includes('id="atlas-splash"')&&source.includes('aria-labelledby="atlas-splash-title"'),'Splash has an accessible title');
for(const file of ['atlas-splash-bundle.js','atlas-splash.css','atlas-splash.html'])assert(source.includes(fs.readFileSync('work/'+file,'utf8').trim()),file+' stays synchronized');
assert(source.includes('data-splash-status')&&source.includes('aria-valuemin="0"')&&source.includes('aria-valuemax="100"'),'Status and progress have accessible markup');
assert(source.includes('class="splash-progress-row"')&&source.includes('data-splash-percent aria-hidden="true">0%</span>'),'Percentage sits beside the bar without duplicating screen-reader progress');
const css=fs.readFileSync('work/atlas-splash.css','utf8');
assert(css.includes('font-variant-numeric:tabular-nums'),'Percentage digits keep a stable width');
assert(css.includes('transition:transform .3s ease-out'),'Fill eases between steps');
assert(css.includes('animation:atlas-splash-sheen .9s linear infinite')&&css.includes('@keyframes atlas-splash-sheen'),'A moving sheen adds motion within each step');
assert(css.includes('transition:none')&&css.includes('animation:none'),'Reduced motion disables fill and sheen animation');
assert(source.includes('<feTurbulence')&&source.includes('type="fractalNoise"')&&source.includes('attributeName="baseFrequency"'),'Animate a real Perlin field');
assert(css.includes('[data-boot="loading"]')&&css.includes('visibility:hidden'),'Keep the editor hidden before initialization');
assert(source.indexOf('<script id="atlas-splash-ui">')<source.indexOf('const raw=JSON.parse'),'Splash controls startup before the editor script');
// Execute the actual main editor with the existing full-app DOM harness.
const setup=fs.readFileSync('work/check_library_naming.cjs','utf8').split('vm.runInNewContext(script.replace')[0];
for(const skip of [false,true]){
 h=harness();const integration={require,process,console,structuredClone,boot:h};
 vm.runInNewContext(setup+`context.window.AtlasStartup=boot.window.AtlasStartup;
 vm.runInNewContext(script.replace('new ResizeObserver','globalThis.startedEditor={state,gradientPresets}; new ResizeObserver'),context);
 globalThis.editorContext=context;`,integration);
 assert(!integration.editorContext.startedEditor,'Real editor starts when warmup reaches the final step');
 if(skip)h.events.click({target:{closest:()=>true}});else{h.finish();h.finish();assert(integration.editorContext.startedEditor,'Initialize the real editor before reveal');assert(h.panel.open);h.finish();}
 integration.editorContext.explosionImage.onerror();await h.ready();
 assert.equal(integration.editorContext.startedEditor.gradientPresets.length,1086,'Start the complete editor after dismissal');
 assert.equal(integration.editorContext.startedEditor.state.system,'vfx');
 const started=integration.editorContext.startedEditor;h.panel.close();assert.equal(integration.editorContext.startedEditor,started,'No second initialization on repeated close');
}
console.log('PASS: variable loading phases, unique phrases from 20, editor warmup behind the splash, readiness/frame barrier, startup exactly once, dark Perlin SVG, Skip/Escape, focus, animation/timer cleanup and reduced-motion bypass.');

})().catch(error=>{console.error(error);process.exitCode=1;});
