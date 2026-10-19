from pathlib import Path
import re
p=Path(re.search("const file='([^']+)'",Path('work/check_triad.cjs').read_text())[1]);s=p.read_text()
s=s.replace('  <div data-field="munsell-panel">','''  <div data-field="munsell-panel">
    <div class="mp-story">
      <div class="viz-row"><strong>Dar um endereço à cor</strong><span class="text-small">Albert H. Munsell · artista e professor · 1858–1918</span></div>
      <div class="viz-row" aria-label="Capítulos do infográfico"><button class="btn" type="button" data-story="why" aria-pressed="true">Por que surgiu</button><button class="btn" type="button" data-story="axes" aria-pressed="false">Três dimensões</button><button class="btn" type="button" data-story="shape" aria-pressed="false">Por que essa forma</button><button class="btn" type="button" data-story="history" aria-pressed="false">1905 → 1915</button></div>
      <div class="text-small" data-field="story-text"></div>
      <div class="viz-row"><span class="text-small">Experimente:</span><button class="btn" type="button" data-experiment="hue">Mudar só o matiz</button><button class="btn" type="button" data-experiment="value">Mudar só o Value</button><button class="btn" type="button" data-experiment="chroma">Do neutro ao intenso</button><span class="text-small" data-field="experiment-note" aria-live="polite"></span></div>
    </div>''',1)
s=s.replace('  <div class="viz-row text-small"><span>Matiz: ao redor</span>', '  <div class="text-small" data-field="reading-note" aria-live="polite"></div>\n  <div class="viz-row text-small"><span>Matiz: ao redor</span>',1)
s=s.replace('<style>','<style>\n#munsell-picker .mp-story{display:flex;flex-direction:column;gap:6px}',1)
pos=s.index('function labColor(')
s=s[:pos]+'''const chapters={
 why:'Munsell queria tornar a descrição da cor precisa, prática e ensinável. Em vez de depender apenas de nomes como “verde” ou “vermelho”, propôs localizar cada cor por atributos comparáveis. Seu trabalho juntou o olhar de um pintor à medição e à educação. <a href="https://www.rit.edu/science/munsell-color-lab" target="_blank" rel="noopener noreferrer">Fonte: RIT</a>',
 axes:'Hue identifica a família do matiz; Value organiza a claridade entre preto e branco; Chroma mede a distância do cinza neutro. A notação H V/C funciona como um endereço: 5R 5/6 é matiz 5R, Value 5 e Chroma 6. Separar os atributos ajuda a comparar cores e orientar escolhas na pintura. <a href="https://munsell.com/wp-content/uploads/2011/03/munsell-color-system-cleland.pdf" target="_blank" rel="noopener noreferrer">Guia histórico</a>',
 shape:'O eixo central reúne os neutros. Subir muda o Value; girar muda o matiz; afastar-se do eixo aumenta o Chroma. As camadas não têm todas o mesmo alcance: o Chroma disponível varia com matiz e Value. Esta prévia mostra amostras tabuladas; sua borda não é um limite universal de cor ou impressão. <a href="https://munsell.com/color-blog/the-munsell-book-of-color-1929-the-color-sphere/1000/" target="_blank" rel="noopener noreferrer">O sólido de cores</a>',
 history:'1905 · A Color Notation apresenta o sistema e seu uso na educação. 1915 · Atlas of the Munsell Color System organiza referências visuais. A ideia central permanece: comunicar e relacionar cores por uma notação, tornando seu ensino mais claro. Os HEX desta página são conversões digitais, não amostras físicas originais. <a href="https://www.rit.edu/science/munsell-color-lab" target="_blank" rel="noopener noreferrer">História: RIT</a>'
};
function setChapter(key){field('story-text').innerHTML=chapters[key];for(const k of Object.keys(chapters))$(`[data-story="${k}"]`).setAttribute('aria-pressed',String(k===key));}
for(const key of Object.keys(chapters))$(`[data-story="${key}"]`).addEventListener('click',()=>setChapter(key));
setChapter('why');
for(const key of ['hue','value','chroma'])$(`[data-experiment="${key}"]`).addEventListener('click',()=>{
 if(key==='hue'){const old=state.c;state.h=hues[(hues.indexOf(state.h)+4)%40];update(true);field('experiment-note').textContent=state.c===old?'Value e Chroma mantidos.':'Chroma ajustado à amostra disponível.';}
 else if(key==='value'){const old=state.c;state.v=state.v>=8?2:state.v+1;update(true);field('experiment-note').textContent=state.c===old?'Matiz e Chroma mantidos.':'Chroma ajustado ao novo Value.';}
 else{state.c=state.c===0?Math.max(...allowed(state.h,state.v)):0;update(true);field('experiment-note').textContent=state.c===0?'Neutro: Chroma zero.':'Maior Chroma tabulado neste corte.';}
});
''' +s[pos:]
s=s.replace(' drawSystem();',' drawSystem();\n field(\'reading-note\').textContent=`Seu endereço: ${state.c===0?\'N \'+state.v+\'/\':state.h+\' \'+state.v+\'/\'+state.c} · corte horizontal no Value ${state.v} · distância do neutro ${state.c} · máximo tabulado ${Math.max(...allowed(state.h,state.v))}.`;',1)
p.write_text(s)
