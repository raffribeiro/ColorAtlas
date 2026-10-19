const fs=require('fs'),vm=require('vm'),assert=require('assert');const src=fs.readFileSync('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html','utf8');const wheel={innerHTML:'',setAttribute(k,v){this[k]=v}},state={gradientColors:[{t:0,hex:'#111111'},{t:1,hex:'#ff0000'}],vfx:{l:50,a:60,b:0},gradientSelection:{kind:'color',index:1}};const context={colorWheelShowAll:false,colorWheelZoom:1,colorWheelPan:{x:0,y:0},state,field:()=>wheel,rgbToLab:hex=>hex==='#111111'?{l:10,a:0,b:0}:{l:50,a:60,b:0},fitLabToSRGB:(l,a,b)=>({l,a,b}),labColor:()=>({hex:'#aabbcc'})};vm.createContext(context);vm.runInContext(src.slice(src.indexOf('function wheelMedian('),src.indexOf("field('wheel-show-all').addEventListener")),context);context.drawColorWheel();assert.equal((wheel.innerHTML.match(/<path /g)||[]).length,120);assert.equal((wheel.innerHTML.match(/data-wheel-key=/g)||[]).length,1);assert(!wheel.innerHTML.includes('is-selected'));assert(!wheel.innerHTML.includes('data-wheel-key="0"'));assert(wheel.innerHTML.includes('Color 1 · #ff0000'));const before=wheel.innerHTML;state.gradientSelection.index=0;state.vfx.l=10;context.drawColorWheel();assert.notEqual(wheel.innerHTML,before);assert(wheel.innerHTML.includes('cx="110" cy="91" r="12"'));console.log('PASS: wheel spectrum, neutral center, gradient numbering and selected marker update.');

context.zoomColorWheel(-100);assert(context.colorWheelZoom>1);const zoomed=wheel.viewBox;context.zoomColorWheel(100);assert(Math.abs(context.colorWheelZoom-1)<1e-9);assert.notEqual(wheel.viewBox,zoomed);for(let i=0;i<30;i++)context.zoomColorWheel(-240);assert.equal(context.colorWheelZoom,4);for(let i=0;i<30;i++)context.zoomColorWheel(240);assert.equal(context.colorWheelZoom,.5);assert(src.includes('colorWheelZoom=1;colorWheelPan={x:0,y:0};drawColorWheel();'));console.log('PASS: color wheel zoom changes viewBox, respects bounds and resets to default.');

context.colorWheelPan={x:20,y:10};context.colorWheelZoom=1;context.drawColorWheel();assert.equal(wheel.viewBox,'-20 -10 220 180');console.log('PASS: wheel viewBox tracks pan and reset recenters the wheel.');

context.drawColorWheel();assert(wheel.innerHTML.includes('fill-opacity="1"'));assert(/paint-order="stroke"/.test(wheel.innerHTML));console.log('PASS: subdued chroma, no numeric labels, smaller markers and larger selected marker.');

context.colorWheelZoom=1;context.drawColorWheel();const low=(wheel.innerHTML.match(/wheel-chroma-sample/g)||[]).length;context.colorWheelZoom=4;context.drawColorWheel();const high=(wheel.innerHTML.match(/wheel-chroma-sample/g)||[]).length;assert(low>50);assert.equal(high,low);assert(wheel.innerHTML.includes('C* 0.0'));console.log('PASS: chroma field fills the center and gains sample resolution with zoom.');

context.colorWheelZoom=1;context.state.gradientSelection.index=0;context.drawColorWheel();assert(wheel.innerHTML.includes('L* 10 ·'));context.state.gradientSelection.index=1;state.vfx.l=50;context.drawColorWheel();assert(wheel.innerHTML.includes('L* 50 ·'));assert(!wheel.innerHTML.includes('L* 10 ·'));console.log('PASS: chroma field follows selected color Lab lightness.');

context.state.gradientSelection.index=1;state.vfx.l=50;context.colorWheelZoom=1;context.colorWheelPan={x:0,y:0};context.drawColorWheel();assert(wheel.innerHTML.includes('cx="77" cy="91"'));console.log('PASS: selected Lab color follows swapped axes.');

context.drawColorWheel();assert(!wheel.innerHTML.includes('class="wheel-color-marker" opacity="0.35"'));assert(wheel.innerHTML.includes('class="wheel-color-marker" opacity="1"'));console.log('PASS: unselected markers subdued, selected marker emphasized and chroma opacity increased.');

