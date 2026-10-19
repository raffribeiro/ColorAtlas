from pathlib import Path
import re
p=Path(re.search("const file='([^']+)'",Path('work/check_triad.cjs').read_text())[1]);s=p.read_text()
s=s.replace('CIELAB · a* / b* plane · D65','CIELAB · 3D volume · D65').replace('CIELAB · A PLANE THROUGH COLOR SPACE','CIELAB · ROTATABLE COLOR VOLUME')
s=s.replace('Colored cells show displayable samples. The blank area is outside sRGB, not outside Lab. CIELCh expresses this same plane using radius and angle.','The dots sample the sRGB volume in Lab coordinates. Bright samples show the current L* slice. The wireframe shows the plotting bounds, not the gamut boundary.')
s=s.replace('Click the plane to select a* and b*. ○ Selection · × Outside sRGB · sampled at 4-unit intervals.','Drag to rotate · click a colored sample to select it · sliders move the selection · ○ Selected color · × Outside sRGB')
s=s.replace('aria-label="CIELAB a star horizontal and b star vertical at selected lightness"','aria-label="Rotatable 3D CIELAB volume with lightness, a star and b star axes"')
a=s.index('const labPlane=');b=s.index('function drawSystem(){',a)
s=s[:a]+'''const labPlane=$('.mp-lab-plane');
let labView={yaw:-.65,pitch:.28},lab3dGeometry={},lab3dPoints=[],lab3dDrag=null;
const labVolume=[];
for(let r=0;r<=8;r++)for(let g=0;g<=8;g++)for(let b=0;b<=8;b++){
 const hex='#'+[r,g,b].map(n=>Math.round(n*255/8).toString(16).padStart(2,'0')).join('');labVolume.push({...rgbToLab(hex),hex});
}
function projectLab(p,w,H){
 const scale=Math.min(w/370,H/240),x=p.a,y=(p.l-50)*1.6,z=p.b;
 const xx=x*Math.cos(labView.yaw)+z*Math.sin(labView.yaw),zz=-x*Math.sin(labView.yaw)+z*Math.cos(labView.yaw);
 const yy=y*Math.cos(labView.pitch)-zz*Math.sin(labView.pitch),depth=y*Math.sin(labView.pitch)+zz*Math.cos(labView.pitch);
 return {x:w/2+xx*scale,y:H/2-yy*scale,depth};
}
function drawLabPlane(){
 if(state.system!=='labcart')return;
 const w=labPlane.clientWidth||640,H=labPlane.clientHeight||390;lab3dGeometry={w,H};labPlane.setAttribute('viewBox',`0 0 ${w} ${H}`);
 const project=p=>projectLab(p,w,H),line=(a,b,extra='')=>{const pa=project(a),pb=project(b);return `<line x1="${pa.x}" y1="${pa.y}" x2="${pb.x}" y2="${pb.y}" ${extra}/>`;};
 let svg='<title>3D CIELAB color volume</title><desc>Drag to rotate. L star is vertical, a star and b star are perpendicular chromatic axes. Dots sample sRGB; the bright plane is the selected lightness.</desc>';
 const bounds=110;
 for(const l of [0,100])for(const q of [-bounds,bounds]){svg+=line({l,a:-bounds,b:q},{l,a:bounds,b:q},'stroke="var(--border)" stroke-width=".7"');svg+=line({l,a:q,b:-bounds},{l,a:q,b:bounds},'stroke="var(--border)" stroke-width=".7"');}
 for(const a of [-bounds,bounds])for(const b of [-bounds,bounds])svg+=line({l:0,a,b},{l:100,a,b},'stroke="var(--border)" stroke-width=".7"');
 const plane=[{l:state.lab.l,a:-bounds,b:-bounds},{l:state.lab.l,a:bounds,b:-bounds},{l:state.lab.l,a:bounds,b:bounds},{l:state.lab.l,a:-bounds,b:bounds}].map(project);
 svg+=`<path d="${dpath(plane.map(p=>[p.x,p.y]))}" fill="var(--foreground)" fill-opacity=".035" stroke="var(--foreground)" stroke-opacity=".35" stroke-width="1"/>`;
 const slice=[];
 for(let a=-104;a<=104;a+=8)for(let b=-104;b<=104;b+=8){const col=labColor(state.lab.l,a,b);if(!col.outside)slice.push({l:state.lab.l,a,b,hex:col.hex,slice:true});}
 lab3dPoints=labVolume.concat(slice).map(p=>({...p,...project(p)})).sort((a,b)=>a.depth-b.depth);
 for(const p of lab3dPoints)svg+=`<circle cx="${p.x}" cy="${p.y}" r="${p.slice?3.2:2}" fill="${p.hex}" fill-opacity="${p.slice?1:.17}"/>`;
 const axis='stroke="var(--foreground)" stroke-width="1.2"';
 svg+=line({l:0,a:0,b:0},{l:100,a:0,b:0},axis)+line({l:50,a:-bounds,b:0},{l:50,a:bounds,b:0},axis)+line({l:50,a:0,b:-bounds},{l:50,a:0,b:bounds},axis);
 for(const [p,label] of [[{l:100,a:0,b:0},'L* 100'],[{l:0,a:0,b:0},'L* 0'],[{l:50,a:bounds,b:0},'+a* · red'],[{l:50,a:-bounds,b:0},'−a* · green'],[{l:50,a:0,b:bounds},'+b* · yellow'],[{l:50,a:0,b:-bounds},'−b* · blue']]){const point=project(p);svg+=`<text x="${Math.max(55,Math.min(w-55,point.x))}" y="${Math.max(20,Math.min(H-15,point.y-9))}" text-anchor="middle">${label}</text>`;}
 const col=labColor(state.lab.l,state.lab.a,state.lab.b),point=project(state.lab);
 svg+=`<circle cx="${point.x}" cy="${point.y}" r="8" fill="${col.hex}" stroke="var(--foreground)" stroke-width="2.5"/><circle cx="${point.x}" cy="${point.y}" r="11" fill="none" stroke="var(--background)" stroke-width="1.5"/>${col.outside?`<text x="${point.x}" y="${point.y-16}" text-anchor="middle">×</text>`:''}<text x="${w/2}" y="18" text-anchor="middle">L* ${state.lab.l.toFixed(1)} · drag to rotate</text>`;
 labPlane.innerHTML=svg;
 for(const k of ['l','a','b']){$('#mp-cart-'+k).value=state.lab[k];field('cart-'+k+'-value').textContent=state.lab[k].toFixed(1);}
 field('cart-preview').style.backgroundColor=col.hex;field('cart-hex').textContent=col.hex.toUpperCase();field('cart-gamut').textContent=col.outside?'× Outside sRGB — clipped preview':'Inside sRGB';const q=toLch();field('cart-lch').textContent=`Same color in LCh: L* ${q.l.toFixed(1)} · C* ${q.c.toFixed(1)} · h° ${q.h.toFixed(1)}`;
}
for(const k of ['l','a','b'])$('#mp-cart-'+k).addEventListener('input',()=>{state.lab[k]=Number($('#mp-cart-'+k).value);drawSystem();remember();});
labPlane.addEventListener('pointerdown',e=>{if(e.button!==0)return;lab3dDrag={id:e.pointerId,x:e.clientX,y:e.clientY,yaw:labView.yaw,pitch:labView.pitch,moved:false};labPlane.setPointerCapture(e.pointerId);e.preventDefault();});
labPlane.addEventListener('pointermove',e=>{if(!lab3dDrag||e.pointerId!==lab3dDrag.id)return;const dx=e.clientX-lab3dDrag.x,dy=e.clientY-lab3dDrag.y;if(Math.hypot(dx,dy)>4)lab3dDrag.moved=true;labView.yaw=lab3dDrag.yaw+dx*.008;labView.pitch=Math.max(-1.2,Math.min(1.2,lab3dDrag.pitch+dy*.008));drawLabPlane();});
for(const type of ['pointerup','pointercancel'])labPlane.addEventListener(type,e=>{
 if(!lab3dDrag||e.pointerId!==lab3dDrag.id)return;
 if(type==='pointerup'&&!lab3dDrag.moved){const box=labPlane.getBoundingClientRect(),x=e.clientX-box.left,y=e.clientY-box.top;let nearest=null,distance=144;for(const p of lab3dPoints){const d=(p.x-x)**2+(p.y-y)**2;if(d<distance){nearest=p;distance=d;}}if(nearest){state.lab={l:nearest.l,a:nearest.a,b:nearest.b};drawSystem();remember();}}
 lab3dDrag=null;if(labPlane.hasPointerCapture(e.pointerId))labPlane.releasePointerCapture(e.pointerId);
});
''' +s[b:]
p.write_text(s)
q=Path('work/check_triad.cjs');t=q.read_text();a=t.index("node('.mp-lab-plane').handlers.click");b=t.index("console.log('PASS: Cartesian",a);t=t[:a]+t[b:];t=t.replace('assert.match(node(\'.mp-lab-plane\').innerHTML,/a\\* \\/ b\\* slice/);','assert.match(node(\'.mp-lab-plane\').innerHTML,/3D CIELAB/);');q.write_text(t)
