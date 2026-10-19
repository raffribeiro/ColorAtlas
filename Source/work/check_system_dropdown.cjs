const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html','utf8');
const code=html.match(/function installIframeDropdown\(select,label\)\{[\s\S]*?\n\}/)?.[0];
assert(code,'System must use an HTML menu inside the iframe, without relying on a native popup');
const documentHandlers={},windowHandlers={},menus=[];
const document={activeElement:null,body:{appendChild(el){menus.push(el);}},createElement(){return element();},addEventListener(t,fn){(documentHandlers[t]??=[]).push(fn)}};
function element(){return {children:[],attrs:{},style:{},handlers:{},hidden:false,addEventListener(t,fn){(this.handlers[t]??=[]).push(fn)},setAttribute(k,v){this.attrs[k]=v},appendChild(el){this.children.push(el)},replaceChildren(){this.children=[]},querySelector(){return this.children.find(el=>el.attrs['aria-selected']==='true')},get firstElementChild(){return this.children[0]},contains(el){return this===el||this.children.includes(el)},focus(){document.activeElement=this},getBoundingClientRect(){return {left:1100,bottom:72,width:155}},dispatchEvent(e){for(const fn of this.handlers[e.type]||[])fn(e)}};}
const context={document,window:{innerWidth:1289,innerHeight:980,addEventListener(t,fn){(windowHandlers[t]??=[]).push(fn)}},Event:class{constructor(type){this.type=type}}};
vm.runInNewContext(code+';globalThis.install=installIframeDropdown;',context);
const select=element();select.id='mp-system';select.value='munsell';select.options=[['munsell','Munsell'],['vfx','VFX · emission designer'],['labcart','OKLab · 3D volume · D65'],['lab','CIELCh · cylindrical Lab · D65']].map(([value,textContent])=>({value,textContent}));
let changes=0;select.addEventListener('change',()=>changes++);context.install(select,'System');
const menu=menus[0],fire=(el,t,props={})=>{let prevented=false;for(const fn of el.handlers[t]||[])fn({...props,preventDefault(){prevented=true}});return prevented};
assert(menu.hidden);assert(fire(select,'pointerdown',{button:0}));assert(!menu.hidden);assert.equal(menu.children.length,4);assert.equal(select.attrs['aria-expanded'],'true');assert.equal(menu.attrs['aria-label'],'System');
for(const option of select.options){if(menu.hidden)fire(select,'pointerdown',{button:0});const button=menu.children.find(el=>el.textContent===option.textContent);assert(button);fire(button,'click');assert.equal(select.value,option.value);assert(menu.hidden);assert.equal(document.activeElement,select);}
assert.equal(changes,4);
fire(select,'keydown',{key:'Enter'});assert(!menu.hidden);fire(menu,'keydown',{key:'Home'});assert.equal(document.activeElement,menu.children[0]);fire(menu,'keydown',{key:'ArrowDown'});assert.equal(document.activeElement,menu.children[1]);fire(menu,'keydown',{key:'Escape'});assert(menu.hidden);assert.equal(select.attrs['aria-expanded'],'false');
fire(select,'pointerdown',{button:0});for(const fn of documentHandlers.pointerdown)fn({target:element()});assert(menu.hidden);
fire(select,'pointerdown',{button:0});for(const fn of windowHandlers.resize)fn();assert(menu.hidden);
assert(parseFloat(menu.style.left)+parseFloat(menu.style.width)<=1289);assert(parseFloat(menu.style.top)+parseFloat(menu.style.maxHeight)<=980);
assert(html.includes("installIframeDropdown($('#mp-system'),'System')"));assert(html.includes("installIframeDropdown($('#random-type'),'Random type')"));
const vision=element();vision.id='color-vision';vision.value='normal';vision.options=[...html.match(/<select id="color-vision"[\s\S]*?<\/select>/)[0].matchAll(/<option value="([^"]+)">([^<]+)<\/option>/g)].map(m=>({value:m[1],textContent:m[2]}));
let visionChanges=0;vision.addEventListener('change',()=>visionChanges++);context.install(vision,'Color vision');const visionMenu=menus.at(-1);
for(const option of vision.options){fire(vision,'pointerdown',{button:0});assert.equal(visionMenu.children.length,8);fire(visionMenu.children.find(el=>el.textContent===option.textContent),'click');assert.equal(vision.value,option.value);assert(visionMenu.hidden);}
assert.equal(visionChanges,8);assert(html.includes("installIframeDropdown($('#color-vision'),'Color vision')"));
console.log('PASS: 8 Color vision choices and four System choices, selection dispatch, keyboard navigation, dismissal and viewport fit.');
