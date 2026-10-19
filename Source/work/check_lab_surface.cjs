// Exercise the surface with the actual editor color math and camera projection.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(process.env.ATLAS_TEST_SOURCE||'/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html','utf8');
let rasters=0,bytes;
const c={window:{},Map,document:{createElement(tag){assert.equal(tag,'canvas');return {getContext(){return {createImageData(w,h){bytes=new Uint8ClampedArray(w*h*4);return {data:bytes}},putImageData(){}}},toDataURL(){rasters++;return 'data:image/png;base64,cached'+rasters}}}},labView:{yaw:.25,pitch:-.75,zoom:1,panX:0,panY:0}};
vm.createContext(c);
const between=(a,b)=>source.slice(source.indexOf(a),source.indexOf(b,source.indexOf(a)));
vm.runInContext(between('function oklabLinear(','const oklabKeyCache'),c);
vm.runInContext(between('const decodeSRGB=','function vfxAxisRange('),c);
vm.runInContext(between('function projectLab(','// Two restrained OKLab spectra'),c);
vm.runInContext(fs.readFileSync('work/atlas-lab-surface.js','utf8'),c);
const surface=c.window.AtlasLabSurface,get=L=>surface.get(L,c.labColor,c.fitLabToSRGB);
const distance=(q,a,b)=>{const dx=b.a-a.a,dy=b.b-a.b,t=Math.max(0,Math.min(1,((q.a-a.a)*dx+(q.b-a.b)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(q.a-a.a-t*dx,q.b-a.b-t*dy)};
function coverage(q){const p=get(q.l).points;let inside=false;for(let i=0,j=p.length-1;i<p.length;j=i++)if(((p[i].b>q.b)!==(p[j].b>q.b))&&(q.a<(p[j].a-p[i].a)*(q.b-p[i].b)/(p[j].b-p[i].b)+p[i].a))inside=!inside;return inside?0:Math.min(...p.map((a,i)=>distance(q,a,p[(i+1)%p.length])))}
for(const L of [1,10,35,54.7,80,95,99]){
 const s=get(L);assert(!s.endpoint);assert(s.points.length>=360&&s.points.length<5000);
 assert(s.href.startsWith('data:image/png;'));assert(bytes.every((v,i)=>i%4!==3||v===255),'No holes/alpha seams in raster');
 for(const p of s.points){assert(Math.abs(p.a)<=110&&Math.abs(p.b)<=110);const rgb=c.labLinearRGB(L,p.a,p.b);assert(rgb.every(v=>v>=-1.1e-7&&v<=1.0000011),'Contour stays in sRGB');}
 for(let h=0;h<360;h+=7){const t=h*Math.PI/180,q=c.fitLabToSRGB(L,155*Math.cos(t),155*Math.sin(t));assert(coverage(q)<.18,'Fitted edge selection is covered to subpixel precision');}
}
for(const hex of ['#ff0000','#00ff00','#0000ff','#ffff00','#00ffff','#ff00ff','#cf0057','#ffc045','#120202'])assert(coverage(c.rgbToLab(hex))<.18,hex+' boundary selection stays on the surface');
surface.clear();const a=get(54.7),count=rasters;assert.equal(get(54.7),a);assert.equal(rasters,count);
for(const [yaw,pitch,zoom,panX,panY] of [[.25,-.75,1,0,0],[2,1.1,3,.2,-.1],[-1,0,.5,-.2,.3]]){
 Object.assign(c.labView,{yaw,pitch,zoom,panX,panY});
 const project=p=>c.projectLab(p,480,300),svg=surface.svg(54.7,c.labColor,c.fitLabToSRGB,project,'test');
 assert(svg.includes('clip-path="url(#lab-surface-test)"'));assert(!svg.includes('NaN'));
 const m=svg.match(/matrix\(([^)]+)\)/)[1].split(' ').map(Number);
 for(const q of [{a:0,b:0},{a:-110,b:-110},{a:110,b:110},{a:32,b:-19}]){const p=project({l:54.7,...q});assert(Math.abs(p.x-(m[0]*q.a+m[2]*q.b+m[4]))<1e-8);assert(Math.abs(p.y-(m[1]*q.a+m[3]*q.b+m[5]))<1e-8);}
}
assert.equal(rasters,count,'Camera projection reuses raster');
for(const L of [0,100]){const s=get(L);assert(s.endpoint);assert.equal(s.href,null);const svg=surface.svg(L,c.labColor,c.fitLabToSRGB,p=>c.projectLab(p,480,300),'test');assert(!svg.includes('<image'));assert(svg.includes('<circle'));}
for(let L=20;L<40;L++)get(L);assert.equal(surface.stats().entries,8,'Cache stays bounded');
assert.throws(()=>get(NaN),/finite/);
console.log('PASS: continuous opaque raster; real sRGB edge coverage, saturated selections, exact camera projection, edge-on/endpoints and bounded raster reuse.');

const cached=get(54.7);assert.equal(typeof cached.contour,'string','Cache invariant SVG contour with raster');
assert.equal((cached.contour.match(/[ML]/g)||[]).length,cached.points.length);
assert(cached.contour.startsWith('M')&&cached.contour.endsWith('Z'));
assert.equal(surface.get(54.7,c.labColor,c.fitLabToSRGB).contour,cached.contour);
console.log('PASS invariant SVG contour is serialized once per cached lightness.');
