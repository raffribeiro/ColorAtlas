function labClickColor(target,e,l,inside=false,offset={x:0,y:0}){const matrix=target.getScreenCTM();if(!matrix)return null;const point=target.createSVGPoint();point.x=e.clientX;point.y=e.clientY;const pos=point.matrixTransform(matrix.inverse()),w=target.clientWidth||640,H=target.clientHeight||390,scale=Math.min(w/370,H/240)*labView.zoom,sinPitch=Math.sin(labView.pitch);if(Math.abs(sinPitch)<.03)return null;const xx=(pos.x-offset.x-w/2-labView.panX*w)/scale,yy=(H/2+labView.panY*H-pos.y+offset.y)/scale,zz=((l-50)*1.6*Math.cos(labView.pitch)-yy)/sinPitch,a=xx*Math.cos(labView.yaw)-zz*Math.sin(labView.yaw),b=xx*Math.sin(labView.yaw)+zz*Math.cos(labView.yaw);if(inside&&(Math.abs(a)>110||Math.abs(b)>110))return null;return fitLabToSRGB(l,a,b);}
function labMarkerOffset(target,e){const matrix=target.getScreenCTM();if(!matrix)return null;const point=target.createSVGPoint();point.x=e.clientX;point.y=e.clientY;const pos=point.matrixTransform(matrix.inverse()),marker=projectLab(state.vfx,target.clientWidth||640,target.clientHeight||390),x=pos.x-marker.x,y=pos.y-marker.y;return Math.hypot(x,y)<=16?{x,y}:null;}
function labNodeAt(target,e){const matrix=target.getScreenCTM();if(!matrix)return -1;const point=target.createSVGPoint();point.x=e.clientX;point.y=e.clientY;const pos=point.matrixTransform(matrix.inverse());return state.gradientColors.map((key,index)=>{const p=projectLab(rgbToLab(key.hex),target.clientWidth||640,target.clientHeight||390);return {index,depth:p.depth,distance:Math.hypot(pos.x-p.x,pos.y-p.y)};}).filter(p=>p.distance<=14).sort((a,b)=>a.distance-b.distance||b.depth-a.depth||a.index-b.index)[0]?.index??-1;}
let labColorFrame=null,labColorPending=null;

// Camera events update labView immediately, but the expensive SVG reconstruction
// runs at most once per frame. Color editing keeps its separate scheduler below.
let labCameraFrame = null;
function queueLabCameraDraw(gesture) {
 if (labCameraFrame !== null) return;
 labCameraFrame = requestAnimationFrame(() => {
  labCameraFrame = null;
  // Never let work from an ended gesture repaint a new interaction.
  if (lab3dDrag === gesture) drawLabPlane();
 });
}
function flushLabCameraDraw() {
 if (labCameraFrame === null) return;
 cancelAnimationFrame(labCameraFrame);
 labCameraFrame = null;
 // Release/cancel must show the last camera state even before the next frame.
 drawLabPlane();
}

function applyLabColor(target,e){const d=lab3dDrag,key=state.gradientColors[state.gradientSelection.index],fit=labClickColor(target,e,d.lightness,false,d.offset);if(!fit||!key)return;const hex=labColor(fit.l,fit.a,fit.b).hex;if(key.hex===hex)return;key.hex=hex;state.gradientPreset='custom';Object.assign(state.vfx,{l:d.lightness,a:fit.a,b:fit.b});d.changed=true;drawLabPlane();drawGradient();}
for(const target of [labPlane,vfxLab]){
target.addEventListener('auxclick',e=>{if(e.button===1)e.preventDefault();});
target.addEventListener('wheel',e=>{e.preventDefault();zoomLab(e.deltaY,e.deltaMode);},{passive:false});
target.addEventListener('pointerdown',e=>{if(lab3dDrag||e.button!==0&&e.button!==1)return;const offset=state.system==='vfx'&&state.gradientSelection.kind==='color'&&e.button===0&&!e.shiftKey&&labMarkerOffset(target,e),color=offset&&labClickColor(target,e,state.vfx.l),key=!offset&&state.system==='vfx'&&e.button===0&&!e.shiftKey?labNodeAt(target,e):-1;lab3dDrag={id:e.pointerId,x:e.clientX,y:e.clientY,yaw:labView.yaw,pitch:labView.pitch,panX:labView.panX,panY:labView.panY,mode:e.button===1?'pan':color?'color':key>=0?'node':'rotate',key,lightness:state.vfx.l,offset,changed:false,width:target.getBoundingClientRect().width||1,height:target.getBoundingClientRect().height||1,moved:false};target.setPointerCapture(e.pointerId);e.preventDefault();});
target.addEventListener('pointermove',e=>{const d=lab3dDrag;if(!d||e.pointerId!==d.id)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.hypot(dx,dy)>4)d.moved=true;if(d.mode==='node'){if(!d.moved)return;d.mode='rotate';}if(d.mode==='color'){if(!d.moved)return;target.setAttribute('data-editing-color','true');labColorPending={clientX:e.clientX,clientY:e.clientY};if(labColorFrame===null)labColorFrame=requestAnimationFrame(()=>{labColorFrame=null;const p=labColorPending;labColorPending=null;if(lab3dDrag?.mode==='color'&&p)applyLabColor(target,p);});return;}if(d.mode==='pan'){labView.panX=d.panX+dx/d.width;labView.panY=d.panY+dy/d.height;}else{labView.yaw=d.yaw-dx*.008;labView.pitch=Math.max(-1.2,Math.min(1.2,d.pitch-dy*.008));}queueLabCameraDraw(d);});
for(const type of ['pointerup','pointercancel'])target.addEventListener(type,e=>{
const d=lab3dDrag;if(!d||e.pointerId!==d.id)return;
flushLabCameraDraw();
if(labColorFrame!==null){cancelAnimationFrame(labColorFrame);labColorFrame=null;}if(d.mode==='color'&&labColorPending)applyLabColor(target,labColorPending);labColorPending=null;
if(type==='pointerup'&&d.mode==='node'&&!d.moved&&state.gradientColors[d.key]){state.gradientSelection={kind:'color',index:d.key};loadGradientColor();d.changed=true;}
if(type==='pointerup'&&state.system!=='vfx'&&d.mode==='rotate'&&!d.moved){const fit=labClickColor(target,e,state.lab.l);if(fit){Object.assign(state.lab,{a:fit.a,b:fit.b});d.changed=true;}}
lab3dDrag=null;target.setAttribute('data-editing-color','false');if(d.changed){drawSystem();remember();window.AtlasMotion?.colorChanged(e);}if(target.hasPointerCapture(e.pointerId))target.releasePointerCapture(e.pointerId);
});
}
