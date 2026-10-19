const fs=require('fs'),vm=require('vm'),assert=require('assert');
const file='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const html=fs.readFileSync(file,'utf8'),data=html.match(/<script type="application\/json" id="mp-data">([\s\S]*?)<\/script>/)[1];
const nodes=new Map();function node(k){if(k==='[data-field="vfx-doc-link"]')return null;if(!nodes.has(k))nodes.set(k,{value:'',textContent:'',innerHTML:'',style:{},parentElement:{hidden:true},clientWidth:k.includes('scene')?420:700,clientHeight:390,handlers:{},attrs:{},addEventListener(n,f){this.handlers[n]=f},setAttribute(n,v){this.attrs[n]=v},getBoundingClientRect(){return {left:0,top:0}},setPointerCapture(id){this.capture=id},hasPointerCapture(id){return this.capture===id},releasePointerCapture(){this.capture=null},select(){}});return nodes.get(k);}
const root={getBoundingClientRect(){return {left:0,top:0,width:700}},querySelector:node,addEventListener(n,f){node("root").handlers[n]=f}};node('#mp-data').textContent=data;
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
const context={Image:class{constructor(){context.explosionImage=this}set src(v){}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},document:{getElementById(){return root}},window:{openai:{widgetState:{modelContent:{h:'5G',v:4,c:0,system:process.env.START_VFX?'vfx':'munsell'}},setWidgetState(){return Promise.resolve()}},addEventListener(){}},navigator:{},ResizeObserver:class{constructor(fn){}observe(){}},console};
vm.runInNewContext(script.replace('new ResizeObserver', 'globalThis.inspectMunsell={state,triadColors,update,labColor,rgbToLab,toLch,setLch,lchColors,drawSystem,vfxColors,hsvRGB,engineColorCode,fitLabToSRGB,vfxAxisRange,gradientSample,gradientSelected,gradientPresets,applyGradientPreset,randomHarmoniousGradient,harmonyOffsets,hueChromaLimit,bloomHighlight,imageCoverageBoundaries,paletteCandidateScore,resetDefaultExplosion,restore}; new ResizeObserver'),context);
const scene=node('.mp-scene'),slider=node('#mp-value'),cx=210,base=342,z=26.5;
function event(y){return {pointerId:7,button:0,clientX:cx,clientY:y,preventDefault(){},type:'pointermove'}}
const down=event(base-4*z);down.type='pointerdown';scene.handlers.pointerdown(down);
scene.handlers.pointermove(event(base-8*z));assert.equal(slider.value,8);assert.equal(node('[data-field="notation"]').textContent,'N 8/');
scene.handlers.pointermove(event(-200));assert.equal(slider.value,10);
scene.handlers.pointermove(event(900));assert.equal(slider.value,0);
const up=event(base-3*z);up.type='pointerup';scene.handlers.pointerup(up);assert.equal(slider.value,3);assert.equal(scene.capture,null);
scene.handlers.click({});assert.equal(slider.value,3);
slider.value='7';slider.handlers.input();assert.match(scene.innerHTML,/Value 7 · drag/);
console.log('PASS: drag updates Value; clamps 0–10; synchronizes notation and side slider; pointer release; suppresses trailing click.');

