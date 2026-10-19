// Editor comparison and selection visibility.
let lastRevealedGradientKey='',visionCompareMode=null;
function requestGradientKeyReveal(){lastRevealedGradientKey='';}
function revealSelectedGradientKey(){
 const list=field('gradient-keys');if(!list?.clientHeight)return;
 const rank=state.gradientColors.map((k,i)=>({k,i})).sort((a,b)=>b.k.t-a.k.t||a.i-b.i).findIndex(p=>p.i===state.gradientSelection.index),token=state.gradientLayer+'|'+state.gradientSelection.index+'|'+rank;
 if(token===lastRevealedGradientKey)return;const row=list.querySelector('.studio-key-row[data-selected="true"]');if(!row)return;
 lastRevealedGradientKey=token;const a=list.getBoundingClientRect(),b=row.getBoundingClientRect(),delta=b.top<a.top?b.top-a.top:b.bottom>a.bottom?b.bottom-a.bottom:0;
 if(delta)list.scrollTop=Math.max(0,Math.min(list.scrollHeight-list.clientHeight,list.scrollTop+delta));
}
function setVisionComparePosition(value){
 const position=Math.max(0,Math.min(100,Number(value)||0)),range=$('#vision-compare-position');range.value=position;
 $('#vision-comparison').parentElement?.style.setProperty('--vision-split',position+'%');$('#vision-comparison').style.setProperty('--vision-split',position+'%');
 range.setAttribute('aria-valuetext',position+'% Regular Vision, '+(100-position)+'% filtered');window.AtlasPreviewCamera?.sync();
}
function syncVisionComparison(ctx){
 const group=$('#vision-comparison'),original=$('#vision-compare-original');if(!group||!original)return;
 const active=state.colorVision!=='normal';group.hidden=!active;original.hidden=!active;group.parentElement?.setAttribute('data-vision-comparison',String(active));
 if(visionCompareMode!==state.colorVision){visionCompareMode=state.colorVision;setVisionComparePosition(50);}
 if(!active)return;original.getContext('2d').putImageData(ctx.getImageData(0,0,512,512),0,0);
 $('#vision-compare-filter-label').textContent=state.colorVision[0].toUpperCase()+state.colorVision.slice(1);
}
$('#vision-compare-position')?.addEventListener('input',e=>setVisionComparePosition(e.target.value));
// End editor comparison and selection visibility.
