from pathlib import Path
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html');s=p.read_text();a=s.index('function randomRuleGradient');b=s.index('const randomEffectThemes=',a)
s=s[:a]+'''function randomArtDirection(random=Math.random){return {dominantSweep:24+random()*30,secondarySweep:20+random()*26,accentSweep:12+random()*20,turn:random()<.5?-1:1,temperature:random()<.5?-1:1,temperatureShift:10+random()*16,chromaStart:.8+random()*.3,chromaEnd:.8+random()*.3,saturationFocus:random()<.7?'secondary':'accent'};}
function randomRuleGradient(baseHue,secondaryOffset,accentOffset,layer,smokeChroma=.72,chromaScale=1,lightnessPower=1,random=Math.random,art=randomArtDirection(random)){
 const positions=[0,.3,.585,.615,.75,.885,.915,1],lightness=[8,22,38,45,60,74,86,96],{dominantSweep,secondarySweep,accentSweep,turn}=art;
 const hues=[baseHue-turn*dominantSweep/2,baseHue,baseHue+turn*dominantSweep/2,baseHue+secondaryOffset-turn*secondarySweep/2,baseHue+secondaryOffset,baseHue+secondaryOffset+turn*secondarySweep/2,baseHue+accentOffset-turn*accentSweep/2,baseHue+accentOffset+turn*accentSweep/2];
 return positions.map((t,i)=>{
  const temperatureShift=art.temperature*art.temperatureShift*(2*t-1),h=(hues[i]+temperatureShift)*Math.PI/180;
  const focus=i<3?.6:(i<6?(art.saturationFocus==='secondary'?1.15:.8):(art.saturationFocus==='accent'?1.15:.85));
  const chromaVariation=art.chromaStart+(art.chromaEnd-art.chromaStart)*t;
  const c=[14,30,44,48,54,42,38,20][i]*focus*chromaVariation*(layer==='smoke'?smokeChroma:1)*chromaScale;
  // Smoke retains the shared hue families but a lower highlight ceiling.
  const l=8+(layer==='smoke'?74:88)*Math.pow((lightness[i]-8)/88,lightnessPower),fit=fitLabToSRGB(l,c*Math.cos(h),c*Math.sin(h));return {t,hex:labColor(fit.l,fit.a,fit.b).hex};
 });
}
'''+s[b:]
s=s.replace('smokeChroma=.18+random()*.97,chromaScale=.45+random()*.95,lightnessPower=.7+random()*.75;','smokeChroma=.18+random()*.77,chromaScale=.65+random()*.7,lightnessPower=.7+random()*.75,art=randomArtDirection(random);')
s=s.replace('layer,smokeChroma,chromaScale,lightnessPower,random);','layer,smokeChroma,chromaScale,lightnessPower,random,art);');p.write_text(s)
q=Path('work/check_triad.cjs');t=q.read_text();t+='''
node('#random-effect-theme').value='triad';node('[data-action="random-all-layers"]').handlers.click();const emissionLabs=picker.state.gradientLayers.emission.colors.map(k=>picker.rgbToLab(k.hex)),smokeLabs=picker.state.gradientLayers.smoke.colors.map(k=>picker.rgbToLab(k.hex));assert(emissionLabs.at(-1).l>smokeLabs.at(-1).l+10);for(const labs of [emissionLabs,smokeLabs])for(let i=1;i<labs.length;i++)assert(labs[i].l>labs[i-1].l);assert(picker.state.gradientLayers.emission.colors.at(-1).hex.toUpperCase()!=='#FFFFFF');console.log('PASS: directed random retains increasing values, tinted highlights and lower smoke brightness.');
''';q.write_text(t)
