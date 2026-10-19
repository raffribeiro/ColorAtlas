from pathlib import Path
import re
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html');s=p.read_text()
choices=[('auto','Harmonic'),('true-random','Free random'),('perceptual','Perceptual'),('monochromatic','Monochromatic'),('analogous','Analogous'),('complementary','Complementary'),('split','Split complementary'),('triadic','Triadic'),('tetradic','Tetradic'),('warm','Warm'),('cool','Cool')]
controls='<div class="studio-random-controls"><button class="btn" type="button" data-action="random-all-layers" title="Generate colors for all importance layers">⚄ Random</button><select id="random-type" class="form-select" aria-label="Random type">'+''.join(f'<option value="{value}">{label}</option>' for value,label in choices)+'</select></div>'
a=s.index('<select id="random-effect-theme"');b=s.index('</div><p class="studio-muted">The active gradients',a)
s=s[:a]+controls+s[b:]
s=s.replace('data-action="gradient-random" title=', 'data-action="gradient-random" hidden title=',1)
s=s.replace('artistHarmony:"theme",artistTransition:"smooth",artistCoverage:"ramp",','randomType:"auto",artistTransition:"smooth",',1)
a=s.index("for(const [k,values] of [['artistHarmony'");b=s.index('if(hues.includes(m.h))',a)
s=s[:a]+"const randomType=m.randomType??(m.artistHarmony==='theme'?'auto':m.artistHarmony);if("+repr([v for v,_ in choices])+".includes(randomType))state.randomType=randomType;if(['smooth','bands'].includes(m.artistTransition))state.artistTransition=m.artistTransition;"+s[b:]
a=s.index('const randomEffectThemes={');b=s.index('function unrestrictedRandomGradient',a);s=s[:a]+s[b:]
s=s.replace("const bounds=state.artistCoverage==='image'?imageCoverageBoundaries(layer):[.6,.9]", "const bounds=[.6,.9]",1)
a=s.index('// Theme identity constrains art-directed generation;');b=s.index('// Render choices inside the iframe;',a)
new='''function randomAllLayers(random=Math.random){
 const activeLayer=state.gradientLayer,preview=state.explosionView;
 storeGradientLayer();const type=state.randomType;let best=null,bestScore=-Infinity;
 if(type==='true-random'){
  best={};for(const {id:layer} of importanceLayerDefinitions)best[layer]=unrestrictedRandomGradient(state.gradientLayers[layer].colors,random);
 }else if(type==='perceptual'){
  const hue=random()*360,span=(25+random()*100)*(random()<.5?-1:1),chroma=25+random()*30;
  best={};for(const {id:layer} of importanceLayerDefinitions)best[layer]=buildDiscriminationRamp({hue,span,chroma,count:state.gradientLayers[layer].colors.length,layer});
 }else{
  for(let attempt=0;attempt<6;attempt++){
   const modes=['monochromatic','analogous','complementary','split','triadic','tetradic'];
   const mode=type==='auto'?modes[Math.min(modes.length-1,Math.floor(random()*modes.length))]:type;
   const base=mode==='warm'?25+random()*20:mode==='cool'?190+random()*25:random()*360;
   const offsets=harmonyOffsets(mode,random),plan={base,offsets,bright:false,chroma:30+random()*35,smoke:random()<.4?1.15+random()*.6:.4+random()*.5,power:.8+random()*.4,focus:random()<.7?1:2,peaks:offsets.map(offset=>huePeakLightness(base+offset))},pair={};
   for(const {id:layer} of importanceLayerDefinitions)pair[layer]=directedPalette(state.gradientLayers[layer].colors,plan,layer);
   const score=paletteCandidateScore(pair);if(score>bestScore){bestScore=score;best=pair;}
  }
 }
 for(const {id:layer} of importanceLayerDefinitions){const target=state.gradientLayers[layer];target.colors=best[layer];target.preset='custom';target.transition='smooth';}
 const active=state.gradientLayers[activeLayer];state.gradientColors=active.colors;state.gradientAlphas=active.alphas;state.gradientPreset='custom';state.artistTransition='smooth';
 state.gradientSelection={kind:'color',index:middleGradientIndex()};loadGradientColor();state.explosionView=preview;drawGradient();remember();
}
'''
s=s[:a]+new+s[b:]
s=s.replace("installIframeDropdown($('#artist-harmony'),'Harmony');", "installIframeDropdown($('#random-type'),'Random type');",1)
a=s.index("for(const [id,key] of [['artist-harmony'");b=s.index("$('[data-action=\"random-all-layers\"]')",a)
s=s[:a]+"$('#artist-transition').value=state.artistTransition;$('#artist-transition').addEventListener('change',()=>{state.artistTransition=$('#artist-transition').value;drawGradient();remember();});\n$('#random-type').value=state.randomType;$('#random-type').addEventListener('change',()=>{state.randomType=$('#random-type').value;remember();});\n"+s[b:]
s=s.replace("$('#mp-system').value=state.system;", "$('#mp-system').value=state.system;$('#random-type').value=state.randomType;",1)
s=s.replace('</style>', '.studio-random-controls{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.studio-random-controls #random-type{width:165px;font-size:12px}.studio-random-controls .btn{white-space:nowrap}\n</style>',1)
p.write_text(s)
