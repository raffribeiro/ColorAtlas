from pathlib import Path
import re
base=Path(__file__).parent
source=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
s=source.read_text()
if '// My palettes: independent' not in s:
 s=s.replace('libraryFolders:{},favoritePresets:[]','libraryFolders:{},userPalettes:[],favoritePresets:[]',1)
 s=s.replace('const m=s.modelContent||s;', 'const m=s.modelContent||s;if(Array.isArray(m.userPalettes))state.userPalettes=cleanUserPalettes(m.userPalettes);',1)
 old=re.search(r'function remember\(\)\{[^\n]+',s)[0]
 new=old.replace('remember()','remember(strict=false)').replace('window.openai?.setWidgetState?.(', 'const write=window.openai?.setWidgetState?.(').replace('})?.catch(()=>{});}', '});if(strict){if(!write)return Promise.reject(new Error(\'Storage unavailable\'));return write;}write?.catch(()=>{});}')
 s=s.replace(old,new,1)
 s=s.replace('let studioLibrarySignature=',base.joinpath('atlas-user-palettes.js').read_text()+'\nlet studioLibrarySignature=',1)
 s=s.replace('state.favoritePresets.filter(id=>libraryPresetIds.has(id))','state.favoritePresets.filter(id=>hasLibraryPreset(id))',1)
 s=s.replace('state.libraryFolders,state.favoritePresets]);','state.libraryFolders,state.favoritePresets,state.userPalettes]);',1)
 s=s.replace("</svg></button></div>`;", "</svg></button>${p.id.startsWith('user-')?`<button type=\"button\" class=\"studio-delete\" data-studio-delete=\"${libraryEscape(p.id)}\" aria-label=\"Delete ${libraryEscape(p.name)}\" title=\"Delete palette\">×</button>`:''}</div>`;",1)
 s=s.replace('favorites=gradientPresets.filter(p=>favoriteIds.has(p.id)&&libraryMatches(p,query))','favorites=[...gradientPresets,...state.userPalettes.map(userPaletteCard)].filter(p=>favoriteIds.has(p.id)&&libraryMatches(p,query))',1)
 s=s.replace("field('studio-library').innerHTML=folder(favoriteGroup,favoriteContents,'favorites')+", "const personal=state.userPalettes.map(userPaletteCard).filter(p=>libraryMatches(p,query));\n field('studio-library').innerHTML=folder(favoriteGroup,favoriteContents,'favorites')+folder({key:'category:My palettes',label:'My palettes',presets:personal},personal.length?personal.map(palette).join(''):`<p class=\"studio-library-empty\">${query?'No saved palettes found.':'Use Save palette to keep your gradients here.'}</p>`,'personal')+",1)
 s=s.replace("field('studio-library').addEventListener('click',e=>{", "field('studio-library').addEventListener('click',e=>{\n const remove=e.target.closest('[data-studio-delete]');if(remove?.dataset.studioDelete){openDeleteUserPalette(remove.dataset.studioDelete,remove);return;}",1)
 s=s.replace('if(!libraryPresetIds.has(id))return;', 'if(!hasLibraryPreset(id))return;',1)
 s=s.replace('if(b)applyGradientPreset(b.dataset.studioPreset);', "if(b){const id=b.dataset.studioPreset;if(!applyUserPalette(id))applyGradientPreset(id);}",1)
 s=s.replace('⇄</button></div><span class="studio-export-actions">', '⇄</button><button class="btn" type="button" data-action="gradient-save">Save palette</button><span data-field="user-palette-status" role="status" aria-live="polite"></span></div><span class="studio-export-actions">',1)
 s=s.replace('<footer class="studio-credit">',base.joinpath('atlas-user-palettes.html').read_text()+'\n<footer class="studio-credit">',1)
 s+='\n<style id="atlas-user-palettes-style">\n'+base.joinpath('atlas-user-palettes.css').read_text()+'</style>\n'
else:
 s=re.sub(r'// My palettes: independent[\s\S]*?// End My palettes',lambda _:base.joinpath('atlas-user-palettes.js').read_text().strip(),s,count=1)
 s=re.sub(r'<dialog id="palette-save-dialog"[\s\S]*?</dialog>\s*<dialog id="palette-delete-dialog"[\s\S]*?</dialog>',lambda _:base.joinpath('atlas-user-palettes.html').read_text().strip(),s,count=1)
 s=re.sub(r'<style id="atlas-user-palettes-style">[\s\S]*?</style>',lambda _:'<style id="atlas-user-palettes-style">\n'+base.joinpath('atlas-user-palettes.css').read_text()+'</style>',s,count=1)
s=s.replace("state.libraryFolders={'category:Favorites':true};","state.libraryFolders={'category:Favorites':true,'category:My palettes':true};",1)
s=s.replace("(key==='category:Favorites');","(key==='category:Favorites'||key==='category:My palettes');",1)
s=s.replace('<button class="btn" type="button" data-action="gradient-save">','<button class="btn studio-primary-action" type="button" data-action="gradient-save">',1)
source.write_text(s);print('Installed My palettes:',len(s.encode()),'bytes; regenerate documentation before export.')
