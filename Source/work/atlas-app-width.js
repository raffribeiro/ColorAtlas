// App width handles integration
(()=>{
 const root=document.getElementById('munsell-picker'),sidebar=root.querySelector('.studio-sidebar'),author=root.querySelector('.studio-author'),divider=root.querySelector('[data-field="sidebar-divider"]');
 const wide=()=>matchMedia('(min-width:1200px)').matches,max=()=>Math.max(0,document.documentElement.clientWidth-32),min=()=>Math.min(1100,max()),clamp=n=>Math.max(min(),Math.min(max(),n));
 const width=()=>root.getBoundingClientRect().width;
 function resize(n){root.style.setProperty('--atlas-app-width',clamp(n)+'px');schedule();}
 function reset(){root.style.removeProperty('--atlas-app-width');schedule();}
 const grips=[];let scheduled=false;
 function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;position();});}
 for(const [name,sign] of [['left',-1],['right',1]]){
  const grip=document.createElement('div');grip.className='atlas-app-edge atlas-app-edge-'+name;grip.tabIndex=0;grip.setAttribute('role','separator');grip.setAttribute('aria-orientation','vertical');grip.setAttribute('aria-label','Resize app width from '+name+' edge');grip.title='Drag to resize app width. Arrow keys adjust; Home or double-click resets.';root.append(grip);grips.push(grip);let drag=null;
  grip.addEventListener('pointerdown',e=>{if(e.button!==0||!wide())return;drag={id:e.pointerId,x:e.clientX,width:width()};grip.setPointerCapture(e.pointerId);e.preventDefault();});
  grip.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;resize(drag.width+sign*2*(e.clientX-drag.x));});
  for(const type of ['pointerup','pointercancel'])grip.addEventListener(type,e=>{if(!drag||e.pointerId!==drag.id)return;drag=null;if(grip.hasPointerCapture(e.pointerId))grip.releasePointerCapture(e.pointerId);});
  grip.addEventListener('lostpointercapture',()=>{drag=null;});grip.addEventListener('dblclick',reset);
  grip.addEventListener('keydown',e=>{if(!wide())return;if(e.key==='Home'){reset();e.preventDefault();}else if(['ArrowLeft','ArrowRight'].includes(e.key)){resize(width()+sign*(e.key==='ArrowLeft'?-32:32));e.preventDefault();}});
 }
 function position(){
  if(!wide())return;
  const r=root.getBoundingClientRect(),s=sidebar.getBoundingClientRect(),a=author.getBoundingClientRect(),center=(s.right+a.left)/2;
  Object.assign(divider.style,{left:center-s.left-6+'px',right:'auto',width:'12px',top:Math.max(s.top,a.top)-s.top+'px',bottom:'0'});
  for(const g of grips){g.setAttribute('aria-valuenow',Math.round(r.width));g.setAttribute('aria-valuemin',min());g.setAttribute('aria-valuemax',max());}
 }
 const observer=new ResizeObserver(schedule);for(const n of [root,sidebar,author])observer.observe(n);addEventListener('resize',schedule);schedule();
})();
// End App width handles integration
