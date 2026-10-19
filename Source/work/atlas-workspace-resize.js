// Workspace splitters retain local page proportions without changing color state.
(()=>{
 const root=document.getElementById('munsell-picker'),find=s=>root.querySelector(s),main=find('.studio-main'),author=find('.studio-author'),keys=find('.studio-keys'),preview=find('.studio-preview'),ramp=find('.studio-ramp'),layers=find('#preview-layers'),list=find('#preview-layer-list');
 const wide=()=>matchMedia('(min-width:1200px) and (min-height:800px)').matches,clamp=(n,a,b)=>Math.max(a,Math.min(Math.max(a,b),n)),scale=()=>main.getBoundingClientRect().width/main.clientWidth||1;
 const widths=()=>[author,keys,preview].map(n=>n.getBoundingClientRect().width/scale()),mins=[260,200,240];
 const colStart=()=>widths(),colMove=(i,d,w)=>{const next=[...w],delta=clamp(d,mins[i]-w[i],w[i+1]-mins[i+1]);next[i]+=delta;next[i+1]-=delta;main.style.setProperty('--atlas-columns',next.map((n,j)=>`minmax(${mins[j]}px,${n}fr)`).join(' '));};
 const rowMax=()=>{const css=getComputedStyle(main);return main.clientHeight-(parseFloat(css.paddingTop)||0)-(parseFloat(css.paddingBottom)||0)-(parseFloat(css.rowGap)||0)-420;};
 const rampMin=()=>find('.studio-ramp-title').getBoundingClientRect().height+136;
 const rampMove=(d,h)=>main.style.setProperty('--atlas-ramp-height',clamp(h-d,rampMin(),Math.min(340,rowMax()))+'px');
 const layerMin=()=>38+(layers.getBoundingClientRect().height-list.getBoundingClientRect().height)/scale();
 const layerMove=(d,h)=>layers.style.setProperty('--atlas-layers-height',clamp(h-d,layerMin(),preview.clientHeight-300)+'px');
 let scheduled=false;
 function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;position();});}
 function grip(parent,label,vertical,start,move,reset){
  const n=document.createElement('div');n.className='atlas-splitter '+(vertical?'atlas-splitter-col':'atlas-splitter-row');n.tabIndex=0;n.setAttribute('role','separator');n.setAttribute('aria-label',label);n.setAttribute('aria-orientation',vertical?'vertical':'horizontal');n.title='Drag or use arrow keys to resize. Double-click or Home to reset.';parent.append(n);let drag=null;
  const coordinate=e=>vertical?e.clientX:e.clientY;
  n.addEventListener('pointerdown',e=>{if(e.button!==0||!wide())return;drag={id:e.pointerId,at:coordinate(e),value:start(),scale:scale()};n.setPointerCapture(e.pointerId);e.preventDefault();});
  n.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;move((coordinate(e)-drag.at)/drag.scale,drag.value);schedule();});
  for(const type of ['pointerup','pointercancel'])n.addEventListener(type,e=>{if(!drag||e.pointerId!==drag.id)return;drag=null;if(n.hasPointerCapture(e.pointerId))n.releasePointerCapture(e.pointerId);});
  n.addEventListener('lostpointercapture',()=>{drag=null;});
  n.addEventListener('keydown',e=>{if(!wide())return;const names=vertical?['ArrowLeft','ArrowRight']:['ArrowUp','ArrowDown'];if(e.key==='Home'){reset();schedule();e.preventDefault();}else if(names.includes(e.key)){move(e.key===names[0]?-16:16,start());schedule();e.preventDefault();}});
  n.addEventListener('dblclick',()=>{reset();schedule();});return n;
 }
 const resetColumns=()=>main.style.removeProperty('--atlas-columns');
 const first=grip(main,'Resize Authoring Colors and Keys',true,colStart,(d,w)=>colMove(0,d,w),resetColumns),second=grip(main,'Resize Keys and Preview',true,colStart,(d,w)=>colMove(1,d,w),resetColumns);
 const horizontal=grip(main,'Resize Gradient Map',false,()=>ramp.getBoundingClientRect().height/scale(),rampMove,()=>main.style.removeProperty('--atlas-ramp-height'));
 const layerGrip=grip(layers,'Resize Preview and Layers',false,()=>layers.getBoundingClientRect().height/scale(),layerMove,()=>layers.style.removeProperty('--atlas-layers-height'));
 function position(){
  if(!wide()){layers.style.removeProperty('--atlas-layers-default-height');return;}if(!main.clientWidth)return;
  // Reference layout: Preview uses about 70% of the column, Layers the lower 30%.
  layers.style.setProperty('--atlas-layers-default-height',clamp(preview.clientHeight*.30,layerMin(),preview.clientHeight-300)+'px');
  const factor=scale(),box=main.getBoundingClientRect(),a=author.getBoundingClientRect(),k=keys.getBoundingClientRect(),p=preview.getBoundingClientRect(),r=ramp.getBoundingClientRect(),css=getComputedStyle(main),gap=parseFloat(css.columnGap)||10;
  for(const [i,n,edge,height] of [[0,first,a.right,a.height],[1,second,k.right,p.height]]){Object.assign(n.style,{left:(edge-box.left)/factor+gap/2-6+'px',top:(a.top-box.top)/factor+'px',height:height/factor+'px'});const w=widths();n.setAttribute('aria-valuenow',Math.round(w[i]));n.setAttribute('aria-valuemin',mins[i]);n.setAttribute('aria-valuemax',Math.round(w[i]+w[i+1]-mins[i+1]));}
  Object.assign(horizontal.style,{left:(a.left-box.left)/factor+'px',top:(r.top-box.top)/factor-(parseFloat(css.rowGap)||10)/2-6+'px',width:(k.right-a.left)/factor+'px'});horizontal.setAttribute('aria-valuenow',Math.round(r.height/factor));
  const row=main.style.getPropertyValue('--atlas-ramp-height'),height=layers.style.getPropertyValue('--atlas-layers-height');if(row)rampMove(0,parseFloat(row));if(height)layerMove(0,parseFloat(height));
  layerGrip.setAttribute('aria-valuenow',Math.round(layers.getBoundingClientRect().height/factor));layerGrip.setAttribute('aria-valuemin',layerMin());layerGrip.setAttribute('aria-valuemax',Math.max(layerMin(),preview.clientHeight-300));
  horizontal.setAttribute('aria-valuemin',rampMin());horizontal.setAttribute('aria-valuemax',Math.max(rampMin(),Math.min(340,rowMax())));
 }
 const observer=new ResizeObserver(schedule);for(const n of [main,author,keys,preview,ramp,layers])observer.observe(n);addEventListener('resize',schedule);schedule();
})();
