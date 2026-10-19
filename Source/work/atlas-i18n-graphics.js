// Only the small text layer is localized after a graph draw. Never scan gamut
// points, paths or raster pixels, and never change a renderer's sync contract.
for(const [name,get,set]of [
 ['3D',()=>drawLabPlane,value=>drawLabPlane=value],
 ['wheel',()=>drawColorWheel,value=>drawColorWheel=value],
 ['LCh',()=>drawLch,value=>drawLch=value]
]){
 const previous=get();set(function(...args){const result=previous.apply(this,args);
  const svg=name==='3D'?activeLabSvg():name==='wheel'?field('color-wheel'):lchScene;
  if(window.AtlasI18n&&window.AtlasI18n.locale!=='en')window.AtlasI18n.translateGraphic(svg);return result;
 });
}
