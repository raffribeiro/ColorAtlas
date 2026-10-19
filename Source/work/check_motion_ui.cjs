const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html','utf8');
const script=source.match(/<script id="atlas-motion-ui">([\s\S]*?)<\/script>/)?.[1];
assert(script,'Motion feedback controller must be embedded in the offline app');
function harness(reduced=false,available=true){
 const handlers={},frames=new Map(),calls=[];let frame=0;
 const style=()=>({setProperty(k,v){this[k]=v},removeProperty(k){delete this[k]}});
 const element=(attrs={})=>({dataset:{},style:style(),isConnected:true,hidden:false,disabled:false,attrs,rect:{left:0,top:0,width:20,height:20},getBoundingClientRect(){return this.rect},
  getAttribute(k){return this.attrs[k]??null},hasAttribute(k){return k in this.attrs},
  closest(selector){if(selector.includes('[hidden]'))return this.hidden?this:null; if(selector.includes('button')&&this.tag==='button')return this;
   if(selector.includes('[data-gradient-select]')&&this.attrs['data-gradient-select']!==undefined)return this;
   if(selector.includes('[data-studio-preset]')&&this.attrs['data-studio-preset'])return this;
   if(selector.includes('[data-studio-favorite]')&&this.attrs['data-studio-favorite'])return this;
   if(selector.includes('[data-gradient-kind]')&&this.attrs['data-gradient-kind'])return this;
   if(selector.includes('[data-field="color-wheel"]')&&this.wheel)return this;
   if(selector.includes('[data-action=')&&this.attrs['data-action']&&selector.includes(this.attrs['data-action']))return this;
   return null;},querySelector(){return null},contains(other){return this===other}});
 const root=element(),preview=element(),ramp=element(),swatch=element(),selected=element();
 const marks={author:element(),keys:element(),wheel:element(),ramp:element()};
 for(const [id,x,y] of [['author',100,100],['keys',400,200],['wheel',400,450],['ramp',700,600]])marks[id].rect={left:x-10,top:y-10,width:20,height:20};
 root.contains=()=>true;root.querySelector=selector=>selector.includes('.mp-vfx-lab')?marks.author:selector.includes('studio-key-row')?marks.keys:selector.includes('[data-field="color-wheel"]')?marks.wheel:selector.includes('.mp-gradient .color-marker')?marks.ramp:selector.includes('explosion-mapped')?preview:selector.includes('ramp-fill')?ramp:selector.includes('selected-color-preview')?swatch:selector.includes('studio-favorite')?selected:null;
 const media={matches:reduced,addEventListener(type,fn){this.onchange=fn}};
 const document={hidden:false,getElementById:()=>root,addEventListener(t,fn){(handlers[t]??=[]).push(fn)}};
 const window={Motion:available?{animate(target,keyframes,options){const record={target,keyframes,options,canceled:false};calls.push(record);options.onUpdate?.(Array.isArray(keyframes)?keyframes.at(-1):keyframes);return {cancel(){record.canceled=true},finished:Promise.resolve()}}}:null,
  matchMedia:()=>media,addEventListener(t,fn){handlers[t]=[fn]}};
 const context={window,document,matchMedia:window.matchMedia,requestAnimationFrame(fn){frames.set(++frame,fn);return frame},cancelAnimationFrame(id){frames.delete(id)},Map,Set,console};
 vm.runInNewContext(script,context);
 const fire=(type,target,extra={})=>(handlers[type]||[]).forEach(fn=>fn({type,target,button:0,pointerId:1,pointerType:'mouse',isTrusted:true,...extra}));
 const flush=()=>{const work=[...frames.values()];frames.clear();work.forEach(fn=>fn())};
 return {root,preview,ramp,swatch,marks,element,media,calls,fire,flush,frames,window};
}
{
 const h=harness(),b=h.element();b.tag='button';
 h.fire('pointerover',b);assert(h.calls.length,'hover uses Motion');
 h.fire('pointerdown',b);assert(h.calls.some(c=>c.keyframes.scale===.94),'press compresses');
 h.fire('pointercancel',b);assert(h.calls.some(c=>c.keyframes.scale===1),'cancellation settles button');
 const before=h.calls.length;h.fire('pointerover',b,{pointerType:'touch'});assert.equal(h.calls.length,before,'touch cannot cause sticky hover');
 b.disabled=true;h.fire('pointerdown',b);assert.equal(h.calls.length,before,'disabled control stays inert');
}
{
 const h=harness(),b=h.element({'data-studio-preset':'laserblue'});b.tag='button';
 h.fire('click',b);h.fire('click',b);assert.equal(h.frames.size,1,'rapid edits coalesce');
 h.flush();assert(h.calls.some(c=>typeof c.target==='number'),'shared selector pulse uses one numeric Motion animation');
 assert(h.calls.some(c=>c.target===h.preview),'palette feedback includes preview');
 assert(h.calls.some(c=>c.target===h.ramp),'palette feedback includes ramp');
 const old=h.calls.length;h.fire('input',b);h.flush();assert.equal(h.calls.length,old,'continuous edits never trigger preview animation');
}
{
 const h=harness(),b=h.element({'data-gradient-select':'3'});b.tag='button';h.fire('click',b);h.flush();
 assert(h.calls.some(c=>typeof c.target==='number'));
 assert(!h.calls.some(c=>c.target===h.preview),'selecting a key does not animate preview colors');
 h.media.matches=true;h.media.onchange();assert(h.calls.every(c=>c.canceled),'reduced motion cancels in-flight effects');
 assert.equal(h.root.style['--atlas-selection-scale'],'1');
 const count=h.calls.length;h.fire('pointerdown',b);h.fire('click',b);h.flush();assert.equal(h.calls.length,count);
}
{
 for(const h of [harness(true),harness(false,false)]){const b=h.element();b.tag='button';h.fire('pointerdown',b);h.fire('click',b);h.flush();assert.equal(h.calls.length,0,'missing library or reduced motion remains usable')}
 const h=harness(),b=h.element({'data-studio-preset':'laserblue'});b.tag='button';h.fire('click',b);h.fire('pagehide',b);h.flush();assert.equal(h.calls.length,0,'pagehide cancels pending feedback');
}
{
 const h=harness(),menu=h.element(),toast=h.element();
 h.window.AtlasMotion.menu(menu);h.window.AtlasMotion.copied(toast);
 assert(h.calls.some(c=>c.target===menu),'custom dropdown receives entry feedback');
 const t=h.calls.find(c=>c.target===toast);assert(t&&!t.keyframes.y&&!t.keyframes.scale,'copy feedback preserves toast anchor transform');
 const b=h.element();b.tag='button';h.fire('pointerover',b);b.isConnected=false;
 menu.tag='button';h.fire('pointerdown',menu);assert(h.calls.find(c=>c.target===b).canceled,'detached controls release animations');
 h.fire('pagehide',menu);h.fire('pageshow',menu);menu.tag='button';const before=h.calls.length;
 h.fire('pointerdown',menu);assert(h.calls.length>before,'restored page can animate again');
}
assert(source.includes('class="atlas-selection-feedback"'),'all four ring views share the pulse wrapper');
assert(source.includes('id="atlas-motion-vendor"'),'real Motion distribution is bundled');
assert(!/<script[^>]+src=["'][^"']*motion/.test(source),'no network dependency at runtime');
console.log('PASS: Motion gestures, selector feedback, coalesced palette feedback, offline fallback, cancellation and reduced motion.');
module.exports={harness};
