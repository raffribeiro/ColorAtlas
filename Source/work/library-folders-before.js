let studioLibrarySignature='';
const libraryPresetIds=new Set(gradientPresets.map(p=>p.id));
function libraryMatches(p,query){const label=templateCategories.find(([category])=>category===p.category)?.[1];return !query||[p.name,p.searchAliases,p.category,label,p.originalCategory,p.description,p.movement,p.dataType,libraryTheme(p)].filter(Boolean).join(' ').toLowerCase().includes(query);}
const libraryThemeLabels={Production:'Production',Smoke:'Smoke & atmosphere',Elements:'Elements',Combat:'Combat',General:'Essentials',hybrid:'Hybrid effects','game-state':'Game states',Science:'Science',Experimental:'Experimental',UI:'Interface',Stylized:'Stylized',Perceptual:'Perceptual',Optics:'Optics',optical:'Optical surfaces','art-style':'Art styles',Fantasy:'Fantasy',Character:'Character materials',Environment:'Environments',Nature:'Nature',Materials:'Materials',minerals:'Minerals',fungi:'Fungi',food:'Food','biome-light':'Biome lighting',transform:'Transformations',aged:'Aged materials',DataViz:'Data visualization',Military:'Military displays',Scientific:'Scientific',TechArt:'Tech art'};
function libraryTheme(p){
 if(p.movement)return p.movement;
 const original=p.originalCategory||'General';
 if(original.startsWith('Botanical'))return 'Flowers & foliage';
 if(original.startsWith('Animals birds'))return 'Animals';
 if(original.startsWith('Animal flower'))return 'Nature studies';
 return libraryThemeLabels[original]||original;
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

