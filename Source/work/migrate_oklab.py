from pathlib import Path
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html');s=p.read_text();a=s.index('function labColor(');b=s.index('function toLch()',a)
s=s[:a]+'''// OKLab reference: https://bottosson.github.io/posts/oklab/
// UI coordinates retain L 0..100 and chromatic axes scaled by 250.
function oklabLinear(l,a,b){l/=100;a/=250;b/=250;const ll=(l+.3963377774*a+.2158037573*b)**3,mm=(l-.1055613458*a-.0638541728*b)**3,ss=(l-.0894841775*a-1.291485548*b)**3;return [4.0767416621*ll-3.3077115913*mm+.2309699292*ss,-1.2684380046*ll+2.6097574011*mm-.3413193965*ss,-.0041960863*ll-.7034186147*mm+1.707614701*ss];}
function labColor(l,a,b){const linear=oklabLinear(l,a,b),outside=linear.some(v=>v<-.00001||v>1.00001),channels=linear.map(v=>{v=Math.max(0,Math.min(1,v));return Math.round(255*(v<=.0031308?12.92*v:1.055*v**(1/2.4)-.055));});return {hex:'#'+channels.map(v=>v.toString(16).padStart(2,'0')).join(''),outside};}
function rgbToLab(hex){const [r,g,b]=hex.match(/[a-f0-9]{2}/gi).map(s=>{const v=parseInt(s,16)/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}),ll=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),mm=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),ss=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);return {l:100*(.2104542553*ll+.793617785*mm-.0040720468*ss),a:250*(1.9779984951*ll-2.428592205*mm+.4505937099*ss),b:250*(.0259040371*ll+.7827717662*mm-.808675766*ss)};}
const oklabKeyCache=new Map();
function cachedOKLab(hex){if(!oklabKeyCache.has(hex)){if(oklabKeyCache.size>512)oklabKeyCache.clear();const q=rgbToLab(hex);oklabKeyCache.set(hex,[q.l,q.a,q.b]);}return oklabKeyCache.get(hex);}
'''+s[b:]
old="return {rgb:interpolate(colors,k=>k.hex.match(/[a-f0-9]{2}/gi).map(n=>decodeSRGB(parseInt(n,16)/255))),alpha:interpolate(alphas,k=>[k.a])[0]};"
assert old in s;s=s.replace(old,"const q=interpolate(colors,k=>cachedOKLab(k.hex));return {rgb:oklabLinear(...q).map(v=>Math.max(0,Math.min(1,v))),alpha:interpolate(alphas,k=>[k.a])[0]};",1)
# Change visible terminology, keeping legacy identifiers for compatibility.
s=s.replace('CIELAB','OKLab').replace('Lab color','OKLab color').replace('Lab hue','OKLab hue').replace('Lab volume','OKLab volume').replace('in Lab.','in OKLab.').replace('Use Lab color','Use OKLab color').replace('L* ${color.l.toFixed(1)}','L ${color.l.toFixed(1)}%')
p.write_text(s)
