// Presentation taxonomy only; preset metadata, identities and ramps are unchanged.
const libraryMovementFamilies={
 'Classical & romantic':['Renaissance','Baroque','Rococo','Neoclassicism','Romanticism','Realism','Pre-Raphaelitism'],
 'Light & impression':['Impressionism','Post-Impressionism','Symbolism'],
 'Decorative & print':['Art Nouveau','Ukiyo-e'],
 'Expressive & regional':['Fauvism','Expressionism','Mexican Muralism','Harlem Renaissance','Brazilian Modernism'],
 'Geometric abstraction':['Cubism','Futurism','Suprematism','Constructivism','De Stijl','Chromatic Abstraction'],
 'Surreal & conceptual':['Dada','Surrealism'],
 'Abstract & minimal':['Abstract Expressionism','Color Field','Minimalism'],
 'Pop & optical':['Pop Art','Op Art'],
 'Craft & interiors':['Arts and Crafts','Scandinavian Modern','Mid-Century Modern'],
 'Modern geometry':['Bauhaus','Swiss Style'],
 'Decorative & industrial':['Art Deco','Space Age Design'],
 'Expressive graphics':['Memphis','Psychedelic Graphic Design','Postmodern Design']
};
function libraryTheme(p){
 const n=(p.name||'').toLowerCase(),id=p.id||'',o=p.originalCategory||'General';
 if(p.movement)return Object.entries(libraryMovementFamilies).find(([,members])=>members.includes(p.movement))?.[0]||p.movement;
 if(p.category==='Effects'){
  if(o==='game-state'||/buff|stealth|dream|fear|rage|rose pulse|violet attenuation|violet interference/.test(n))return 'States & pulses';
  if(o==='hybrid')return 'Transitions & signals';
  if(/cinema|comic|pixel|confetti|fireworks|smear|speed|trail|sound wave|halftone|paint|golden linework/.test(n))return 'Graphic & motion';
  if(/transition|teleport|summon|banish|portal|time |illusion|dissolv|disintegr|spawn|buff|stealth|dream|fear|rage|rose pulse|hologram|scan|glitch|loot|violet attenuation|violet interference/.test(n))return 'Transitions & signals';
  if(/gravity|black hole|nebula|solar|lunar|void|antimatter|cosmic/.test(n))return 'Space & radiant light';
  if(/fire|lava|ember|magma|molten|muzzle|detonation/.test(n))return 'Fire & heat';
  if(/smoke|ash|steam|vapor|mist|dust|sandstorm|wind|pale wisps|air |sand burst/.test(n))return 'Smoke & atmosphere';
  if(/water|ice|frost|snow|blizzard|foam|bubbl|rain|sea spray/.test(n))return 'Water & ice';
  if(/poison|toxic|acid|corros|venom|healing|recovery|corruption|blight|miasma|nature|spore|pollen|petals|web|slime|disease|blood|crimson.*(?:liquid|flow|pulse)|green dissolv|biolumin/.test(n))return 'Organic & recovery';
  if(/impact|slash|projectile|ricochet|shockwave|debris|shard|earthquake|shatter|shield|ink|laser/.test(n))return 'Impacts & projectiles';
  return 'Electricity & glow';
 }
 if(p.category==='World'){
  if(o.startsWith('Animals')||id.startsWith('coverage-animal')||/bird|butterfly|beetle|jellyfish/.test(n))return /bird|butterfly|moth|insect|beetle|mantis|scarab/.test(n)?'Birds & insects':'Land & marine life';
  if(/botanical|animal flower/.test(o.toLowerCase())){
   if(/leaf|leaves|foliage|moss|fern|conifer/.test(n))return 'Foliage & organic materials';
   return 'Flowers & petals';
  }
  if(['food','fungi'].includes(o))return 'Foliage & organic materials';
  if(/Environment|biome-light/.test(o)||/cloud|smoke|cinder|sunset|polar|ocean|atmosphere/.test(n))return 'Environments & atmosphere';
  if(/emerald|opal|obsidian|ruby|sapphire|jade stone|mineral|crystal|glass/.test(n)||o==='minerals')return 'Stone & glass';
  if(/moss|sakura/.test(n))return 'Foliage & organic materials';
  return 'Surfaces & weathering';
 }
 if(p.category==='Champions'){
  const colors=(p.colors||[]).map(rgbToLab);let warm=0,cool=0;
  for(const q of colors){const c=Math.hypot(q.a,q.b);if(c<5||q.l<15||q.l>95)continue;const h=(Math.atan2(q.b,q.a)*180/Math.PI+360)%360;if(h<100||h>=330)warm+=c;else cool+=c;}
  return warm>3*cool?'Warm accents':cool>3*warm?'Cool accents':'Mixed accents';
 }
 if(p.category==='Data'){
  if(/diagnostic|roughness|metallic|ambient occlusion|overdraw|low confidence/.test(n))return 'Surface & exposure diagnostics';
  if(/signed|residual|anomaly|deviation|cross-track|loss \/ gain|inside \/ outside/.test(n))return 'Diverging & differences';
  if(/phase|bearing|angle|classes|levels|threshold/.test(n))return 'Cycles & classes';
  return 'Sequential measurements';
 }
 if(p.category==='Creative'){
  if(o==='Perceptual'){
   if(/coverage-fill.*-l2-/.test(id)||id.includes('boundary'))return 'Vivid chroma';
   if(/coverage-fill.*-l3-/.test(id))return 'Bright highlights';
   if(id.startsWith('coverage-fill')||n.includes('neutral'))return 'Value & muted chroma';
   return 'Hue & contrast';
  }
  if(['Optics','optical'].includes(o))return 'Optics & surfaces';
  if(o==='Science')return 'Light & spectra';
  if(o==='UI')return 'Interface accents';
  if(o==='Experimental')return 'Experimental contrast';
  if(/tone shift|chromatic edge/.test(n))return 'Painterly color shifts';
  if(/cel |cartoon|rubber hose|animation|storybook|comic|pixel|style ·/.test(n))return 'Animation & graphic styles';
  if(/poster|print|duotone|tritone|engraving|paper|packaging|graphics|noir/.test(n))return 'Print & posters';
  return 'Illustration & surfaces';
 }
 return p.originalCategory||'Essentials';
}
