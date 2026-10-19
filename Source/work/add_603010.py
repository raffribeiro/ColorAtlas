import json
from pathlib import Path
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html');s=p.read_text()
rows=[]
for id,name,colors in [
 ('rulevoid','60 / 30 / 10 · Void Crown','100820 291044 482367 12656a 20979b 5bc8c4 f4cc52 fff2af'),
 ('rulefire','60 / 30 / 10 · Ember Gold','170b08 442018 794132 a63712 d75a13 f69732 fff1ad fffff0'),
 ('ruleice','60 / 30 / 10 · Polar Signal','071828 12324d 265577 277a91 45aec0 8cdce5 ff8f5c ffd4a8'),
 ('rulevenom','60 / 30 / 10 · Venom Bloom','081913 17392a 34634a 759a20 a3c832 d8ee7b ed65cc ffe0f6'),
 ('rulearc','60 / 30 / 10 · Arc Voltage','0c102b 20295a 454c83 256cad 3e9dd4 85d8f0 ffd95b fff5c4')]:
 rows.append(dict(id=id,name=name,category='Experimental',description='60–30–10: dominant hue 0–60%, secondary hue 60–90%, accent 90–100%. Ramp allocation; visible image coverage depends on its values.',colors=['#'+c for c in colors.split()],positions=[0,.3,.599,.6,.75,.899,.9,1]))
a=s.index('\n];',s.index('const gradientPresets=['));s=s[:a]+',\n'+',\n'.join(json.dumps(r) for r in rows)+s[a:];s=s.replace('DEFAULT LIBRARY · 100 PRESETS','DEFAULT LIBRARY · 105 PRESETS');p.write_text(s)
assert len(rows)==5 and all(len(r['colors'])==8 for r in rows)
print('PASS: five eight-key presets with dominant, secondary and accent ranges.')
