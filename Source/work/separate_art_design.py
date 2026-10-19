from pathlib import Path
import re
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
s=p.read_text()
s=s.replace('<option value="Creative">Cor e experimentos</option>','<option value="Art">Arte</option><option value="Design">Design</option><option value="Creative">Cor e experimentos</option>',1)
s=s.replace("['Creative','Cor e experimentos']", "['Art','Arte'],['Design','Design'],['Creative','Cor e experimentos']",1)
s=s.replace('gradientPresets.push(...artDesignTemplates);', "for(const p of artDesignTemplates)p.category=p.collectionKind==='design'?'Design':'Art';\ngradientPresets.push(...artDesignTemplates);",1)
s=s.replace("let studioLibrarySignature='';", "let studioLibrarySignature='',studioMovementCategory='';",1)
start=s.index("$('#studio-movement').innerHTML='<option value=\"all\">All art and design movements")
end=s.index("$('#studio-movement').addEventListener('change',renderStudioLibrary);",start)
old=s[start:end]
tail=old[old.index("field('studio-library').innerHTML="):]
tail=tail.replace("(p.name+' '+p.searchAliases+' '+p.category+' '+p.originalCategory+' '+p.description)","(p.name+' '+p.searchAliases+' '+p.category+' '+p.originalCategory+' '+p.description)")
new='''function renderStudioLibrary(){
 const category=$('#studio-category').value||'all',movement=$('#studio-movement');
 const hasMovements=category==='Art'||category==='Design';
 movement.hidden=!hasMovements;
 if(studioMovementCategory!==category){
  studioMovementCategory=category;
  movement.innerHTML='<option value="all">'+(category==='Design'?'All design movements':'All art movements')+'</option>'+[...new Set(artDesignTemplates.filter(p=>p.category===category).map(p=>p.movement))].map(m=>`<option value="${m}">${m}</option>`).join('');
  movement.value='all';
 }
 if(!hasMovements)movement.value='all';
 $('#studio-data-type').hidden=category!=='Data';if(category!=='Data')$('#studio-data-type').value='all';
 const signature=JSON.stringify([$('#studio-search').value,category,$('#studio-data-type').value,movement.value,state.gradientPreset]);
 if(signature===studioLibrarySignature)return;studioLibrarySignature=signature;
 const query=$('#studio-search').value.toLowerCase();
 '''+tail
s=s[:start]+new+s[end:]
p.write_text(s)
