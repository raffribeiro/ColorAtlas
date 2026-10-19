const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
assert(fs.existsSync('work/atlas-random-roles.js'),'Random needs a 60/30/10 scene-role analysis');
const core=fs.readFileSync('work/atlas-preview-layers-core.js','utf8'),source=fs.readFileSync('work/atlas-random-roles.js','utf8').split('// Role-aware generation adapter')[0];const c={};vm.createContext(c);vm.runInContext(core+source,c);
const sample=(t,map)=>({rgb:map.rgb,alpha:map.alpha??1});
const layer=(id,alpha,rgb,blend='normal',opacity=1)=>({id,visible:true,opacity,blend,gray:Uint8Array.from(alpha.map(()=>128)),alpha:Uint8Array.from(alpha),map:{layers:{rgb},view:'active',active:'emission',split:.6}});
const stack=[layer('bg',[255,255,255,255],[.1,.1,.1]),layer('smoke',[255,0,0,0],[.2,.3,.4]),layer('glow',[255,0,0,0],[.05,.02,.01],'add')];
const before=JSON.stringify(stack),plan=c.atlasSceneRoles(stack,sample);assert.equal(JSON.stringify(stack),before,'Analysis is read-only');assert.equal(plan.get('bg').role,'dominant');assert.equal(plan.get('smoke').role,'secondary');assert.equal(plan.get('glow').role,'accent');assert(Math.abs([...plan.values()].reduce((n,p)=>n+p.share,0)-1)<1e-9);
stack[2].map.layers.rgb=[0,0,0];assert.equal(c.atlasSceneRoles(stack,sample).get('glow').share,0,'Black Add contributes no color');stack[1].visible=false;assert.equal(c.atlasSceneRoles(stack,sample).get('smoke').share,0,'Hidden layers contribute nothing');
stack[1].visible=true;stack[1].alpha.fill(255);stack[1].map.layers.rgb=[.6,.6,.6];stack[2].visible=false;assert.equal(c.atlasSceneRoles(stack,sample).get('bg').share,0,'Opaque upper layers occlude the background');assert.equal(c.atlasSceneRoles(stack,sample).get('smoke').role,'dominant');
stack[1].opacity=0;assert.equal(c.atlasSceneRoles(stack,sample).get('bg').role,'dominant');assert.equal(c.atlasSceneRoles(stack,sample).get('smoke').share,0);
assert.equal(c.atlasSceneRoles([],sample).size,0);console.log('PASS: read-only scene roles include visibility, opacity, source/ramp alpha, occlusion and black Add neutrality.');

const bright=[layer('base',[255,255,255,255],[.1,.1,.1]),layer('detail',[255,0,0,0],[.2,.3,.4]),layer('add1',[255,255,255,255],[.4,.4,.4],'add'),layer('add2',[255,255,255,255],[.3,.3,.3],'add')];
const roles=c.atlasSceneRoles(bright,sample);assert.equal(roles.get('base').role,'dominant');assert.equal(roles.get('detail').role,'secondary');for(const id of ['add1','add2']){assert.equal(roles.get(id).role,'accent');assert.equal(roles.get(id).target,.1);}
console.log('PASS: Add layers remain 10% accents regardless of contribution; other layers rank independently.');
