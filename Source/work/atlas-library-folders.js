let studioLibrarySignature='';
const libraryPresetIds=new Set(gradientPresets.map(p=>p.id));
function libraryMatches(p,query){const label=templateCategories.find(([category])=>category===p.category)?.[1];return !query||[p.name,p.searchAliases,p.category,label,p.originalCategory,p.description,p.movement,p.dataType,libraryTheme(p),legacyLibraryTheme(p)].filter(Boolean).join(' ').toLowerCase().includes(query);}
const libraryThemeLabels={Production:'Production',Smoke:'Smoke & atmosphere',Elements:'Elements',Combat:'Combat',General:'Essentials',hybrid:'Hybrid effects','game-state':'Game states',Science:'Science',Experimental:'Experimental',UI:'Interface',Stylized:'Stylized',Perceptual:'Perceptual',Optics:'Optics',optical:'Optical surfaces','art-style':'Art styles',Fantasy:'Fantasy',Character:'Character materials',Environment:'Environments',Nature:'Nature',Materials:'Materials',minerals:'Minerals',fungi:'Fungi',food:'Food','biome-light':'Biome lighting',transform:'Transformations',aged:'Aged materials',DataViz:'Data visualization',Military:'Military displays',Scientific:'Scientific',TechArt:'Tech art'};
function legacyLibraryTheme(p){
 if(p.movement)return p.movement;
 const original=p.originalCategory||'General';
 if(original.startsWith('Botanical'))return 'Flowers & foliage';
 if(original.startsWith('Animals birds'))return 'Animals';
 if(original.startsWith('Animal flower'))return 'Nature studies';
 return libraryThemeLabels[original]||original;
}
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
function studioLibraryGroups(query=''){
 query=query.trim().toLowerCase();
 return templateCategories.map(([category,label])=>{
  const presets=gradientPresets.filter(p=>p.category===category&&libraryMatches(p,query));
  const themes=new Map();for(const preset of presets){const theme=libraryTheme(preset);if(!themes.has(theme))themes.set(theme,[]);themes.get(theme).push(preset);}
  return {key:'category:'+category,label,presets,children:[...themes].map(([theme,presets])=>({key:'theme:'+category+':'+theme,label:theme,presets}))};
 }).filter(group=>group.presets.length);
}
function initializeStudioLibrary(){
 // Seed once so removing a starter favorite is respected on later visits.
 if(state.favoriteDefaultsVersion<1){
  state.favoritePresets=[...new Set([...state.favoritePresets,'atlas-explosion-fire','laserblue'])];
  state.favoriteDefaultsVersion=1;
 }
 // Start each visit with a compact library; manual expansion and search still work.
 state.libraryFolders={'category:Favorites':true,'category:My palettes':true};
}
function libraryFolderIsOpen(key,presets,query){
 if(query.trim())return true;
 return Object.hasOwn(state.libraryFolders,key)?state.libraryFolders[key]:(key==='category:Favorites'||key==='category:My palettes');
}
function libraryEscape(text){return String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderStudioLibrary(){
 state.favoritePresets=state.favoritePresets.filter(id=>hasLibraryPreset(id));
 const query=$('#studio-search').value.trim().toLowerCase(),signature=JSON.stringify([query,state.gradientPreset,state.libraryFolders,state.favoritePresets,state.userPalettes]);
 if(signature===studioLibrarySignature)return;studioLibrarySignature=signature;
 const folderIcon='<svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true"><path d="M2 6V4.5h6l2 2H18v10H2Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>';
 const favoriteIds=new Set(state.favoritePresets);
 const palette=p=>{
  const colors=p.colors||[blackbodyHex(1000),blackbodyHex(3500),blackbodyHex(6500),blackbodyHex(12000)],favorite=favoriteIds.has(p.id),favoriteLabel=`${favorite?'Remover':'Adicionar'} ${p.name} ${favorite?'dos':'aos'} favoritos`;
  return `<div class="studio-palette-row"><button type="button" data-studio-preset="${libraryEscape(p.id)}" aria-pressed="${state.gradientPreset===p.id}" title="${libraryEscape(p.description||'')}"><i aria-hidden="true" style="background:linear-gradient(90deg,${colors.join(',')})"></i><span>${libraryEscape(p.name)}</span></button><button type="button" class="studio-favorite" data-studio-favorite="${libraryEscape(p.id)}" aria-pressed="${favorite}" aria-label="${libraryEscape(favoriteLabel)}" title="${libraryEscape(favoriteLabel)}"><svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true"><path d="m10 2 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L2.2 7.7l5.4-.8Z" fill="${favorite?'currentColor':'none'}" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg></button>${p.id.startsWith('user-')?`<button type="button" class="studio-delete" data-studio-delete="${libraryEscape(p.id)}" aria-label="Delete ${libraryEscape(p.name)}" title="Delete palette">×</button>`:''}</div>`;
 };
 const folder=(group,contents,level)=>`<details class="studio-folder studio-folder-${level}" data-studio-folder="${libraryEscape(group.key)}"${libraryFolderIsOpen(group.key,group.presets,query)?' open':''}><summary>${folderIcon}<span>${libraryEscape(group.label)}</span><small aria-label="${group.presets.length} palettes">${group.presets.length}</small></summary><div class="studio-folder-items">${contents}</div></details>`;
 const groups=studioLibraryGroups(query),favorites=[...gradientPresets,...state.userPalettes.map(userPaletteCard)].filter(p=>favoriteIds.has(p.id)&&libraryMatches(p,query)),favoriteGroup={key:'category:Favorites',label:'Favoritos',presets:favorites};
 const favoriteContents=favorites.length?favorites.map(palette).join(''):`<p class="studio-library-empty" role="status">${query?'Nenhum favorito encontrado.':'Clique na estrela de uma paleta para salvá-la aqui.'}</p>`;
 const personal=state.userPalettes.map(userPaletteCard).filter(p=>libraryMatches(p,query));
 field('studio-library').innerHTML=folder(favoriteGroup,favoriteContents,'favorites')+folder({key:'category:My palettes',label:'My palettes',presets:personal},personal.length?personal.map(palette).join(''):`<p class="studio-library-empty">${query?'No saved palettes found.':'Use Save palette to keep your gradients here.'}</p>`,'personal')+(groups.length?groups.map(g=>folder(g,g.children.map(t=>folder(t,t.presets.map(palette).join(''),'theme')).join(''),'category')).join(''):'<p class="studio-library-empty" role="status">No palettes found.</p>');
}
$('#studio-search').addEventListener('input',renderStudioLibrary);
field('studio-library').addEventListener('toggle',e=>{
 const key=e.target.dataset?.studioFolder;if(!key||e.target.isConnected===false||$('#studio-search').value.trim())return;
 const open=e.target.open;if(state.libraryFolders[key]===open)return;state.libraryFolders[key]=open;remember();
},true);
field('studio-library').addEventListener('click',e=>{
 const remove=e.target.closest('[data-studio-delete]');if(remove?.dataset.studioDelete){openDeleteUserPalette(remove.dataset.studioDelete,remove);return;}
 const star=e.target.closest('[data-studio-favorite]'),id=star?.dataset.studioFavorite;
 if(id){
  if(!hasLibraryPreset(id))return;
  const folderKey=star.closest('[data-studio-folder]')?.dataset.studioFolder,scrollTop=field('studio-library').scrollTop;
  state.favoritePresets=state.favoritePresets.includes(id)?state.favoritePresets.filter(value=>value!==id):[...state.favoritePresets,id];
  renderStudioLibrary();remember();
  const selector=`[data-studio-favorite="${id}"]`,folderSelector=`[data-studio-folder="${CSS.escape(folderKey||'category:Favorites')}"]`;
  const target=field('studio-library').querySelector(`${folderSelector} ${selector}`)||field('studio-library').querySelector(selector);
  target?.focus({preventScroll:true});field('studio-library').scrollTop=scrollTop;
  return;
 }
 const b=e.target.closest('[data-studio-preset]');if(b){const id=b.dataset.studioPreset;if(!applyUserPalette(id))applyGradientPreset(id);}
});

