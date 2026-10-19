from pathlib import Path
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
s=p.read_text().replace('data-action="gradient-remove">Remove key','data-action="gradient-blackbody">Black Body</button><button class="btn" type="button" data-action="gradient-remove">Remove key')
s=s.replace('Drag color keys below the ramp and alpha keys above it.','Click an empty area below the ramp to add a color key, or above it to add alpha. Drag keys to reposition them.')
pos=s.index("$('[data-action=\"gradient-add\"]').addEventListener")
code='''function blackbodyHex(kelvin){
 // Planck spectrum integrated against an analytic approximation of CIE 1931 curves.
 const gaussian=(w,m,left,right)=>Math.exp(-.5*((w-m)*(w<m?left:right))**2);
 let x=0,y=0,z=0;
 for(let w=380;w<=780;w+=5){const power=1/(w**5*Math.expm1(1.438776877e7/(w*kelvin)));
 const cx=1.056*gaussian(w,599.8,.0264,.0323)+.362*gaussian(w,442,.0624,.0374)-.065*gaussian(w,501.1,.049,.0382);
 const cy=.821*gaussian(w,568.8,.0213,.0247)+.286*gaussian(w,530.9,.0613,.0322);
 const cz=1.217*gaussian(w,437,.0845,.0278)+.681*gaussian(w,459,.0385,.0725);
 x+=power*cx;y+=power*cy;z+=power*cz;}
 const rgb=[3.2404542*x-1.5371385*y-.4985314*z,-.969266*x+1.8760108*y+.041556*z,.0556434*x-.2040259*y+1.0572252*z],peak=Math.max(...rgb);
 return rgbHex(rgb.map(v=>encodeSRGB(Math.max(0,v)/peak)));
}
$('[data-action="gradient-blackbody"]').addEventListener('click',()=>{state.gradientColors=[1000,1800,2700,4000,5500,6500,9000,12000].map(k=>({t:(k-1000)/11000,hex:blackbodyHex(k)}));state.gradientAlphas=[{t:0,a:1},{t:1,a:1}];state.gradientSelection={kind:'color',index:0};loadGradientColor();gradientChange();field('gradient-status').textContent='Black Body · 1000–12000 K · approximate CIE 1931 / Planck colors, normalized brightness, sRGB preview. Replaces the current ramp.';});
'''
s=s[:pos]+code+s[pos:]
s=s.replace("if(!g||e.button!==0)return;state.gradientSelection=", "if(e.button!==0)return;if(!g){const box=gradientSvg.getBoundingClientRect(),t=Math.max(0,Math.min(1,(e.clientX-box.left-gradientGeometry.left)/gradientGeometry.width)),kind=e.clientY-box.top<30?'alpha':'color',keys=kind==='color'?state.gradientColors:state.gradientAlphas;if(keys.length>=8){field('gradient-status').textContent='Maximum 8 keys per channel (Unity Gradient compatible).';return;}const sample=gradientSample(t);keys.push(kind==='color'?{t,hex:rgbHex(sample.rgb.map(encodeSRGB))}:{t,a:sample.alpha});state.gradientSelection={kind,index:keys.length-1};loadGradientColor();gradientChange();return;}state.gradientSelection=")
p.write_text(s)
