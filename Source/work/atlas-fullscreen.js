(()=>{
 const nav=document.querySelector('.studio-workspace-nav');if(!nav)return;
 const button=document.createElement('button');button.type='button';button.className='studio-tab';button.id='atlas-fullscreen';nav.prepend(button);
 const sync=()=>{const active=!!document.fullscreenElement;button.textContent=active?'Exit fullscreen':'Fullscreen';button.setAttribute('aria-pressed',String(active));button.title=active?'Exit fullscreen (Esc)':'Enter fullscreen';button.disabled=!document.fullscreenEnabled;};
 button.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{button.title='Fullscreen unavailable in this browser';button.textContent='Unavailable';} });
 document.addEventListener('fullscreenchange',sync);sync();
})();
