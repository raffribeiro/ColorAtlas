# -*- coding: utf-8 -*-
from pathlib import Path
import json, math
source=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
rows=[]
def add(id,name,category,theme,colors,purpose,positions=None):
 colors=colors.split() if isinstance(colors,str) else colors;n=len(colors)
 if positions is None:
  positions={2:[0,1],3:[0,.7,1],4:[0,.18,.82,1],5:[0,.15,.42,.86,1],6:[0,.12,.32,.62,.9,1],7:[0,.1,.24,.46,.68,.9,1],8:[0,.08,.2,.36,.55,.74,.92,1]}.get(n,[round(i/(n-1),6) for i in range(n)])
 rows.append({'id':'gamut-'+id,'name':name,'category':category,'originalCategory':theme,'colors':colors,'positions':positions,'transition':'smooth','searchAliases':'gamut expansion high chroma saturated '+id.replace('-',' '),'description':purpose+' Original high-chroma sRGB art-direction study with Smooth OKLab interpolation. Tune masks, alpha and exposure to the asset; luminous appearance requires compositing.'})
# Magenta / purple: strong middle-lightness body, with distinct material/effect roles.
add('magenta-plasma','Plasma · Electric Magenta','Effects','VFX Tropes','#130520 #45065E #8C0CAA #C516FC #F005FE #FF8FF3 #FFF0FD','Dense magenta plasma body with a short pale emission cap.')
add('magenta-orchid','Orchid · Ultraviolet Petals','World','Botanical foliage flowers vegetation petals','#25082E #75178C #C516FC #F005FE #FB5BFD #FFB2F3','Petal shadows, saturated local pigment and translucent highlights; an artistic botanical interpretation.')
add('magenta-beetle','Beetle · Purple Iridescent Shell','World','Animals birds butterflies fauna','#160B20 #580C84 #8809FE #C516FC #F005FE #FC68EB #FFD1F6 #FFF6FD','Purple shell sheen with a concentrated spectral-looking accent. Iridescence requires view-dependent shading.')
add('magenta-laser','Laser · Violet to Magenta','Effects','Combat','#8809FE #F005FE','Two-color emissive beam, retaining high chroma across the body.')
add('magenta-portal','Portal · Magenta Singularity','Effects','VFX Tropes','#10021E #6900A8 #F005FE #FF46ED #FFC7F8','Deep aperture rim to saturated magenta core and a restrained bright edge.')
add('magenta-glass','Glass · Electric Purple Transmission','World','Materials','#36004C #A900E8 #F005FE #FB5BFD #FFDDF9','Purple stained-glass transmission; use a separate mask for neutral reflections.')
add('magenta-energy','Energy · Purple Pulse','Effects','Elements','#4A006B #C516FC #F005FE #FA35F0','Compact energy ramp with a broad saturated body and no white washout.')
# Indigo / violet: avoid replacing saturated blue-violet with muted lavender.
add('violet-arc','Lightning · Deep Violet Arc','Effects','Elements','#050419 #230075 #5606EC #8809FE #BD5BFF #F5DCFF','Dark violet arc, saturated discharge and pale spark.')
add('violet-void','Void · Saturated Rift','Effects','VFX Tropes','#04020C #200040 #4900A0 #5606EC #8809FE #C516FC #F3B7FF','Violet rift with a readable dark silhouette and intensely colored interior.')
add('violet-butterfly','Butterfly · Electric Violet Wing','World','Animals birds butterflies fauna','#090623 #280066 #5606EC #8809FE #B730FF #EDB2FF','Artistic violet wing coloration; use pattern masks and view-dependent shading for structural color.')
add('violet-iris','Iris · Vivid Purple Petals','World','Botanical foliage flowers vegetation petals','#1A0A31 #4A168A #8809FE #C44FFF #E8A3FF #FFF0FF','Violet petal body with independent pale tips; flower centers need a separate map.')
add('violet-pigment','Pigment · Indigo to Electric Violet','World','Materials','#2400AD #8809FE','Two-color pigment study of saturated indigo and violet without a pale endpoint.')
add('violet-crystal','Crystal · Violet Facet Depth','World','minerals','#10062D #2C0872 #5606EC #8809FE #B02AFF #D173FF #EEBAFF #FFEDFF','Violet crystal depth, colored internal reflections and a narrow specular region.')
add('violet-surge','Energy · Indigo Surge','Effects','Elements','#110042 #5606EC #8809FE','Three-point indigo-to-violet surge with a broad chromatic highlight.')
# Deep blue: include true near-primary blue rather than only cyan-blue.
add('blue-discharge','Lightning · Pure Blue Discharge','Effects','Elements','#020414 #030664 #0B03C1 #0306F4 #3156FF #A6C4FF #F5FAFF','Blue discharge with near-primary saturated body, softened sparks and white tips.')
add('blue-deepwater','Water · Abyssal Blue Current','Effects','VFX Tropes','#010313 #010690 #0B03C1 #0306F4 #3266FF #8EBBFF','Deep-water art direction with saturated blue caustic accents; not a measured depth scale.')
add('blue-emitter','Energy · Cobalt Emitter','Effects','Production','#0B03C1 #0306F4 #5367FF #E0EAFF','Compact cobalt emitter body with short pale core; emission intensity remains separate.')
add('blue-wing','Butterfly · Cobalt Wing Flash','World','Animals birds butterflies fauna','#050624 #171369 #0B03C1 #0306F4 #3865FF #97BDFF #E9F5FF','Cobalt wing interpretation with saturated structural-color accents. Iridescence needs view-dependent shading.')
add('blue-glass','Glass · Ultramarine Transmission','World','Materials','#050A43 #0B03C1 #0306F4 #5B8CFF #DCEAFF','Ultramarine glass body to luminous transmission; isolate reflections from pigment.')
add('blue-laser','Laser · Primary Blue Beam','Effects','Combat','#0B03C1 #0306F4','Two-point blue beam that keeps color intensity instead of drifting toward cyan.')
add('blue-flower','Flower · Electric Blue Petals','World','Botanical foliage flowers vegetation petals','#101344 #242CA1 #0306F4 #4669FF #9DBAFF #EDF2FF','Stylized electric-blue petals and cool highlights; this is an artistic pigment interpretation.')
# Electric green: protect high-chroma highlights from pale mint desaturation.
add('green-venom','Poison · Electric Green Venom','Effects','VFX Tropes','#021107 #064A17 #00A620 #2CF722 #51FF20 #C8FF81 #F1FFD7','Dark venom edge, saturated green body and brief yellow-green emission cap.')
add('green-bioluminescence','Bioluminescence · Green Signal','Effects','Elements','#003E20 #00C52F #2CF722 #7BFF62 #C5FFAB','Green emissive tissue art direction; actual brightness requires emission and compositing.')
add('green-leaf','Foliage · Electric Backlit Leaf','World','Botanical foliage flowers vegetation petals','#032A15 #126E2E #28BD2D #2CF722 #69FF2E #CBFF87','Stylized translucent leaf with saturated green light; use separate front-light and backlight masks.')
add('green-frog','Frog · Lime Skin Accent','World','Animals birds butterflies fauna','#09251B #1F6831 #32C22B #2CF722 #B4FF52','Artistic green skin ramp; separate eyes, markings and skin-pattern masks.')
add('green-laser','Laser · Electric Green Beam','Effects','Combat','#00DB20 #2CF722','Two-point high-chroma green beam without a neutralized highlight.')
add('green-crystal','Crystal · Acid Green Facets','World','minerals','#03221C #075838 #169847 #00D92C #2CF722 #76FF3A #C3FF79 #F4FFD2','Saturated green crystal reflections; highlights occupy a short final region.')
add('green-spores','Spores · Luminous Green Cloud','Effects','VFX Tropes','#045027 #2CF722 #93FF52','Three-point green spore glow with a vivid broad body, for stylized effects.')
# Fuchsia: high-lightness chroma rather than pale pink as the default body.
add('fuchsia-magic','Magic · Luminous Fuchsia Bloom','Effects','VFX Tropes','#240826 #83106E #DA11BE #F005FE #FB5BFD #FFA8F4 #FFE8FB','Fuchsia spell bloom with a vivid core and a narrow pale trail.')
add('fuchsia-flower','Flower · Radiant Fuchsia Petals','World','Botanical foliage flowers vegetation petals','#470B41 #A01591 #E72ADF #FB5BFD #FFA8F2 #FFDBF8','Bright fuchsia pigment and translucent petal highlights; centers and veins need separate masks.')
add('fuchsia-feather','Bird · Fuchsia Feather Accent','World','Animals birds butterflies fauna','#481133 #A82475 #F031BA #FB5BFD #FFB4EF','Stylized vivid feather accents; the ramp is not an anatomical color distribution.')
add('fuchsia-glass','Glass · Radiant Rose Transmission','World','Materials','#94046D #F005FE #FB5BFD #FFB8F3','Rose glass transmission with a saturated bright range; use separate neutral reflections.')
add('fuchsia-ribbon','Energy · Fuchsia Ribbon','Effects','Elements','#E900A7 #FB5BFD','Two-point energy ribbon spanning saturated warm pink and luminous fuchsia.')
add('fuchsia-prism','Optics · Fuchsia Fringe','Creative','Optics','#280850 #6800CD #C516FC #F005FE #FB5BFD #FFAAF4 #FFF0FB','Artistic prism-like fuchsia fringe, not calibrated wavelength dispersion or a chromatic-aberration shader.')
add('fuchsia-aura','Aura · Fuchsia Halo','Effects','VFX Tropes','#8D087E #F005FE #FB5BFD #FFADF2','Four-point luminous halo with a broad saturated rim and short softer falloff.')
# Sixteen samples are useful here: follow the curved sRGB boundary across hue/lightness.
def linear(l,a,b):
 ll=(l+.3963377774*a+.2158037573*b)**3;mm=(l-.1055613458*a-.0638541728*b)**3;ss=(l-.0894841775*a-1.291485548*b)**3
 return [4.0767416621*ll-3.3077115913*mm+.2309699292*ss,-1.2684380046*ll+2.6097574011*mm-.3413193965*ss,-.0041960863*ll-.7034186147*mm+1.707614701*ss]
