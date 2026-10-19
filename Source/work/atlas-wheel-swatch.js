// Wheel swatch grouping integration
(()=>{
 const root=document.getElementById('munsell-picker'),swatch=root.querySelector('[data-field="selected-color-preview"]'),divider=root.querySelector('[data-field="wheel-divider"]');if(!swatch||!divider)return;
 divider.insertAdjacentElement('afterend',swatch);fitStudioKeys();
})();
// End Wheel swatch grouping integration
