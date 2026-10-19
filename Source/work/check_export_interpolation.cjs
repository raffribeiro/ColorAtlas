const fs=require('fs'),vm=require('vm'),assert=require('assert');
const file='/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html',html=fs.readFileSync(file,'utf8');
assert(html.includes('id="png-export-perceptual"'),'Export must offer explicit perceptual interpolation');
assert(html.includes('id="png-export-linear"'),'Export must retain linear RGB compatibility');
const code=html.split('// PNG export options\n')[1].split('// End PNG export options')[0];
const colorMath=html.slice(html.indexOf('function oklabLinear('),html.indexOf('function toLch('));
const sampleCode=html.slice(html.indexOf('function gradientSample('),html.indexOf('function gradientSelected('));
const nodes=new Map(),copies=[],downloads=[];let exportedPixels;
function node(k){if(!nodes.has(k))nodes.set(k,{value:'',checked:false,disabled:false,hidden:false,open:false,handlers:{},addEventListener(e,f){this.handlers[e]=f},focus(){this.focused=true},showModal(){this.open=true},close(){this.open=false;this.handlers.close?.()},getBoundingClientRect(){return{left:0,right:100,top:0,bottom:100}},getContext(){return{createImageData(w,h){return{data:new Uint8ClampedArray(w*h*4)}},putImageData(p){exportedPixels=p.data}}}});return nodes.get(k);}
const colors=[{t:1,hex:'#ffbd32'},{t:0,hex:'#1464e8'}],alphas=[{t:1,a:.8},{t:0,a:.2}];
const state={vfxEngine:'unity',gradientLayer:'smoke',artistTransition:'smooth',gradientColors:colors,gradientAlphas:alphas,gradientLayers:{emission:{colors:[{t:0,hex:'#000000'},{t:1,hex:'#ffffff'}],alphas,transition:'bands'},smoke:{colors,alphas,transition:'smooth'}}};
const before=JSON.stringify(state);
const context={state,$:node,field:n=>node('[data-field="'+n+'"]'),importanceLayerName:id=>id==='smoke'?'Importance 02':'Importance 01',copyCode:t=>copies.push(t),decodeSRGB:n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4,encodeSRGB:n=>n<=.0031308?12.92*n:1.055*n**(1/2.4)-.055,document:{createElement:tag=>tag==='canvas'?{...node('canvas'),toBlob:fn=>fn({})}:{click(){downloads.push(this.download)}}},URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},setTimeout(){}};
vm.createContext(context);vm.runInContext(colorMath+'\n'+sampleCode+'\n'+code,context);
node('#png-export-width').value='256';node('#png-export-height').value='16';node('#png-export-name').value='map';node('#png-export-alpha').checked=true;node('#png-export-layer-current').checked=true;node('#png-export-perceptual').checked=true;
node('[data-action="gradient-png"]').handlers.click();
node('#png-export-format-png').checked=false;node('#png-export-format-unity').checked=true;node('#png-export-form').handlers.change();
assert(node('#png-export-dialog').open);assert.equal(copies.length,0,'Opening code export must allow reviewing options before copying');
let options=context.pngExportOptions(),result=context.gradientExportData(options);assert.equal(options.format,'unity');assert.equal(options.interpolation,'oklab');
assert(result.text.includes('GradientMode.PerceptualBlend'));assert(result.text.includes('gradient.colorSpace = ColorSpace.Linear;'));assert(result.text.includes('0.006995f'),'Generated color keys must be decoded once to linear light');
assert(result.text.indexOf('0.000000f)')<result.text.indexOf('1.000000f)'),'Keys sorted ascending');
node('#png-export-perceptual').checked=false;node('#png-export-linear').checked=true;
options=context.pngExportOptions();result=context.gradientExportData(options);assert(result.text.includes('GradientMode.Blend;'));assert(!result.text.includes('GradientMode.PerceptualBlend;'));
const layer={colors,alphas,transition:'smooth'},a=context.sampleExportGradient(.5,layer,'oklab'),b=context.sampleExportGradient(.5,layer,'linear-rgb');
assert(a.rgb.some((v,i)=>Math.abs(v-b.rgb[i])>.02),'PNG interpolation selection must change actual midpoint pixels');assert.equal(a.alpha,b.alpha);
for(const [interpolation,sample] of [['oklab',a],['linear-rgb',b]]){
 context.paintGradientPNG(node('pixel-canvas'),{width:3,height:1,alpha:true,interpolation},[layer]);
 const expected=[...sample.rgb.map(v=>Math.round(context.encodeSRGB(v)*255)),Math.round(sample.alpha*255)];
 assert.deepEqual([...exportedPixels.slice(4,8)],expected,'Actual exported midpoint bytes follow '+interpolation);
}