const picker=context.inspectMunsell;
assert.equal(picker.state.gradientLayers.emission.preset,"atlas-explosion-fire");assert.equal(picker.state.gradientLayers.smoke.preset,"atlas-explosion-smoke");assert.equal(picker.state.gradientLayers.smoke.colors.length,8);
console.log("PASS: default emission uses Fire and smoke uses eight-point Charcoal / Ash palette.");
picker.state.h='5P';picker.state.v=6;picker.state.c=14;picker.update();
let palette=picker.triadColors();assert.deepEqual(Array.from(palette,s=>s.h),['5P','7.5YR','2.5BG']);assert.equal(palette.length,3);assert(palette.every(s=>s.v===6&&/^#[0-9a-f]{6}$/.test(s.hex)));
assert.match(scene.innerHTML,/opacity="0.12"/);assert.match(scene.innerHTML,/opacity="1"/);
picker.state.h='5R';picker.state.v=1;picker.state.c=12;picker.update();palette=picker.triadColors();assert(palette.some(s=>s.c!==picker.state.c));
picker.state.c=0;picker.update();palette=picker.triadColors();assert(palette.every(s=>s.hex===palette[0].hex));
console.log('PASS: triad hue wraparound, shared Value, valid HEX, low-Value chroma limits, neutral collapse, and selected/background opacity.');
const chromaSlider=node('#mp-chroma');
picker.state.h='5R';picker.state.v=6;picker.state.c=0;picker.update();
chromaSlider.value=String(chromaSlider.max);chromaSlider.handlers.input();assert(picker.state.c>0);assert.equal(chromaSlider.attrs['aria-valuetext'],String(picker.state.c));
chromaSlider.value='0';chromaSlider.handlers.input();assert.equal(picker.state.c,0);
picker.state.v=10;picker.update();assert.equal(chromaSlider.max,0);assert.equal(chromaSlider.disabled,true);assert.equal(picker.state.c,0);
picker.state.v=6;picker.update();assert.equal(chromaSlider.disabled,false);
console.log('PASS: Chroma slider selects valid samples, neutral zero, dynamic limits and endpoint disable/re-enable.');
picker.state.h='5R';picker.state.v=6;picker.state.c=6;picker.update();
const before=picker.triadColors(),otherHue=before[1].h;
const independent={dataset:{triadChroma:'1'},value:'0',closest(){return this}};
node('[data-field="triad-colors"]').handlers.input({target:independent});
let after=picker.triadColors();assert.equal(after[0].c,6);assert.equal(after[1].c,0);assert.equal(after[2].c,before[2].c);
picker.state.c=10;picker.update();assert.equal(picker.triadColors()[1].c,0);
independent.value='2';node('[data-field="triad-colors"]').handlers.input({target:independent});assert.equal(picker.triadColors()[1].c,4);assert.equal(picker.state.c,10);
picker.state.v=1;picker.update();assert(picker.triadColors().every(s=>/^#[0-9a-f]{6}$/.test(s.hex)));
picker.state.v=6;picker.update();assert.equal(picker.triadColors()[1].c,4);
console.log('PASS: per-color Chroma input isolates colors, preserves adjustments, shares Value and respects available samples.');
assert.match(node('.mp-strip').innerHTML,/Color 2/);assert.match(node('.mp-strip').innerHTML,/Color 3/);
const prior=picker.triadColors();node('.mp-strip').handlers.click({target:{closest(){return {dataset:{stripColor:'2',c:'2'}}}}});
assert.equal(picker.triadColors()[2].c,2);assert.equal(picker.triadColors()[0].c,prior[0].c);assert.equal(picker.triadColors()[1].c,prior[1].c);
picker.state.triad=false;picker.update();assert(!node('.mp-strip').innerHTML.includes('Color 2'));picker.state.triad=true;picker.update();
console.log('PASS: triad variation strips render all three colors, isolate sample selection and hide extra rows when disabled.');
assert.equal(node('[data-field="grayscale-panel"]').hidden,true);
for(let j=0;j<3;j++){assert.match(node(`[data-triad-gray="${j}"]`).style.backgroundColor,/^#([a-f0-9]{2})\1\1$/);assert.match(node(`[data-triad-gray="${j}"]`).attrs['aria-label'],/grayscale/);}
picker.state.triad=false;picker.update();assert.equal(node('[data-field="grayscale-panel"]').hidden,false);assert.match(node('[data-field="grayscale-colors"]').innerHTML,/Preto|Base/);
console.log('PASS: grayscale strips align with each triad color and single-color preview remains available.');
picker.state.triad=true;picker.update();assert.equal((node('.mp-strip').innerHTML.match(/data-max-chroma="true"/g)||[]).length,3);assert.match(node('.mp-strip').innerHTML,/stroke-dasharray="3 2"/);
picker.state.v=10;picker.update();assert.equal((node('.mp-strip').innerHTML.match(/data-max-chroma="true"/g)||[]).length,3);
console.log('PASS: each hue/Value strip marks exactly one tabulated maximum, including neutral endpoints.');
picker.state.v=6;picker.state.c=6;picker.update();
node('[data-action="palette-triad"]').handlers.click();assert.equal(picker.state.savedPalette.length,3);
const saved=JSON.parse(JSON.stringify(picker.state.savedPalette[0]));
node('[data-field="palette-swatches"]').handlers.click({target:{closest(){return {dataset:{paletteIndex:'0'}}}}});assert.equal(picker.state.h,saved.h);assert.equal(picker.state.c,saved.c);
picker.state.c=0;picker.update();assert.equal(picker.state.savedPalette[0].c,saved.c);node('[data-action="palette-update"]').handlers.click();assert.equal(picker.state.savedPalette[0].c,0);
node('[data-action="palette-remove"]').handlers.click();assert.equal(picker.state.savedPalette.length,2);
for(let i=0;i<30;i++)node('[data-action="palette-add"]').handlers.click();assert.equal(picker.state.savedPalette.length,24);
console.log('PASS: palette add/load/explicit update/remove and 24-color limit.');
let copiedHex='',stopped=false;context.navigator.clipboard={writeText(t){copiedHex=t;return Promise.resolve()}};
node('root').handlers.click({target:{closest(){return {getBoundingClientRect(){return {left:50,top:100,width:80}},getAttribute(){return ''},textContent:'#00a15e ×'}}},stopPropagation(){stopped=true}});
assert.equal(copiedHex,'#00A15E');assert(stopped);
console.log('PASS: clicking HEX copies only the six-digit color code and prevents palette selection side effects.');
assert.equal(picker.labColor(0,0,0).hex,'#000000');assert.equal(picker.labColor(100,0,0).hex,'#ffffff');assert.equal(picker.labColor(50,0,0).hex,'#777777');assert(picker.labColor(50,127,127).outside);
const redLab=picker.rgbToLab('#ff0000');assert(Math.abs(redLab.l-53)<=1);assert(Math.abs(redLab.a-80)<=1);assert(Math.abs(redLab.b-67)<=1);
node('#mp-system').value='lab';node('#mp-system').handlers.change();assert.equal(node('[data-field="munsell-panel"]').hidden,true);assert.equal(node('[data-field="lab-panel"]').hidden,false);
node('#mp-lab-l').value='70';node('#mp-lab-l').handlers.input();assert.equal(picker.state.lab.l,70);
node('#mp-system').value='munsell';node('#mp-system').handlers.change();assert.equal(node('[data-field="munsell-panel"]').hidden,false);
console.log('PASS: Lab D65 reference colors, gamut detection, mode switching and sliders.');
picker.state.system='lab';picker.setLch(50,40,30);picker.drawSystem();let cylindrical=picker.toLch();assert(Math.abs(cylindrical.c-40)<1e-8);assert(Math.abs(cylindrical.h-30)<1e-8);
const lc=picker.lchColors();assert.deepEqual(Array.from(lc,s=>Math.round(s.h)),[30,150,270]);assert(lc.every(s=>s.l===50));
node('#mp-lch-h').value='359';node('#mp-lch-h').handlers.input();assert(Math.abs(picker.toLch().h-359)<1e-8);
node('#mp-lch-c').value='0';node('#mp-lch-c').handlers.input();assert.equal(picker.toLch().c,0);assert(Math.abs(picker.toLch().h-359)<1e-8);
node('#mp-lch-c').value='40';node('#mp-lch-c').handlers.input();assert(Math.abs(picker.toLch().h-359)<1e-8);
node('[data-field="lch-triad-colors"]').handlers.input({target:{closest(){return {dataset:{lchC:'1'},value:'20'}}}});assert.equal(picker.lchColors()[1].c,20);assert(Math.abs(picker.lchColors()[0].c-40)<1e-8);
const lchSvg=node('.mp-lch-scene');assert.match(lchSvg.innerHTML,/data-lch-layer="50"/);assert.match(lchSvg.innerHTML,/opacity="0.035"/);
lchSvg.handlers.pointerdown({button:0,pointerId:9,clientX:210,clientY:342-80*2.65,preventDefault(){}});assert.equal(picker.state.lab.l,80);
lchSvg.handlers.pointerup({pointerId:9,clientX:210,clientY:342-80*2.65});assert.equal(lchSvg.capture,null);
console.log('PASS: LCh cylindrical conversion, triad angles, independent chroma, neutral hue memory, layered rendering and axis drag.');
const beforeCartesian=JSON.stringify(picker.state.lab);node('#mp-system').value='labcart';node('#mp-system').handlers.change();assert.equal(JSON.stringify(picker.state.lab),beforeCartesian);assert.equal(node('[data-field="labcart-panel"]').hidden,false);assert.equal(node('[data-field="lab-panel"]').hidden,true);
node('#mp-cart-a').value='0';node('#mp-cart-a').handlers.input();node('#mp-cart-b').value='0';node('#mp-cart-b').handlers.input();assert.equal(picker.state.lab.a,0);assert.equal(picker.state.lab.b,0);assert.match(node('.mp-lab-plane').innerHTML,/3D CIELAB/);
console.log('PASS: Cartesian Lab view, independent axes, center selection and color preservation between Lab/LCh.');
picker.state.system='labcart';picker.drawSystem();const lab3d=node('.mp-lab-plane'),beforeRotation=lab3d.innerHTML;
lab3d.handlers.pointerdown({button:0,pointerId:12,clientX:200,clientY:180,preventDefault(){}});lab3d.handlers.pointermove({pointerId:12,clientX:260,clientY:200});assert.notEqual(lab3d.innerHTML,beforeRotation);assert.match(lab3d.innerHTML,/3D CIELAB color volume/);
const colorBeforeRelease=JSON.stringify(picker.state.lab);lab3d.handlers.pointerup({pointerId:12,clientX:260,clientY:200});assert.equal(lab3d.capture,null);assert.equal(JSON.stringify(picker.state.lab),colorBeforeRelease);
console.log('PASS: 3D rotation changes projected geometry, preserves selected color and releases pointer capture.');
picker.state.system='vfx';picker.state.vfx={l:50,a:0,b:0,stops:0,core:0,halo:50};picker.drawSystem();let labEmission=picker.vfxColors();assert.equal(labEmission.base,'#777777');assert(!labEmission.outside);const initialHDR=Array.from(labEmission.hdr);
picker.state.vfx.stops=1;labEmission=picker.vfxColors();labEmission.hdr.forEach((n,i)=>assert(Math.abs(n-initialHDR[i]*2)<1e-10));assert.equal(labEmission.base,'#777777');
picker.state.vfx.core=100;labEmission=picker.vfxColors();labEmission.coreHDR.forEach(n=>assert(Math.abs(n-2)<1e-5));
picker.state.vfxLock=false;node('#mp-vfx-a').value='127';node('#mp-vfx-a').handlers.input();assert(picker.vfxColors().outside);assert.match(node('[data-field="vfx-note"]').textContent,/clipped before emission/);
picker.state.vfxEngine='unity';assert.match(picker.engineColorCode(),/^new Color/);const beforeEngine=JSON.stringify(picker.vfxColors().hdr);node('#mp-vfx-engine').value='unreal';node('#mp-vfx-engine').handlers.change();assert.match(picker.engineColorCode(),/^\(R=/);assert.equal(JSON.stringify(picker.vfxColors().hdr),beforeEngine);
console.log('PASS: Lab-based VFX neutral reference, exposure separation, Lab core whitening, gamut warning and engine exports.');
picker.state.vfx={l:65,a:-25,b:-30,stops:3,core:70,halo:55};picker.drawSystem();const vfxVolume=node('.mp-vfx-lab');assert.match(vfxVolume.innerHTML,/L\* 65\.0/);assert.match(vfxVolume.innerHTML,/3D CIELAB color volume/);
const volumeBefore=vfxVolume.innerHTML;node('#mp-vfx-l').value='40';node('#mp-vfx-l').handlers.input();assert.match(vfxVolume.innerHTML,/L\* 40\.0/);assert.notEqual(vfxVolume.innerHTML,volumeBefore);
const baseBeforeDrag=JSON.stringify(picker.state.vfx);vfxVolume.handlers.pointerdown({button:0,pointerId:13,clientX:200,clientY:140,preventDefault(){}});vfxVolume.handlers.pointermove({pointerId:13,clientX:230,clientY:160});vfxVolume.handlers.pointerup({pointerId:13,clientX:230,clientY:160});assert.equal(JSON.stringify(picker.state.vfx),baseBeforeDrag);assert.equal(vfxVolume.capture,null);
console.log('PASS: VFX Lab volume follows base-color sliders and rotates without altering emission settings.');
const fitted=picker.fitLabToSRGB(50,100,80);assert.equal(fitted.l,50);assert(fitted.changed);assert(Math.abs(fitted.a/fitted.b-100/80)<1e-9);
picker.state.vfx={l:50,a:100,b:80,stops:6,core:70,halo:55};node('#mp-vfx-lock').checked=true;node('#mp-vfx-lock').handlers.change();assert(!picker.vfxColors().outside);assert.equal(picker.state.vfx.stops,6);assert(picker.vfxColors().hdr.some(n=>n>1));
node('#mp-vfx-lock').checked=false;node('#mp-vfx-lock').handlers.change();node('#mp-vfx-a').value='127';node('#mp-vfx-a').handlers.input();assert.equal(picker.state.vfx.a,127);assert.match(node('[data-field="vfx-mapping"]').textContent,/UNLOCKED.*Requested Lab/);
console.log('PASS: gamut lock preserves L*/hue, restricts base gamut, leaves HDR free and reports unlocked mapping.');
picker.state.vfx={l:50,a:0,b:0,stops:4,core:70,halo:55};picker.state.vfxLock=true;picker.drawSystem();const rangeA=picker.vfxAxisRange('a');assert(rangeA.min>-128&&rangeA.max<127);assert.equal(node('#mp-vfx-a').step,'any');assert.equal(node('#mp-vfx-a').min,rangeA.min);
node('#mp-vfx-a').value=String(rangeA.max);node('#mp-vfx-a').handlers.input();assert(!picker.vfxColors().outside);assert.equal(picker.state.vfx.stops,4);
picker.state.vfx.l=0;picker.drawSystem();assert.equal(node('#mp-vfx-a').disabled,true);assert.equal(node('#mp-vfx-b').disabled,true);
picker.state.vfxLock=false;picker.drawSystem();assert.equal(node('#mp-vfx-a').min,-128);assert.equal(node('#mp-vfx-a').max,127);assert.equal(node('#mp-vfx-a').disabled,false);
console.log('PASS: locked Lab sliders span valid conditional sRGB intervals, collapse at black, and restore full ranges unlocked.');
picker.state.gradientColors=[{t:0,hex:'#000000'},{t:1,hex:'#ffffff'}];picker.state.gradientAlphas=[{t:0,a:0},{t:1,a:1}];picker.state.gradientSelection={kind:'color',index:0};picker.drawSystem();
assert.equal(picker.gradientSample(.5).rgb[0],.5);assert.equal(picker.gradientSample(.5).alpha,.5);
node('[data-action="gradient-add"]').handlers.click();assert.equal(picker.state.gradientColors.length,3);node('[data-action="gradient-apply"]').handlers.click();assert.equal(picker.gradientSelected().hex,picker.vfxColors().base);
node('#gradient-position').value='75';node('#gradient-position').handlers.input();assert.equal(picker.gradientSelected().t,.75);
for(let i=0;i<10;i++)node('[data-action="gradient-add"]').handlers.click();assert.equal(picker.state.gradientColors.length,8);
node('[data-action="gradient-remove"]').handlers.click();assert.equal(picker.state.gradientColors.length,7);
picker.state.gradientColors=[{t:0,hex:'#000000'},{t:1,hex:'#ffffff'}];picker.state.gradientSelection={kind:'color',index:0};picker.drawSystem();
let imagePixels,downloaded=false;context.document.createElement=kind=>kind==='canvas'?{getContext(){return {createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)}},putImageData(p){imagePixels=p.data}}},toDataURL(){return 'data:image/png;base64,test'}}:{click(){downloaded=true}};
node('[data-action="gradient-png"]').handlers.click();assert(downloaded);assert.equal(imagePixels[0],0);assert.equal(imagePixels[3],0);assert.equal(imagePixels[128*4],188);assert.equal(imagePixels[255*4],255);assert.equal(imagePixels[255*4+3],255);
picker.state.vfxEngine='unity';node('[data-action="gradient-code"]').handlers.click({clientX:20,clientY:30,currentTarget:node('export')});assert.match(copiedHex,/new GradientColorKey/);assert.match(copiedHex,/new GradientAlphaKey/);
picker.state.vfxEngine='unreal';node('[data-action="gradient-code"]').handlers.click({clientX:20,clientY:30,currentTarget:node('export')});assert.equal(JSON.parse(copiedHex).colorSpace,'linear-sRGB');
console.log('PASS: gradient linear interpolation, independent alpha, Lab application, key positions/limit/removal, PNG pixel encoding and engine data exports.');
picker.state.system='vfx';picker.state.gradientColors=[{t:0,hex:'#ff0000'},{t:1,hex:'#0000ff'}];picker.state.gradientSelection={kind:'color',index:0};
const grad=node('.mp-gradient');grad.handlers.pointerdown({button:0,pointerId:31,target:{closest(){return {dataset:{gradientKind:'color',gradientIndex:'1'}}}},preventDefault(){}});
assert(Math.abs(picker.state.vfx.l-picker.rgbToLab('#0000ff').l)<.001);assert.equal(picker.gradientSelected().hex,'#0000ff');
node('#mp-vfx-l').value='40';node('#mp-vfx-l').handlers.input();assert.equal(picker.gradientSelected().hex,picker.vfxColors().base);assert.equal(picker.state.gradientColors[0].hex,'#ff0000');
const previous=JSON.stringify(picker.state.vfx);grad.handlers.pointerdown({button:0,pointerId:32,target:{closest(){return {dataset:{gradientKind:'alpha',gradientIndex:'0'}}}},preventDefault(){}});assert.equal(JSON.stringify(picker.state.vfx),previous);
console.log('PASS: selecting color keys loads Lab; picker edits only selected key; alpha selection preserves Lab color.');
node('[data-action="gradient-blackbody"]').handlers.click();assert.equal(picker.state.gradientColors.length,8);assert.equal(picker.state.gradientColors[0].t,0);assert.equal(picker.state.gradientColors[7].t,1);assert.equal(picker.state.gradientAlphas[0].a,1);assert.match(node('[data-field="gradient-status"]').textContent,/1000–12000 K/);
const warm=picker.state.gradientColors[0].hex.match(/[a-f0-9]{2}/gi).map(v=>parseInt(v,16)),cold=picker.state.gradientColors[7].hex.match(/[a-f0-9]{2}/gi).map(v=>parseInt(v,16));assert(warm[0]>warm[2]);assert(cold[2]>cold[0]);
picker.state.gradientColors=[{t:0,hex:'#000000'},{t:1,hex:'#ffffff'}];picker.drawSystem();grad.handlers.pointerdown({button:0,clientX:350,clientY:85,target:{closest(){return null}},preventDefault(){}});assert.equal(picker.state.gradientColors.length,3);assert.equal(picker.state.gradientSelection.index,2);assert.equal(picker.gradientSelected().t,.5);
console.log('PASS: Black Body preset temperatures, warm/cool progression, opaque alpha and click-to-add color keys.');

let mappedPixels;const grayData=new Uint8ClampedArray(512*512*4);for(let i=0;i<512*512;i++)grayData.set([i%256,i%256,i%256,255],i*4);
node('[data-field="explosion-gray"]').getContext=()=>({drawImage(){},getImageData(){return {data:grayData}},putImageData(){}});
let bloomDraws=0;node('[data-field="explosion-mapped"]').getContext=()=>({save(){},restore(){},getImageData(){return {data:mappedPixels}},drawImage(){bloomDraws++},createImageData(){return {data:new Uint8ClampedArray(512*512*4)}},putImageData(p){mappedPixels=p.data}});
picker.state.gradientColors=[{t:0,hex:'#000000'},{t:1,hex:'#ffffff'}];picker.state.gradientAlphas=[{t:0,a:0},{t:1,a:1}];picker.state.gradientLayers={emission:{colors:picker.state.gradientColors,alphas:picker.state.gradientAlphas},smoke:{colors:picker.state.gradientColors,alphas:picker.state.gradientAlphas}};grayData[64*4+3]=0;grayData[128*4+3]=128;context.explosionImage.onload();assert.equal(mappedPixels[64*4+3],0);assert(mappedPixels[128*4+3]>0&&mappedPixels[128*4+3]<=128);assert.equal(mappedPixels[0],0);assert.equal(mappedPixels[255*4],255);assert.equal(mappedPixels[255*4+3],255);assert(mappedPixels[128*4]>188);
console.log('PASS: explosion luminance maps full black/white endpoints, linear RGB gradient and independent alpha.');

assert.equal(picker.gradientPresets.length,172);assert.equal(new Set(picker.gradientPresets.map(p=>p.id)).size,172);
for(const preset of picker.gradientPresets){picker.applyGradientPreset(preset.id);assert(picker.state.gradientColors.length>=2&&picker.state.gradientColors.length<=8);assert.equal(picker.state.gradientColors[0].t,0);assert.equal(picker.state.gradientColors.at(-1).t,1);assert.equal(node('#gradient-preset').value,preset.id);assert.equal(picker.gradientSelected().hex,picker.vfxColors().base);assert(picker.state.gradientAlphas.every(k=>k.a===1));}
node('#gradient-preset').value='fire';node('#gradient-preset').handlers.change();assert.equal(picker.state.gradientPreset,'fire');node('#gradient-position').value='12';node('#gradient-position').handlers.input();assert.equal(picker.state.gradientPreset,'custom');assert.equal(node('#gradient-preset').value,'custom');
console.log('PASS: all 172 palette presets, dropdown selection, Lab synchronization, valid keys and custom edit tracking.');

for(const preset of picker.gradientPresets.filter(p=>['neonriot','alienreactor','acidmirage','cosmicfracture','chromaticshock'].includes(p.id))){picker.applyGradientPreset(preset.id);assert.equal(picker.state.gradientColors.length,8);assert.equal(new Set(picker.state.gradientColors.map(k=>k.hex)).size,8);assert.equal(node('#gradient-preset').value,preset.id);}
console.log('PASS: five bold palettes each contain eight distinct editable color keys.');

picker.state.gradientLayer='emission';picker.applyGradientPreset('fire');const emissionSnapshot=JSON.stringify(picker.state.gradientLayers.emission);
node('#gradient-layer').value='smoke';node('#gradient-layer').handlers.change();picker.applyGradientPreset('ice');assert.equal(picker.state.gradientLayers.smoke.preset,'ice');assert.equal(JSON.stringify(picker.state.gradientLayers.emission),emissionSnapshot);
const smokeSnapshot=JSON.stringify(picker.state.gradientLayers.smoke);node('#gradient-layer').value='emission';node('#gradient-layer').handlers.change();assert.equal(node('#gradient-preset').value,'fire');assert.equal(JSON.stringify(picker.state.gradientLayers.smoke),smokeSnapshot);
console.log('PASS: independent emission/smoke gradients, per-layer preset selection and edits preserved across switches.');

picker.state.gradientLayers={emission:{colors:[{t:0,hex:'#ff0000'},{t:1,hex:'#ff0000'}],alphas:[{t:0,a:1},{t:1,a:1}]},smoke:{colors:[{t:0,hex:'#0000ff'},{t:1,hex:'#0000ff'}],alphas:[{t:0,a:1},{t:1,a:1}]}};
node('#explosion-view').value='combined';node('#explosion-view').handlers.change();assert.equal(mappedPixels[255*4],255);assert.equal(mappedPixels[255*4+2],0);assert.equal(mappedPixels[32*4],0);assert.equal(mappedPixels[32*4+2],255);
node('#explosion-view').value='emission';node('#explosion-view').handlers.change();assert.equal(mappedPixels[32*4+3],0);assert.equal(mappedPixels[255*4+3],255);
node('#explosion-view').value='smoke';node('#explosion-view').handlers.change();assert.equal(mappedPixels[255*4+3],0);assert.equal(mappedPixels[32*4+3],255);
console.log('PASS: hot pixels use emission gradient only; dark smoke uses smoke gradient only; isolated previews preserve separate masks.');


node('#explosion-view').value='combined';node('#explosion-view').handlers.change();
node('#gradient-layer').value='emission';node('#gradient-layer').handlers.change();picker.applyGradientPreset('fire');
node('#gradient-layer').value='smoke';node('#gradient-layer').handlers.change();picker.applyGradientPreset('ice');assert.equal(picker.state.explosionView,'combined');assert.equal(node('#explosion-view').value,'combined');assert.equal(node('#gradient-preset').value,'ice');
node('#explosion-view').value='emission';node('#explosion-view').handlers.change();assert.equal(picker.state.gradientLayer,'smoke');assert.equal(node('#gradient-preset').value,'ice');
node('#gradient-layer').value='emission';node('#gradient-layer').handlers.change();assert.equal(node('#gradient-preset').value,'fire');assert.equal(picker.state.explosionView,'emission');
console.log('PASS: Layer selects the editable gradient only; Preview visibility changes independently.');

node('#explosion-view').value='combined';node('#explosion-view').handlers.change();node('#explosion-glow').value='0';node('#explosion-glow').handlers.input();const bloomBefore=bloomDraws;node('#explosion-bloom').value='0';node('#explosion-bloom').handlers.input();assert.equal(bloomDraws,bloomBefore);node('#explosion-bloom').value='.6';node('#explosion-bloom').handlers.input();assert(bloomDraws>bloomBefore);const isolatedBefore=bloomDraws;node('#explosion-view').value='smoke';node('#explosion-view').handlers.change();assert(bloomDraws>isolatedBefore);
node('#explosion-view').value='combined';node('#explosion-view').handlers.change();node('#explosion-bloom').value='0';node('#explosion-bloom').handlers.input();const glowBefore=bloomDraws;node('#explosion-glow').value='.6';node('#explosion-glow').handlers.input();assert(bloomDraws>glowBefore);assert.equal(picker.state.explosionGlow,.6);const smokeGlowBefore=bloomDraws;node('#explosion-view').value='smoke';node('#explosion-view').handlers.change();assert(bloomDraws>smokeGlowBefore);console.log('PASS: independent emission glow and smoke isolation.');
console.log('PASS: adjustable hot bloom draws only on emission/combined preview, disabled at zero and on isolated smoke.');
node('#studio-search').value='neon';node('#studio-search').handlers.input();assert.match(node('[data-field="studio-library"]').innerHTML,/Neon Riot/);assert(!node('[data-field="studio-library"]').innerHTML.includes('Alien Reactor'));
node('[data-field="studio-library"]').handlers.click({target:{closest(){return {dataset:{studioPreset:'neonriot'}}}}});assert.equal(picker.state.gradientPreset,'neonriot');assert.equal(node('#gradient-preset').value,'neonriot');assert.equal(picker.state.gradientColors.length,8);
console.log('PASS: studio library search and preset selection update the active editable layer.');
assert.match(node('[data-field="gradient-keys"]').innerHTML,/studio-key-swatch/);assert.match(node('.mp-vfx-lab').innerHTML,/data-lab-gradient-key="0"/);
const oldLayer=picker.state.gradientLayer,oldPreview=picker.state.explosionView;node('[data-action="gradient-toggle-layer"]').handlers.click();assert.notEqual(picker.state.gradientLayer,oldLayer);assert.equal(picker.state.explosionView,oldPreview);
node('.mp-vfx-lab').handlers.pointerdown({button:0,target:{closest(){return {dataset:{labGradientKey:'1'}}}},preventDefault(){}});assert.equal(picker.state.gradientSelection.index,1);assert.equal(picker.gradientSelected().hex,picker.vfxColors().base);
console.log('PASS: key color swatches, indexed gradient markers in Lab, clickable selection and quick layer switch without preview isolation.');
picker.state.gradientColors=[{t:0,hex:'#000000'},{t:.8,hex:'#ffffff'},{t:.3,hex:'#ff0000'}];picker.state.gradientSelection={kind:'color',index:1};picker.drawSystem();
const displayed=node('[data-field="gradient-keys"]').innerHTML;assert(displayed.indexOf('data-gradient-select="1"')<displayed.indexOf('data-gradient-select="2"'));assert.equal(picker.state.gradientSelection.index,1);assert.match(displayed,/studio-key-index">2<\/span><span>#FF0000/);
console.log('PASS: key list and Lab numbering follow descending gradient position, independent of creation order and selected identity.');

assert(displayed.indexOf('data-gradient-select="1"')<displayed.indexOf('data-gradient-select="0"'));assert.match(displayed,/data-gradient-select="1"[^]*?studio-key-index">1<\/span>/);
console.log('PASS: rightmost gradient key is first in the vertical list, with matching Lab numbering.');

const otherLayer=picker.state.gradientLayer==='emission'?'smoke':'emission',beforeOther=JSON.stringify(picker.state.gradientLayers[otherLayer]),beforeAlpha=JSON.stringify(picker.state.gradientAlphas);
for(let seed=1;seed<=25;seed++){let n=seed;picker.randomHarmoniousGradient(()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296});assert(picker.state.gradientColors.length>=6&&picker.state.gradientColors.length<=8);const lights=picker.state.gradientColors.map(k=>picker.rgbToLab(k.hex).l);assert(lights.every((l,i)=>i===0||l>lights[i-1]));assert.equal(picker.state.gradientColors[0].t,0);assert.equal(picker.state.gradientColors.at(-1).t,1);assert(picker.state.gradientColors.every(k=>!picker.labColor(...Object.values(picker.rgbToLab(k.hex))).outside));}
assert.equal(JSON.stringify(picker.state.gradientLayers[otherLayer]),beforeOther);assert.equal(JSON.stringify(picker.state.gradientAlphas),beforeAlpha);node('[data-action="gradient-random"]').handlers.click();assert.match(node('[data-field="gradient-status"]').textContent,/Random (soft|wide|bold) harmony/);
console.log('PASS: random harmonious gradients use 6–8 keys, increasing lightness, in-gamut colors, and preserve the other layer and alpha.');

for(const mode of ['soft','wide','bold']){node('#random-harmony-range').value=mode;node('#random-harmony-range').handlers.change();picker.randomHarmoniousGradient(()=>.5);assert.equal(picker.state.randomHarmonyRange,mode);assert.match(node('[data-field="gradient-status"]').textContent,new RegExp('Random '+mode+' harmony'));assert.match(node('[data-field="gradient-status"]').textContent,new RegExp(mode==='soft'?'48°':mode==='wide'?'115°':'180°'));const lights=picker.state.gradientColors.map(k=>picker.rgbToLab(k.hex).l);assert(lights.every((l,i)=>!i||l>lights[i-1]));}
console.log('PASS: soft/wide/bold harmony ranges expand the hue arc while preserving progressive lightness and selectable Auto mode.');
const keyRows=node('[data-field="gradient-keys"]').innerHTML;assert(!keyRows.includes("studio-selected-badge"));assert.match(keyRows,/data-selected="true"/);assert.match(keyRows,/studio-key-copy/);assert.match(keyRows,/data-copy-hex=/);assert(!keyRows.includes('studio-key-position'));
const selectionBeforeCopy=picker.state.gradientSelection.index;node('root').handlers.click({target:{closest(){return {getAttribute(){return '#123456'},getBoundingClientRect(){return {left:0,top:40,width:60}}}}},clientX:30,clientY:50,stopPropagation(){}});assert.equal(copiedHex,'#123456');assert.equal(picker.state.gradientSelection.index,selectionBeforeCopy);
console.log('PASS: selected key has a fixed-layout highlight; per-row Copy HEX replaces percentage and preserves selection.');

node('#studio-search').value='';node('#studio-category').value='Science';node('#studio-category').handlers.change();const scientificLibrary=node('[data-field="studio-library"]').innerHTML;assert(scientificLibrary.includes('Aurora'));assert(!scientificLibrary.includes('Void ·'));node('#studio-category').value='Fantasy';node('#studio-category').handlers.change();assert(node('[data-field="studio-library"]').innerHTML.includes('Void ·'));assert(picker.gradientPresets.every(p=>p.category&&p.description));
console.log('PASS: 172 classified palettes, theme filter, searchable metadata and clear artistic/scientific descriptions.');

node('#studio-category').value='Production';node('#studio-category').handlers.change();assert.match(node('[data-field="studio-library"]').innerHTML,/Muzzle Flash/);assert.match(node('[data-field="studio-library"]').innerHTML,/Healing/);node('#studio-category').value='Smoke';node('#studio-category').handlers.change();assert.match(node('[data-field="studio-library"]').innerHTML,/Steam/);assert(!node('[data-field="studio-library"]').innerHTML.includes('Laser ·'));
picker.applyGradientPreset('muzzleflash');assert.equal(picker.state.gradientColors[1].t,.08);assert.equal(picker.state.gradientColors[6].t,.94);assert.equal(picker.state.gradientColors.length,8);
console.log('PASS: 172 presets, production and smoke filters, use-case descriptions and tuned nonuniform key positions.');

for(const id of ["celanime","celice","celtoxic","celviolet","celmono"]){picker.applyGradientPreset(id);for(const [a,b] of [[.05,.25],[.3,.5],[.6,.8],[.85,.95]])assert.deepEqual(picker.gradientSample(a).rgb,picker.gradientSample(b).rgb);}console.log("PASS: five cel palettes sample constant colors within all four bands.");

const allBefore=JSON.stringify(picker.state.gradientLayers),activeBefore=picker.state.gradientLayer,viewBefore=picker.state.explosionView;node('[data-action="random-all-layers"]').handlers.click();assert.notEqual(JSON.stringify(picker.state.gradientLayers),allBefore);assert.equal(picker.state.gradientLayer,activeBefore);assert.equal(picker.state.explosionView,viewBefore);for(const layer of ['emission','smoke']){assert.equal(picker.state.gradientLayers[layer].preset,'custom');assert(picker.state.gradientLayers[layer].colors.length>=6);}console.log('PASS: preview random button updates both layers, retains active editor and preview.');

node('#paste-hex').removeAttribute=()=>{};node('#paste-hex').value='#2ac';const hexIndex=picker.state.gradientSelection.index;node('[data-action="apply-hex"]').handlers.click();assert.equal(picker.state.gradientColors[hexIndex].hex.toUpperCase(),'#22AACC');const validHex=picker.state.gradientColors[hexIndex].hex;node('#paste-hex').value='invalid';node('[data-action="apply-hex"]').handlers.click();assert.equal(picker.state.gradientColors[hexIndex].hex,validHex);assert.match(node('[data-field="hex-error"]').textContent,/RRGGBB/);console.log('PASS: pasted shorthand HEX updates selected color; invalid input preserves color.');

for(const layer of ['emission','smoke'])assert.deepEqual(Array.from(picker.state.gradientLayers[layer].colors,k=>k.t),[0,.3,.585,.615,.75,.885,.915,1]);console.log('PASS: global random gradients allocate 60/30/10 hue bands on both layers.');

for(const theme of ['fire','ice','electric','light','void','poison','water','nature']){node('#random-effect-theme').value=theme;node('[data-action="random-all-layers"]').handlers.click();const first=JSON.stringify(picker.state.gradientLayers);node('[data-action="random-all-layers"]').handlers.click();assert.notEqual(JSON.stringify(picker.state.gradientLayers),first);for(const layer of ['smoke','emission']){assert.equal(picker.state.gradientLayers[layer].colors.length,8);assert(picker.state.gradientLayers[layer].colors.every(k=>/^#[a-f0-9]{6}$/i.test(k.hex)));}}console.log('PASS: eight themed generators produce new valid variations on both layers.');

node('#random-effect-theme').value='triad';node('[data-action="random-all-layers"]').handlers.click();const emissionLabs=picker.state.gradientLayers.emission.colors.map(k=>picker.rgbToLab(k.hex)),smokeLabs=picker.state.gradientLayers.smoke.colors.map(k=>picker.rgbToLab(k.hex));assert(emissionLabs.at(-1).l>smokeLabs.at(-1).l+10);for(const labs of [emissionLabs,smokeLabs])for(let i=1;i<labs.length;i++)assert(labs[i].l>labs[i-1].l);assert(picker.state.gradientLayers.emission.colors.at(-1).hex.toUpperCase()!=='#FFFFFF');console.log('PASS: directed random retains increasing values, tinted highlights and lower smoke brightness.');

node('#random-effect-theme').value='true-random';const randomActive=picker.state.gradientLayer;picker.state.gradientLayers.emission.colors=[{t:0,hex:'#000000'},{t:.23,hex:'#444444'},{t:1,hex:'#ffffff'}];picker.state.gradientLayers.smoke.colors=[{t:0,hex:'#111111'},{t:.4,hex:'#333333'},{t:.8,hex:'#777777'},{t:1,hex:'#eeeeee'}];const active=picker.state.gradientLayers[randomActive];picker.state.gradientColors=active.colors;const positionsBefore=Object.fromEntries(['emission','smoke'].map(layer=>[layer,Array.from(picker.state.gradientLayers[layer].colors,k=>k.t)]));node('[data-action="random-all-layers"]').handlers.click();assert.equal(picker.state.gradientLayer,randomActive);for(const layer of ['emission','smoke']){assert.deepEqual(Array.from(picker.state.gradientLayers[layer].colors,k=>k.t),positionsBefore[layer]);assert(picker.state.gradientLayers[layer].colors.every(k=>/^#[a-f0-9]{6}$/i.test(k.hex)));}console.log('PASS: True random preserves separate layer point counts and nonuniform positions.');

node('#random-effect-theme').value='harmonic';const harmonicBefore=Object.fromEntries(['emission','smoke'].map(layer=>[layer,Array.from(picker.state.gradientLayers[layer].colors,k=>k.t)]));node('[data-action="random-all-layers"]').handlers.click();for(const layer of ['emission','smoke']){assert.deepEqual(Array.from(picker.state.gradientLayers[layer].colors,k=>k.t),harmonicBefore[layer]);const labs=picker.state.gradientLayers[layer].colors.map(k=>picker.rgbToLab(k.hex));for(let i=1;i<labs.length;i++)assert(labs[i].l>labs[i-1].l);}console.log('PASS: Harmonic random preserves point counts and positions with progressive values on both layers.');

for(const look of ['vivid','bright','vivid-bright']){node('#random-color-look').value=look;for(const theme of ['true-random','harmonic','fire']){node('#random-effect-theme').value=theme;node('[data-action="random-all-layers"]').handlers.click();for(const layer of ['emission','smoke'])assert(picker.state.gradientLayers[layer].colors.every(k=>/^#[a-f0-9]{6}$/i.test(k.hex)));}}console.log('PASS: vivid and bright looks apply across unrestricted, harmonic and themed random modes.');

node('#random-effect-theme').value='triad';node('#random-color-look').value='vivid-bright';node('[data-action="random-all-layers"]').handlers.click();for(const layer of ['emission','smoke']){const labs=picker.state.gradientLayers[layer].colors.map(k=>picker.rgbToLab(k.hex));const hue=l=>((Math.atan2(l.b,l.a)*180/Math.PI)%360+360)%360,dist=(a,b)=>Math.abs(((a-b+540)%360)-180);for(const group of [[0,1,2],[3,4,5],[6,7]])for(const i of group)assert(dist(hue(labs[i]),hue(labs[group[0]]))<5);assert(Math.abs(dist(hue(labs[1]),hue(labs[4]))-120)<5);assert(Math.abs(dist(hue(labs[4]),hue(labs[6]))-120)<5);}console.log('PASS: strict Lab triad with three fixed hue families 120 degrees apart, allowing RGB quantization tolerance.');

node('#artist-harmony').value='split';node('#artist-harmony').handlers.change();node('#artist-transition').value='bands';node('#artist-transition').handlers.change();const bandKeys=[{t:0,hex:'#ff0000'},{t:.5,hex:'#00ff00'},{t:1,hex:'#0000ff'}],bandAlpha=[{t:0,a:1},{t:1,a:1}];assert.deepEqual(Array.from(picker.gradientSample(.25,bandKeys,bandAlpha).rgb),[1,0,0]);node('#artist-transition').value='smooth';node('#artist-transition').handlers.change();assert(picker.gradientSample(.25,bandKeys,bandAlpha).rgb[1]>0);node('#artist-coverage').value='image';node('#artist-coverage').handlers.change();for(const layer of ['emission','smoke']){const bounds=picker.imageCoverageBoundaries(layer);assert(bounds.every(Number.isFinite));assert(bounds[0]<=bounds[1]);}for(const mode of ['monochromatic','analogous','complementary','split','double','triadic','tetradic','analogous-accent','warm','cool','classical','artist']){node('#artist-harmony').value=mode;node('#artist-harmony').handlers.change();node('#random-effect-theme').value='fire';node('[data-action="random-all-layers"]').handlers.click();for(const layer of ['emission','smoke'])assert(picker.state.gradientLayers[layer].colors.every(k=>/^#[a-f0-9]{6}$/i.test(k.hex)));}console.log('PASS: all harmony masks, band/smooth sampling, weighted image coverage and candidate selection.');

node('#artist-harmony').value='split';node('#artist-harmony').handlers.change();node('#random-effect-theme').value='water';node('#random-effect-theme').handlers.change();assert.equal(picker.state.artistHarmony,'theme');assert.equal(node('#artist-harmony option[value="split"]').disabled,true);for(const mode of ['theme','monochromatic','analogous','cool','split','triadic']){node('#artist-harmony').value=mode;node('#artist-harmony').handlers.change();for(let run=0;run<4;run++){node('[data-action="random-all-layers"]').handlers.click();for(const layer of ['emission','smoke'])for(const key of picker.state.gradientLayers[layer].colors){const lab=picker.rgbToLab(key.hex),chroma=Math.hypot(lab.a,lab.b),hue=(Math.atan2(lab.b,lab.a)*180/Math.PI+360)%360;if(chroma>8)assert(hue>=160&&hue<=295,`Water hue ${hue}`);}}}node('#random-effect-theme').value='triad';node('#random-effect-theme').handlers.change();assert.equal(node('#artist-harmony option[value="split"]').disabled,false);console.log('PASS: Water rejects incompatible harmonies, stays aquatic on both layers, and unlocks harmonies for other themes.');

for(const [theme,range] of Object.entries({fire:[20,105],ice:[195,290],light:[45,105],void:[275,345],poison:[95,165],nature:[90,172],skin:[30,75],earth:[40,95],metal:[210,270]})){node('#random-effect-theme').value=theme;node('#artist-harmony').value='triadic';picker.state.artistHarmony='triadic';node('#random-effect-theme').handlers.change();assert.equal(picker.state.artistHarmony,'theme');assert.equal(node('#artist-harmony option[value="triadic"]').disabled,true);for(const mode of ['theme','analogous']){node('#artist-harmony').value=mode;node('#artist-harmony').handlers.change();node('[data-action="random-all-layers"]').handlers.click();for(const layer of ['emission','smoke'])for(const key of picker.state.gradientLayers[layer].colors){const lab=picker.rgbToLab(key.hex),c=Math.hypot(lab.a,lab.b),h=(Math.atan2(lab.b,lab.a)*180/Math.PI+360)%360;if(c>8)assert(h>=range[0]-4&&h<=range[1]+4,`${theme}: ${h}`);}}}for(const theme of ['triad','harmonic','true-random','cloth']){node('#random-effect-theme').value=theme;node('#random-effect-theme').handlers.change();assert.equal(node('#artist-harmony option[value="triadic"]').disabled,false);}console.log('PASS: elemental/material hue domains and harmony availability; free modes and cloth remain unrestricted.');

node('#explosion-view').value='combined';node('#explosion-view').handlers.change();node('#explosion-glow').value='0';node('#explosion-glow').handlers.input();const bloomPasses=value=>{const before=bloomDraws;node('#explosion-bloom').value=String(value);node('#explosion-bloom').handlers.input();return bloomDraws-before;};assert(bloomPasses(2)>bloomPasses(1));node('#explosion-bloom').value='0';node('#explosion-bloom').handlers.input();const glowPasses=value=>{const before=bloomDraws;node('#explosion-glow').value=String(value);node('#explosion-glow').handlers.input();return bloomDraws-before;};assert(glowPasses(2)>glowPasses(1));assert.equal(node('[data-field="explosion-glow-value"]').textContent,'100%');assert(/id="explosion-bloom"[^>]*max="2"/.test(html));assert(/id="explosion-glow"[^>]*max="2"/.test(html));console.log('PASS: Bloom and Glow extend to 200% with extra valid compositing passes.');

assert.equal(picker.bloomHighlight(0,0,0),0);assert.equal(picker.bloomHighlight(80,80,80),0);assert(picker.bloomHighlight(255,255,255)>picker.bloomHighlight(200,200,200));assert(picker.bloomHighlight(255,255,0)>picker.bloomHighlight(0,0,255));console.log('PASS: post-process highlight extraction uses final linear luminance, soft knee, all preview layers and transparency.');

picker.restore({gradientVersion:1,gradientLayers:{emission:{colors:[{t:0,hex:'#ff00ff'},{t:1,hex:'#ffffff'}],alphas:[{t:0,a:1},{t:1,a:1}],preset:'custom'},smoke:{colors:[{t:0,hex:'#00ffff'},{t:1,hex:'#ffffff'}],alphas:[{t:0,a:1},{t:1,a:1}],preset:'custom'}},explosionBloom:2,artistTransition:'bands'});picker.resetDefaultExplosion();assert.equal(picker.state.gradientLayers.emission.preset,'atlas-explosion-fire');assert.equal(picker.state.gradientLayers.smoke.preset,'atlas-explosion-smoke');assert.equal(picker.state.artistTransition,'smooth');assert.equal(picker.state.explosionBloom,1);assert.equal(picker.state.explosionSplit,.72);console.log('PASS: default authored explosion replaces restored random colors on reload and preserves reusable presets.');
