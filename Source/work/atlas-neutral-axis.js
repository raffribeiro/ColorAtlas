/* Decorative neutral spine: uses the editor projection and OKLab neutral colors. */
(function(){
 'use strict';
 function svg(lightness,project,neutralColor,prefix,phase){
  const L=Math.max(0,Math.min(100,lightness)),r=1.35,ringRadius=3.1;
  const p=(l,a=0,b=0)=>project({l,a,b}),black=p(0),white=p(100),a=p(0,1),b=p(0,0,1);
  const dx=a.x-black.x,dy=b.x-black.x,n=Math.hypot(dx,dy)||1;
  const edge=(l,s)=>p(l,s*r*dx/n,s*r*dy/n);
  // Camera depth increases away from the viewer.
  const upperBehind=(white.depth||0)>(black.depth||0);
  const back=phase==='back',split=phase==='back'||phase==='front';
  const lo=split?(back===upperBehind?L:0):0,hi=split?(back===upperBehind?100:L):100;
  const bl=edge(lo,-1),br=edge(lo,1),wl=edge(hi,-1),wr=edge(hi,1);
  const path=(l,radius)=>Array.from({length:32},(_,i)=>{const t=i*Math.PI/16,q=p(l,Math.cos(t)*radius,Math.sin(t)*radius);return `${i?'L':'M'}${q.x.toFixed(3)},${q.y.toFixed(3)}`;}).join(' ')+'Z';
  const body=`M${bl.x},${bl.y}L${br.x},${br.y}L${wr.x},${wr.y}L${wl.x},${wl.y}Z`;
  const id=prefix+'-neutral-spine-'+(phase||'all'),level=p(L);
  return `<g data-neutral-axis data-depth-pass="${phase||'all'}" data-neutral-start="${lo}" data-neutral-end="${hi}" opacity=".42" aria-hidden="true" pointer-events="none"><defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${black.x}" y1="${black.y}" x2="${white.x}" y2="${white.y}">${[0,20,40,60,80,100].map(v=>`<stop offset="${v}%" stop-color="${neutralColor(v)}"/>`).join('')}</linearGradient></defs><path d="${body}" fill="url(#${id})" stroke="#a8b6c8" stroke-opacity=".18" stroke-width=".6"/>${lo===0?`<path d="${path(0,r)}" fill="${neutralColor(0)}" stroke="#a8b6c8" stroke-opacity=".18" stroke-width=".6"/>`:''}${hi===100?`<path d="${path(100,r)}" fill="${neutralColor(100)}" stroke="#a8b6c8" stroke-opacity=".28" stroke-width=".6"/>`:''}${!back?`<path data-neutral-level="${L}" data-center-x="${level.x}" data-center-y="${level.y}" d="${path(L,ringRadius)}" fill="${neutralColor(L)}" fill-opacity=".35" stroke="#edf5ff" stroke-opacity=".7" stroke-width=".8"/>`:''}</g>`;
 }
 window.AtlasNeutralAxis={svg};
})();
