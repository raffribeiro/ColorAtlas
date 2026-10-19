const fs=require('fs'),vm=require('vm'),assert=require('assert');
const file='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const html=fs.readFileSync(file,'utf8'),data=html.match(/<script type="application\/json" id="mp-data">([\s\S]*?)<\/script>/)[1];
const nodes=new Map();function node(k){if(k==='[data-field="vfx-doc-link"]')return null;if(!nodes.has(k))nodes.set(k,{value:'',textContent:'',innerHTML:'',style:{setProperty(k,v){this[k]=v}},parentElement:{hidden:true},clientWidth:k.includes('scene')?420:700,clientHeight:390,handlers:{},attrs:{},addEventListener(n,f){this.handlers[n]=f},setAttribute(n,v){this.attrs[n]=v},getBoundingClientRect(){return {left:0,top:0}},setPointerCapture(id){this.capture=id},hasPointerCapture(id){return this.capture===id},releasePointerCapture(){this.capture=null},select(){},appendChild(){},append(){},replaceChildren(){},focus(){},querySelector(){return null},contains(){return false},options:[]});return nodes.get(k);}
const root={getBoundingClientRect(){return {left:0,top:0,width:700}},querySelector:node,addEventListener(n,f){node("root").handlers[n]=f}};node('#mp-data').textContent=data;
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
const context={Date:class extends Date{static now(){return 12345}},Image:class{constructor(){context.explosionImage=this}set src(v){}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},document:{getElementById(){return root},createElement:()=>node('created-'+Math.random()),body:{appendChild(){}},addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},structuredClone,window:{openai:{widgetState:{modelContent:{h:'5G',v:4,c:0,system:process.env.START_VFX?'vfx':'munsell'}},setWidgetState(){return Promise.resolve()}},addEventListener(){}},navigator:{},ResizeObserver:class{constructor(fn){}observe(){}},console};
vm.runInNewContext(script.replace('new ResizeObserver', 'globalThis.inspectMunsell={state,drawGradient,drawLabPlane,drawColorWheel,gradientSample,rgbToLab,selectionSpectrum:typeof selectionSpectrum==="function"?selectionSpectrum:null,selectionStrokeSVG:typeof selectionStrokeSVG==="function"?selectionStrokeSVG:null}; new ResizeObserver'),context);

