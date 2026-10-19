let ramps=0;
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const s=fs.readFileSync(process.env.ATLAS_TEST_SOURCE||'/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html','utf8');
const frames=new Map(),handlers={},other={colors:[{t:0,hex:'#112233'}]},alphas=[{t:0,a:.4}];let saves=0,paints=0,full=0,id=0,captured=false;
const dragAttrs={};const target={setAttribute(k,v){dragAttrs[k]=v},clientWidth:370,clientHeight:240,addEventListener(k,fn){handlers[k]=fn},getScreenCTM(){return {inverse(){return {}}}},createSVGPoint(){return {matrixTransform(m){return {x:this.x*(m.a??1)+(m.e??0),y:this.y*(m.d??1)+(m.f??0)}}}},getBoundingClientRect(){return {width:370,height:240}},setPointerCapture(){captured=true},hasPointerCapture(){return captured},releasePointerCapture(){captured=false}};
const state={system:'vfx',vfx:{l:70,a:0,b:0},gradientSelection:{kind:'color',index:1},gradientColors:[{t:0,hex:'#000000'},{t:.75,hex:'#aaaaaa'}],gradientAlphas:alphas,gradientLayers:{smoke:other},gradientPreset:'preset'};
const c={state,rgbToLab:hex=>hex===state.gradientColors[state.gradientSelection.index].hex?state.vfx:{l:0,a:-100,b:-100},labPlane:{...target,addEventListener(){}},vfxLab:target,labView:{zoom:1,yaw:0,pitch:.5,panX:0,panY:0},lab3dDrag:null,window:{AtlasLabSurface:{svg:()=>''},AtlasNeutralAxis:{svg:()=>''}},requestAnimationFrame(fn){frames.set(++id,fn);return id},cancelAnimationFrame(id){frames.delete(id)},fitLabToSRGB:(l,a,b)=>({l,a,b}),labColor(l,a,b){return {hex:'#'+Math.round(a+128).toString(16).padStart(2,'0')+'4466'}},storeGradientLayer(){state.gradientLayers.emission={colors:state.gradientColors,alphas:state.gradientAlphas}},drawGradient(){ramps++;c.storeGradientLayer();c.drawExplosionMap();},drawLabPlane(){},drawColorWheel(){},drawSelectedColorPreview(){},drawExplosionMap(){paints++;assert.equal(state.gradientLayers.emission.colors[1].hex,state.gradientColors[1].hex,'preview sees synchronized active layer')},drawSystem(){full++},remember(){saves++}};
vm.createContext(c);
vm.runInContext(s.slice(s.indexOf('function projectLab('),s.indexOf('// Two restrained OKLab spectra')),c);
vm.runInContext(s.slice(s.indexOf('function labClickColor('),s.indexOf('function hsvRGB(')),c);
const e=(x,y,button=0,extra={})=>({clientX:x,clientY:y,button,pointerId:1,preventDefault(){},...extra});
const flush=()=>{const q=[...frames.values()];frames.clear();q.forEach(fn=>fn())};
const center=()=>c.projectLab(state.vfx,370,240);
const original=state.gradientColors[1].hex;
// Regression: even on the visible plane at maximum zoom, background dragging rotates.
c.labView.zoom=3;let p=center();
handlers.pointerdown(e(p.x+35,p.y));assert.equal(c.lab3dDrag.mode,'rotate','only the selection circle starts color editing');
handlers.pointermove(e(p.x+55,p.y+10));handlers.pointerup(e(p.x+55,p.y+10));assert.equal(state.gradientColors[1].hex,original);assert.equal(saves,0);assert.equal(paints,0);
Object.assign(c.labView,{zoom:1,yaw:0,pitch:.5,panX:0,panY:0});
p=center();handlers.pointerdown(e(p.x+8,p.y));assert.equal(c.lab3dDrag.mode,'color');assert.equal(state.gradientColors[1].hex,original,'grabbing the ring does not jump the color');assert.equal(paints,0);handlers.pointerup(e(p.x+8,p.y));assert.equal(saves,0,'stationary marker click is not an edit');
const camera=JSON.stringify(c.labView);
p=center();handlers.pointerdown(e(p.x+8,p.y));assert(captured);
handlers.pointermove(e(p.x+33,p.y+3));handlers.pointermove(e(p.x+48,p.y+6));assert.equal(frames.size,1,'coalesce moves to one frame');flush();assert.equal(paints,1);assert.equal(ramps,1,'3D edits repaint Gradient Map before release');assert.equal(dragAttrs['data-editing-color'],'true','Context dims while the circle moves');
assert(Math.abs(state.vfx.a-40)<1e-9,'drag preserves the grab offset, rather than snapping marker to cursor');
assert.equal(JSON.stringify(c.labView),camera);assert.equal(state.vfx.l,70);assert.equal(state.gradientColors[1].t,.75);assert.equal(state.gradientAlphas,alphas);assert.equal(state.gradientLayers.smoke,other);assert.equal(full,0);
const hex=state.gradientColors[1].hex;handlers.pointermove(e(p.x+48,p.y+6));flush();assert.equal(state.gradientColors[1].hex,hex);assert.equal(paints,1,'unchanged HEX avoids repaint');
handlers.pointermove(e(p.x+58,p.y+9));handlers.pointerup(e(p.x+58,p.y+9));assert.equal(frames.size,0);assert.equal(paints,2);assert.equal(saves,1);assert.equal(dragAttrs['data-editing-color'],'false','Release restores context');assert.equal(full,1);assert.equal(c.lab3dDrag,null);assert(!captured);
const end=state.gradientColors[1].hex;
for(const [button,shiftKey] of [[1,false],[0,true]]){
 p=center();handlers.pointerdown(e(p.x,p.y,button,{shiftKey}));assert.equal(c.lab3dDrag.mode,button===1?'pan':'rotate');handlers.pointermove(e(p.x+20,p.y+10,button));handlers.pointerup(e(p.x+20,p.y+10,button));assert.equal(state.gradientColors[1].hex,end);assert.equal(saves,1);
}
c.labView.pitch=0;p=center();handlers.pointerdown(e(p.x,p.y));assert.equal(c.lab3dDrag.mode,'rotate','edge-on marker remains a camera gesture');handlers.pointercancel(e(p.x,p.y));
Object.assign(c.labView,{yaw:0,pitch:.5,panX:0,panY:0});
p=center();handlers.pointerdown(e(p.x,p.y));handlers.pointermove(e(p.x+10,p.y+4,0,{pointerId:9}));assert.equal(frames.size,0);handlers.pointermove(e(p.x+20,p.y+4));handlers.pointercancel(e(p.x+20,p.y+4));assert.equal(frames.size,0);assert.equal(saves,2,'cancel commits the last visible edit like the wheel');assert(!captured);
p=center();handlers.pointerdown(e(p.x,p.y,2));assert.equal(c.lab3dDrag,null);
// Invert the actual renderer at different yaw/pitch/zoom/pan values.
vm.runInContext(s.slice(s.indexOf('function projectLab('),s.indexOf('// Two restrained OKLab spectra')),c);
for(const [yaw,pitch,zoom,panX,panY] of [[0,.5,1,0,0],[1,-.7,2,.1,-.2],[-2,1,.5,-.3,.1]]){
 Object.assign(c.labView,{yaw,pitch,zoom,panX,panY});
 const q={l:70,a:12,b:-18},p=c.projectLab(q,370,240),fit=c.labClickColor(target,e(p.x,p.y),q.l,true);
 assert(fit);assert(Math.abs(fit.a-q.a)<1e-9);assert(Math.abs(fit.b-q.b)<1e-9,'picking respects the rendered camera');
 const outside=c.projectLab({l:70,a:120,b:0},370,240);assert.equal(c.labClickColor(target,e(outside.x,outside.y),70,true),null,'outside-plane press stays a camera gesture');
 const marker=center();assert(c.labMarkerOffset(target,e(marker.x+15.9,marker.y)));assert.equal(c.labMarkerOffset(target,e(marker.x+17,marker.y)),null,'marker hit radius stays bounded as camera zoom changes');
}
target.getScreenCTM=()=>({inverse(){return {a:.5,d:.5,e:-50,f:-25}}});
p=center();assert.equal(c.labMarkerOffset(target,e(p.x*2+130,p.y*2+50)).x,15,'marker hit test accounts for SVG screen scaling');assert.equal(c.labMarkerOffset(target,e(p.x*2+134,p.y*2+50)),null);
console.log('PASS: marker-only 3D drag, background rotation at maximum zoom, no press jump, grab offset, live color/preview, one update per frame, final flush/save, fixed lightness/camera, unchanged alpha/position/other layer, camera gestures and cancellation.');
// Exercise the actual SVG renderer: only nonactive context receives dimming tags.
const viewAttrs={},svg={clientWidth:370,clientHeight:240,setAttribute(k,v){viewAttrs[k]=v}};
Object.assign(c,{field:()=>({}),activeLabSvg:()=>svg,activeLabColor:()=>state.vfx,labVolume:[{l:20,a:0,b:0,hex:'#123456'},{l:70,a:0,b:0,hex:'#abcdef'}],dpath:()=>'',layoutLabLabels:labels=>labels,selectionStrokeSVG:()=>'',markerAnimationDelay:()=>'',vfxColors:()=>({base:'#aabbcc'}),rgbToLab:()=>({l:20,a:0,b:0})});
state.system='vfx';state.vfx={l:70,a:0,b:0};state.gradientSelection={kind:'color',index:1};c.labColor=()=>({hex:'#aabbcc',outside:false});c.lab3dDrag={mode:'color',moved:true};
vm.runInContext(s.slice(s.indexOf('function drawLabPlane(){'),s.indexOf("for(const k of ['l','a','b'])$('#mp-cart-")),c);
c.drawLabPlane();assert.equal(viewAttrs['data-editing-color'],'true');
assert(/<circle data-lab-context[^>]*fill="#123456"/.test(svg.innerHTML),'Other L samples are dimmable');
assert(/<circle  cx[^>]*fill="#abcdef"/.test(svg.innerHTML),'Current-L volume samples stay clear');
assert(/<polyline data-lab-context/.test(svg.innerHTML));
assert(/data-lab-gradient-key="0" data-lab-context/.test(svg.innerHTML));
assert(!/data-lab-gradient-key="1" data-lab-context/.test(svg.innerHTML),'Selected key stays clear');
c.lab3dDrag=null;c.drawLabPlane();assert.equal(viewAttrs['data-editing-color'],'false');
console.log('PASS: actual SVG dimming tags isolate other L samples, other key markers and the dashed path; normal state restores context.');