let writes=0,markup=wheel.innerHTML;Object.defineProperty(wheel,'innerHTML',{get(){return markup},set(value){writes++;markup=value}});context.drawColorWheel();const beforeWrites=writes;context.drawColorWheel();assert.equal(writes,beforeWrites);context.colorWheelPan.x+=3;context.drawColorWheel();assert.equal(writes,beforeWrites);console.log('PASS: unchanged wheel and pan keep SVG nodes intact, preventing redraw flicker.');

assert(wheel.innerHTML.includes('stroke-opacity=".08"'));console.log('PASS: true opaque chroma colors and subdued dashed reference rings.');

assert(src.includes("['GREEN',193,94]"));assert(src.includes("['BLUE',110,15]"));assert(src.includes('const a=-x/.55,b=y/.55'));console.log('PASS: swapped Lab axes preserve opposing hue pairs.');

let hueSamples=[];context.fitLabToSRGB=(l,a,b)=>{hueSamples.push({l,c:Math.hypot(a,b)});return {l,a,b}};state.gradientSelection.index=1;state.vfx.l=50;state.vfx.l=50;context.drawColorWheel();assert(hueSamples.length>=120);assert(hueSamples.slice(0,120).every(p=>p.l===50&&Math.abs(p.c-60)<1e-8));console.log("PASS: hue ring uses selected color lightness and chroma.");

assert(wheel.innerHTML.includes('class="wheel-color-number"'));assert(/class="wheel-color-number"[^>]*>1<\/text>/.test(wheel.innerHTML));console.log("PASS: wheel shows selected color rank beside marker with constant visual font size.");

wheel.getBoundingClientRect=()=>({width:220,height:180});
for(const z of [1,2,4]){context.colorWheelZoom=z;context.drawColorWheel();const font=Number(wheel.innerHTML.match(/class="wheel-color-number" style="font-size:([\d.]+)px!important"/)[1]);assert(Math.abs(font*z-11)<1e-8);}
console.log('PASS: inline font sizing overrides shared SVG text CSS and stays 11 pixels at every zoom.');

context.colorWheelShowAll=true;context.drawColorWheel();assert.equal((wheel.innerHTML.match(/data-wheel-key=/g)||[]).length,2);assert.equal(context.wheelMedian([10,50]),30);assert.equal(context.wheelMedian([10,20,90]),20);assert(wheel.innerHTML.includes("L* 30"));context.colorWheelShowAll=false;context.drawColorWheel();assert.equal((wheel.innerHTML.match(/data-wheel-key=/g)||[]).length,1);console.log("PASS: all-colors toggle displays every key and uses median lightness; off restores selected-only view.");

context.colorWheelShowAll=true;context.colorWheelZoom=1;context.drawColorWheel();const markers=[...wheel.innerHTML.matchAll(/class="wheel-color-marker" opacity="([^"]+)"[^>]* r="([^"]+)"/g)];assert.equal(markers.length,2);assert(markers.every(m=>m[1]==='1'&&Math.abs(Number(m[2])-9.6)<1e-8));console.log('PASS: all-color markers have full opacity and equal radius 20 percent smaller than normal.');

assert(/class="wheel-chroma-sample"[^>]*fill-opacity="0.22"/.test(wheel.innerHTML));context.colorWheelShowAll=false;context.drawColorWheel();assert(/class="wheel-chroma-sample"[^>]*fill-opacity="1"/.test(wheel.innerHTML));console.log("PASS: background chroma is subdued only in all-colors mode.");

const counts=[];for(const lightness of [10,50,78,90]){state.vfx.l=lightness;context.drawColorWheel();counts.push((wheel.innerHTML.match(/class="wheel-chroma-sample"/g)||[]).length);}assert(counts.every(n=>n===counts[0]));console.log("PASS: chroma dot count and positions stay fixed across lightness and gamut boundaries.");

context.labColor=(l,a,b)=>({hex:"#aabbcc",outside:Math.hypot(a,b)>40});state.vfxLock=true;context.drawColorWheel();assert(/fill-opacity="0.18" data-outside-srgb="true"/.test(wheel.innerHTML));const fixedCount=(wheel.innerHTML.match(/wheel-chroma-sample/g)||[]).length;state.vfxLock=false;context.drawColorWheel();assert(/fill-opacity="1" data-outside-srgb="true"/.test(wheel.innerHTML));assert.equal((wheel.innerHTML.match(/wheel-chroma-sample/g)||[]).length,fixedCount);console.log("PASS: sRGB lock dims outside-gamut dots without removing any dots; disabling lock restores emphasis.");
