const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('work/vendor/motion-14.0.0-animate.js','utf8');
const context={queueMicrotask,setTimeout,clearTimeout,performance,requestAnimationFrame:cb=>setTimeout(()=>cb(performance.now()),10),cancelAnimationFrame:clearTimeout};
vm.createContext(context);try{vm.runInContext(source,context);}catch(e){console.error(e.message);process.exit(1);}assert.equal(typeof context.Motion.animate,'function');
let value=0;const animation=context.Motion.animate(0,[0,1],{duration:.04,onUpdate:v=>{value=v}});
setTimeout(()=>{assert(value>.9,'Bundled real Motion advances numeric animations');animation.cancel();console.log('PASS: compiled Motion subset exposes and executes the actual animate API.');},160);