assert(context.sampleExportGradient(0,layer,'linear-rgb').rgb.every((v,i)=>Math.abs(v-context.gradientSample(0,colors,alphas,'smooth').rgb[i])<1e-7),'Endpoints unchanged');
layer.transition='bands';assert.deepEqual(JSON.stringify(context.sampleExportGradient(.5,layer,'oklab')),JSON.stringify(context.sampleExportGradient(.5,layer,'linear-rgb')),'Bands ignores smooth interpolation choice');
state.artistTransition='bands';result=context.gradientExportData(context.pngExportOptions());assert(result.text.includes('GradientMode.Fixed;'));state.artistTransition='smooth';
node('#png-export-layer-current').checked=false;result=context.gradientExportData(context.pngExportOptions());assert(result.text.includes('var importance01'));assert(result.text.includes('var importance02'));assert(result.text.includes('GradientMode.Fixed;'));
node('#png-export-format-unity').checked=false;node('#png-export-format-unreal').checked=true;options=context.pngExportOptions();result=context.gradientExportData(options);let json=JSON.parse(result.text);assert.equal(json.layers.length,2);assert.equal(json.layers[0].interpolation,'constant');assert.equal(json.layers[1].interpolation,'linear');assert.equal(json.colorSpace,'linear-sRGB');
node('#png-export-perceptual').checked=true;node('#png-export-linear').checked=false;json=JSON.parse(context.gradientExportData(context.pngExportOptions()).text);assert.equal(json.layers[1].interpolation,'oklab');assert(json.exportHint.includes('OKLab'),'Unreal JSON must explain that custom OKLab sampling is needed');
node('#png-export-alpha').checked=false;json=JSON.parse(context.gradientExportData(context.pngExportOptions()).text);assert(json.layers.every(l=>l.alphas.every(k=>k.alpha===1)));
node('#png-export-layer-current').checked=true;node('#png-export-format-unity').checked=true;node('#png-export-format-unreal').checked=false;state.gradientColors=Array.from({length:9},(_,i)=>({t:i/8,hex:'#abcdef'}));result=context.gradientExportData(context.pngExportOptions());assert.equal(result.kind,'json');assert.equal(JSON.parse(result.text).colors.length,9,'More than eight keys uses lossless JSON fallback');assert(!result.text.includes('GradientMode.PerceptualBlend'));
state.gradientColors=colors;node('#png-export-alpha').checked=true;
node('#png-export-width').value='0';node('#png-export-height').value='0';context.pngExportOptions();node('#png-export-width').value='256';node('#png-export-height').value='16';
node('#png-export-form').handlers.submit({preventDefault(){}});assert.equal(copies.length,1);assert.equal(downloads.length,0);assert(!node('#png-export-dialog').open);assert(node('[data-action="gradient-png"]').focused);
node('[data-action="gradient-png"]').handlers.click();assert.equal(context.pngExportOptions().format,'png');node('#png-export-form').handlers.submit({preventDefault(){}});assert.equal(downloads.length,1);
assert.equal(JSON.stringify(state),before,'Export choices must not modify editor palettes or transition modes');
console.log('PASS: reviewable code export, OKLab/linear PNG samples, Unity perceptual + linear color space, compatibility mode, Bands, both layers, accurate JSON metadata, >8-key fallback, opaque alpha and no editor mutation.');
