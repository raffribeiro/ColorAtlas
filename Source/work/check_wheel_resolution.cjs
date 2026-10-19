const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(process.env.ATLAS_TEST_SOURCE||'/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html','utf8');
let rasters=0;
const wheel={innerHTML:'',setAttribute(k,v){this[k]=v},getBoundingClientRect(){return {width:220,height:180}}};
const state={gradientColors:[{t:0,hex:'#0000ff'},{t:1,hex:'#cf0057'}],vfx:{l:54.73123,a:60,b:0},vfxLock:true,gradientSelection:{kind:'color',index:1}};
const c={window:{},field:()=>wheel,state,colorWheelShowAll:false,colorWheelZoom:1,colorWheelPan:{x:0,y:0},selectionStrokeSVG:()=>'',document:{createElement(){return {getContext(){return {createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)}},putImageData(){}}},toDataURL(){return 'data:image/png;base64,field'+ ++rasters}}}}};
vm.createContext(c);
vm.runInContext(source.slice(source.indexOf('function oklabLinear('),source.indexOf('const oklabKeyCache')),c);
vm.runInContext(source.slice(source.indexOf('const decodeSRGB='),source.indexOf('function vfxAxisRange(')),c);
vm.runInContext(fs.readFileSync('work/atlas-lab-surface.js','utf8'),c);
vm.runInContext(source.slice(source.indexOf('function wheelMedian('),source.indexOf('function studioKeySizes(')),c);
const snapshot=JSON.stringify(state);c.drawColorWheel();
assert.equal((wheel.innerHTML.match(/<image /g)||[]).length,1,'One continuous color image replaces sample dots');
assert(!wheel.innerHTML.includes('wheel-chroma-sample'),'No holes between samples');
assert(wheel.innerHTML.includes('data-wheel-color-surface opacity="1"'));
assert(wheel.innerHTML.includes('clip-path="url(#wheel-color-surface-disc)"'));
assert(wheel.innerHTML.includes('clip-path="url(#lab-surface-wheel)"'));
const matrix=wheel.innerHTML.match(/transform="matrix\(([^)]+)\)"/)[1].split(' ').map(Number);
for(const [actual,expected] of matrix.map((n,i)=>[n,[.55,0,0,-.55,110,91][i]]))assert(Math.abs(actual-expected)<1e-10,'Surface uses the same orientation and scale as picking');
assert.equal(c.window.AtlasLabSurface.get(state.vfx.l,c.labColor,c.fitLabToSRGB).l,54.73123,'Keep precise selected lightness at the gamut edge');
const builds=rasters;
for(const zoom of [.5,1,1.5,2,4]){c.colorWheelZoom=zoom;c.colorWheelPan={x:12,y:-8};c.drawColorWheel();assert.equal(rasters,builds,'Pan/zoom reuse the color raster');assert.equal((wheel.innerHTML.match(/<image /g)||[]).length,1);}
state.vfx.l=65.12345;c.drawColorWheel();assert.equal(rasters,builds+1,'Lightness refreshes color field');
c.colorWheelShowAll=true;c.drawColorWheel();assert.equal((wheel.innerHTML.match(/data-wheel-key=/g)||[]).length,2);assert(wheel.innerHTML.includes('data-wheel-color-surface opacity="0.22"'),'All-key mode retains quiet context');
c.colorWheelShowAll=false;state.vfx.l=54.73123;c.drawColorWheel();assert.equal(JSON.stringify(state),snapshot,'Rendering preserves authored colors, positions and selection');
for(const L of [0,100]){state.vfx.l=L;c.drawColorWheel();assert(!wheel.innerHTML.includes('<image '));assert(wheel.innerHTML.includes('class="lab-color-surface"'));}
for(let L=1;L<18;L++){state.vfx.l=L;c.drawColorWheel()}assert(c.window.AtlasLabSurface.stats().entries<=8,'Shared raster cache remains bounded');
console.log('PASS: continuous wheel image, precise lightness, real sRGB math, orientation/scale, circle clipping, pan/zoom cache reuse, refreshed L, endpoints and preserved palette/all-key semantics.');