def boundary(l,h):
 h=math.radians(h);lo=0;hi=.4
 for _ in range(32):
  c=(lo+hi)/2;rgb=linear(l,c*math.cos(h),c*math.sin(h))
  if all(0<=v<=1 for v in rgb):lo=c
  else:hi=c
 rgb=linear(l,lo*.995*math.cos(h),lo*.995*math.sin(h));u=[round(255*(12.92*v if v<=.0031308 else 1.055*v**(1/2.4)-.055)) for v in rgb]
 return '#'+''.join(f'{min(255,max(0,v)):02X}' for v in u)
for id,name,l0,l1,h0,h1 in [('magenta-boundary','Purple Gamut Edge',.53,.78,302,328),('violet-boundary','Violet Gamut Edge',.34,.65,280,305),('blue-boundary','Deep Blue Gamut Edge',.23,.64,264,268),('green-boundary','Electric Green Gamut Edge',.43,.94,150,133),('fuchsia-boundary','Fuchsia Gamut Edge',.48,.79,353,330)]:
 colors=[boundary(l0+(l1-l0)*i/15,h0+(h1-h0)*i/15) for i in range(16)]
 add(id,'OKLab · '+name,'Creative','Perceptual',colors,'Sixteen-point study following a saturated sRGB boundary through hue and lightness. These positions represent gradient coordinates, not wavelengths or measured physical energy.')
assert len(rows)==40
assert len({p['id'] for p in rows})==40
Path('work/gamut-expansion-templates.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
s=source.read_text();marker="field('preset-count').textContent=gradientPresets.length;"
assert s.count(marker)==1 and 'const gamutExpansionTemplates=' not in s
s=s.replace(marker,'// Saturated families fill the measured sRGB/OKLab gaps; existing templates remain intact.\nconst gamutExpansionTemplates='+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';\ngradientPresets.push(...gamutExpansionTemplates);\n'+marker)
source.write_text(s)
print('Added 40 original gamut-expansion templates in existing folders.')
