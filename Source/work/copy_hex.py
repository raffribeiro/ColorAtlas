from pathlib import Path
import re
p=Path(re.search("const file='([^']+)'",Path('work/check_triad.cjs').read_text())[1]);s=p.read_text()
s=s.replace('<code data-field="hex"></code>','<button class="btn btn-ghost" type="button" data-copy-hex data-field="hex" aria-label="Copiar HEX da cor atual"></button>')
s=s.replace('<code data-triad-hex="${j}"></code>','<button class="btn btn-ghost" type="button" data-copy-hex data-triad-hex="${j}" aria-label="Copiar HEX da cor ${j+1}"></button>')
s=s.replace('<span class="text-small">${hex.toUpperCase()}</span>','<span class="text-small" data-copy-hex="${hex}">${hex.toUpperCase()}</span>')
s=s.replace("field('palette-preview-label').textContent=`${state.paletteSelected>=0?'Amostra '+(state.paletteSelected+1):'Cor atual'} · ${selected.h} ${selected.v}/${selected.c} · ${hex.toUpperCase()}`;", "field('palette-preview-label').innerHTML=`${state.paletteSelected>=0?'Amostra '+(state.paletteSelected+1):'Cor atual'} · ${selected.h} ${selected.v}/${selected.c} · <button class=\"btn btn-ghost\" type=\"button\" data-copy-hex=\"${hex}\" aria-label=\"Copiar HEX da prévia\">${hex.toUpperCase()}</button>`;")
s=s.replace('· ${gray.toUpperCase()}</span>', '· <button class="btn btn-ghost" type="button" data-copy-hex="${gray}">${gray.toUpperCase()}</button></span>')
s=s.replace("async function copyCode(text)", "root.addEventListener('click',e=>{const target=e.target.closest('[data-copy-hex]');if(!target)return;const hex=(target.getAttribute('data-copy-hex')||target.textContent).match(/#[a-f0-9]{6}/i)?.[0];if(!hex)return;e.stopPropagation();copyCode(hex.toUpperCase());},true);\nasync function copyCode(text)")
p.write_text(s)
for name in ['check_triad.cjs','check_value_axis.cjs']:
 q=Path('work')/name
 if q.exists():q.write_text(q.read_text().replace('const root={querySelector:node};','const root={querySelector:node,addEventListener(n,f){node(\"root\").handlers[n]=f}};'))
