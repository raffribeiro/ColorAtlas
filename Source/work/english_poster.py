from pathlib import Path
import re
p=Path(re.search("const file='([^']+)'",Path('work/check_triad.cjs').read_text())[1]);s=p.read_text()
a=s.index('    <div class="mp-story">');b=s.index('  <div class="mp-layout">',a)
s=s[:a]+'''    <section class="mp-poster-intro">
      <div class="viz-row"><strong>A COLOR HAS AN ADDRESS</strong><span class="text-small">Albert H. Munsell · artist &amp; teacher · 1858–1918</span></div>
      <div class="mp-poster-grid text-small">
        <div><strong>WHY HE CREATED IT</strong><p>Munsell wanted color to be described accurately and taught clearly. A name like “green” is broad; a notation locates a specific color. He connected the painter’s eye with measurement.</p></div>
        <div><strong>THREE INDEPENDENT DIMENSIONS</strong><p>Hue identifies the color family. Value describes lightness from black to white. Chroma describes distance from neutral. H V/C gives each color an address: 5R 5/6.</p></div>
        <div><strong>AN IRREGULAR COLOR SOLID</strong><p>Move up for Value, around for Hue, outward for Chroma. Different hues reach different chroma limits at each Value. The faded layers reveal that changing shape.</p></div>
        <div><strong>FROM STUDIO TO SYSTEM</strong><p>1905 · A Color Notation.<br>1915 · Atlas of the Munsell Color System.<br>An artist’s teaching problem became a practical language for comparing and communicating color.</p><a href="https://www.rit.edu/science/munsell-color-lab" target="_blank" rel="noopener noreferrer">Historical source · RIT</a></div>
      </div>
    </section>
''' +s[b:]
a=s.index('const chapters={');b=s.index('function labColor(',a);s=s[:a]+s[b:]
s=s.replace('<style>','<style>\n#munsell-picker .mp-poster-intro{display:flex;flex-direction:column;gap:8px}\n#munsell-picker .mp-poster-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}\n#munsell-picker .mp-poster-grid p{margin:6px 0}\n@media(max-width:720px){#munsell-picker .mp-poster-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}',1)
translations={
'Seletor de cores':'COLOR ATLAS','Sistema':'System','Referência D65 · observador 2°':'D65 reference · 2° observer','Prévia CIELAB':'CIELAB preview','L*: claro ↔ escuro · a*: verde ↔ vermelho · b*: azul ↔ amarelo. Valores fora de sRGB têm a prévia limitada à tela.':'L*: light ↔ dark · a*: green ↔ red · b*: blue ↔ yellow. Out-of-sRGB colors are clipped for display.',
'Sobre Munsell e a leitura das cores':'Reading Munsell · notes & sources','Tríade Munsell':'Munsell triad','Copiar os 3 HEX':'Copy 3 HEX codes','Copiar HEX':'Copy HEX','Cor selecionada':'Selected color','HEX para copiar manualmente':'HEX for manual copying','Matiz':'Hue','matiz':'hue','Value: preto → branco':'Value: black → white','Chroma: neutro → intenso':'Chroma: neutral → vivid','ao redor':'around the axis','Copiado':'Copied','Selecione e copie o código':'Select and copy the code','Fora de sRGB':'Outside sRGB','fora de sRGB':'outside sRGB','Dentro de sRGB':'Inside sRGB','prévia e HEX com canais limitados.':'display preview and HEX are clipped.','conversão dos dados de renotação.':'converted from renotation data.','prévia limitada':'clipped preview','Maior Chroma tabulado':'Highest tabulated Chroma','Seleção atual':'Current selection','Chroma disponível neste hue e Value':'Available Chroma for this hue and Value','Variações de Chroma':'Chroma variations','tríade':'triad','Tríade aproximada: matizes próximos de 120° e 240°. Value compartilhado; Chroma independente em cada cor.':'Approximate triad: hues near 120° and 240°. Shared Value; independent Chroma for each color.',
'Paleta':'Palette','paleta':'palette','Minha palette':'My palette','Nome da palette':'Palette name','Editor de palette':'Palette editor','+ Cor atual':'+ Current color','+ Tríade':'+ Triad','Atualizar selecionada':'Update selected','Remover selecionada':'Remove selected','Cores da palette':'Palette colors','Prévia da cor da palette':'Palette color preview','Cor atual':'Current color','Amostra ':'Swatch ','Selecionar ':'Select ','Clique em uma amostra para editar sua cor no seletor.':'Click a swatch to load it into the color picker.','Adicione cores do seletor para começar.':'Add colors from the picker to begin.','Usar esta cor':'Use this color','Cor ${j+1}':'Color ${j+1}','Cor ${j+1}:':'Color ${j+1}:','Cor 2':'Color 2','Cor 3':'Color 3','em preto e branco':'in grayscale','Preto e branco · luminância sRGB':'Grayscale · sRGB luminance','Chroma aumenta do eixo para fora':'Chroma increases away from the axis','arraste o eixo central':'drag the central axis','Selecione chroma':'Select Chroma','Variações de Chroma das cores selecionadas':'Chroma variations for selected colors','Amostras selecionáveis por chroma':'Selectable Chroma swatches','Neutro':'Neutral','Seu endereço:':'Color address:','corte horizontal no Value':'horizontal slice at Value','distância do neutro':'distance from neutral','máximo tabulado':'tabulated maximum','Copiar HEX da cor atual':'Copy current color HEX','Copiar HEX da cor ${j+1}':'Copy color ${j+1} HEX','Copiar HEX da prévia':'Copy preview HEX','Prévia ':'Preview ',
'Vermelho':'Red','Laranja':'Orange','Amarelo':'Yellow','Verde-amarelo':'Yellow-green','Verde':'Green','Turquesa':'Blue-green','Azul':'Blue','Índigo':'Blue-purple','Púrpura':'Purple','Rosa':'Red-purple',
}
for a,b in translations.items():s=s.replace(a,b)
# Replace the longer methodological notes wholesale to avoid mixed-language fragments.
a=s.index('  <details class="text-small">');b=s.index('</details>',a)+len('</details>')
s=s[:a]+'''  <details class="text-small"><summary>Reading Munsell · notes &amp; sources</summary><div class="mp-method-notes">
  <div><strong>H V/C</strong> · 5R 5/6 means Hue 5R, Value 5, Chroma 6. Neutrals use N V/.</div>
  <div><strong>Variable limits</strong> · ◆ marks the last tabulated sample for a Hue and Value, not a universal limit or the maximum printable color.</div>
  <div><strong>Digital preview</strong> · × marks colors outside sRGB. HEX and grayscale use clipped sRGB; equal Munsell Values may appear different after clipping.</div>
  <div><strong>Triad</strong> · Hue intervals are approximate in the Munsell wheel. Value is shared; Chroma is independent.</div>
  <a href="https://munsell.com/color-blog/the-munsell-book-of-color-1929-the-color-sphere/1000/" target="_blank" rel="noopener noreferrer">Munsell Color · the color solid</a>
  </div></details>''' +s[b:]
p.write_text(s)
