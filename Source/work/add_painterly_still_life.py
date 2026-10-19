# -*- coding: utf-8 -*-
"""Reference-informed painterly color studies in the existing Stylized folder."""
from pathlib import Path
import json


def lightness(hex):
    rgb = [int(hex[i:i+2], 16)/255 for i in (1, 3, 5)]
    r, g, b = [v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in rgb]
    ll = (.4122214708*r+.5363325363*g+.0514459929*b)**(1/3)
    mm = (.2119034982*r+.6806995451*g+.1073969566*b)**(1/3)
    ss = (.0883024619*r+.2817188376*g+.6299787005*b)**(1/3)
    return .2104542553*ll+.793617785*mm-.0040720468*ss


# First palette: selected cluster centers from a 16-color quantization of the user's image.
# Remaining palettes: original variations on warm light, colored shadow and reflected color.
studies = [
    ('tropical', 'Tropical Still Life',
     '#1E477C #434B5F #636574 #9D6971 #958697 #D0656A #D48770 #E7995F #EAAE6B #EED296 #B1C9BC #E5EAD4',
     [0,.08,.18,.28,.36,.44,.53,.63,.73,.83,.91,1],
     'Representative sampled blues, lavender-gray, painted coral, mango orange, mint reflection and pale porcelain from the supplied still-life reference.'),
    ('mango', 'Mango & Lavender',
     '#304661 #696487 #9A7B9F #D18781 #EDA354 #F3D282 #F4F0D3',
     [0,.16,.31,.47,.67,.86,1],
     'Lavender and blue-gray shadows shift through warm coral into golden mango and soft cream light.'),
    ('citrus', 'Citrus & Turquoise',
     '#234C68 #5A8391 #75AB9E #D09B74 #EDA458 #F4C977 #CDE3C1 #F4F0D7',
     [0,.13,.3,.46,.63,.79,.9,1],
     'Cool blue and turquoise reflections turn toward orange citrus, golden skin and mint-tinted porcelain.'),
    ('strawberry', 'Strawberry & Periwinkle',
     '#343F6C #706994 #AF6F9A #D77682 #EA9B92 #E5BDAA #F3E6CA',
     [0,.17,.34,.54,.73,.88,1],
     'Periwinkle shadows support rose and coral fruit tones with restrained pale peach highlights.'),
    ('kiwi', 'Kiwi & Blue Ink',
     '#264F66 #637D74 #8AA164 #B3C765 #DCE19C #EDF0D3',
     [0,.21,.43,.66,.85,1],
     'Blue ink shadows rise through dusty teal, kiwi green and yellow-green flesh to pale creamy light.'),
    ('plum', 'Plum & Mint Light',
     '#333D66 #70658A #A275A0 #C78DA9 #E5B1B0 #B6D9C5 #D9E8CE #F2F0D8',
     [0,.14,.3,.46,.63,.79,.91,1],
     'Slate blue and mauve plum shadows brighten through dusty rose before catching soft mint reflected light.'),
    ('peach', 'Peach & Cool Porcelain',
     '#31485D #65768A #958AAB #C18F99 #D9A08B #EAB68B #EECDA3 #CFE1D5 #F5EFDA',
     [0,.12,.25,.4,.55,.7,.82,.92,1],
     'Cool porcelain blues and lilac reflections meet peach skin, warm orange flesh and pale celadon highlights.'),
    ('golden', 'Golden Fruit & Violet Shade',
     '#2E4264 #605F83 #867394 #AD889C #CC978B #DFA171 #ECB55C #EFC97D #EADBAB #F5F0D2',
     [0,.1,.21,.33,.46,.59,.72,.83,.92,1],
     'A detailed violet-to-gold ramp preserves painted shadow color, coral bounce and broad golden midtones.'),
]

rows = []
for slug, name, inks, positions, direction in studies:
    # A gradient map orders tones by perceptual lightness; source image area is not ramp width.
    colors = sorted(inks.split(), key=lightness)
    assert len(colors) == len(positions) and 2 <= len(colors) <= 16
    rows.append({
        'id':'painterly-still-'+slug, 'name':'Painterly · '+name,
        'category':'Creative', 'originalCategory':'Stylized',
        'colors':colors, 'positions':positions, 'transition':'smooth',
        'searchAliases':'painterly still life painted fruit colorful shadows warm light pintura frutas sombras coloridas '+slug,
        'description':direction+' Smooth OKLab interpolation keeps a continuous value ramp with visible warm/cool hue shifts. Positions are authored tonal proportions. Brush strokes and separate object colors come from the source image or masks.',
    })
source = Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
s = source.read_text()
marker = "field('preset-count').textContent=gradientPresets.length;"
assert 'const painterlyStillLifeTemplates=' not in s and s.count(marker) == 1
assert len(rows) == 8
Path('work/painterly-still-life-templates.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
s = s.replace(marker,'// Painterly still-life studies preserve colored shadows and warm reflected light.\nconst painterlyStillLifeTemplates='+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';\ngradientPresets.push(...painterlyStillLifeTemplates);\n'+marker)
source.write_text(s)
print('Added eight Painterly palettes to Stylized, with 6–12 points.')