const app=context.inspectMunsell,state=app.state;
assert.equal(typeof app.selectionStrokeSVG,'function','Selected markers need the animated OKLab spectrum stroke');
const colors=app.selectionSpectrum('#000000');assert.equal(colors.length,72);assert.equal(new Set(colors).size,72);assert.strictEqual(app.selectionSpectrum('#050505'),colors,'Cache by contrast profile');
for(const hex of colors){assert(/^#[a-f0-9]{6}$/i.test(hex));const lab=app.rgbToLab(hex);assert(Math.abs(lab.l-90)<.25,'Spectrum should retain perceptual lightness');}

// Every animated hue must contrast with the selected center, including threshold colors.
function luminance(hex){return hex.match(/[a-f0-9]{2}/gi).map(c=>parseInt(c,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i],0);}
for(const center of ['#000000','#ffffff','#ff9e36','#00ff00','#ff0000','#0000ff','#ff00ff','#00ffff','#757575','#767676','#777777','#808080','#888888','#aaaaaa']){
 const y=luminance(center),spectrum=app.selectionSpectrum(center);
 for(const hue of spectrum){const h=luminance(hue),ratio=(Math.max(y,h)+.05)/(Math.min(y,h)+.05);assert(ratio>=3,'All animated hues must highlight '+center+'; ratio '+ratio);}
}
// The worst case is the profile switch at luminance .18, so check both sides.
for(const center of ['#000000','#ffffff'])for(const hue of app.selectionSpectrum(center)){
 const y=luminance(hue),ratio=(Math.max(.18,y)+.05)/(Math.min(.18,y)+.05);assert(ratio>=3,'Profile threshold retains contrast for every animated hue');
}
assert.notStrictEqual(app.selectionSpectrum('#000000'),app.selectionSpectrum('#ffffff'),'Adapt lightness to the selected color');
const brightRing=app.selectionStrokeSVG(18,24,12,2.5,'#ffffff'),darkRing=app.selectionStrokeSVG(18,24,12,2.5,'#000000');assert.notEqual(brightRing,darkRing,'SVG ring uses the selected center color');
assert(app.selectionStrokeSVG(18,24,12,2.5).includes('stroke-width="1.75"'),'Shared ring is thin so the center remains dominant');
const ring=app.selectionStrokeSVG(18,24,12,2.5);assert(ring.includes('transform="translate(18 24)"'));assert(ring.includes('pointer-events="none"'));assert(ring.includes('aria-hidden="true"'));assert.equal((ring.match(/<path /g)||[]).length,72);const outer=ring.match(/<circle class="selection-outer-ring"[^>]+>/)?.[0];assert(outer,'Selected SVG marker needs an outer white contour');assert(outer.includes('stroke="#ffffff"')&&outer.includes('stroke-opacity=".9"')&&outer.includes('fill="none"'));assert.equal(Number(outer.match(/stroke-width="([^"]+)"/)[1]),1);assert(Number(outer.match(/ r="([^"]+)"/)[1])>12+2.5*.7/2,'White contour lies outside animated stroke');assert(html.includes('.studio-selection-ring{position:absolute'),'List hosts the same shared ring without changing color centers');
assert(html.includes('@keyframes oklab-selection-spin'));assert(html.includes('animation:oklab-selection-spin 30s linear infinite'));assert(!html.includes('conic-gradient(from 90deg,var(--selection-colors))'),'No alternate animation renderer for the list');assert(html.includes('@media(prefers-reduced-motion:reduce){.oklab-selection-ring{animation:none}}'));
state.system='vfx';state.gradientSelection={kind:'color',index:1};state.explosionBloom=0;
const before=JSON.stringify([state.gradientColors,state.gradientAlphas]),sample=JSON.stringify(app.gradientSample(.4));
app.drawLabPlane();app.drawGradient();
for(const name of ['.mp-vfx-lab','.mp-gradient','[data-field="color-wheel"]'])assert(node(name).innerHTML.includes('class="oklab-selection-ring"'),name+' must show the spectrum stroke');
// The active ramp circle has a modest steady enlargement; other circles retain their size.
const rampMarkers=()=>[...node('.mp-gradient').innerHTML.matchAll(/<circle class="color-marker[^"]*"[^>]* r="([^"]+)"/g)].map(m=>Number(m[1]));
const radiiBefore=rampMarkers();
assert(radiiBefore.length>1);
assert.equal(radiiBefore.filter(r=>r===8).length,1,'only the selected ramp circle has an 8 px base radius');assert(radiiBefore.filter(r=>r!==8).every(r=>r===6),'unselected circles retain a 6 px radius');
const keys=node('[data-field="gradient-keys"]').innerHTML;
const selectedProfile=app.selectionSpectrum(state.gradientColors[1].hex);for(const name of ['.mp-gradient','[data-field="color-wheel"]'])assert(node(name).innerHTML.includes('stroke="'+selectedProfile[0]+'"'),name+' should use the actual color contrast profile');
assert.equal((keys.match(/class="studio-selection-ring"/g)||[]).length,1,'The selected list circle must use the shared SVG ring renderer');
for(const name of ['.mp-vfx-lab','.mp-gradient','[data-field="color-wheel"]']){
 const rendered=node(name).innerHTML;
 assert(rendered.includes('animation-delay:-12345ms'),name+' must share the same animation phase');
}
assert(keys.includes('animation-delay:-12345ms'),'The list uses the same slow animation phase');
assert(!keys.includes('--selection-colors:'),'No separate CSS spectrum for the list');
assert(keys.includes('background:'+state.gradientColors[1].hex));
assert.equal((node('.mp-gradient').innerHTML.match(/class="oklab-selection-ring"/g)||[]).length,1);
assert.equal((node('[data-field="color-wheel"]').innerHTML.match(/class="oklab-selection-ring"/g)||[]).length,1);
state.gradientSelection={kind:'color',index:2};app.drawGradient();assert.deepEqual(rampMarkers().sort((a,b)=>a-b),[...radiiBefore].sort((a,b)=>a-b),'selection moves the enlargement to one circle only');assert(node('[data-field="gradient-keys"]').innerHTML.includes('background:'+state.gradientColors[2].hex));assert(node('[data-field="gradient-keys"]').innerHTML.includes('class="studio-selection-ring"'));
state.gradientSelection={kind:'alpha',index:0};app.drawGradient();assert(!node('[data-field="color-wheel"]').innerHTML.includes('class="oklab-selection-ring"'));assert.equal((node('.mp-gradient').innerHTML.match(/class="oklab-selection-ring"/g)||[]).length,1);
assert.equal(JSON.stringify([state.gradientColors,state.gradientAlphas]),before);assert.equal(JSON.stringify(app.gradientSample(.4)),sample);
console.log('PASS: adaptive contrast for all hues and profile boundary, 30-second thinner stroke, gamut-fitted OKLab spectrum, one animated selection ring per view, selection changes, alpha selection, unchanged gradient colors/export samples and reduced-motion CSS.');
