from pathlib import Path
import json
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html');s=p.read_text()
raw='''muzzleflash|Muzzle Flash · White Hot|Production|Ballistic flashes, sparks and short impacts.|190802 52200a 9c400e e27017 ffa72b ffce65 ffe9b0 fffff2
weldspark|Welding Sparks · Amber Trail|Production|Metal sparks and ricochet trails.|130708 481615 923024 d45525 ef8724 f8b74a ffda88 fff8ce
impactgold|Impact · Golden Burst|Production|Stylized hit sparks and melee contact.|160b03 44230a 7f440f b97415 e7a826 f7ce55 ffe9a0 fffff0
engineblue|Thruster · Blue Core|Production|Engine exhaust and propulsion jets.|03071b 101342 182c8a 1d55ce 328ceb 66c7ff b7eeff f8ffff
jetpurple|Thruster · Violet Ion|Production|Ion engines and sci-fi propulsion.|08031a 21104b 43218b 6d40c8 9d6eed c89cff ebd2ff fffbff
healingmint|Healing · Mint Renewal|Production|Soft regeneration, healing pulses and restorative trails.|05130d 123728 23624b 3a9471 66bc93 9ddabb d1efd9 f8fff2
healwarm|Healing Fire · Gentle Ember|Production|Warm restorative fire with a soft bright center.|20110c 563524 976444 c68d66 e4b48b f2d3ae fbe9d0 fffff1
shieldcyan|Shield · Cyan Barrier|Production|Protective barriers, force fields and shield impacts.|040e1c 0b2c4a 105276 16799b 2ca6bb 72cfdf b8ecf3 f3ffff
shieldamber|Shield · Amber Guard|Production|Defensive rings and warm protective barriers.|1c1004 4c330e 836019 b68d2d deb649 f0d278 fce9b3 ffffe8
poisonstatus|Poison · Venom Pulse|Production|Poison ticks, corrosive clouds and debuff bursts.|07130a 18381b 285f25 4c8b30 7aba41 a9d86a d6efa4 f6ffe1
curseviolet|Curse · Violet Hex|Production|Curse marks and dark magic projectiles.|12071d 36153f 632665 963f8b c565ae e59bcf f7ceeb fff3fc
teleport|Teleport · Arcane Arrival|Production|Portal openings, recalls and teleport beams.|070b22 1a2053 353889 6759bd 9b85e2 c3b2f5 e5deff ffffff
waterimpact|Water Impact · Sea Spray|Production|Water splashes, aquatic impact rings and foam.|031322 0b344c 145b72 28829b 54aabd 91ccd7 c8e8ee f7ffff
iceimpact|Ice Impact · Frozen Shards|Production|Cold hit sparks, frost trails and ice shattering.|08142a 1d365b 395d8c 5b8bb8 84b7d8 b2daef ddedf8 ffffff
slashred|Slash · Crimson Edge|Production|Aggressive melee arcs and damage accents.|190409 4c0a19 922035 cf3c43 ed685a fa9c82 ffc9b0 fff4e4
laserred|Laser · Red Beam|Production|Laser beams, targeting accents and hot beam cores.|160206 4b0411 900724 cb173a eb3e60 fa7b93 ffbed0 fff5fb
lasergreen|Laser · Green Beam|Production|Scanning beams and neon energy cores.|031006 073316 0c6928 13a33c 3ad55c 81f59a c3ffd1 f8fff8
laserblue|Laser · Blue Beam|Production|Electric beams and clean sci-fi streaks.|030a20 082452 0c468d 126ac9 3a9dee 84caff c6eaff ffffff
lootglow|Loot · Legendary Gold|Production|Reward bursts, pickups and rarity highlights.|180c04 4a2a12 805223 b78336 d5b25f ebce95 f9e8c6 fffaf0
holyheal|Holy Heal · Pearl Gold|Production|Sacred healing, cleansing and blessing bursts.|181320 3c3148 6d5967 a5868b d1b6a2 e7d4bd f7eedc fffff6
sootdense|Smoke · Dense Soot|Smoke|Dark combustion smoke; restrained contrast.|030405 0b0e12 151a20 232b34 39434e 56616e 7b8793 aab5bd
steamsoft|Steam · Soft White|Smoke|Steam plumes, vapor and soft clouds.|1b2630 37434e 586672 7b8995 9dabb6 becad4 dee7ed f9fcff
dustdesert|Dust · Desert Impact|Smoke|Desert impacts and warm dust clouds.|1c130b 3e2c1b 674a2c 936d42 b79462 d4b88c e8d3b1 f4e8cf
dustconcrete|Dust · Concrete Break|Smoke|Concrete debris and muted destruction clouds.|11161b 2b3239 4c555e 717a83 969da3 bac0c5 d9dde0 f3f4f4
smokeblue|Smoke · Moonlit Cool|Smoke|Cool smoke layers for night scenes.|080f1e 17243a 2c3f57 49627c 718ca5 9eb3c7 c7d8e7 edf4fb
smokewarm|Smoke · Firelit Warm|Smoke|Smoke lit by warm flames.|160d0a 35231e 594036 82604e aa836c c9ab90 e1cdb5 f3e8d7
smoketoxic|Smoke · Toxic Murk|Smoke|Dense toxic fog with low saturation.|0b1008 232b17 414a2c 65703f 8b9859 b2bd7d d4dca4 f0f4cf
smokeviolet|Smoke · Cursed Haze|Smoke|Purple shadow smoke with restrained chroma.|0d0a16 272032 463a55 6a5b7d 9180a4 b5a6c4 d8cce1 f1eaf5
smokepink|Smoke · Rose Incense|Smoke|Soft incense plumes and stylized colored vapor.|1c1019 3d2836 674452 946576 bc8d9d d9b4c0 ecd6df fcf3f6
ashvolcanic|Ash · Volcanic Fallout|Smoke|Heavy ash columns and volcanic dust.|100d0c 2b2421 4c4139 706255 958777 bbb09c d9d0ba f0e9d6
sunkenneon|Sunken Neon · Coral Abyss|Experimental|Deep teal shadows opposed to hot coral highlights.|03141e 073f50 086b71 20a38e 81ceb1 e99097 ff676f fff0bd
venomorchid|Venom Orchid · Lime / Magenta|Experimental|Acid-green body and orchid-colored hot transitions.|10051d 3e145b 762a88 b053a9 84765d 9ac825 dbf66b f8ffd3
solarbruise|Solar Bruise · Indigo / Copper|Experimental|Cold indigo shadows, copper mids and pale solar core.|090b28 242352 493765 7d506b b17564 dba06b f1d297 fff7d8
chromehoney|Chrome Honey · Steel / Amber|Experimental|Steel-blue shadows crossing into amber energy.|080e1b 23344c 486982 7faaa8 c7b978 e7ac44 fbd375 fff4d0
radioactivevelvet|Radioactive Velvet|Experimental|Velvet purple with a sharp chartreuse center.|090518 2c124c 5a2a79 8d50a0 a49180 bbc537 e8f36b fffff1
pinkthunder|Pink Thunder · Cyan Edge|Experimental|Saturated cyan-to-violet-to-pink electrical palette.|031b2c 07506c 148ca4 598eca aa65c9 ee70ae ffaab9 fff3df
abyssmint|Abyss Mint · Black Pearl|Experimental|Almost-black teal with a sudden mint bright zone.|010807 061d20 113038 29424f 506574 799ea1 a9e3cc efffea
emberfrost|Emberfrost · Cold / Hot|Experimental|Ice shadows crossing a violet bridge into hot amber.|07172b 1a4768 468599 9484b1 c8798d e79262 f5c875 fff2cb
magentasulfur|Magenta Sulfur · Split Energy|Experimental|Magenta-to-violet mids against sulfur-yellow highlights.|130519 4c134e 9c257d d958aa 8868ad 799a59 c7d941 fffbaf
peacockshock|Peacock Shock · Iridescent Burst|Experimental|Blue, teal, green and gold with a pearl highlight.|041026 102e66 175694 1a8e9a 40b987 a3cc62 ead88e fff6d4'''
rows=[]
for line in raw.splitlines():
 id,name,cat,description,colors=line.split('|');rows.append({'id':id,'name':name,'category':cat,'description':description+' Original artistic ramp; tune for scene lighting and blend mode.','colors':['#'+c for c in colors.split()]})
assert len(rows)==40 and all(len(p['colors'])==8 for p in rows)
# Non-uniform key positions prioritize useful low/mid detail and narrow bright cores.
for r in rows:
 r['positions']=[0,.12,.28,.46,.65,.8,.92,1] if r['category']=='Smoke' else [0,.08,.21,.4,.62,.81,.94,1] if r['category']=='Production' else [0,.14,.3,.48,.66,.81,.93,1]
end=s.index('\n];',s.index('const gradientPresets=['));s=s[:end]+',\n'+',\n'.join(json.dumps(r) for r in rows)+s[end:]
s=s.replace("['Elements','Fantasy','Nature','Science','Experimental'].map(category", "['Production','Smoke','Elements','Fantasy','Nature','Science','Experimental'].map(category")
s=s.replace('DEFAULT LIBRARY · 60 PRESETS','DEFAULT LIBRARY · 100 PRESETS')
s=s.replace('<option value="all">All themes</option>','<option value="all">All themes</option><option value="Production">VFX Essentials</option><option value="Smoke">Smoke / Dust / Vapor</option>',1)
s=s.replace('t:i/(preset.colors.length-1),hex','t:preset.positions?.[i]??i/(preset.colors.length-1),hex')
p.write_text(s)
