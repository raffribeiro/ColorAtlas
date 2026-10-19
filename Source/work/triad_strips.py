from pathlib import Path
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
s=p.read_text();a=s.index('function drawStrip(){');b=s.index('function update(',a)
s=s[:a]+'''function drawStrip(){
 const colors=state.triad?triadColors():[{h:state.h,v:state.v,c:state.c}],w=strip.clientWidth||700,columns=Math.max(1,Math.floor(w/52)),cell=w/columns;
 let yOffset=0,s='<title>Variações de Chroma das cores selecionadas</title>';
 colors.forEach((color,j)=>{
 const cs=allowed(color.h,state.v),rows=Math.ceil(cs.length/columns);
 s+=`<text x="3" y="${yOffset+17}" text-anchor="start">${state.triad?(j===0?'Base':`Cor ${j+1}`)+' · ':''}${color.h} · Value ${state.v} · Chroma ${color.c}</text>`;
 cs.forEach((c,i)=>{const x=(i%columns)*cell,y=yOffset+26+Math.floor(i/columns)*68,col=swatch(color.h,state.v,c);
 s+=`<g data-c="${c}" data-strip-color="${j}" data-tooltip="${color.h} ${state.v}/${c}${col[1]?' · fora de sRGB':''}"><rect x="${x+3}" y="${y+3}" width="${cell-6}" height="38" fill="${col[0]}"/><rect x="${x+1}" y="${y+1}" width="${cell-2}" height="42" fill="none" stroke="${c===color.c?'var(--foreground)':'none'}" stroke-width="2"/><text x="${x+cell/2}" y="${y+58}" text-anchor="middle">${c}${col[1]?' ×':''}</text><rect x="${x}" y="${y}" width="${cell}" height="66" fill="transparent"/></g>`;
 });yOffset+=26+rows*68+12;
 });strip.style.height=`${yOffset}px`;strip.setAttribute('viewBox',`0 0 ${w} ${yOffset}`);strip.innerHTML=s;
}
''' +s[b:]
s=s.replace("field('slice-heading').textContent=state.c===0?", "field('slice-heading').textContent=state.triad?'Variações de Chroma · tríade':state.c===0?")
s=s.replace("strip.addEventListener('click',e=>{const g=e.target.closest('[data-c]');if(g){state.c=Number(g.dataset.c);update(true)}});", "strip.addEventListener('click',e=>{const g=e.target.closest('[data-c]');if(g){const j=Number(g.dataset.stripColor||0),c=Number(g.dataset.c);if(state.triad&&j>0){state.triadChroma[triadColors()[j].h]=c;}else state.c=c;update(true)}});")
p.write_text(s)
