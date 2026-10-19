# -*- coding: utf-8 -*-
"""Eight shared-lightness painting studies, inspired by the supplied references."""
from pathlib import Path
import json
import re
from oklab_palette import color

# Reflected-color accents and chroma rests; all retain L(t) = .24 + .70t.
studies = [
    ('peach-periwinkle','Peach & Periwinkle',
     [0,.12,.23,.32,.46,.56,.65,.74,.84,.93,1],
     [270,235,295,320,25,40,160,45,85,140,90],
     [.045,.115,.065,.14,.235,.12,.065,.145,.08,.06,.025],
     'A cyan shadow glint, violet bounce and hot coral edge give way to apricot body color, a small mint reflection and golden light.'),
    ('lime-orchid','Lime & Orchid',
     [0,.1,.18,.29,.4,.49,.6,.7,.77,.85,.93,1],
     [310,285,235,300,330,95,140,170,250,320,115,100],
     [.055,.13,.055,.165,.245,.065,.225,.1,.06,.115,.075,.027],
     'Orchid ink catches a blue reflection and a vivid rose accent; a quiet golden bridge leads to lime-green body color and pink reflected light.'),
    ('apricot-teal','Apricot & Teal',
     [0,.14,.26,.38,.49,.6,.72,.82,.93,1],
     [220,185,275,340,35,60,190,45,140,85],
     [.045,.11,.055,.15,.235,.115,.075,.12,.055,.025],
     'Turquoise reflection, violet shadow bounce and a vermilion edge turn into broad apricot, then briefly return to teal before warm cream light.'),
    ('cobalt-cream','Cobalt & Cream',
     [0,.16,.29,.43,.55,.68,.8,.92,1],
     [280,300,220,260,235,145,80,160,90],
     [.055,.14,.06,.245,.12,.07,.145,.055,.025],
     'Violet-lit cobalt, a cyan reflection and a saturated blue focal edge shift through pale jade toward gold, with a final mint gleam.'),
    ('coral-seafoam','Coral & Seafoam',
     [0,.11,.23,.34,.46,.57,.65,.75,.83,.93,1],
     [280,245,315,345,20,40,160,170,330,130,95],
     [.045,.12,.06,.16,.235,.115,.055,.165,.075,.055,.025],
     'A cyan shadow glint and magenta bounce feed a vivid coral focal region; mint reflections and a restrained rose return enliven pale seafoam light.'),
    ('violet-gold','Violet & Gold',
     [0,.1,.21,.32,.45,.54,.63,.72,.8,.87,.94,1],
     [285,245,300,315,325,25,70,85,165,80,130,95],
     [.05,.12,.065,.19,.245,.11,.075,.165,.06,.125,.05,.025],
     'Blue-lit violet shadows carry vivid orchid and fuchsia; copper and gold gain a small jade reflection before a warm metallic-colored highlight.'),
    ('jade-rose','Jade & Rose',
     [0,.13,.25,.38,.5,.61,.71,.82,.93,1],
     [215,170,265,155,345,20,170,30,110,75],
     [.045,.11,.055,.185,.225,.105,.065,.13,.06,.025],
     'Jade body color is interrupted by a lavender reflection and a lively rose terminator; peach light catches a mint return and pale lime gleam.'),
    ('copper-cyan','Copper & Cyan',
     [0,.14,.29,.43,.55,.68,.8,.92,1],
     [25,35,300,30,70,205,170,55,110],
     [.05,.125,.055,.235,.07,.18,.075,.105,.025],
     'Copper shadow color catches a violet glint before a bright orange edge; broad cyan reflection and seafoam light return briefly to gold.'),
]
rows = []
for slug, name, positions, hues, chromas, direction in studies:
    assert len(positions) == len(hues) == len(chromas)
    colors = [color(.24+.70*t, c, h, gamut_margin=.92)
              for t, c, h in zip(positions, chromas, hues)]
    rows.append({
        'id':'painterly-tone-'+slug, 'name':'Tone Shift · '+name,
        'category':'Creative', 'originalCategory':'Stylized',
        'colors':colors, 'positions':positions, 'transition':'smooth',
        'searchAliases':'painterly tone shift color remap volume preserving painting mudanca de tom valores preservados '+slug.replace('-',' '),
        'description':direction+' Shares the same ascending OKLab lightness profile with the other Tone Shift palettes; hue and chroma change independently. Chroma is fitted to sRGB at fixed lightness. Apply with a source value mask; individual material reflections and brushwork are supplied by the source image.',
    })
assert len(rows) == 8
source = Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
s = source.read_text()
marker = "field('preset-count').textContent=gradientPresets.length;"
assert s.count(marker) == 1
Path('work/tone-shift-templates.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
declaration = 'const painterlyToneShiftTemplates='+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';'
if 'const painterlyToneShiftTemplates=' in s:
    s, count = re.subn(r'const painterlyToneShiftTemplates=\[.*?\];',lambda _: declaration,s,count=1)
    assert count == 1
else:
    s = s.replace(marker,'// Tone Shift variants share the same OKLab lightness ramp across different hues.\n'+declaration+'\ngradientPresets.push(...painterlyToneShiftTemplates);\n'+marker)
source.write_text(s)
print('Refined eight Tone Shift palettes with 9–12 keys, reflected-color accents and matched lightness.')
