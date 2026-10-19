function fitStudioPreview(){
 const root=document.getElementById('munsell-picker');
 const area=root.querySelector('.mp-explosion-previews');
 const caption=root.querySelector('.mp-explosion-previews figcaption');
 const captionHeight=caption?caption.getBoundingClientRect().height+8:0;
 const height=Math.max(0,area.clientHeight-captionHeight);
 area.style.setProperty('--studio-preview-height',height+'px');
 area.style.setProperty('--studio-preview-image-size',Math.max(area.clientWidth,height)+'px');
 window.AtlasPreviewCamera?.sync();
}
const studioPreviewArea=document.getElementById('munsell-picker').querySelector('.mp-explosion-previews');
new ResizeObserver(fitStudioPreview).observe(studioPreviewArea);
addEventListener('resize',fitStudioPreview);
requestAnimationFrame(fitStudioPreview);
