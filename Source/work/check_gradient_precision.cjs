const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
assert(fs.existsSync('work/atlas-gradient-editing.js'),'Precise SVG mapping is required');
const c={};vm.createContext(c);vm.runInContext(fs.readFileSync('work/atlas-gradient-editing.js','utf8').split('// Gradient editing integration')[0],c);
const svg={getScreenCTM:()=>null,getBoundingClientRect:()=>({left:100,top:50,width:600,height:220}),viewBox:{baseVal:{x:0,y:0,width:600,height:110}}};
const p=c.atlasGradientPoint(svg,{clientX:250,clientY:160});assert.equal(p.x,150);assert.equal(p.y,55,'Letterbox padding is removed');
const scaled={getScreenCTM:()=>({inverse:()=>({})}),createSVGPoint:()=>({matrixTransform(){return{x:(this.x-100)/.5,y:(this.y-50)/.5}}})};assert.equal(c.atlasGradientPoint(scaled,{clientX:250,clientY:92}).x,300,'Scaled SVG maps to local coordinates');
const keys=[{t:.5},{t:.51}];assert.equal(c.atlasNearestGradientKey({x:51,y:84},keys,{left:0,width:100},-1),1,'Nearest point wins overlapping hit boxes');assert.equal(c.atlasNearestGradientKey({x:51,y:84},keys,{left:0,width:100},0),0,'Selected circle takes priority');
console.log('PASS: exact transformed coordinates, letterboxing and overlapping point selection.');
