(()=>{
 const initialize=()=>{
  const root=document.getElementById('munsell-picker'),view=root?.querySelector('.mp-explosion-previews figure');if(!view)return;
  const split=root.querySelector('#vision-compare-position');let fit=true,zoom=1,x=0,y=0,drag=null;
  const metrics=()=>{const box=view.getBoundingClientRect(),side=Math.max(box.width,box.height)||1;return [box.width/side,box.height/side,side];};
  const paint=()=>{
   const [w,h]=metrics();if(fit)zoom=h||1;const lx=Math.max(0,(zoom-w)/2)+.15*w,ly=Math.max(0,(zoom-h)/2)+.15*h;x=Math.max(-lx,Math.min(lx,x));y=Math.max(-ly,Math.min(ly,y));
   for(const [key,v] of Object.entries({'zoom':zoom,'pan-x':x*100+'%','pan-y':y*100+'%','image-split':Math.max(0,Math.min(1,((Number(split.value)/100-.5)*w-x)/zoom+.5))*100+'%'}))view.style.setProperty('--preview-'+key,String(v));
   view.setAttribute('data-preview-zoomed',String(zoom>Math.min(w,h)));
  };
  const set=percent=>{fit=false;zoom=Math.max(.01,Math.min(4,(Number.isFinite(Number(percent))?Math.round(Number(percent)):100)/100));paint();};
  const end=e=>{if(!drag||e.pointerId!==drag.id)return;drag=null;view.setAttribute('data-preview-panning','false');if(view.hasPointerCapture(e.pointerId))view.releasePointerCapture(e.pointerId);};
  split.addEventListener('input',paint);
  root.querySelector('[data-preview-camera="reset"]').addEventListener('click',()=>{if(drag)end({pointerId:drag.id});x=y=0;fit=true;paint();});
  view.addEventListener('wheel',e=>{e.preventDefault();const unit=e.deltaMode===1?16:e.deltaMode===2?view.getBoundingClientRect().height:1;set(zoom*100*Math.exp(-e.deltaY*unit*.0015));},{passive:false});
  view.addEventListener('auxclick',e=>{if(e.button===1)e.preventDefault();});
  view.addEventListener('pointerdown',e=>{const [w,h,side]=metrics();if(drag||(e.button!==0&&e.button!==1)||(e.button===0&&(zoom<=Math.min(w,h)||e.target.closest('#vision-comparison'))))return;const box=view.getBoundingClientRect();if(!box.width||!box.height)return;fit=false;drag={id:e.pointerId,x,y,px:e.clientX,py:e.clientY,w:side,h:side};view.setPointerCapture(e.pointerId);view.setAttribute('data-preview-panning','true');e.preventDefault();});
  view.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;x=drag.x+(e.clientX-drag.px)/drag.w;y=drag.y+(e.clientY-drag.py)/drag.h;paint();});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])view.addEventListener(event,end);
  window.AtlasPreviewCamera={sync:paint,getZoom:()=>zoom,setZoom:z=>{fit=false;zoom=Number.isFinite(z)&&z>0?Math.min(4,z):1;paint();}};paint();
 };
 if(window.AtlasStartup)window.AtlasStartup.run(initialize);else initialize();
})();
