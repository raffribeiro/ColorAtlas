from pathlib import Path
import json,re
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html');s=p.read_text()
raw='''void|Void · Abyssal Hunger|Fantasy|05000c 140522 291044 4b156f 78269c af56db d69aff f4dfff
shadowisles|Spectral Mist · Undeath|Fantasy|020d10 07272a 0b4846 08716a 20a28b 5fceb0 a4efd0 e9fff2
hextech|Hextech · Crystal Charge|Fantasy|071223 10284d 1c477a 2065ad 328bc8 61bddf b1e4f2 edffff
celestial|Celestial · Starlight|Fantasy|120e31 282153 544388 9175b7 c49bc9 eac5d5 ffe5c5 fffbe9
bloodmagic|Blood Magic · Crimson Pact|Fantasy|0e0205 2e050e 580b20 8f1132 bd2544 e85760 ff9890 ffe0c5
fae|Fae · Enchanted Bloom|Fantasy|100e25 33224c 624283 9a69b6 c797db e4c4ec f6e4d4 fffff1
soulfire|Soul Fire · Spirit Blue|Fantasy|021024 082c53 094981 0c6eb0 249bd0 71c9e8 bee9f7 f1ffff
sandmagic|Sand Magic · Ancient Sun|Fantasy|1c1109 49321a 795127 ad803d d5ac65 e9cc98 f5e5be fff9e3
runes|Runic · Sapphire Script|Fantasy|090622 20124d 352977 4b48ac 6a74d4 95aaf4 cbdcff f7fbff
corruption|Corruption · Sickly Bloom|Fantasy|100917 2c1438 55295b 77447c 77813a a4b54a d6de88 f5f7cc
hellfire|Hellfire · Obsidian Orange|Elements|070405 23070a 540c12 951c12 cf3f12 f57c18 ffbe4e fff2bb
frostbite|Frostbite · Glacial Vein|Elements|051326 0f3153 174f75 1e769b 419db7 80cbd8 b9eaf0 f2ffff
storm|Storm · Lightning Strike|Elements|06091b 121c43 203576 2c51be 4680ea 83b5ff cbe5ff ffffff
thunder|Thunder · Golden Arc|Elements|141017 36303a 66575a 927948 c7a13e f2cb39 ffe77b ffffd5
holy|Light · Sacred Gold|Elements|231711 503825 89643b b68c52 d8b573 ecd299 f8e9c6 fffff0
darkflame|Dark Flame · Violet Ember|Elements|08060e 200d2c 481845 762653 ac407b dc70a1 f6a9c8 ffe7df
acid|Acid · Corrosive Heat|Elements|081009 22340a 43590a 728915 a8b927 d6df46 f1f882 fcffe1
earth|Earth · Molten Stone|Elements|110e0b 30261c 54412c 785b35 a67d46 caa16e e5caa0 f4ead4
wind|Wind · Silver Gale|Elements|08111c 1d2c3c 35495b 526979 7c929f abbcc4 dce5e7 ffffff
waterdeep|Water · Abyss to Foam|Elements|010a1b 082644 0b4462 0c657c 238c9d 69b8bc a9ded9 ecfff6
auroraoxygen|Aurora · Oxygen Green / Red|Science|071310 113b24 147438 26a853 88d275 d7e696 d97b79 f0baca
auroranitrogen|Aurora · Nitrogen Violet|Science|070b24 171b4a 33367a 6350a0 9a69bb c98dd1 e6b4e0 ffe7f7
sodium|Sodium · Amber Emission|Science|170c02 44230a 78420c a8610d d78917 f0af2c ffcf62 fff1be
copperflame|Copper · Blue Green Flame|Science|031419 073339 08575e 077f84 17a7a3 5bcfbb a2ebd7 e7fff5
hydrogen|Hydrogen · Balmer Inspired|Science|160622 351144 58205d 91316c ca537b ef889e ffbdc9 fff0f0
helium|Helium · Peach Discharge|Science|1c0a09 44201b 733b2e a65d45 ce8765 eaaa8c f9cdb3 fff2df
argon|Argon · Lavender Discharge|Science|0c071a 29123d 4b225d 783780 a858a2 ce86c6 e9b8e6 fff0ff
rayleigh|Rayleigh · Twilight Sky|Science|08112b 182957 2b4a88 5575ae 9ca4c4 dbb1bf f1bb98 ffe0b3
thinfilm|Thin Film · Interference|Science|150b2b 543369 ad657d debb70 92c1a0 61a4c1 8c87cb e9cdec
heatmap|Thermal · False Color|Science|080413 27134f 57206e 983170 d65058 ea7b3d f6bd57 fff5b0
biolume|Bioluminescence · Marine Glow|Nature|031319 05323a 065461 007985 149fa6 59c9cc a0e9e6 e8fffa
jellyfish|Jellyfish · Pelagic Violet|Nature|0b0921 25214e 494581 7967b0 a08bcc b9b8e5 dae3f7 f5ffff
beetle|Beetle · Iridescent Shell|Nature|08100f 0b3a32 1a6b52 669c45 c8b35d b380ab 7878cc d5edfa
opal|Opal · Milky Fire|Nature|18202a 344958 65817f a3b09b d6c48b e8b7be cbd5ed fbf5e8
obsidian|Obsidian · Glass Smoke|Nature|030407 10151c 242c36 3e4854 65717c 92a0aa c2d0d5 eff7fa
cinder|Cinder · Ash Veil|Nature|0a0808 242020 443a36 6b5950 937b68 b59e88 d7c6ae f1e8d6
cumulus|Cloud · Cumulus Silver|Nature|101723 2b3749 4d5d74 74849a 9aabc0 bdccdc dde6ef ffffff
sunset|Sunset · Dust and Haze|Nature|100d2c 34244d 67355f a65165 db786c f5a77b fbcaa0 fff0cf
moss|Moss · Forest Floor|Nature|07100a 1b2b18 33462b 546c3d 7c9256 a8b879 d1dba8 f0f3d4
polar|Polar · Snow and Ice|Nature|0d142a 283454 4a5c7c 718aa7 9ebacb c5dbe0 e6f3f3 ffffff'''
rows=[]
for line in raw.splitlines():
 id,name,cat,colors=line.split('|');rows.append({'id':id,'name':name,'category':cat,'colors':['#'+c for c in colors.split()],'description':('Science-inspired artistic ramp; not a calibrated spectrum or temperature scale.' if cat=='Science' else 'Original '+cat.lower()+' VFX palette; artistic interpretation, not an official game palette.')})
