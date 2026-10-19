# -*- coding: utf-8 -*-
"""Append the 24 approved artistic directions without changing existing presets."""
from pathlib import Path
import json

rows = []


def add(slug, name, colors, positions, direction):
    colors = colors.split() if isinstance(colors, str) else colors
    assert len(colors) == len(positions) and 2 <= len(colors) <= 16
    assert positions[0] == 0 and positions[-1] == 1
    assert all(a < b for a, b in zip(positions, positions[1:]))
    rows.append({
        'id': 'stylized-material-' + slug,
        'name': name, 'category': 'Creative', 'originalCategory': 'Stylized',
        'colors': colors, 'positions': positions, 'transition': 'smooth',
        'searchAliases': 'stylized materials ' + name.split(' · ')[0].lower() + ' ' + slug.replace('-', ' '),
        'description': direction + ' Original sRGB art-direction palette with Smooth OKLab interpolation. Positions describe tonal-mask allocation, not measured image area. Surface texture, outlines, reflections and geometry require separate material or image treatments.',
    })


def flat(slug, name, inks, widths, direction):
    inks = inks.split()
    assert len(inks) == len(widths) and all(w > 0 for w in widths)
    colors, positions, start = [], [], 0
    for i, (ink, width) in enumerate(zip(inks, widths)):
        end = start + width / sum(widths)
        colors.extend([ink, ink])
        positions.extend([0 if i == 0 else round(start + .0001, 7),
                          1 if i == len(inks) - 1 else round(end - .0001, 7)])
        start = end
    add(slug, name, colors, positions,
        direction + ' Paired keys retain solid regions with narrow transitions.')


flat('enamel-cherry', 'Enamel Pin · Cherry Badge',
     '#211B30 #782747 #DB3D57 #F6A489 #FFF0C8', [.25, .17, .4, .12, .06],
     'Dark plum outline tones frame a dominant cherry body, coral edges and a tiny cream gleam.')
flat('enamel-ocean', 'Enamel Pin · Ocean Emblem',
     '#142337 #254C75 #228DA2 #68C8BF #E5F5D5', [.24, .2, .34, .16, .06],
     'Navy ink and blue shadows frame turquoise enamel with a small pale green highlight.')
add('airbrush-peach', 'Airbrush · Peach Chrome',
    '#211C39 #453858 #796376 #B78C97 #E3ABA0 #F2C3AD #F7DEC5 #FFF4DF',
    [0, .12, .28, .47, .65, .8, .93, 1],
    'Broad violet-to-peach washes and a concentrated cream highlight suggest a softly polished illustration.')
add('airbrush-violet', 'Airbrush · Violet Boulevard',
    '#191936 #353064 #5B4C90 #906FAA #BE9EC7 #D8C5DE #F3EAF1',
    [0, .13, .3, .52, .72, .88, 1],
    'Long indigo and violet blends lighten through mauve toward misty lilac, keeping a clear shading ramp.')
flat('acid-tangerine', 'Acid Graphics · Toxic Tangerine',
     '#111C22 #273B3B #FF782D #C9ED43 #F4F7CB', [.48, .2, .2, .09, .03],
     'Charcoal occupies 68 percent of the tonal range, interrupted by hot orange and acid-lime accents.')
flat('acid-lilac', 'Acid Graphics · Electric Lilac',
     '#191525 #39314B #BA83F1 #69E4C1 #F5E7FF', [.5, .18, .21, .08, .03],
     'Large dark violet regions support an electric lilac body and concentrated mint highlights.')
add('lacquer-cherry', 'Candy Lacquer · Cherry Gloss',
    '#2C1126 #631536 #A82246 #DE3D5A #F36B78 #FFB6AA #FFF4DD',
    [0, .15, .36, .64, .82, .95, 1],
    'Saturated cherry midtones take most of the ramp; a short warm pale tail suggests a strong glossy highlight.')
add('lacquer-grape', 'Candy Lacquer · Grape Glaze',
    '#211035 #4F205F #842D98 #AD52C0 #CE8AD8 #EDC5EA #FFF2F8',
    [0, .16, .4, .66, .85, .96, 1],
    'Grape-purple shadows and rich orchid midtones rise to a small pink-white gleam.')
add('porcelain-blue', 'Porcelain · Blue Porcelain',
    '#233853 #42658B #839EBA #D4E0E4 #E8EBE5 #F4F0E3 #FFF8EA',
    [0, .1, .2, .32, .53, .82, 1],
    'Blue decoration occupies the darker third; soft ivory and cool off-white dominate the remaining tonal range.')
add('porcelain-rose', 'Porcelain · Rose Ceramic',
    '#513441 #895461 #C39199 #E5CDCA #F0E3D7 #FFF6E8',
    [0, .09, .2, .33, .7, 1],
    'Muted rose decoration fades into a broad warm porcelain body with restrained deep burgundy details.')
