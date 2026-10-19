# -*- coding: utf-8 -*-
"""Additional Tone Shift studies with independently authored color rhythms."""
from pathlib import Path
import json
from oklab_palette import color

# Each tuple is tonal position, hue angle, and target chroma.
# All palettes preserve the existing shared OKLab lightness function.
studies = [
    ('ember-glacier','Ember & Glacier',
     [(0,260,.05),(.1,220,.12),(.22,290,.06),(.35,345,.17),(.47,30,.245),(.59,65,.07),(.69,200,.055),(.79,225,.145),(.89,45,.07),(.95,145,.05),(1,100,.025)],
     'Icy blue shadow glints meet a hot ember edge; a quiet golden bridge leads to glacier cyan with a brief peach reflection.'),
    ('aubergine-chartreuse','Aubergine & Chartreuse',
     [(0,315,.05),(.13,265,.14),(.24,315,.065),(.36,340,.215),(.47,70,.055),(.58,140,.225),(.7,120,.12),(.81,330,.055),(.87,350,.115),(.94,110,.06),(1,90,.025)],
     'Aubergine ink catches cobalt and fuchsia before opening into chartreuse; a small blush reflection punctuates warm lime light.'),
    ('ultramarine-tangerine','Ultramarine & Tangerine',
     [(0,285,.055),(.18,260,.18),(.32,205,.065),(.47,40,.245),(.63,75,.065),(.8,225,.15),(.92,95,.065),(1,85,.025)],
     'Broad ultramarine shadow and tangerine body color are interrupted by cyan and cool reflected light, then softened into butter cream.'),
    ('petrol-carnation','Petrol & Carnation',
     [(0,215,.05),(.14,185,.12),(.26,290,.06),(.39,345,.22),(.52,20,.235),(.63,45,.055),(.73,170,.15),(.83,300,.075),(.92,160,.06),(1,65,.025)],
     'Petrol-green shadow reflects lavender and vivid carnation rose; pale jade bounce adds contrast to peach-colored light.'),
    ('mulberry-pistachio','Mulberry & Pistachio',
     [(0,330,.045),(.11,290,.13),(.23,345,.06),(.35,325,.215),(.46,25,.07),(.57,130,.195),(.69,155,.065),(.81,80,.14),(.91,170,.05),(1,110,.025)],
     'Mulberry shadow and violet reflection give way to pistachio green, warm honey and a small mint gleam.'),
    ('espresso-lilac','Espresso & Electric Lilac',
     [(0,40,.035),(.14,30,.125),(.28,205,.055),(.43,305,.255),(.56,335,.12),(.69,185,.055),(.81,320,.125),(.93,100,.055),(1,85,.025)],
     'Espresso warmth is interrupted by a teal shadow reflection and electric lilac, with blush light and a small champagne accent.'),
    ('cerulean-marigold','Cerulean & Marigold',
     [(0,255,.05),(.1,290,.125),(.21,210,.06),(.34,245,.21),(.46,270,.09),(.57,65,.185),(.68,95,.065),(.77,165,.14),(.85,70,.07),(.94,140,.045),(1,90,.025)],
     'Blue-lit cerulean carries a violet reflection before a marigold turn; jade bounce and a golden return keep the light lively.'),
    ('russet-peacock','Russet & Peacock',
     [(0,30,.045),(.14,45,.13),(.27,305,.055),(.42,25,.235),(.55,85,.065),(.69,205,.185),(.82,165,.075),(.93,45,.085),(1,100,.025)],
     'Russet and vermilion shadow colors meet violet bounce, then give way to peacock-blue reflection and pale copper light.'),
    ('sage-vermilion','Sage & Vermilion',
     [(0,180,.035),(.12,235,.11),(.24,160,.05),(.36,145,.18),(.48,30,.24),(.6,70,.065),(.71,175,.13),(.81,345,.055),(.9,45,.105),(1,105,.025)],
     'Sage shadows catch cobalt and emerald, then a concentrated vermilion edge; muted coral rests separate mint and peach reflections.'),
    ('midnight-opal','Midnight & Opal',
     [(0,275,.055),(.08,310,.135),(.17,220,.055),(.28,285,.185),(.4,335,.075),(.51,185,.165),(.62,140,.06),(.73,305,.14),(.82,345,.075),(.89,90,.055),(.95,165,.045),(1,100,.02)],
     'Midnight violet is enlivened by blue, rose and turquoise reflections; lighter orchid, blush, pale gold and mint form an opal-colored finish.'),
    ('ochre-iris','Ochre & Blue Iris',
     [(0,65,.035),(.07,30,.07),(.15,45,.125),(.24,185,.055),(.33,285,.2),(.41,315,.10),(.49,265,.23),(.57,225,.075),(.65,80,.16),(.73,100,.065),(.8,175,.12),(.86,85,.055),(.93,320,.07),(1,95,.025)],
     'Ochre warmth catches teal and electric iris-blue; golden light is broken by a jade reflection and a restrained lilac gleam.'),
    ('garnet-mint','Garnet & Mint',
     [(0,350,.045),(.11,305,.135),(.23,215,.06),(.35,340,.215),(.46,15,.245),(.57,45,.075),(.66,170,.055),(.76,155,.165),(.84,330,.055),(.93,105,.075),(1,130,.025)],
     'Garnet and fuchsia shadows gain a blue reflection and a hot coral turn; mint light catches a small rose return before pale lime.'),
]
rows = []
for slug, name, anchors, direction in studies:
    positions = [t for t, _, _ in anchors]
    assert 2 <= len(anchors) <= 16 and all(a < b for a, b in zip(positions, positions[1:]))
    rows.append({
        'id':'painterly-shift-extra-'+slug, 'name':'Tone Shift · '+name,
        'category':'Creative', 'originalCategory':'Stylized',
        'colors':[color(.24+.70*t,c,h,gamut_margin=.92) for t,h,c in anchors],
        'positions':positions, 'transition':'smooth',
        'searchAliases':'painterly tone shift expansion color remap painted reflection mudanca de tom reflexos coloridos '+slug.replace('-',' '),
        'description':direction+' Shares the Tone Shift family lightness profile, L(t)=0.24+0.70t in OKLab. Chroma accents alternate with restrained resting regions. Hue and chroma are authored independently; gamut fitting retains lightness. Apply to a value mask for continuous shading.',
    })
assert len(rows) == 12
source=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
s=source.read_text();marker="field('preset-count').textContent=gradientPresets.length;"
assert 'const painterlyToneExpansionTemplates=' not in s and s.count(marker)==1
Path('work/tone-expansion-templates.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
s=s.replace(marker,'// Additional Tone Shift studies retain matched perceptual values and distinct color rhythms.\nconst painterlyToneExpansionTemplates='+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';\ngradientPresets.push(...painterlyToneExpansionTemplates);\n'+marker)
source.write_text(s)
print('Added 12 new Tone Shift palettes with 8–14 keys.')
