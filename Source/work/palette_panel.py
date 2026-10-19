from pathlib import Path
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
s=p.read_text();pos=s.index('  <details class="text-small">')
s=s[:pos]+'''  <section class="mp-palette-panel" aria-label="Editor de paleta">
    <div class="viz-row"><strong>Paleta</strong><input class="form-control" data-field="palette-name" aria-label="Nome da paleta" maxlength="48" placeholder="Minha paleta"><span class="text-small" data-field="palette-count"></span></div>
    <div class="viz-row"><button class="btn" type="button" data-action="palette-add">+ Cor atual</button><button class="btn" type="button" data-action="palette-triad">+ Tríade</button><button class="btn" type="button" data-action="palette-copy">Copiar HEX</button><button class="btn" type="button" data-action="palette-remove">Remover selecionada</button></div>
    <div class="mp-palette-grid" data-field="palette-swatches" aria-label="Cores da paleta"></div>
    <div class="text-small" data-field="palette-status" aria-live="polite"></div>
  </section>
''' +s[pos:]
s=s.replace('<style>','''<style>
#munsell-picker .mp-palette-panel{display:flex;flex-direction:column;gap:8px}
#munsell-picker .mp-palette-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(76px,1fr));gap:6px}
#munsell-picker .mp-palette-swatch{display:block;height:22px;width:100%}
''',1)
s=s.replace('triadChroma:{}},geometry','triadChroma:{},savedPalette:[],paletteName:"Minha paleta",paletteSelected:-1},geometry')
s=s.replace('state.c=closest(allowed(state.h,state.v),state.c);}', '''if(typeof m.paletteName==='string')state.paletteName=m.paletteName.slice(0,48);if(Array.isArray(m.savedPalette))state.savedPalette=m.savedPalette.filter(s=>hues.includes(s.h)&&Number.isInteger(s.v)&&s.v>=0&&s.v<=10&&Number.isFinite(s.c)&&allowed(s.h,s.v).includes(s.c)).slice(0,24).map(s=>({h:s.h,v:s.v,c:s.c}));if(Number.isInteger(m.paletteSelected))state.paletteSelected=Math.min(state.savedPalette.length-1,Math.max(-1,m.paletteSelected));state.c=closest(allowed(state.h,state.v),state.c);}''',1)
s=s.replace('function update(save=false){','''function drawPalette(){
 field('palette-name').value=state.paletteName;
 field('palette-count').textContent=`${state.savedPalette.length}/24`;
 field('palette-swatches').innerHTML=state.savedPalette.map((s,i)=>{const hex=swatch(s.h,s.v,s.c)[0];return `<button type="button" class="btn" data-palette-index="${i}" aria-pressed="${i===state.paletteSelected}" aria-label="Selecionar ${s.h} ${s.v}/${s.c}, ${hex}"><span class="mp-palette-swatch" style="background-color:${hex}"></span><span class="text-small">${hex.toUpperCase()}</span></button>`}).join('');
 field('palette-status').textContent=state.savedPalette.length?'Clique em uma amostra para editar sua cor no seletor.':'Adicione cores do seletor para começar.';
 $('[data-action="palette-remove"]').disabled=state.paletteSelected<0;
 $('[data-action="palette-copy"]').disabled=!state.savedPalette.length;
}
function addPalette(entries){
 for(const s of entries){if(state.savedPalette.length>=24)break;state.savedPalette.push({h:s.h,v:s.v,c:s.c});state.paletteSelected=state.savedPalette.length-1;}
 update(true);
}
function update(save=false){''')
s=s.replace('drawScene();drawStrip();if(save)remember();','drawScene();drawStrip();drawPalette();if(save)remember();')
s=s.replace("new ResizeObserver(()=>",'''$('[data-action="palette-add"]').addEventListener('click',()=>addPalette([state]));
$('[data-action="palette-triad"]').addEventListener('click',()=>addPalette(triadColors()));
$('[data-action="palette-copy"]').addEventListener('click',()=>copyCode(state.savedPalette.map(s=>swatch(s.h,s.v,s.c)[0].toUpperCase()).join(', ')));
$('[data-action="palette-remove"]').addEventListener('click',()=>{if(state.paletteSelected<0)return;state.savedPalette.splice(state.paletteSelected,1);state.paletteSelected=Math.min(state.paletteSelected,state.savedPalette.length-1);update(true);});
field('palette-name').addEventListener('input',()=>{state.paletteName=field('palette-name').value.slice(0,48);remember();});
field('palette-swatches').addEventListener('click',e=>{const b=e.target.closest('[data-palette-index]');if(!b)return;const i=Number(b.dataset.paletteIndex),s=state.savedPalette[i];if(!s)return;state.paletteSelected=i;state.h=s.h;state.v=s.v;state.c=s.c;update(true);});
new ResizeObserver(()=>''',1)
p.write_text(s)
