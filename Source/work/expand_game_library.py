import json
from pathlib import Path
# Six authored anchors per ramp, ordered from deep shadow to highlight.
data='''
Materials|Forged Steel|Metal armor and weapons|080d15 202c3a 465b70 8297aa c6d4dc f4fbff
Materials|Burnished Bronze|Warm metal props|180d08 402315 77512a b78c49 e4c282 fff1c8
Materials|Oxidized Copper|Weathered copper surfaces|101c19 28483b 468a73 8a9b69 c8ad77 f5e2b5
Materials|Polished Gold|Treasure and gilded armor|1c1005 563209 a07314 d4ad3a f3d97a fff7d1
Materials|Obsidian Glass|Dark reflective volcanic glass|080811 1b192c 39334b 615b78 aaa0bf ece4ff
Materials|Ruby Crystal|Gemstones and red crystal props|180619 400b2c 811641 c53756 f88089 fff0dc
Materials|Sapphire Crystal|Blue crystal props|060d24 132956 24559e 3a91d4 87d9f2 e9ffff
Materials|Jade Stone|Carved stone and green ornaments|081a13 1e4631 47765a 84a780 c4d7ad f4f5d3
Materials|Leather Ochre|Leather belts and worn equipment|170e0a 38241a 654532 9b7350 cab087 eee0be
Materials|Weathered Wood|Wooden props and bark|11110a 302c19 595035 8c805b bfb48c e8dfc1
Environment|Desert Dunes|Sand and warm arid terrain|20120e 573126 986548 cfa374 ebd29c fff0ca
Environment|Forest Canopy|Forest vegetation|06140f 17392a 346140 64894f a1b574 e3e5b5
Environment|Swamp Marsh|Wetlands and murky water|0a1515 243b35 4d6250 7c8860 b7b588 e5ddb4
Environment|Tundra Snow|Cold snow terrain|0b1832 29486c 5d7c9b 9db6c9 d7e4ea fffff7
Environment|Volcanic Terrain|Basalt and heated ground|120c16 38222a 683630 a85b38 e99c4a ffe4a5
Environment|Underwater Reef|Aquatic environments|031b2d 07536a 138b91 52b8a6 b0dfbf f0ffe1
Environment|Moonlit Ruins|Nighttime stone architecture|080d20 202a48 414c70 737e9b b0bcd0 e7efff
Environment|Golden Hour|Warm sunset lighting ramps|201127 513046 975665 d49479 efc49a fff0c3
Environment|Overcast City|Muted urban lighting|10171e 303b45 596b75 8f9fa6 c9d1ce f0efe3
Environment|Alien Biome|Unusual terrain and vegetation|120d28 39224a 67475e 508d7a 9acf99 f2f4b3
Character|Skin Warm|Stylized warm skin shadows|321721 71363b ad6656 d89c79 f0caa0 fff0d5
Character|Skin Cool|Stylized cool skin shadows|241b35 594157 946b79 c99ca0 e8c7bc fff0dc
Character|Skin Deep|Stylized deep skin values|130e16 35212a 643e3d 996552 c79572 eecba4
Character|Skin Golden|Stylized golden skin values|2d1a21 644131 9c7046 cca06b e8c797 fff0cb
Character|Undead Skin|Undead character shading|121c24 354649 65726c 98a18a c9ceb0 f0ebd0
Character|Demon Skin|Demonic red skin shading|1e0a1f 4d1c32 8d3344 c85b59 ef9680 ffdcc0
Character|Ivory Cloth|Cream fabric shading|171923 454752 80817e b8b5a5 e0d9c2 fff8e7
Character|Crimson Cloth|Red fabric shading|190b22 44172b 842638 bd4652 e7797b ffb9a6
Character|Royal Blue Cloth|Blue fabric shading|090f28 1b2b59 344c93 647dc1 a2b8e8 e6edff
Character|Silver Hair|Stylized silver hair shading|11152a 343b57 68728e a1acc2 d3dce8 fbfdff
UI|Rare Loot Blue|Rare item glow and UI rarity|071127 11396a 216cad 42a1df 8cdaff eaffff
UI|Epic Loot Purple|Epic item glow and UI rarity|130b29 3c1a65 7939a9 b565df e4afff fff1ff
UI|Legendary Loot Orange|Legendary item glow and UI rarity|28100a 69270c b34e10 ea8b25 ffc56c fff2c5
UI|Mythic Loot Rose|Mythic item glow and UI rarity|200c25 621c53 a33c79 e871a1 ffb5c6 fff0e5
UI|Health Healing|Healing meters and positive feedback|071c17 14503b 238956 56c481 a1edbd e9fff1
UI|Mana Reserve|Mana meters and resource highlights|08112e 1b326f 365eba 7398ee bbd5ff f4faff
UI|Stamina Amber|Stamina and endurance indicators|1d1608 55400f 94741c caa837 e8d276 fff4bc
UI|Danger Alert|Damage flashes and warnings|240b13 641526 ac2731 e64a42 ff8d66 ffe6bd
UI|Quest Gold|Quest highlights and interaction cues|201327 543248 926441 cca56b eed19d fff5da
UI|Hologram Cyan|Diegetic screens and holograms|031c29 075467 118d9b 45c9cd a0f1e9 efffff
Combat|Sword Spark|Metal weapon impact sparks|1c0c0a 5c2617 a85424 e39839 ffd56f fffbe2
Combat|Blood Impact|Stylized blood impact|14070d 3a0916 741527 af2935 dd5356 ffab8e
Combat|Frost Shatter|Icy shards and frozen hit feedback|08162e 23466e 4482a7 7dbfd4 b8eff0 f6ffff
Combat|Shock Impact|Electrical hits and sparks|100e2f 392469 6246b2 6e91ef b1e6ff fffff2
Combat|Poison Splash|Toxic hit feedback|0e160a 304214 627d1b a1bf30 dcf06c f9ffd2
Combat|Holy Smite|Radiant combat impacts|241327 613747 a7745a dcb176 f6dcaa ffffee
Combat|Shadow Slash|Dark magical weapon trails|0c081d 2b1646 623171 9e55aa d895de ffe5ff
Combat|Sand Burst|Dusty ground impacts|1b1110 4a2c22 825238 ba895c e2bd8b ffe5bc
Combat|Arcane Missile|Magical projectile trails|0b112c 263665 5255a6 8b83de cab4fc fcf1ff
Combat|Shield Break|Energy barrier shattering|041b2b 0e4d6b 267fa8 6ab8d0 bfe7ed fffff1
Stylized|Cel Sunset|Flat warm illustration bands|27142d 87416c e4866d ffe6a6
Stylized|Cel Ocean|Flat blue illustration bands|101b39 245778 48b1bc dbf7e6
Stylized|Cel Candy|Flat pastel illustration bands|291832 9660a4 e9a4d6 fff4df
Stylized|Cel Forest|Flat foliage illustration bands|11231e 3f6343 96ac59 f5edb6
Stylized|Cel Noir|Flat high contrast values|090b10 343b47 929caa f6f7ef
Stylized|Retro Gameboy|Four-tone green pixel art|102c22 36573b 86a65d c9d99a
Stylized|Retro Copper CRT|Amber monochrome pixel art|180e08 503119 a67432 f4ce7b
Stylized|Retro Ice CRT|Blue monochrome pixel art|080f20 183954 548aa0 bfeaf0
Stylized|Poster Pop|Bold graphic poster bands|19142d d33470 2cbac5 fbe16b
Stylized|Comic Halftone|Graphic warm cool comic bands|171a31 42597f d98a56 fff0bd
'''
rows=[]
for line in data.strip().splitlines():
 cat,name,desc,hexes=line.split('|');colors=['#'+h for h in hexes.split()]
 pos=[0,.15,.35,.57,.8,1]
 if len(colors)==4:
  colors=[c for c in colors for _ in range(2)];pos=[0,.2799,.28,.5599,.56,.8199,.82,1]
 rows.append(dict(id='gamedev-'+name.lower().replace(' ','-'),name=name,category=cat,description=desc+'. Artist-authored game-dev ramp; tune to your lighting and art direction.',colors=colors,positions=pos))
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html');s=p.read_text();a=s.index('\n];',s.index('const gradientPresets=['));s=s[:a]+',\n'+',\n'.join(json.dumps(r) for r in rows)+s[a:]
s=s.replace('DEFAULT LIBRARY · 110 PRESETS','DEFAULT LIBRARY · 170 PRESETS')
s=s.replace("['Production','Smoke','Elements','Fantasy','Nature','Science','Experimental'].map(category", "['Production','Smoke','Combat','Materials','Environment','Character','UI','Stylized','Elements','Fantasy','Nature','Science','Experimental'].map(category")
options=''.join(f'<option value="{c}">{label}</option>' for c,label in [('Combat','Combat / Hits'),('Materials','Materials / Surfaces'),('Environment','Environment / Lighting'),('Character','Characters / Cloth'),('UI','UI / Loot / Resources'),('Stylized','Stylized / Pixel Art')])
s=s.replace('<option value="Experimental">Experimental</option>',options+'<option value="Experimental">Experimental</option>',1);p.write_text(s)
assert len(rows)==60 and len({r['id'] for r in rows})==60
q=Path('work/check_triad.cjs');t=q.read_text().replace('picker.gradientPresets.length,110','picker.gradientPresets.length,170').replace('p.id)).size,110','p.id)).size,170').replace('110 palette presets','170 palette presets').replace('110 classified palettes','170 classified palettes').replace('110 presets, production','170 presets, production');q.write_text(t)
print('PASS: 60 new authored presets across six game-dev categories; 170 total.')
