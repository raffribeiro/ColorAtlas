# -*- coding: utf-8 -*-
from pathlib import Path
import json
rows=[]
def add(id,name,colors,positions,purpose):
 colors=colors.split() if isinstance(colors,str) else colors
 rows.append({'id':'stylized-direction-'+id,'name':name,'category':'Creative','originalCategory':'Stylized','colors':colors,'positions':positions,'transition':'smooth','searchAliases':'stylized directions '+name.split(' · ')[0].lower()+' '+id.replace('-',' '),'description':purpose+' Original sRGB art-direction palette using Smooth OKLab interpolation. Adapt value masks to the asset. Color direction only; paper, brush marks, outlines, foil reflection, glass geometry and other surface treatments need their own shading or texture.'})
def flat(id,name,inks,widths,purpose):
 inks=inks.split();total=sum(widths);start=0;colors=[];positions=[]
 for i,(hex,width) in enumerate(zip(inks,widths)):
  end=start+width/total;colors.extend([hex,hex]);positions.extend([0 if i==0 else round(start+.0001,7),1 if i==len(inks)-1 else round(end-.0001,7)]);start=end
 add(id,name,colors,positions,purpose+' Paired keys retain flat regions with narrow transitions; widths are authored tonal regions, not measured final image coverage.')
flat('paper-citrus','Paper Cut · Citrus Layers','#24384B #4B8065 #F2A13C #F9DE89',[.24,.34,.27,.15],'Cut-paper citrus composition with cool blue shadows, leaf green, orange and pale yellow.')
flat('paper-forest','Paper Cut · Forest Collage','#192B38 #2E5548 #729A58 #CBCC80 #F0E7BA',[.2,.3,.27,.16,.07],'Layered woodland collage, from blue-green silhouettes to leafy greens and warm paper light.')
flat('rubber-butter','Rubber Hose · Ink & Butter','#16151F #C99549 #FFE5A0',[.42,.34,.24],'Expressive near-black ink, warm ochre midtones and butter-cream highlights.')
flat('rubber-cherry','Rubber Hose · Cherry Cartoon','#201724 #D5434B #FFE7C5',[.34,.43,.23],'Cartoon ink, a dominant cherry-red body and warm cream accents.')
add('cyanotype-prussian','Cyanotype · Prussian Paper','#061A30 #143A61 #2A648A #8BB3C6 #E8F1E8',[0,.2,.43,.78,1],'Prussian-blue print interpretation with progressive lightness and a soft warm-paper highlight; not a measured pigment or calibrated print profile.')
add('cyanotype-midnight','Cyanotype · Midnight Blueprint','#071329 #234576 #5A8CAB #D1E7E5',[0,.28,.68,1],'Four-point deep-blue blueprint direction, keeping saturated blue shadows and pale cyan paper.')
add('wash-indigo','Ink Wash · Indigo Bleed','#10162A #273650 #49647B #8197A6 #C1CCCA #F2EFE3',[0,.16,.36,.61,.83,1],'Indigo pigment gradually dissolving toward warm paper, with smooth tonal transitions.')
add('wash-sepia','Ink Wash · Sepia Mist','#30241F #665448 #A58B6E #E9DDC5',[0,.26,.63,1],'Four-point sepia wash, balancing deep umber pigment, warm diluted tones and cream paper.')
add('chalk-carnival','Chalk & Pastel · Dusty Carnival','#45445F #6E6B8A #AF89A3 #D39C92 #E4BBA1 #E6D5B7 #F4EAD9',[0,.14,.31,.49,.66,.84,1],'Opaque violet shadows and dusty rose, coral and cream pastel tones; restrained chroma supports a soft illustration mood.')
add('chalk-lavender','Chalk & Pastel · Lavender Peach','#4B4261 #867198 #B599B3 #E4B39C #F8E4CB',[0,.2,.45,.75,1],'Lavender shadows blend through muted mauve toward peach and pale cream.')
add('solar-copper','Solarization · Copper Inversion','#131827 #557584 #C1DDC9 #F9EDD2 #D58E52 #713820 #351B38 #81476E #D78387 #FFE0B0',[0,.09,.21,.33,.43,.52,.61,.73,.86,1],'Intentional lightness reversal: cool shadows brighten to paper, plunge into copper and violet, then return to warm highlights. Artistic solarization color direction, not an emulation of a specific photochemical process.')
add('solar-sunset','Solarization · Electric Sunset','#171137 #4045B9 #2DBFCA #A5F1B8 #FCEB6C #F38944 #98204F #38165D #8041CC #DB64B5 #FFBD86 #FFF0B0',[0,.08,.17,.27,.37,.46,.55,.63,.72,.82,.92,1],'Multiple deliberate lightness turns cross blue, cyan, citrus, crimson and violet for a solarized sunset treatment.')
flat('foil-gold','Foil Print · Midnight Gold','#111A2B #28364D #89622E #D3AE52 #F9E6AB',[.58,.23,.08,.07,.04],'Midnight paper dominates 81% of authored tonal regions; bronze, gold and pale gleam are small accents. Metallic reflection remains view-dependent.')
flat('foil-copper','Foil Print · Emerald Copper','#0F2827 #225344 #9B5338 #D98D5B #F6D0A1',[.5,.31,.09,.07,.03],'Dark emerald paper holds the composition while copper and warm gleams remain concentrated accents. Metallic reflection remains view-dependent.')
flat('glass-jewel','Stained Glass · Jewel Window','#141828 #2446AB #102C39 #18A695 #27182E #C13074 #DCAB36 #F7E8AF',[.16,.18,.07,.2,.07,.17,.1,.05],'Eight-region jewel study with dark separators, cobalt and jade panes, a ruby accent and warm gold light.')
flat('glass-crimson','Stained Glass · Crimson Cathedral','#1E1020 #6B193F #231A43 #BE3048 #E98444 #F8D6A1',[.24,.2,.1,.28,.12,.06],'Crimson panes and violet shadows create strong dark/light separation before amber transmission highlights.')
add('negative-candy','Photographic Negative · Candy Negative','#FFF1D5 #DBED8C #76D5CA #9A85C4 #4D3B7F #211D36',[0,.2,.4,.62,.82,1],'Reversed lightness: cream and lime occupy source shadows while lavender and deep violet occupy highlights. An artistic negative palette, not channelwise photographic inversion.')
add('negative-alien','Photographic Negative · Alien Portrait','#E2FFD5 #7ADAB5 #55A9B7 #714B9A #271C4C',[0,.22,.48,.75,1],'Luminous green shadows descend through teal into violet highlights for an alien negative portrait direction.')
flat('animation-peach','Limited Animation · Peach Shadow','#4C355A #D4927F #F8D7AF',[.27,.56,.17],'Three distinct values: violet shadow, a dominant peach body and restrained cream light.')
flat('animation-mint','Limited Animation · Mint Midnight','#152C3E #53A58E #C8E6B5',[.29,.55,.16],'Three distinct values: midnight-blue shadow, mint-green body and pale yellow-green light.')
assert len(rows)==20 and len({p['id'] for p in rows})==20
assert all(2<=len(p['colors'])<=16 for p in rows)
Path('work/stylized-direction-templates.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html');s=p.read_text();marker="field('preset-count').textContent=gradientPresets.length;"
assert 'const stylizedDirectionTemplates=' not in s
s=s.replace(marker,'// Ten additional Stylized directions retain purpose-specific tonal behavior.\nconst stylizedDirectionTemplates='+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';\ngradientPresets.push(...stylizedDirectionTemplates);\n'+marker);p.write_text(s)
print('Added all 20 named templates across 10 Stylized directions.')
