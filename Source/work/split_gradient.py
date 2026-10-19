from pathlib import Path
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html');s=p.read_text()
s=s.replace('<strong>GRADIENT MAP</strong>','<strong>GRADIENT MAP</strong><label class="form-label" for="gradient-layer">Layer</label><select id="gradient-layer" class="form-select"><option value="emission">Emission</option><option value="smoke">Smoke</option></select>',1)
s=s.replace('Live gradient map · neutral black backdrop','Emission + Smoke · neutral black backdrop')
s=s.replace('gradientVersion:1,','gradientVersion:1,gradientLayer:"emission",gradientLayers:null,',1)
s=s.replace("if(typeof m.gradientPreset==='string')", "if(['emission','smoke'].includes(m.gradientLayer))state.gradientLayer=m.gradientLayer;if(m.gradientLayers)state.gradientLayers=m.gradientLayers;if(typeof m.gradientPreset==='string')",1)
s=s.replace('function gradientSample(t){','function gradientSample(t,colors=state.gradientColors,alphas=state.gradientAlphas){')
s=s.replace('interpolate(state.gradientColors,k=>','interpolate(colors,k=>').replace('interpolate(state.gradientAlphas,k=>','interpolate(alphas,k=>')
start=s.index('function drawExplosionMap(){');end=s.index('function initializeExplosion()',start)
s=s[:start]+'''function drawExplosionMap(){if(!explosionPixels)return;const canvas=field('explosion-mapped'),ctx=canvas.getContext('2d'),pixels=ctx.createImageData(512,512),layers=state.gradientLayers;const lut=Array.from({length:256},(_,v)=>{const t=v/255;if(!layers){const sample=gradientSample(t);return [...sample.rgb.map(c=>Math.round(encodeSRGB(c)*255)),Math.round(sample.alpha*255)];}const e=gradientSample(t,layers.emission.colors,layers.emission.alphas),sm=gradientSample(t,layers.smoke.colors,layers.smoke.alphas),x=Math.max(0,Math.min(1,(t-.28)/.52)),mask=x*x*(3-2*x),ea=mask*e.alpha,sa=(1-mask)*sm.alpha,total=ea+sa;return [...e.rgb.map((c,i)=>Math.round(encodeSRGB(total?(c*ea+sm.rgb[i]*sa)/total:0)*255)),Math.round(total*255)];});for(let i=0;i<explosionPixels.length;i++){const color=lut[explosionPixels[i]];pixels.data.set([color[0],color[1],color[2],Math.round(color[3]*explosionAlpha[i]/255)],i*4);}ctx.putImageData(pixels,0,0);}
''' + s[end:]
s=s.replace('function drawGradient(){','''function storeGradientLayer(){if(!state.gradientLayers)return;state.gradientLayers[state.gradientLayer]={colors:state.gradientColors,alphas:state.gradientAlphas,preset:state.gradientPreset};}
function validGradientLayer(layer){return layer&&Array.isArray(layer.colors)&&layer.colors.length>=2&&layer.colors.length<=8&&layer.colors.every(k=>k&&Number.isFinite(k.t)&&k.t>=0&&k.t<=1&&/^#[a-f0-9]{6}$/i.test(k.hex))&&Array.isArray(layer.alphas)&&layer.alphas.length>=2&&layer.alphas.length<=8&&layer.alphas.every(k=>k&&Number.isFinite(k.t)&&k.t>=0&&k.t<=1&&Number.isFinite(k.a)&&k.a>=0&&k.a<=1);}
function selectGradientLayer(kind){storeGradientLayer();state.gradientLayer=kind;const layer=state.gradientLayers[kind];state.gradientColors=layer.colors;state.gradientAlphas=layer.alphas;state.gradientPreset=layer.preset;state.gradientSelection={kind:'color',index:0};loadGradientColor();drawGradient();remember();}
$('#gradient-layer').addEventListener('change',()=>selectGradientLayer($('#gradient-layer').value));
function drawGradient(){storeGradientLayer();$('#gradient-layer').value=state.gradientLayer;
''')
s=s.replace('initializeExplosion();\nconst savedGradient=', 'const savedGradient=')
needle="if(savedGradient?.gradientVersion!==1)resetBlackbody();else loadGradientColor();"
replacement='''if(!validGradientLayer(state.gradientLayers?.emission)||!validGradientLayer(state.gradientLayers?.smoke)){state.gradientLayers=null;state.gradientLayer='emission';if(savedGradient?.gradientVersion!==1)resetBlackbody();const emission={colors:state.gradientColors,alphas:state.gradientAlphas,preset:state.gradientPreset};const smokePreset=gradientPresets.find(p=>p.id==='smoke');state.gradientLayers={emission,smoke:{colors:smokePreset.colors.map((hex,i)=>({t:i/(smokePreset.colors.length-1),hex})),alphas:[{t:0,a:1},{t:1,a:1}],preset:'smoke'}};}else{const layer=state.gradientLayers[state.gradientLayer];state.gradientColors=layer.colors;state.gradientAlphas=layer.alphas;state.gradientPreset=layer.preset;}
loadGradientColor();initializeExplosion();'''
assert needle in s;s=s.replace(needle,replacement)
s=s.replace('Color keys below · alpha keys above','Estimated luminance masks: bright = emission, dark = smoke. Each layer has its own preset and keys. Color keys below · alpha keys above')
p.write_text(s)
