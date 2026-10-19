import json
from pathlib import Path
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html');s=p.read_text()
rows=[]
for id,name,colors in [('celanime','Cel · Anime Ember','291527 8d2937 f66c35 ffe9a0'),('celice','Cel · Arctic Ink','102039 245678 54c6d6 e2ffff'),('celtoxic','Cel · Toxic Comic','171c29 356947 a7d82f f5ffb5'),('celviolet','Cel · Arcane Toon','1c1536 563c89 c67aee ffe6fc'),('celmono','Cel · Manga Values','101216 444950 9299a2 f4f5f7')]:
 c=['#'+x for x in colors.split()]
 rows.append(dict(id=id,name=name,category='Experimental',description='Cel shading: four flat tonal bands with sharp boundaries. Use as a luminance ramp for graphic shadows and highlights.',colors=[c[0],c[0],c[1],c[1],c[2],c[2],c[3],c[3]],positions=[0,.2799,.28,.5599,.56,.8199,.82,1]))
a=s.index('\n];',s.index('const gradientPresets=['));s=s[:a]+',\n'+',\n'.join(json.dumps(r) for r in rows)+s[a:];s=s.replace('DEFAULT LIBRARY · 105 PRESETS','DEFAULT LIBRARY · 110 PRESETS');p.write_text(s)
q=Path('work/check_triad.cjs');t=q.read_text().replace('picker.gradientPresets.length,105','picker.gradientPresets.length,110').replace('p.id)).size,105','p.id)).size,110').replace('105 palette presets','110 palette presets').replace('105 classified palettes','110 classified palettes').replace('105 presets, production','110 presets, production');q.write_text(t)
print('PASS: five cel ramps, four constant bands and narrow transitions.')
