const fs=require('fs'),vm=require('vm'),assert=require('assert');
const file='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const html=fs.readFileSync(file,'utf8'),data=html.match(/<script type="application\/json" id="mp-data">([\s\S]*?)<\/script>/)[1];
const nodes=new Map();function node(k){if(k==='[data-field="vfx-doc-link"]')return null;if(!nodes.has(k))nodes.set(k,{value:'',textContent:'',innerHTML:'',style:{setProperty(k,v){this[k]=v}},parentElement:{hidden:true},clientWidth:k.includes('scene')?420:700,clientHeight:390,handlers:{},attrs:{},addEventListener(n,f){this.handlers[n]=f},setAttribute(n,v){this.attrs[n]=v},getBoundingClientRect(){return {left:0,top:0}},setPointerCapture(id){this.capture=id},hasPointerCapture(id){return this.capture===id},releasePointerCapture(){this.capture=null},select(){},appendChild(){},append(){},replaceChildren(){},focus(){},querySelector(){return null},contains(){return false},options:[]});return nodes.get(k);}
const root={getBoundingClientRect(){return {left:0,top:0,width:700}},querySelector:node,addEventListener(n,f){node("root").handlers[n]=f}};node('#mp-data').textContent=data;
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
const context={Image:class{constructor(){context.explosionImage=this}set src(v){}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},document:{getElementById(){return root},createElement:()=>node('created-'+Math.random()),body:{appendChild(){}},addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},structuredClone,window:{openai:{widgetState:{modelContent:{h:'5G',v:4,c:0,system:process.env.START_VFX?'vfx':'munsell'}},setWidgetState(){return Promise.resolve()}},addEventListener(){}},navigator:{},ResizeObserver:class{constructor(fn){}observe(){}},console};
vm.runInNewContext(script.replace('new ResizeObserver', 'globalThis.inspectMunsell={state,labView,labDefaultView,projectLab,drawLabPlane,drawColorWheel,applyWheelColor,wheelKeyAtPointer,rgbToLab,gradientSample}; new ResizeObserver'),context);

const app=context.inspectMunsell,state=app.state;
for(const [w,H] of [[400,300],[300,200],[700,400]]){
 const green=app.projectLab({l:50,a:-110,b:0},w,H),red=app.projectLab({l:50,a:110,b:0},w,H);
 assert(green.x<red.x,'Default camera must place Green left of Red');assert(Math.abs(green.y-red.y)<1e-6,'Green–Red axis should be horizontal, matching the requested camera');
 assert(app.projectLab({l:100,a:0,b:0},w,H).y<app.projectLab({l:0,a:0,b:0},w,H).y);
 assert(app.projectLab({l:50,a:0,b:110},w,H).y<app.projectLab({l:50,a:0,b:-110},w,H).y,'Yellow above Blue in the requested 3D perspective');
}
Object.assign(app.labView,{yaw:2.5,pitch:.8,zoom:2.7,panX:.4,panY:.2});
node('[data-action="lab-reset-zoom"]').handlers.click({preventDefault(){},stopPropagation(){}});
assert.equal(JSON.stringify(app.labView),JSON.stringify(app.labDefaultView),'Reset view restores the new default camera');
state.system='vfx';state.gradientLayers=null;state.gradientColors=[{t:0,hex:'#00ff00'},{t:1,hex:'#ff0000'}];state.gradientAlphas=[{t:0,a:1},{t:1,a:1}];state.gradientSelection={kind:'color',index:0};state.vfx.l=65;
const original=JSON.stringify(state.gradientColors);app.drawColorWheel();assert.equal(JSON.stringify(state.gradientColors),original,'Orientation changes do not change colors');
const wheel=node('[data-field="color-wheel"]');
function labelX(label){return Number(wheel.innerHTML.match(new RegExp('<text x="([^"]+)"[^>]*>'+label+'<\\/text>'))[1]);}
assert(wheel.innerHTML.includes('<path d="M175,91 A65 65 0 0 1 '),'Outer hue arcs must follow the mirrored clockwise coordinates');assert(wheel.innerHTML.includes(' A57 57 0 0 0 '),'Inner arc sweep returns counterclockwise');
assert(labelX('GREEN')<110);assert(labelX('RED')>110);assert(labelX('BLUE')===110&&labelX('YELLOW')===110);
function sampleAt(x,y){const tag=wheel.innerHTML.match(new RegExp('<circle class="wheel-chroma-sample" cx="'+x+'" cy="'+y+'"[^>]+>'))[0];return tag.match(/fill="([^"]+)"/)[1];}
assert(app.rgbToLab(sampleAt(90,91)).a<0,'Left field samples the green side of OKLab a');assert(app.rgbToLab(sampleAt(130,91)).a>0,'Right field samples the red side of OKLab a');
const marker=wheel.innerHTML.match(/<circle class="wheel-color-marker"[^>]+>/)[0];assert(Number(marker.match(/cx="([^"]+)"/)[1])<110,'Green marker belongs on the left');
// Exercise hit testing with screen scaling/translation, including both visible markers.
wheel.getScreenCTM=()=>({inverse:()=>({})});wheel.createSVGPoint=()=>({matrixTransform(){return {x:this.x/2-30,y:this.y/2-20}}});wheel.getBoundingClientRect=()=>({width:440,height:360});
node('[data-field="wheel-show-all"]').handlers.change({target:{checked:true}});
for(const [index,key] of state.gradientColors.entries()){
 const lab=app.rgbToLab(key.hex),chroma=Math.hypot(lab.a,lab.b),factor=Math.min(50,chroma*.55)/chroma;
 const x=110+lab.a*factor,y=91+lab.b*factor,event={clientX:(x+30)*2,clientY:(y+20)*2};
 assert.equal(app.wheelKeyAtPointer(event).getAttribute(),String(index),'Mirrored hit testing must match rendered marker');
}
const red=state.gradientColors[1].hex;
function dragTo(x,y){app.applyWheelColor({clientX:(x+30)*2,clientY:(y+20)*2},65,true);return app.rgbToLab(state.gradientColors[0].hex);}
const left=dragTo(98,91),right=dragTo(122,91),up=dragTo(110,79),down=dragTo(110,103);
assert(left.a<0&&right.a>0,'Dragging left/right follows Green/Red');assert(up.b<0&&down.b>0,'Blue/Yellow direction remains unchanged');assert([left,right,up,down].every(c=>Math.abs(c.l-65)<.25));assert.equal(state.gradientColors[1].hex,red,'Drag edits only the selected key');
console.log('PASS: requested 3D camera/default reset, Green-left/Red-right labels, field and markers, scaled hit testing, drag axes, fixed lightness and untouched non-selected colors.');
