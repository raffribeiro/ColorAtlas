from pathlib import Path
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
s=p.read_text().replace("triad:true},geometry", "triad:true,triadChroma:{}},geometry")
s=s.replace("if(typeof m.triad==='boolean')state.triad=m.triad;", "if(typeof m.triad==='boolean')state.triad=m.triad;if(m.triadChroma&&typeof m.triadChroma==='object')state.triadChroma=Object.fromEntries(Object.entries(m.triadChroma).filter(([h,c])=>hues.includes(h)&&Number.isFinite(c)&&c>=0));")
s=s.replace("c=closest(allowed(h,state.v),state.c)","c=closest(allowed(h,state.v),offset===0?state.c:(state.triadChroma[h]??state.c))")
a=s.index(" field('triad-colors').innerHTML=")
b=s.index(" hue.value=",a)
s=s[:a]+''' const panel=field('triad-colors'),signature=colors.map(s=>s.h+':'+s.v).join('|');
 if(panel.renderSignature!==signature){panel.renderSignature=signature;panel.innerHTML=colors.map((s,j)=>`<div><div class="mp-triad-swatch" data-triad-swatch="${j}" role="img"></div><div class="viz-row"><span data-triad-notation="${j}"></span><code data-triad-hex="${j}"></code></div><label class="form-label" for="mp-triad-chroma-${j}">Chroma <output data-triad-value="${j}"></output></label><input id="mp-triad-chroma-${j}" class="form-range" type="range" min="0" step="1" data-triad-chroma="${j}"><button class="btn" type="button" data-use-triad="${j}">Usar esta cor</button></div>`).join('');}
 colors.forEach((s,j)=>{const steps=allowed(s.h,s.v),slider=$(`[data-triad-chroma="${j}"]`),sw=$(`[data-triad-swatch="${j}"]`);slider.max=steps.length-1;slider.value=steps.indexOf(s.c);slider.disabled=steps.length===1;slider.setAttribute('aria-valuetext',String(s.c));sw.style.backgroundColor=s.hex;sw.setAttribute('aria-label',`Cor ${j+1}: ${s.notation}`);$(`[data-triad-notation="${j}"]`).textContent=`${j===0?'Base':`Cor ${j+1}`} · ${s.notation}`;$(`[data-triad-hex="${j}"]`).textContent=s.hex.toUpperCase()+(s.outsideSRGB?' ×':'');$(`[data-triad-value="${j}"]`).textContent=s.c;});
 field('triad-note').textContent='Tríade aproximada: matizes próximos de 120° e 240°. Value compartilhado; Chroma independente em cada cor.';
''' + s[b:]
s=s.replace("field('triad-colors').addEventListener('click'", "field('triad-colors').addEventListener('input',e=>{const slider=e.target.closest('[data-triad-chroma]');if(!slider)return;const j=Number(slider.dataset.triadChroma),color=triadColors()[j],c=allowed(color.h,state.v)[Number(slider.value)];if(j===0)state.c=c;else state.triadChroma[color.h]=c;update(true);});\nfield('triad-colors').addEventListener('click'")
p.write_text(s)
