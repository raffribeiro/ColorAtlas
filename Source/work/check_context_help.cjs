/* Isolated lifecycle contract; browser acceptance verifies real layout/top layer. */
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let next=0;const timers=new Map(),listeners=new Map(),elements=[];
class Element {
 constructor(tag='button',attrs={}){this.tagName=tag.toUpperCase();this.attrs={...attrs};this.style={};this.dataset={};this.isConnected=true;this.hidden=false;this.textContent='';this.children=[];this.eventHandlers=new Map();elements.push(this);}
 get id(){return this.attrs.id||'';}set id(v){this.attrs.id=v;}
 getAttribute(k){return this.attrs[k]??null;}setAttribute(k,v){this.attrs[k]=String(v);}hasAttribute(k){return k in this.attrs;}removeAttribute(k){delete this.attrs[k];}
 matches(s){if(s.includes('button,input:'))return ['BUTTON','INPUT','SVG','CANVAS','SELECT'].includes(this.tagName);if(s=== ':focus-visible')return !!this.focusVisible;if(s=== ':popover-open')return !!this.open;return s.split(',').some(x=>{x=x.trim();if(x[0]==='#')return this.id===x.slice(1);const m=x.match(/^\[([\w-]+)="([^"]+)"\]$/);if(m)return this.attrs[m[1]]===m[2];if(/^\[[\w-]+\]$/.test(x))return this.hasAttribute(x.slice(1,-1));return x.toUpperCase()===this.tagName;});}
 closest(s){if(this.matches(s))return this;return null;}
 contains(el){return this===el||this.children.includes(el);}
 append(el){this.children.push(el);}
 getBoundingClientRect(){return {left:100,top:100,bottom:120,width:150,height:20};}
 getClientRects(){return [this.getBoundingClientRect()];}
 addEventListener(n,f){if(!this.eventHandlers.has(n))this.eventHandlers.set(n,[]);this.eventHandlers.get(n).push(f);}
 showPopover(){this.open=true;}hidePopover(){this.open=false;}
}
const root=new Element('div',{id:'munsell-picker'}),body=new Element('body');root.contains=()=>true;
const document={hidden:false,body,getElementById:id=>id===root.id?root:null,createElement:tag=>new Element(tag),addEventListener(n,f){if(!listeners.has(n))listeners.set(n,[]);listeners.get(n).push(f);}};
const window={addEventListener(){}};
const observers=[];class Observer{constructor(callback){this.callback=callback;this.nodes=[];observers.push(this);}observe(node){this.nodes.push(node);}disconnect(){this.nodes=[];}}
const context={MutationObserver:Observer,document,window,Element,innerWidth:800,innerHeight:600,getComputedStyle:()=>({visibility:'visible'}),setTimeout:f=>{timers.set(++next,f);return next;},clearTimeout:id=>timers.delete(id),console};
vm.runInNewContext(fs.readFileSync('work/atlas-context-help.js','utf8'),context);
const api=window.AtlasContextHelp;
const emit=(host,n,e={})=>(host===document?listeners:host.eventHandlers).get(n)?.forEach(f=>f({buttons:0,pointerType:'mouse',clientX:10,clientY:10,...e}));
const flush=()=>{const work=[...timers.values()];timers.clear();work.forEach(f=>f());};
assert.equal(api.delay,650);
const color=new Element('input',{id:'mp-vfx-l'});assert.match(api.describe(color).text,/Black to White/);
const unknown=new Element('button');assert.equal(api.describe(unknown).source,'fallback');
const custom=new Element('button',{'data-context-help':'Exact help'});assert.equal(api.describe(custom).text,'Exact help');
const button=new Element('button',{'data-action':'gradient-add',title:'Original title','aria-describedby':'existing other'});
emit(root,'pointerover',{target:button});assert.equal(timers.size,1);assert.equal(button.hasAttribute('title'),false);assert.equal(elements.find(el=>el.id==='atlas-context-help'),undefined);
flush();let tip=elements.find(el=>el.id==='atlas-context-help');assert.equal(tip.hidden,false);assert.match(tip.textContent,/Add a color key/);assert.equal(button.getAttribute('aria-describedby'),'existing other atlas-context-help');assert.equal(tip.open,true);
button.setAttribute('aria-describedby',button.getAttribute('aria-describedby')+' new-owner');
emit(document,'keydown',{key:'Escape'});assert.equal(tip.hidden,true);assert.equal(button.getAttribute('aria-describedby'),'existing other new-owner');assert.equal(button.getAttribute('title'),'Original title');
emit(root,'pointerover',{target:button});emit(document,'pointerdown');flush();assert.equal(tip.hidden,true);assert.equal(timers.size,0);
emit(root,'pointerover',{target:button,buttons:1});assert.equal(timers.size,0);emit(document,'pointerup');
root.dataset.tour='on';emit(root,'pointerover',{target:button});assert.equal(timers.size,0);delete root.dataset.tour;
emit(root,'pointerover',{target:button});emit(root,'pointermove',{target:button,clientX:90});assert.equal(timers.size,1);emit(root,'pointerout',{target:button,relatedTarget:null});assert.equal(timers.size,0);
button.focusVisible=true;emit(root,'focusin',{target:button});flush();assert.equal(tip.hidden,false);emit(root,'focusout',{target:button});assert.equal(tip.hidden,true);
emit(root,'pointerover',{target:button});emit(document,'scroll');assert.equal(timers.size,0);
emit(root,'pointerover',{target:button,pointerType:'touch'});assert.equal(timers.size,0);
button.isConnected=false;emit(root,'pointerover',{target:button});flush();assert.equal(tip.hidden,true);
emit(document,'pointerdown');button.isConnected=true;emit(root,'pointerover',{target:button,buttons:0});assert.equal(timers.size,1);api.hide();
console.log('PASS contextual help: curated registry, delay, delegation, pointer/focus lifecycle, title and ARIA restoration, tour/drag suppression, teardown.');

const icon=new Element('button',{title:'Icon action'});icon.parentElement=root;
emit(root,'pointerover',{target:icon});assert.equal(icon.getAttribute('aria-label'),'Icon action','Keep title-only accessible name during delay');
icon.focusVisible=true;emit(root,'focusin',{target:icon});emit(root,'pointerout',{target:icon,relatedTarget:null});flush();
assert.equal(tip.hidden,false,'Keyboard focus retains help when pointer leaves');
assert(observers.some(o=>o.nodes.includes(root)),'Removal observer active only while showing');
icon.isConnected=false;observers.forEach(o=>o.callback());assert.equal(tip.hidden,true,'Removed control dismisses tooltip');
assert.equal(icon.getAttribute('aria-label'),null);assert.equal(icon.getAttribute('title'),'Icon action');
assert(observers.every(o=>o.nodes.length===0),'Hide disconnects removal observers');
console.log('PASS focus transfer, title-only accessible name and removal cleanup.');
