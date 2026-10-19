from pathlib import Path
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html');s=p.read_text()
s=s.replace('explosionBloom:.45,','explosionBloom:.45,explosionGlow:.35,')
s=s.replace('if(Number.isFinite(m.explosionBloom))','if(Number.isFinite(m.explosionGlow))state.explosionGlow=Math.max(0,Math.min(1,m.explosionGlow));if(Number.isFinite(m.explosionBloom))')
s=s.replace('<label class="form-label" for="explosion-view">Preview</label>','<label class="form-label" for="explosion-glow">Emission glow</label><input id="explosion-glow" class="form-range" type="range" min="0" max="1" step=".01" value=".35"><output data-field="explosion-glow-value"></output><label class="form-label" for="explosion-view">Preview</label>')
a=s.index('function drawHotBloom(ctx)');b=s.index("$('#explosion-bloom').addEventListener",a)
s=s[:a]+'''function drawHotBloom(ctx){
 if(!explosionPixels||state.explosionView==='smoke'||(state.explosionBloom===0&&state.explosionGlow===0))return;
 const glow=document.createElement('canvas');glow.width=glow.height=512;const g=glow.getContext('2d'),data=g.createImageData(512,512),layer=state.gradientLayers?.emission;if(!layer)return;
 const lut=Array.from({length:256},(_,v)=>{const t=v/255,hot=Math.max(0,Math.min(1,(t-state.explosionSplit)/(1-state.explosionSplit))),color=gradientSample(hot,layer.colors,layer.alphas);return [...color.rgb.map(c=>Math.round(encodeSRGB(c)*255)),Math.pow(hot,1.6)*color.alpha];});
 for(let i=0;i<explosionPixels.length;i++){const c=lut[explosionPixels[i]];data.data.set([c[0],c[1],c[2],Math.round(explosionAlpha[i]*c[3])],i*4);}g.putImageData(data,0,0);
 ctx.save();ctx.globalCompositeOperation='screen';
 if(state.explosionGlow>0){ctx.globalAlpha=state.explosionGlow*.8;ctx.filter='blur(26px)';ctx.drawImage(glow,0,0);ctx.globalAlpha=state.explosionGlow*.45;ctx.filter='blur(48px)';ctx.drawImage(glow,0,0);}
 if(state.explosionBloom>0){ctx.globalAlpha=state.explosionBloom;ctx.filter='blur(10px)';ctx.drawImage(glow,0,0);ctx.globalAlpha=state.explosionBloom*.7;ctx.filter='blur(3px)';ctx.drawImage(glow,0,0);}
 ctx.restore();
}
$('#explosion-glow').addEventListener('input',()=>{state.explosionGlow=Number($('#explosion-glow').value);field('explosion-glow-value').textContent=Math.round(state.explosionGlow*100)+'%';drawExplosionMap();remember();});
'''+s[b:]
s=s.replace("function drawGradient(){storeGradientLayer();", "function drawGradient(){storeGradientLayer();$('#explosion-glow').value=state.explosionGlow;field('explosion-glow-value').textContent=Math.round(state.explosionGlow*100)+'%';")
p.write_text(s)
