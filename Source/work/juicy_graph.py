from pathlib import Path
import re
p=Path(re.search("const file='([^']+)'",Path('work/check_triad.cjs').read_text())[1]);s=p.read_text()
s=s.replace('<style>','''<style>
#munsell-picker .mp-elastic-marker{transform-box:fill-box;transform-origin:center;animation:mp-marker-pop 520ms cubic-bezier(.22,.8,.3,1) both}
@keyframes mp-marker-pop{0%{transform:scale(.65)}35%{transform:scale(1.38)}58%{transform:scale(.9)}78%{transform:scale(1.08)}100%{transform:scale(1)}}
@media(prefers-reduced-motion:reduce){#munsell-picker .mp-elastic-marker{animation:none}}
''',1)
s=s.replace('const target=activeLabSvg(),color=activeLabColor();', "const target=activeLabSvg(),color=activeLabColor();\n const colorKey=[color.l,color.a,color.b].join('|'),pop=target.colorKey!==colorKey;target.colorKey=colorKey;")
s=s.replace('<circle cx="${point.x}" cy="${point.y}" r="8"', '<circle class="${pop?\'mp-elastic-marker\':\'\'}" cx="${point.x}" cy="${point.y}" r="8"')
s=s.replace("let labView={yaw:-.65,pitch:.28},", "let labView={yaw:-.65,pitch:.28},labSpringFrame=0,")
pos=s.index('for(const target of [labPlane,vfxLab]){')
s=s[:pos]+'''function settleLabView(yaw,pitch){
 if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
 cancelAnimationFrame(labSpringFrame);let velocityYaw=0,velocityPitch=0,previous=0,frames=0;
 function tick(time){const dt=previous?Math.min((time-previous)/16.67,2):1;previous=time;
 velocityYaw+=(yaw-labView.yaw)*.075*dt;velocityPitch+=(pitch-labView.pitch)*.075*dt;
 velocityYaw*=Math.pow(.78,dt);velocityPitch*=Math.pow(.78,dt);labView.yaw+=velocityYaw*dt;labView.pitch+=velocityPitch*dt;drawLabPlane();
 if(++frames<100&&(Math.abs(yaw-labView.yaw)+Math.abs(pitch-labView.pitch)+Math.abs(velocityYaw)+Math.abs(velocityPitch)>.001))labSpringFrame=requestAnimationFrame(tick);
 else{labView.yaw=yaw;labView.pitch=pitch;drawLabPlane();labSpringFrame=0;}
 }
 labSpringFrame=requestAnimationFrame(tick);
}
''' +s[pos:]
s=s.replace("if(e.button!==0)return;lab3dDrag={", "if(e.button!==0)return;cancelAnimationFrame(labSpringFrame);lab3dDrag={")
s=s.replace("lab3dDrag=null;if(target.hasPointerCapture", "if(type==='pointerup'&&lab3dDrag.moved)settleLabView(labView.yaw+(e.clientX-lab3dDrag.x)*.001,Math.max(-1.1,Math.min(1.1,labView.pitch+(e.clientY-lab3dDrag.y)*.001)));\n lab3dDrag=null;if(target.hasPointerCapture")
p.write_text(s)
q=Path('work/check_triad.cjs');t=q.read_text().replace('const context={setTimeout', 'const context={requestAnimationFrame(){return 1},cancelAnimationFrame(){},setTimeout');q.write_text(t)
