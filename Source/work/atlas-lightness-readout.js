// Lightness readout integration
(()=>{
 const root=document.getElementById('munsell-picker'),label=root.querySelector('[data-field="lab-view-lightness"]'),slider=root.querySelector('#mp-vfx-l');if(!label||!slider)return;
 label.classList.add('atlas-lightness-readout');slider.closest('.mp-color-slider-group').insertAdjacentElement('beforebegin',label);
 let last=label.textContent,animation=null;
 new MutationObserver(()=>{const next=label.textContent;if(next===last)return;last=next;animation?.cancel();animation=null;if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&label.animate)animation=label.animate([{transform:'scale(1)'},{transform:'scale(1.12)',offset:.45},{transform:'scale(1)'}],{duration:180,easing:'ease-out'});}).observe(label,{childList:true,characterData:true,subtree:true});
})();
// End Lightness readout integration
