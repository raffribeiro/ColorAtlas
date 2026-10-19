from pathlib import Path
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
s=p.read_text().replace('<div class="mp-control-group">\n      <label class="form-label" for="mp-hue">','<div class="mp-control-group" hidden>\n      <label class="form-label" for="mp-hue">',1)
s=s.replace('<div class="mp-swatch" role="img" aria-label="Cor selecionada"></div>','<div class="mp-swatch" role="img" aria-label="Cor selecionada" hidden></div>')
s=s.replace('#munsell-picker .mp-control-group{','#munsell-picker .mp-control-group[hidden]{display:none}\n#munsell-picker .mp-control-group{')
s=s.replace('  <svg class="mp-strip', '  <div class="viz-row text-small"><span>□ Seleção atual</span><span style="color:var(--orange)">◆ Maior Chroma tabulado</span><span>× Fora de sRGB</span></div>\n  <svg class="mp-strip',1)
s=s.replace('  <div class="text-small">× Fora de sRGB; prévia e HEX limitados à faixa da tela.</div>', '''  <details class="text-small"><summary>Sobre Munsell e a leitura das cores</summary><div class="mp-method-notes">
  <div><strong>H V/C</strong> · Exemplo: 5R 5/6 significa matiz 5R, Value 5 e Chroma 6. Neutros usam N V/.</div>
  <div><strong>Três dimensões</strong> · Hue identifica o matiz; Value vai de preto (0) a branco (10); Chroma indica a distância do neutro.</div>
  <div><strong>Limite variável</strong> · O maior Chroma depende do matiz e do Value. ◆ marca a última amostra deste conjunto de dados, não um limite universal nem o máximo imprimível.</div>
  <div><strong>Prévia digital</strong> · HEX e cinza representam sRGB; cores com × tiveram canais limitados. Mesmo Value Munsell pode aparecer diferente em cinza após essa limitação.</div>
  <div><strong>Tríade</strong> · Os intervalos são aproximados na roda Munsell; o Value é compartilhado e o Chroma é independente.</div>
  <a href="https://munsell.com/color-blog/the-munsell-book-of-color-1929-the-color-sphere/1000/" target="_blank" rel="noopener noreferrer">Referência: Munsell Color</a>
  </div></details>''')
s=s.replace('#munsell-picker .mp-color-pair{','#munsell-picker .mp-method-notes{display:flex;flex-direction:column;gap:8px;padding-top:8px}\n#munsell-picker .mp-color-pair{')
s=s.replace('s+=`<g data-c="${c}" data-strip-color=', 's+=`<g data-max-chroma="${c===cs[cs.length-1]}" data-c="${c}" data-strip-color=')
s=s.replace('<rect x="${x}" y="${y}" width="${cell}" height="52" fill="transparent"/></g>', '${c===cs[cs.length-1]?`<path d="M${x+cell-9},${y+5} l4,4 l-4,4 l-4,-4 Z" fill="var(--orange)"/><rect x="${x+5}" y="${y+5}" width="${cell-10}" height="22" fill="none" stroke="var(--orange)" stroke-dasharray="3 2"/>`:""}<rect x="${x}" y="${y}" width="${cell}" height="52" fill="transparent"/></g>')
p.write_text(s)