assert len(rows)==40 and all(len(r['colors'])==8 for r in rows)
end=s.index('\n];',s.index('const gradientPresets=['));s=s[:end]+',\n'+',\n'.join(json.dumps(r) for r in rows)+s[end:]
needle="const presetSelect=$('#gradient-preset');"
meta="""for(const p of gradientPresets){p.category=p.category||(p.id==='blackbody'?'Science':['smoke','copper','ocean','sakura','emerald'].includes(p.id)?'Nature':['neonriot','alienreactor','acidmirage','cosmicfracture','chromaticshock','spectral'].includes(p.id)?'Experimental':['arcane','plasma'].includes(p.id)?'Fantasy':'Elements');p.description=p.description||(p.id==='blackbody'?'Planck spectrum integrated with approximate CIE matching curves. 1000–12000 K; normalized brightness.':'Original artistic VFX palette.');}
"""
s=s.replace(needle,meta+needle)
s=s.replace("gradientPresets.map(p=>`<option value=\"${p.id}\">${p.name}</option>`).join('')", "['Elements','Fantasy','Nature','Science','Experimental'].map(category=>`<optgroup label=\"${category}\">${gradientPresets.filter(p=>p.category===category).map(p=>`<option value=\"${p.id}\">${p.name}</option>`).join('')}</optgroup>`).join('')")
s=s.replace('DEFAULT LIBRARY · 20 PRESETS','DEFAULT LIBRARY · 60 PRESETS')
s=s.replace('<div data-field="studio-library"','<select id="studio-category" class="form-select" aria-label="Palette category"><option value="all">All themes</option><option value="Elements">Elements</option><option value="Fantasy">Fantasy / MOBA</option><option value="Nature">Nature / Materials</option><option value="Science">Science inspired</option><option value="Experimental">Experimental</option></select><div data-field="studio-library"',1)
s=s.replace("const query=$('#studio-search').value.toLowerCase();", "const query=$('#studio-search').value.toLowerCase(),category=$('#studio-category').value||'all';")
s=s.replace("gradientPresets.filter(p=>p.name.toLowerCase().includes(query))", "gradientPresets.filter(p=>(category==='all'||p.category===category)&&(p.name+' '+p.category+' '+p.description).toLowerCase().includes(query))")
s=s.replace('aria-pressed="${state.gradientPreset===p.id}"><i', 'aria-pressed="${state.gradientPreset===p.id}" title="${p.description}"><i')
s=s.replace("$('#studio-search').addEventListener('input',renderStudioLibrary);", "$('#studio-category').addEventListener('change',renderStudioLibrary);$('#studio-search').addEventListener('input',renderStudioLibrary);")
s=s.replace("preset.name+' · editable color keys · opaque alpha.'", "preset.name+' · '+preset.description")
s=s.replace('</style>', '.studio-sidebar #studio-category{margin-top:9px}.studio-library{max-height:850px;overflow-y:auto;scrollbar-width:thin}.studio-library button{min-height:36px}.studio-sidebar .studio-muted{margin-top:14px}\n</style>',1)
s=s.replace('<summary>Workflow &amp; color reference</summary>', '<summary>Workflow &amp; color reference</summary><p class="studio-muted">Fantasy ramps are original interpretations of familiar MOBA themes. Science ramps are artistic references, except the approximate spectral Black Body computation. <a href="https://www.leagueoflegends.com/en-us/news/dev/clarity-in-league/" target="_blank" rel="noopener">Riot · visual clarity</a> · <a href="https://science.nasa.gov/feature/nasas-guide-to-finding-and-photographing-auroras/" target="_blank" rel="noopener">NASA · aurora colors</a></p>')
p.write_text(s)
