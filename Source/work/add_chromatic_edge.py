# -*- coding: utf-8 -*-
"""Painterly ramps: restrained shadow/light, concentrated chroma at the terminator."""
from pathlib import Path
import json
import math


def linear_rgb(l, c, h):
    a, b = c * math.cos(math.radians(h)), c * math.sin(math.radians(h))
    ll = (l + .3963377774*a + .2158037573*b)**3
    mm = (l - .1055613458*a - .0638541728*b)**3
    ss = (l - .0894841775*a - 1.291485548*b)**3
    return [4.0767416621*ll - 3.3077115913*mm + .2309699292*ss,
            -1.2684380046*ll + 2.6097574011*mm - .3413193965*ss,
            -.0041960863*ll - .7034186147*mm + 1.707614701*ss]


def color(l, c, h):
    # Reduce chroma to fit sRGB while preserving authored lightness and hue.
    rgb = linear_rgb(l, c, h)
    if not all(0 <= v <= 1 for v in rgb):
        low, high = 0, c
        for _ in range(36):
            middle = (low + high) / 2
            if all(0 <= v <= 1 for v in linear_rgb(l, middle, h)):
                low = middle
            else:
                high = middle
        rgb = linear_rgb(l, low, h)
    encoded = [12.92*v if v <= .0031308 else 1.055*v**(1/2.4)-.055 for v in rgb]
    return '#' + ''.join(f'{max(0,min(255,round(v*255))):02X}' for v in encoded)


# Positions, lightness, relative edge chroma. No flat duplicate keys: these are washes.
structures = {
    5: [(0,.2,.15),(.3,.4,.29),(.52,.6,1),(.77,.81,.20),(1,.95,.08)],
    6: [(0,.19,.12),(.26,.36,.25),(.43,.52,.60),(.55,.64,1),(.78,.84,.18),(1,.96,.06)],
    7: [(0,.18,.12),(.22,.33,.25),(.41,.49,.54),(.52,.61,1),(.64,.74,.40),(.8,.86,.16),(1,.96,.06)],
    8: [(0,.19,.12),(.2,.32,.23),(.39,.47,.50),(.5,.59,1),(.62,.72,.42),(.77,.83,.20),(.9,.91,.12),(1,.97,.04)],
}

# Name, count, shadow hue, edge hue, light hue, edge chroma, direction.
studies = [
    ('jade-silk','Jade Silk',7,245,160,95,.16,'Blue-gray ink shadow, saturated jade at the edge, warm silk-colored light.'),
    ('cinnabar-lantern','Cinnabar Lantern',8,320,32,85,.18,'Plum shadow, a glowing cinnabar-orange boundary and golden ivory light.'),
    ('indigo-mountains','Indigo Mountains',6,265,260,220,.19,'Quiet slate-blue shadows rise through an indigo edge toward cool mountain mist.'),
    ('plum-blossom','Plum Blossom',7,285,345,40,.18,'Violet ink shadows, a vivid rose-plum edge and pale warm blossom light.'),
    ('amber-mist','Amber Mist',5,175,70,95,.15,'Muted green-gray shadow meets concentrated amber before fading to pale gold.'),
    ('lotus-rose','Lotus Rose',8,205,15,55,.17,'Cool teal-gray shadow, a coral-rose boundary and soft peach-ivory highlights.'),
    ('peacock-veil','Peacock Veil',6,280,205,155,.13,'Restrained indigo shadow gives way to a rich blue-teal edge and a pale jade veil.'),
    ('orchid-dusk','Orchid Dusk',7,235,305,330,.18,'Cool charcoal shadow crosses an orchid-purple edge into luminous lilac-pink light.'),
    ('celadon-moon','Celadon Moon',5,250,175,130,.13,'Blue-gray shadow, emerald-celadon at the boundary and gently green moonlight.'),
    ('persimmon-glow','Persimmon Glow',8,260,45,75,.17,'Navy ink shadow, intense persimmon-orange at the edge and pale apricot light.'),
    ('malachite-ridge','Malachite Ridge',6,180,145,100,.16,'Deep green ink, saturated malachite at the ridge and warm leaf-ivory light.'),
    ('azure-porcelain','Azure Porcelain',7,280,235,90,.15,'Violet-blue shadow passes through vivid azure into restrained porcelain-ivory light.'),
]
rows = []
for slug, name, count, shadow_h, edge_h, light_h, peak, direction in studies:
    anchors = structures[count]
    colors = []
    for t, l, relative in anchors:
        # Hue turns are strongest at the boundary; shadows and highlights stay quiet.
        if t <= .5:
            blend = min(1, t/.43)
            delta = (edge_h-shadow_h+180) % 360 - 180
            hue = shadow_h + delta*blend
        else:
            blend = max(0, min(1, (t-.56)/.3))
            delta = (light_h-edge_h+180) % 360 - 180
            hue = edge_h + delta*blend
        colors.append(color(l, peak*relative, hue))
    rows.append({
        'id':'chromatic-edge-'+slug, 'name':'Chromatic Edge · '+name,
        'category':'Creative', 'originalCategory':'Stylized',
        'colors':colors, 'positions':[a[0] for a in anchors], 'transition':'smooth',
        'searchAliases':'chromatic edge saturated terminator painterly painting chinese-inspired limiar saturado luz sombra '+slug.replace('-',' '),
        'description':direction+' Painterly art direction inspired by luminous ink-and-color contrasts, not a reconstruction of a specific painting or a claim about all Chinese painting. Chroma peaks around the light-shadow boundary while OKLab lightness rises smoothly. Align the edge with the source tonal mask; pigment texture and lighting remain separate treatments.',
    })
assert len(rows) == 12
source = Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
s = source.read_text()
marker = "field('preset-count').textContent=gradientPresets.length;"
assert 'const chromaticEdgeTemplates=' not in s and s.count(marker) == 1
Path('work/chromatic-edge-templates.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2))
s = s.replace(marker,'// Painterly chromatic edges concentrate saturation between restrained shadow and light.\nconst chromaticEdgeTemplates='+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';\ngradientPresets.push(...chromaticEdgeTemplates);\n'+marker)
source.write_text(s)
print('Added 12 smooth painterly chromatic-edge palettes with 5–8 points.')