flat('embroidery-garden', 'Embroidery · Garden Stitch',
     '#273A3C #55664C #77916A #C56F84 #E7B56D #F2E3C3', [.2, .17, .25, .18, .12, .08],
     'Forest fabric tones support distinct leaf-green, rose and golden thread colors against linen light.')
flat('embroidery-midnight', 'Embroidery · Midnight Tapestry',
     '#1B2139 #3E4766 #777490 #B58C9B #CCAE73 #EEE0C2', [.32, .22, .17, .14, .1, .05],
     'Midnight woven tones dominate, with mauve, dusty rose and antique gold threads as smaller accents.')
add('storybook-foxwood', 'Muted Storybook · Foxwood Tale',
    '#30302D #55594B #8A8164 #BAA081 #DFCAA8', [0, .2, .48, .77, 1],
    'Restrained olive shadows, earthy ochre and warm parchment create an understated woodland illustration ramp.')
add('storybook-meadow', 'Muted Storybook · Moonlit Meadow',
    '#222B3F #465468 #778879 #A9B49E #DCE0C5', [0, .2, .49, .79, 1],
    'Cool slate shadows gradually give way to quiet sage and pale moonlit grass.')
flat('noir-crimson', 'Graphic Noir · Crimson Detective',
     '#141B26 #9DA9B0 #C92948 #F3EDE1', [.64, .24, .08, .04],
     'Deep ink fills 64 percent of the tonal range, with cool gray detail and a narrow crimson signal.')
flat('noir-amber', 'Graphic Noir · Amber Alley',
     '#191C27 #8F969F #E5A33C #F6E8C7', [.67, .2, .09, .04],
     'Large charcoal silhouettes frame gray detail, amber signage and a restrained paper highlight.')
add('packaging-citrus', 'Faded Packaging · Vintage Citrus',
    '#34343B #75624F #AD8B57 #D3AF73 #E8CDA0 #F5E9CF',
    [0, .14, .34, .58, .79, 1],
    'Worn umber and muted orange lighten toward aged cream, with broad faded midtones.')
add('packaging-seaside', 'Faded Packaging · Seaside Label',
    '#263C47 #547984 #88A7A6 #C3CEC0 #F0E5C9', [0, .2, .47, .73, 1],
    'Weathered blue-green ink dissolves toward sea-glass gray and warm uncoated paper.')
add('pearl-opal', 'Pearlescent Illustration · Opal Dream',
    '#9887B8 #BAB3DD #A8D1DA #C6E5D1 #EDE4B8 #F0C6D4 #FCF3E8',
    [0, .16, .35, .54, .72, .88, 1],
    'Luminous lilac, icy cyan, mint, pale gold and blush alternate warm and cool regions for an opalescent illustration mood.')
add('pearl-shell', 'Pearlescent Illustration · Shell Ballet',
    '#A58FAD #CCB2C8 #ECC8C3 #F3DDC3 #D7E4DA #FDF4E9',
    [0, .19, .41, .64, .84, 1],
    'Soft mauve and shell pink meet cream and a pale seafoam reflection; a light pastel range avoids deep shadows.')
add('clay-apricot', 'Clay Animation · Apricot Clay',
    '#643C3A #B3654B #E59C68 #F5CF9D', [0, .23, .65, 1],
    'Warm maroon shadow, terracotta and apricot body colors blend toward a subdued creamy highlight.')
add('clay-moss', 'Clay Animation · Moss Workshop',
    '#2F4036 #526B48 #829159 #B4B87B #DDD7A9', [0, .18, .48, .76, 1],
    'Olive-green clay uses warm leafy midtones and modest cream light, without a sharp specular white.')
flat('festival-summer', 'Festival Graphics · Summer Parade',
     '#29334C #EB6955 #EFAC49 #F3D772 #68B6AC #F7EACD', [.18, .25, .18, .13, .17, .09],
     'Broad coral, marigold and teal bands are separated by deep blue and cream resting regions.')
flat('festival-midnight', 'Festival Graphics · Midnight Carnival',
     '#171C33 #384B82 #765DC0 #CF5DAB #E78273 #E8B84F #74BDAF #F2E5C6',
     [.26, .12, .12, .16, .1, .09, .1, .05],
     'Eight graphic regions combine night blue, violet, pink and warm carnival accents with dark breathing space.')

assert len(rows) == 24 and len({p['id'] for p in rows}) == 24
source = Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
text = source.read_text()
marker = "field('preset-count').textContent=gradientPresets.length;"
assert 'const stylizedMaterialTemplates=' not in text and text.count(marker) == 1
Path('work/stylized-material-templates.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2))
text = text.replace(marker,
    '// Twelve approved illustration/material directions preserve authored tonal proportions.\n'
    'const stylizedMaterialTemplates=' + json.dumps(rows, ensure_ascii=False, separators=(',', ':')) + ';\n'
    'gradientPresets.push(...stylizedMaterialTemplates);\n' + marker)
source.write_text(text)
print('Added 24 templates across 12 Stylized directions.')
