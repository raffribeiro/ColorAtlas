function labClickColor(target,e,l){const matrix=target.getScreenCTM();if(!matrix)return null;const point=target.createSVGPoint();point.x=e.clientX;point.y=e.clientY;const pos=point.matrixTransform(matrix.inverse()),w=target.clientWidth||640,H=target.clientHeight||390,scale=Math.min(w/370,H/240)*labView.zoom,sinPitch=Math.sin(labView.pitch);if(Math.abs(sinPitch)<.03)return null;const xx=(pos.x-w/2-labView.panX*w)/scale,yy=(H/2+labView.panY*H-pos.y)/scale,zz=((l-50)*1.6*Math.cos(labView.pitch)-yy)/sinPitch,a=xx*Math.cos(labView.yaw)-zz*Math.sin(labView.yaw),b=xx*Math.sin(labView.yaw)+zz*Math.cos(labView.yaw);return fitLabToSRGB(l,a,b);}
for(const target of [labPlane,vfxLab]){
target.addEventListener('auxclick',e=>{if(e.button===1)e.preventDefault();});
target.addEventListener('wheel',e=>{e.preventDefault();zoomLab(e.deltaY,e.deltaMode);},{passive:false});

target.addEventListener('pointerdown',e=>{if(e.button!==0&&e.button!==1)return;lab3dDrag={id:e.pointerId,x:e.clientX,y:e.clientY,yaw:labView.yaw,pitch:labView.pitch,panX:labView.panX,panY:labView.panY,mode:e.button===1?'pan':'rotate',width:target.getBoundingClientRect().width||target.clientWidth||1,height:target.getBoundingClientRect().height||target.clientHeight||1,moved:false};target.setPointerCapture(e.pointerId);e.preventDefault();});
target.addEventListener('pointermove',e=>{if(!lab3dDrag||e.pointerId!==lab3dDrag.id)return;const dx=e.clientX-lab3dDrag.x,dy=e.clientY-lab3dDrag.y;if(Math.hypot(dx,dy)>4)lab3dDrag.moved=true;if(lab3dDrag.mode==='pan'){labView.panX=lab3dDrag.panX+dx/lab3dDrag.width;labView.panY=lab3dDrag.panY+dy/lab3dDrag.height;}else{labView.yaw=lab3dDrag.yaw-dx*.008;labView.pitch=Math.max(-1.2,Math.min(1.2,lab3dDrag.pitch-dy*.008));}drawLabPlane();});
for(const type of ['pointerup','pointercancel'])target.addEventListener(type,e=>{
 if(!lab3dDrag||e.pointerId!==lab3dDrag.id)return;
 if(type==='pointerup'&&lab3dDrag.mode==='rotate'&&!lab3dDrag.moved){const color=state.system==='vfx'?state.vfx:state.lab,fit=labClickColor(target,e,color.l);if(fit){Object.assign(color,{a:fit.a,b:fit.b});drawSystem();remember();window.AtlasMotion?.colorChanged(e);}}
  lab3dDrag=null;if(target.hasPointerCapture(e.pointerId))target.releasePointerCapture(e.pointerId);
});
}
