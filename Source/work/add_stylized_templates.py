# -*- coding: utf-8 -*-
from pathlib import Path
import json
# Each entry defines ink colors and authored tonal-region widths, not measured pigment coverage.
studies=[
 ('poster-electric','Poster Pop · Electric Primary','#17132C #ED1E79 #19C7D4 #FFE365',[.26,.3,.28,.16],'Electric pink and cyan against dark violet, with a small lemon accent.'),
 ('poster-sunburst','Poster Pop · Tangerine Sunburst','#29132C #F23D4C #FF9A38 #FFE7A3',[.28,.32,.26,.14],'Plum ink, scarlet body and warm citrus highlights.'),
 ('poster-acid','Poster Pop · Acid Punch','#151C30 #513BDE #D82895 #C7F243 #FFF2D9',[.22,.22,.26,.22,.08],'Violet and magenta masses with a concentrated acid-lime accent.'),
 ('poster-orchid','Poster Pop · Orchid Voltage','#201030 #752ED0 #ED47BD #B5F0CF',[.3,.24,.3,.16],'Orchid purple, hot pink and mint; cool highlights keep strong hue separation.'),
 ('poster-coast','Poster Pop · Coastal Punch','#122638 #16B9B9 #FFB15B',[.36,.42,.22],'Three-color navy, turquoise and apricot composition.'),
 ('poster-midnight','Poster Pop · Midnight Lemon','#151327 #4248AF #E53686 #FADE3C #FFF4C4',[.32,.18,.24,.2,.06],'Midnight ink with pink and lemon accents; restrained paper highlight.'),
 ('comic-primary','Comic · Heroic Primary','#121B31 #2257C8 #E63846 #FFD55C',[.28,.3,.28,.14],'Blue and scarlet graphic masses framed by deep ink and golden sparks.'),
 ('comic-villain','Comic · Villain Violet','#19132B #6638AD #C82DA7 #9CC843 #F5E6B4',[.3,.2,.27,.17,.06],'Violet, magenta and sharp olive-green accents for a sinister graphic mood.'),
 ('comic-pulp','Comic · Pulp Adventure','#211E31 #347C91 #DE6742 #F7D385',[.3,.26,.28,.16],'Weathered teal, burnt orange and warm paper for pulp-style illustration.'),
 ('comic-candy','Comic · Candy Clash','#2C1744 #6A4CD5 #F160BD #53CADA #FFE4A5',[.22,.2,.26,.22,.1],'Candy pink and cyan with violet shadows and cream highlights.'),
 ('riso-coral','Riso · Coral Indigo','#252C67 #F06470 #F5E8CC',[.35,.43,.22],'Indigo and coral against warm paper; a two-ink-inspired color direction.'),
 ('riso-mint','Riso · Mint Vermilion','#1E554C #EA503A #A7D8B6',[.32,.4,.28],'Green ink and vermilion balanced by a mint paper-like region.'),
 ('riso-plum','Riso · Plum Mustard','#48264A #D5A63D #F5DFC0',[.36,.42,.22],'Plum ink, ochre print body and warm uncoated-paper tones.'),
 ('riso-tangerine','Riso · Blue Tangerine','#252D65 #568DCC #EE803F #FAEAD0',[.28,.24,.32,.16],'Cobalt ink, faded blue, tangerine and cream paper.'),
 ('duotone-coral','Duotone · Ink Coral','#182237 #FF7868',[.57,.43],'Deep blue ink and coral with a deliberately concentrated tonal edge.'),
 ('duotone-lime','Duotone · Aubergine Lime','#3C1948 #D3EE60',[.6,.4],'Aubergine shadow and sharp lime highlight.'),
 ('duotone-cobalt','Duotone · Cobalt Cream','#2149B8 #FFF1D6',[.58,.42],'Cobalt and warm cream for a clean editorial silhouette.'),
 ('duotone-teal','Duotone · Teal Peach','#125C65 #FFC09A',[.56,.44],'Dark teal and peach for warm/cool graphic contrast.'),
 ('screenprint-botanical','Screenprint · Botanical Punch','#193E36 #548847 #D75663 #E5AD41 #F6EBC5',[.22,.25,.26,.19,.08],'Leaf-green ink, floral coral and mustard on warm paper.'),
 ('screenprint-magenta','Screenprint · Magenta Gold','#241D3D #D9348C #F0CD57',[.35,.4,.25],'Three-ink dark violet, magenta and golden-yellow composition.'),
 ('screenprint-spectrum','Screenprint · Psychedelic Spectrum','#211636 #484AC4 #994BD8 #E54CAE #F36D59 #F4B440 #B8D456 #ECF2B6',[.18,.12,.13,.15,.13,.12,.1,.07],'Eight-color psychedelic sequence with warm/cool shifts and a restrained pale end.'),
 ('retro-arcade','Retro · Arcade Neon','#11172E #2B3274 #7144C9 #D944A9 #36CFD8 #FFE080',[.22,.15,.18,.2,.17,.08],'Six-color arcade graphic direction, from navy ink through violet and pink to cyan and lemon.'),
 ('retro-noir','Retro · Noir Signal','#101921 #77818A #F35546',[.56,.29,.15],'Large charcoal silhouette, cool gray detail and a small vermilion signal.'),
 ('cel-soda','Cel · Soda Pop','#222347 #505DB4 #29B8CC #FA839F #FFE58D',[.25,.2,.24,.21,.1],'Flat cel-style navy, cornflower, cyan, strawberry and lemon tones.'),
]
rows=[]
for id,name,inks,widths,direction in studies:
 inks=inks.split();assert 2<=len(inks)<=8 and len(inks)==len(widths)
 total=sum(widths);boundary=0;colors=[];positions=[]
 for i,(hex,width) in enumerate(zip(inks,widths)):
  end=boundary+width/total
  positions.extend([0 if i==0 else round(boundary+.0001,7),1 if i==len(inks)-1 else round(end-.0001,7)])
  colors.extend([hex,hex]);boundary=end
 rows.append({'id':'stylized-extra-'+id,'name':name,'category':'Creative','originalCategory':'Stylized','colors':colors,'positions':positions,'transition':'smooth','searchAliases':'stylized expansion graphic '+name.split(' · ')[0].lower()+' '+id.replace('-',' '),'description':direction+' Original graphic color study. Paired keys hold solid-color regions with narrow Smooth transitions. Widths are art-direction choices, not final image area measurements. Color palette only: halftone, ink texture, print registration and cel outlines need separate treatments.'})
assert len(rows)==24 and len({p['name'] for p in rows})==24
Path('work/stylized-expansion-templates.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html');s=p.read_text();marker="field('preset-count').textContent=gradientPresets.length;"
assert 'const stylizedExpansionTemplates=' not in s
s=s.replace(marker,'// Graphic palettes retain deliberate flat-color regions in the default Smooth mode.\nconst stylizedExpansionTemplates='+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';\ngradientPresets.push(...stylizedExpansionTemplates);\n'+marker)
p.write_text(s);print('Added 24 Stylized graphic palettes.')
