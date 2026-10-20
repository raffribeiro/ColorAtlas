const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('work/atlas-hits.js','utf8');
function run({origin='https://raffribeiro.github.io',pathname='/ColorAtlas/',hidden=false,dnt='0',gpc=false,bot=false,frame=false}={}){
 const requests=[],listeners={};const doc={prerendering:false,visibilityState:hidden?'hidden':'visible',addEventListener:(n,f)=>listeners[n]=f,removeEventListener:n=>delete listeners[n]};
 const w={};w.top=frame?{}:w;w.self=w;
 const context=vm.createContext({window:w,document:doc,location:{origin,pathname},navigator:{doNotTrack:dnt,globalPrivacyControl:gpc,webdriver:bot},Image:class{set src(v){requests.push(v)}},Date,Math});
 vm.runInContext(source,context);vm.runInContext(source,context);
 return {requests,doc,listeners};
}
assert.equal(run().requests.length,1,'one hit per page even if initialized twice');
for(const config of [{origin:'null'},{origin:'http://localhost:8000'},{origin:'https://example.com'},{pathname:'/Other/'},{dnt:'1'},{gpc:true},{bot:true},{frame:true}])assert.equal(run(config).requests.length,0,JSON.stringify(config));
const h=run({hidden:true});assert.equal(h.requests.length,0);h.doc.visibilityState='visible';h.listeners.visibilitychange();assert.equal(h.requests.length,1);
assert.equal(run({pathname:'/ColorAtlas/index.html'}).requests.length,1);
const url=new URL(run().requests[0]);assert.equal(url.origin,'https://hits.sh');assert.equal(url.pathname,'/raffribeiro.github.io/ColorAtlas.svg');assert.deepEqual([...url.searchParams.keys()],['_']);
console.log('PASS production-only, one load count, no iframe/local/opt-out/bot hits and no user content in URL');
