// Color Atlas guide: interactive examples. Pure color math is shared with the
// check script (between the doc-math markers) and mirrors the editor's own
// oklabLinear / rgbToLab / gradientSample implementations.
(() => {
// doc-math-start
const AtlasDocMath = (() => {
 const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
 const dec = c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
 const enc = x => x <= .0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - .055;
 function lin(l, a, b) {
  l /= 100; a /= 250; b /= 250;
  const ll = (l + .3963377774 * a + .2158037573 * b) ** 3, mm = (l - .1055613458 * a - .0638541728 * b) ** 3, ss = (l - .0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * ll - 3.3077115913 * mm + .2309699292 * ss, -1.2684380046 * ll + 2.6097574011 * mm - .3413193965 * ss, -.0041960863 * ll - .7034186147 * mm + 1.707614701 * ss];
 }
 function rgb(hex) { return [1, 3, 5].map(i => dec(parseInt(hex.slice(i, i + 2), 16) / 255)); }
 function lab(hex) {
  const [r, g, b] = rgb(hex), ll = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b), mm = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b), ss = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b);
  return [100 * (.2104542553 * ll + .793617785 * mm - .0040720468 * ss), 250 * (1.9779984951 * ll - 2.428592205 * mm + .4505937099 * ss), 250 * (.0259040371 * ll + .7827717662 * mm - .808675766 * ss)];
 }
 const byte = x => Math.round(255 * enc(clamp(x)));
 const hex = linear => '#' + linear.map(v => byte(v).toString(16).padStart(2, '0')).join('');
 const inside = linear => linear.every(v => v >= -.00001 && v <= 1.00001);
 function fit(l, a, b) {
  if (inside(lin(l, a, b))) return [l, a, b];
  let lo = 0, hi = 1;
  for (let i = 0; i < 32; i++) { const k = (lo + hi) / 2; if (inside(lin(l, k * a, k * b))) lo = k; else hi = k; }
  return [l, lo * a, lo * b];
 }
 // mode: 'smooth' (OKLab, the editor), 'linear' (linear-RGB export), 'bands'
 function sample(t, keys, mode = 'smooth') {
  const sorted = [...keys].sort((p, q) => p.t - q.t), value = k => mode === 'linear' ? rgb(k.hex) : lab(k.hex);
  let v;
  if (t <= sorted[0].t) v = value(sorted[0]);
  else if (t >= sorted[sorted.length - 1].t) v = value(sorted[sorted.length - 1]);
  else {
   let i = 1; while (mode === 'bands' ? sorted[i].t <= t : sorted[i].t < t) i++;
   const p = sorted[i - 1], q = sorted[i], w = mode === 'bands' ? 0 : (t - p.t) / (q.t - p.t || 1), pv = value(p), qv = value(q);
   v = pv.map((x, j) => x + (qv[j] - x) * w);
  }
  return (mode === 'linear' ? v : lin(...v)).map(x => clamp(x));
 }
 return { clamp, dec, enc, lin, rgb, lab, byte, hex, inside, fit, sample };
})();
// doc-math-end
const root = typeof document !== 'undefined' && document.getElementById('munsell-picker');
const panel = root && root.querySelector('#atlas-documentation');
if (!panel) return;
const { clamp, dec, enc, lin, lab, byte, hex, inside, fit, sample } = AtlasDocMath;

const K = (...pairs) => pairs.map(([t, h]) => ({ t, hex: h }));
const RAMPS = {
 fire: K([0, '#000000'], [.072, '#120202'], [.2, '#650B06'], [.4, '#CB2A08'], [.6, '#FF790C'], [.8, '#FFCC45'], [1, '#FFF9DC']),
 smoke: K([0, '#101215'], [.55, '#4b4f57'], [1, '#c9ccd1']),
 ice: K([0, '#06101e'], [.45, '#1d5fa8'], [.8, '#7fd0f0'], [1, '#effbff']),
 alert: K([0, '#d7261e'], [.5, '#f2c12e'], [1, '#2fa84f']),
 toxic: K([0, '#10200a'], [.4, '#3f8f1b'], [.75, '#b6f23a'], [1, '#f6ffd0']),
 rainbow: K([0, '#6a2bd6'], [.2, '#2b6cd6'], [.4, '#22b5a8'], [.6, '#7fd13b'], [.8, '#f2c12e'], [1, '#e8582a'])
};
const BG = '#0e1621', BGL = AtlasDocMath.rgb(BG), INK = '#c9d9ed', MUTED = '#8fa4bb';
const VISION = {
 protanopia: [.152286, 1.052583, -.204868, .114503, .786281, .099216, -.003882, -.048116, 1.051998],
 deuteranopia: [.367322, .860646, -.227968, .280085, .672501, .047413, -.011820, .042940, .968881],
 tritanopia: [1.255528, -.076749, -.178779, -.078411, .930809, .147602, .004733, .691367, .303900],
 protanomaly: [.458064, .679578, -.137642, .092785, .846313, .060902, -.007494, -.016807, 1.024301],
 deuteranomaly: [.547494, .607765, -.155259, .181692, .781742, .036566, -.010410, .027275, .983136],
 tritanomaly: [1.017277, .027029, -.044306, -.006113, .958479, .047634, .006379, .248708, .744913],
 grayscale: [.2126, .7152, .0722, .2126, .7152, .0722, .2126, .7152, .0722]
};

// ---- shared helpers
const localeRenders=new Map();
function kit(fig) {
 const q = k => fig.querySelector(`[data-k="${k}"]`);
 const ctx = k => fig.querySelector(`[data-c="${k}"]`).getContext('2d');
 const val = k => { const el = q(k); return el.type === 'checkbox' ? el.checked : el.type === 'range' ? Number(el.value) : el.value; };
 const read = k => fig.querySelector(`[data-r="${k}"]`);
 // Capture authored defaults before the first render changes dependent controls
 // (Munsell chroma limits, disabled sliders, etc.). Reset repaints once and never
 // rebuilds the example, so caches and one-time pointer listeners stay intact.
 const controls = [...fig.querySelectorAll('[data-k]')];
 const defaults = controls.map(el => ({ el, value: el.value, checked: el.checked,
  disabled: el.disabled, min: el.getAttribute('min'), max: el.getAttribute('max') }));
 const outputs = [...fig.querySelectorAll('[data-o]')].map(el => ({ el, text: el.textContent }));
 return { q, ctx, val, read, on(render, resetState = () => {}) {
  for (const el of controls) el.addEventListener('input', () => {
   const o = fig.querySelector(`[data-o="${el.dataset.k}"]`);
   if (o) o.textContent = el.value + (o.dataset.u || '');
   render();
  });
  fig.querySelector('[data-doc-reset]')?.addEventListener('click', () => {
   for (const saved of defaults) {
    for (const attr of ['min', 'max']) {
     if (saved[attr] === null) saved.el.removeAttribute(attr);
     else saved.el.setAttribute(attr, saved[attr]);
    }
    saved.el.value = saved.value;
    saved.el.checked = saved.checked;
    saved.el.disabled = saved.disabled;
   }
   for (const saved of outputs) saved.el.textContent = saved.text;
   resetState();
   render();
  });
  localeRenders.set(fig,render);render();
 } };
}
function rampRow(ctx, x, y, w, h, colorAt) {
 for (let i = 0; i < w; i++) { ctx.fillStyle = hex(colorAt(w > 1 ? i / (w - 1) : 0)); ctx.fillRect(x + i, y, 1, h); }
}
function label(ctx, text, x, y, color = INK, size = 12, align = 'left', columnWidth = Infinity) {
 ctx.fillStyle = color; ctx.font = `${size}px system-ui,sans-serif`; ctx.textAlign = align; ctx.textBaseline = 'middle';
 const translated=globalThis.AtlasI18n?.t(String(text))||text,maxWidth=Math.max(1,Math.min(columnWidth,align==='center'?2*Math.min(x,ctx.canvas.width-x)-8:align==='right'?x-4:ctx.canvas.width-x-4));
 ctx.fillText(translated, x, y, maxWidth);
}
function clear(ctx) { ctx.fillStyle = BG; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); }
function swatch(h) { return `<span class="doc-ex-swatch" style="background:${h}"></span>`; }
function pointer(canvas, handler) {
 const at = e => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) * canvas.width / r.width, (e.clientY - r.top) * canvas.height / r.height]; };
 canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture?.(e.pointerId); handler(...at(e)); });
 canvas.addEventListener('pointermove', e => { if (e.buttons & 1) handler(...at(e)); });
}
// Seeded value noise (deterministic illustrations, no Math.random)
function noiseField(w, h, seed, scale, octaves = 4) {
 const hash = (x, y) => { let n = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 2147483647); n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967295; };
 const smooth = t => t * t * (3 - 2 * t);
 const vnoise = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = smooth(x - xi), yf = smooth(y - yi), a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1); return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf; };
 const out = new Float32Array(w * h);
 for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
  let v = 0, amp = .5, f = 1 / scale; for (let o = 0; o < octaves; o++) { v += amp * vnoise(x * f, y * f); amp *= .5; f *= 2; }
  out[y * w + x] = v / .9375;
 }
 return out;
}
function blob(w, h, cx, cy, r, field, gain = .7) { // radial mask disturbed by noise → [0,1]
 const out = new Float32Array(w * h);
 for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
  const d = Math.hypot((x - cx * w) / (r * w), (y - cy * h) / (r * w)) + (field[y * w + x] - .5) * gain;
  out[y * w + x] = clamp(1 - d);
 }
 return out;
}
function paint(ctx, w, h, pixel) { // pixel(i) → [linear r,g,b] composited
 const img = ctx.createImageData(w, h), d = img.data;
 for (let i = 0; i < w * h; i++) { const c = pixel(i); d[4 * i] = byte(c[0]); d[4 * i + 1] = byte(c[1]); d[4 * i + 2] = byte(c[2]); d[4 * i + 3] = 255; }
 ctx.putImageData(img, 0, 0);
}
const over = (c, a, under) => c.map((v, j) => v * a + under[j] * (1 - a));

// ---- examples
const examples = {
 munsell(fig) {
  const k=kit(fig),ctx=k.ctx('tree'),raw=JSON.parse(root.querySelector('#mp-data').textContent);
  const families=['R','YR','Y','GY','G','BG','B','PB','P','RP'],hues=families.map(h=>'5'+h);
  const names=['Red','Yellow-Red','Yellow','Green-Yellow','Green','Blue-Green','Blue','Purple-Blue','Purple','Red-Purple'];
  const available=(h,v)=>[0,...Object.entries(raw.samples[h]?.[v]||{}).filter(([,p])=>!p[1]).map(([c])=>+c)].sort((a,b)=>a-b);
  const nearest=(values,c)=>values.reduce((best,n)=>Math.abs(n-c)<Math.abs(best-c)?n:best,0);
  const color=(h,v,c)=>c?raw.samples[h][v][c][0]:raw.neutrals[v];
  const polygon=(points,fill,stroke='#101923',width=1)=>{ctx.beginPath();ctx.moveTo(...points[0]);for(const p of points.slice(1))ctx.lineTo(...p);ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();};
  const line=(p,q,ink,width=1)=>{ctx.beginPath();ctx.moveTo(...p);ctx.lineTo(...q);ctx.strokeStyle=ink;ctx.lineWidth=width;ctx.stroke();};
  k.on(()=>{
   const hi=clamp(Math.round(k.val('H')),0,9),h=hues[hi],v=k.val('V'),allowed=available(h,v),maximum=allowed.at(-1),c=nearest(allowed,k.val('C')),selected=color(h,v,c);
   fig.querySelector('[data-o="H"]').textContent=h+' · '+names[hi];k.q('H').setAttribute('aria-valuetext',h+' · '+names[hi]);
   k.q('C').max=maximum;k.q('C').disabled=maximum===0;k.q('C').value=c;k.q('C').setAttribute('aria-valuetext',c+'; available maximum '+maximum);fig.querySelector('[data-o="C"]').textContent=c;
   clear(ctx);
   // Schematic geometry; every displayed chip comes from the bundled Munsell table.
   const angle=i=>i*Math.PI/5+2.55,point=(r,a,value=v)=>[300+r*Math.cos(a),225-(value-5)*24+r*Math.sin(a)*.34];
   const arc=(r,a,b)=>Array.from({length:17},(_,j)=>point(r,a+(b-a)*j/16));
   const sectors=hues.map((hh,i)=>({i,a:angle(i)-Math.PI/10,b:angle(i)+Math.PI/10,depth:Math.sin(angle(i)),fill:color(hh,v,nearest(available(hh,v),c))}));
   const sector=s=>{const top=arc(180,s.a,s.b),inner=arc(155,s.a,s.b);polygon([...top,...top.toReversed().map(p=>[p[0],p[1]+12])],s.fill);polygon([...top,...inner.toReversed()],s.fill,s.i===hi?'#eef5ff':'#243445',s.i===hi?2:1);};
   for(const s of sectors.filter(s=>s.depth<0).sort((a,b)=>a.depth-b.depth))sector(s);
   const drawChroma=()=>{
   const a=angle(hi),step=218/Math.max(1,allowed.length-1);
   for(let j=1;j<allowed.length;j++){
    const r0=24+(j-1)*step,r1=24+j*step,poly=[point(r0,a-.105),point(r1,a-.105),point(r1,a+.105),point(r0,a+.105)];
    polygon(poly,color(h,v,allowed[j]),allowed[j]===c?'#fff':'#263747',allowed[j]===c?2:1);
    const p=point((r0+r1)/2,a);label(ctx,String(allowed[j]),p[0],p[1]-13,INK,11,'center');
   }
   };
   if(Math.sin(angle(hi))<0)drawChroma();
   // Neutral Value column, from black (0) to white (10).
   for(let n=0;n<10;n++){const y=225-(n-5)*24;polygon([[280,y],[320,y],[320,y-24],[280,y-24]],raw.neutrals[n]);}
   const cap=Array.from({length:33},(_,i)=>[300+20*Math.cos(i*Math.PI/16),105+6*Math.sin(i*Math.PI/16)]);polygon(cap,raw.neutrals[10]);
   for(const s of sectors.filter(s=>s.depth>=0).sort((a,b)=>a.depth-b.depth))sector(s);
   if(Math.sin(angle(hi))>=0)drawChroma();
   for(let n=0;n<=10;n+=2){const y=225-(n-5)*24;ctx.fillStyle=BG;ctx.fillRect(325,y-8,18,16);label(ctx,String(n),334,y,MUTED,11,'center');}
   const activeY=225-(v-5)*24;line([278,activeY],[322,activeY],'#e8f1ff',2);
   label(ctx,'Value ↑',300,69,INK,15,'center');label(ctx,'Selected Hue',454,30,MUTED,12);label(ctx,h+' · '+names[hi],454,51,INK,14);label(ctx,'White outline = selection',454,72,MUTED,11);label(ctx,'Chroma: gray → stronger',30,398,INK,13);
   for(let i=0;i<hues.length;i++){
    const p=point(225,angle(i));p[1]+=Math.sin(angle(i))>=0?16:-10;label(ctx,families[i],p[0],p[1],i===hi?'#ffffff':MUTED,12,'center');if(i===hi){ctx.beginPath();ctx.arc(p[0]-16,p[1],3,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();}
   }
   ctx.fillStyle=selected;ctx.fillRect(508,338,64,44);label(ctx,c?h+' '+v+'/'+c:'N '+v,540,400,INK,15,'center');
   k.read('out').innerHTML=`${swatch(selected)}<strong>${c?h+' '+v+'/'+c:'N '+v}</strong> · ${names[hi]} · ${selected.toUpperCase()} · available chroma: 0–${maximum}. ${c===0?'At zero chroma, every hue is the same gray.':'The outlined radial chip is your selected color.'}`;
  });
 },

 lookup(fig) {
  const k = kit(fig), ctx = k.ctx('ramp'), W = ctx.canvas.width;
  k.on(() => {
   const t = k.val('t'), x = Math.round(t * (W - 1));
   clear(ctx);
   for (let i = 0; i < W; i++) { const g = i / (W - 1); ctx.fillStyle = `rgb(${255 * g},${255 * g},${255 * g})`; ctx.fillRect(i, 8, 1, 30); }
   rampRow(ctx, 0, 54, W, 34, s => sample(s, RAMPS.fire));
   ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 1, 2, 3, 92); ctx.fillStyle = '#0b0f15'; ctx.fillRect(x, 2, 1, 92);
   const h = hex(sample(t, RAMPS.fire)), g = Math.round(255 * t);
   k.read('out').innerHTML = `Pixel brightness <strong>${g}</strong> → t = <strong>${t.toFixed(2)}</strong> → ${swatch(h)}<strong>${h.toUpperCase()}</strong>`;
  });
 },

 slice(fig) {
  const k = kit(fig), ctx = k.ctx('plane'), S = ctx.canvas.width, R = 90, half = S / 2;
  const toAB = (x, y) => [(x - half) / half * R, -(y - half) / half * R], toXY = (a, b) => [half + a / R * half, half - b / R * half];
  let pick = [0, 60], cachedL = null, base = null;
  const background = L => {
   const img = ctx.createImageData(S, S), d = img.data;
   for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const [a, b] = toAB(x, y), raw = lin(L, a, b), ok = inside(raw), c = ok ? raw : over(lin(...fit(L, a, b)), .13, BGL), i = 4 * (y * S + x);
    d[i] = byte(c[0]); d[i + 1] = byte(c[1]); d[i + 2] = byte(c[2]); d[i + 3] = 255;
   }
   return img;
  };
  pointer(ctx.canvas, (x, y) => { pick = toAB(x, y); render(); });
  function render() {
   const L = k.val('L'), useFit = k.val('fit');
   if (cachedL !== L) { base = background(L); cachedL = L; }
   ctx.putImageData(base, 0, 0);
   ctx.strokeStyle = '#ffffff22'; ctx.beginPath(); ctx.moveTo(half, 0); ctx.lineTo(half, S); ctx.moveTo(0, half); ctx.lineTo(S, half); ctx.stroke();
   label(ctx, 'Yellow', half, 12, MUTED, 11, 'center'); label(ctx, 'Blue', half, S - 12, MUTED, 11, 'center');
   label(ctx, 'Green', 6, half - 10, MUTED, 11); label(ctx, 'Red', S - 6, half - 10, MUTED, 11, 'right');
   const [a, b] = pick, raw = lin(L, a, b), out = !inside(raw), shown = useFit ? fit(L, a, b) : [L, a, b];
   const C = Math.hypot(shown[1], shown[2]), hue = Math.atan2(shown[2], shown[1]) || 0;
   const Cref = useFit ? Math.hypot(...fit(L, 100 * Math.cos(hue), 100 * Math.sin(hue)).slice(1)) : 100;
   const S_ = Cref > 1e-6 ? clamp(100 * C / Cref, 0, 100) : 0, h = hex(lin(...shown));
   const [px, py] = toXY(a, b), [fx, fy] = toXY(shown[1], shown[2]);
   if (useFit && out) { ctx.setLineDash([3, 3]); ctx.strokeStyle = '#ffffffaa'; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(fx, fy); ctx.stroke(); ctx.beginPath(); ctx.arc(px, py, 6, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
   ctx.lineWidth = 2; ctx.strokeStyle = '#ffffff'; ctx.fillStyle = h; ctx.beginPath(); ctx.arc(fx, fy, 8, 0, 7); ctx.fill(); ctx.stroke(); ctx.lineWidth = 1;
   const status = !out ? 'inside sRGB' : useFit ? 'outside sRGB → fitted (chroma reduced, lightness and hue kept)' : 'outside sRGB → HEX clipped (hue may shift)';
   k.read('out').innerHTML = `${swatch(h)}<strong>${h.toUpperCase()}</strong><br>L ${L.toFixed(0)} · a ${shown[1].toFixed(1)} · b ${shown[2].toFixed(1)}<br>Chroma ${C.toFixed(1)} · Saturation ${S_.toFixed(0)}%<br><span class="${out ? 'doc-ex-warn' : ''}">${status}</span>`;
  }
  k.on(render, () => { pick = [0, 60]; });
 },

 interp(fig) {
  const k = kit(fig), ctx = k.ctx('ramps'), W = ctx.canvas.width, X = 120, RW = W - X;
  k.on(() => {
   k.q('p').disabled = !k.val('mid');
   const keys = [{ t: 0, hex: k.val('c0') }, { t: 1, hex: k.val('c2') }];
   if (k.val('mid')) keys.push({ t: k.val('p') / 100, hex: k.val('c1') });
   clear(ctx);
   [['Smooth · OKLab', 'smooth'], ['Linear RGB', 'linear'], ['Bands', 'bands']].forEach(([name, mode], row) => {
    const y = 8 + row * 54;
    label(ctx, name, 0, y + 18, INK, 12, 'left', X-8);
    rampRow(ctx, X, y, RW, 36, t => sample(t, keys, mode));
   });
   for (const key of keys) { const x = X + key.t * (RW - 1); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(x, 160); ctx.lineTo(x - 5, 167); ctx.lineTo(x + 5, 167); ctx.fill(); }
  });
 },

 normalize(fig) {
  const k = kit(fig), img = k.ctx('img'), hist = k.ctx('hist'), S = img.canvas.width;
  const n = noiseField(S, S, 7, 46), shape = blob(S, S, .5, .55, .42, noiseField(S, S, 3, 60), .9);
  const g = new Uint8Array(S * S), alpha = new Float32Array(S * S);
  for (let i = 0; i < S * S; i++) { alpha[i] = clamp(shape[i] * 2.2); g[i] = Math.round(255 * (.25 + .45 * clamp(n[i] * .75 + shape[i] * .45 - .1))); }
  let lo = 255, hi = 0; for (let i = 0; i < S * S; i++) if (alpha[i] > 0) { lo = Math.min(lo, g[i]); hi = Math.max(hi, g[i]); }
  const lut = Array.from({ length: 256 }, (_, v) => sample(v / 255, RAMPS.fire));
  k.on(() => {
   const on = k.val('on'), value = v => on && hi > lo ? Math.round(255 * clamp((v - lo) / (hi - lo))) : v;
   paint(img, S, S, i => over(lut[value(g[i])], alpha[i], BGL));
   const bins = new Float32Array(64); for (let i = 0; i < S * S; i++) if (alpha[i] > 0) bins[value(g[i]) >> 2] += alpha[i];
   const HW = hist.canvas.width, HH = hist.canvas.height, top = Math.max(...bins), bw = HW / 64;
   clear(hist);
   for (let b = 0; b < 64; b++) { const h = (HH - 60) * bins[b] / top; hist.fillStyle = hex(lut[b * 4 + 2]); hist.fillRect(b * bw + .5, HH - 34 - h, bw - 1, h); }
   rampRow(hist, 0, HH - 26, HW, 14, t => sample(t, RAMPS.fire));
   const used = on ? [0, 255] : [lo, hi];
   label(hist, `ramp range used: ${Math.round(100 * used[0] / 255)}–${Math.round(100 * used[1] / 255)}%`, 4, 12, INK, 12);
   for (const v of used) { const x = v / 255 * (HW - 1); hist.fillStyle = '#ffffff'; hist.fillRect(x - .5, 24, 1.5, HH - 36); }
  });
 },

 blend(fig) {
  const k = kit(fig), ctx = k.ctx('out'), W = ctx.canvas.width, H = ctx.canvas.height;
  const smokeN = noiseField(W, H, 11, 38), smoke = blob(W, H, .5, .58, .55, noiseField(W, H, 5, 70), 1.1);
  const fireN = noiseField(W, H, 23, 22), fire = blob(W, H, .5, .55, .26, fireN, .8);
  const back = [], src = [];
  for (let i = 0; i < W * H; i++) {
   back.push({ c: sample(clamp(smokeN[i] * .9 + smoke[i] * .3 - .05), RAMPS.smoke), a: clamp(smoke[i] * 1.8) });
   const f = clamp(fire[i] * 1.6);
   src.push({ c: sample(clamp(f * .85 + fireN[i] * .2), RAMPS.fire), a: clamp(f * 2.2) });
  }
  const fn = { normal: (b, s) => s, multiply: (b, s) => b * s, screen: (b, s) => b + s - b * s, overlay: (b, s) => b <= .5 ? 2 * b * s : 1 - 2 * (1 - b) * (1 - s), add: (b, s) => Math.min(1, b + s) };
  k.on(() => {
   const blendFn = fn[k.val('mode')], op = k.val('op') / 100;
   paint(ctx, W, H, i => {
    const cb = over(back[i].c, back[i].a, BGL), as = src[i].a * op, cs = src[i].c; // backdrop is opaque after the background
    return cb.map((b, j) => (1 - as) * b + as * blendFn(b, cs[j]));
   });
  });
 },

 harmony(fig) {
  const k = kit(fig), wheel = k.ctx('wheel'), rampCtx = k.ctx('ramp'), S = wheel.canvas.width, c = S / 2;
  const OFF = { monochromatic: [0], analogous: [-25, 0, 25], complementary: [0, 180], split: [0, 150, 210], triadic: [0, 120, 240], tetradic: [0, 90, 180, 270], warm: [0, 25, 55], cool: [0, 30, 65] };
  const at = (L, h, C = 120) => fit(L, C * Math.cos(h * Math.PI / 180), C * Math.sin(h * Math.PI / 180));
  const ring = wheel.createImageData(S, S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
   const dx = x - c, dy = c - y, r = Math.hypot(dx, dy), i = 4 * (y * S + x);
   const col = r > c - 30 && r < c - 6 ? lin(...at(72, Math.atan2(dy, dx) * 180 / Math.PI)) : BGL;
   ring.data[i] = byte(col[0]); ring.data[i + 1] = byte(col[1]); ring.data[i + 2] = byte(col[2]); ring.data[i + 3] = 255;
  }
  k.on(() => {
   const mode = k.val('mode'), fixed = mode === 'warm' ? 35 : mode === 'cool' ? 200 : null, slider = k.q('h');
   slider.disabled = fixed !== null;
   const base = fixed ?? k.val('h'), hues = OFF[mode].map(o => (base + o + 360) % 360);
   wheel.putImageData(ring, 0, 0);
   hues.forEach((h, n) => {
    const a = h * Math.PI / 180, x = c + (c - 18) * Math.cos(a), y = c - (c - 18) * Math.sin(a);
    wheel.strokeStyle = '#ffffff55'; wheel.beginPath(); wheel.moveTo(c, c); wheel.lineTo(x, y); wheel.stroke();
    wheel.lineWidth = 2; wheel.strokeStyle = '#fff'; wheel.fillStyle = hex(lin(...at(72, h))); wheel.beginPath(); wheel.arc(x, y, n === 0 ? 11 : 8, 0, 7); wheel.fill(); wheel.stroke(); wheel.lineWidth = 1;
   });
   label(wheel, fixed !== null ? `${mode} · base ${fixed}°` : `base ${base}°`, c, c, INK, 12, 'center');
   const keys = Array.from({ length: 5 }, (_, i) => {
    const h = hues[i % hues.length], L = 24 + i * 17, C = mode === 'monochromatic' ? 30 + 15 * Math.sin(i * 1.3) : 55;
    return { t: i / 4, hex: hex(lin(...at(L, h, C))) };
   });
   const RW = rampCtx.canvas.width;
   clear(rampCtx);
   rampRow(rampCtx, 0, 10, RW, 70, t => sample(t, keys));
   keys.forEach((key, i) => {
    const y = 104 + i * 30;
    rampCtx.fillStyle = key.hex; rampCtx.fillRect(0, y, 22, 22);
    label(rampCtx, `${key.hex.toUpperCase()}  ·  L ${(24 + i * 17)}  ·  hue ${Math.round(hues[i % hues.length])}°`, 32, y + 11, INK, 12);
   });
  });
 },

 bloom(fig) {
  const k = kit(fig), ctx = k.ctx('out'), W = ctx.canvas.width, H = ctx.canvas.height, scale = W / 512;
  const n = noiseField(W, H, 41, 26), core = blob(W, H, .5, .52, .3, n, .9);
  const base = document.createElement('canvas'), hl = document.createElement('canvas'); base.width = hl.width = W; base.height = hl.height = H;
  const bctx = base.getContext('2d'), hctx = hl.getContext('2d'), hImg = hctx.createImageData(W, H);
  paint(bctx, W, H, i => { const f = clamp(core[i] * 1.7); return over(sample(clamp(f * .9 + n[i] * .15), RAMPS.fire), clamp(f * 2.5), BGL); });
  const src = bctx.getImageData(0, 0, W, H).data;
  for (let i = 0; i < W * H; i++) {
   const Y = .2126 * dec(src[4 * i] / 255) + .7152 * dec(src[4 * i + 1] / 255) + .0722 * dec(src[4 * i + 2] / 255);
   const z = clamp(Y - .45 + .15, 0, .3), h = Math.min(1, Math.max(Y - .45, z * z / .6) / Math.max(Y, 1e-6));
   hImg.data.set([src[4 * i], src[4 * i + 1], src[4 * i + 2], Math.round(255 * h)], 4 * i);
  }
  hctx.putImageData(hImg, 0, 0);
  k.on(() => {
   const B = k.val('b') / 100;
   ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none'; ctx.globalAlpha = 1; ctx.drawImage(base, 0, 0);
   for (const [radius, strength] of [[10, B], [3, .7 * B]]) {
    for (let s = strength; s > 1e-3; s -= 1) { ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = Math.min(1, s); ctx.filter = `blur(${radius * scale}px)`; ctx.drawImage(hl, 0, 0); }
   }
   ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = 'none';
  });
 },

 vision(fig) {
  const k = kit(fig), ctx = k.ctx('out'), W = ctx.canvas.width, X = 120, RW = W - X;
  k.on(() => {
   const keys = RAMPS[k.val('pal')], m = VISION[k.val('mode')];
   const sim = c => [0, 3, 6].map(r => clamp(m[r] * c[0] + m[r + 1] * c[1] + m[r + 2] * c[2]));
   clear(ctx);
   label(ctx, 'Regular', 0, 30, INK, 12, 'left', X-8); rampRow(ctx, X, 8, RW, 44, t => sample(t, keys));
   label(ctx, k.q('mode').selectedOptions[0].textContent, 0, 98, INK, 12, 'left', X-8); rampRow(ctx, X, 76, RW, 44, t => sim(sample(t, keys)));
   label(ctx, 'left end', X, 136, MUTED, 11); label(ctx, 'right end', W, 136, MUTED, 11, 'right');
  });
 },

 uv(fig) {
  const k = kit(fig), ctx = k.ctx('tex'), W = ctx.canvas.width, H = 120;
  const mix = (p, q, w) => p.map((v, j) => v + (q[j] - v) * w);
  k.on(() => {
   const texW = Number(k.val('w')), layers = Number(k.val('layers')), rowSel = k.q('row');
   rowSel.disabled = layers === 1; const row = layers === 1 ? 0 : Number(k.val('row')), t = k.val('t');
   const ramps = [RAMPS.fire, RAMPS.ice].slice(0, layers), texel = (r, i) => sample(texW > 1 ? i / (texW - 1) : 0, ramps[r]);
   const bilinear = (r, u) => { const c = clamp(u * texW - .5, 0, texW - 1), i = Math.floor(c), j = Math.min(texW - 1, i + 1); return mix(texel(r, i), texel(r, j), c - i); };
   clear(ctx);
   const rh = H / layers, cw = W / texW;
   for (let r = 0; r < layers; r++) for (let i = 0; i < texW; i++) { ctx.fillStyle = hex(texel(r, i)); ctx.fillRect(i * cw, r * rh, Math.ceil(cw), rh); }
   if (texW <= 64) { ctx.strokeStyle = '#00000055'; for (let i = 1; i < texW; i++) { ctx.beginPath(); ctx.moveTo(i * cw, 0); ctx.lineTo(i * cw, H); ctx.stroke(); } }
   ctx.strokeStyle = '#000'; for (let r = 1; r < layers; r++) { ctx.beginPath(); ctx.moveTo(0, r * rh); ctx.lineTo(W, r * rh); ctx.stroke(); }
   const u = (t * (texW - 1) + .5) / texW, v = layers === 1 ? .5 : row ? .75 : .25, cy = v * H;
   const mark = (x, dashed, color) => { ctx.setLineDash(dashed ? [4, 3] : []); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, cy, 9, 0, 7); ctx.stroke(); ctx.lineWidth = 1; ctx.setLineDash([]); };
   mark(t * W, true, '#ffffffaa'); mark(u * W, false, '#ffffff');
   label(ctx, '○ remapped u   ◌ naive u = t', 0, H + 18, MUTED, 11);
   const good = hex(bilinear(row, u)), naive = hex(bilinear(row, t)), want = hex(sample(t, ramps[row]));
   k.read('out').innerHTML = `u = <strong>${u.toFixed(4)}</strong>, v = <strong>${v}</strong> → ${swatch(good)}${good.toUpperCase()} (ramp value ${want.toUpperCase()})<br>`
    + `naive u = t → ${swatch(naive)}${naive.toUpperCase()}, shifted by ${(Math.abs(t - .5)).toFixed(2)} texel`;
  });
 },

 srgb(fig) {
  const k = kit(fig), ctx = k.ctx('out'), W = ctx.canvas.width, X = 120, RW = W - X;
  k.on(() => {
   const mode = k.val('mode');
   const shown = c => { const e = c.map(v => byte(v) / 255); return mode === 'once' ? e.map(dec) : mode === 'never' ? e : e.map(x => dec(dec(x))); };
   clear(ctx);
   label(ctx, 'Exported', 0, 30, INK, 12, 'left', X-8); rampRow(ctx, X, 8, RW, 44, t => sample(t, RAMPS.fire));
   label(ctx, 'In engine', 0, 90, INK, 12, 'left', X-8); rampRow(ctx, X, 68, RW, 44, t => shown(sample(t, RAMPS.fire)));
  });
 }
};

// Reuse the editor's rendered SVG without its controls or animated classes.
function mountDocVolume(host,source){
 if(!source?.innerHTML)return false;
 const copy=source.cloneNode(true);copy.removeAttribute('id');copy.setAttribute('class','doc-editor-volume');copy.setAttribute('role','img');copy.setAttribute('aria-label','Color Atlas 3D OKLab graph: faint sRGB cloud, continuous lightness surface and numbered gradient keys');copy.setAttribute('focusable','false');
 const originals=[...source.querySelectorAll('text')],clones=[...copy.querySelectorAll('text')];
 if(globalThis.AtlasI18n)clones.forEach((element,i)=>[...element.childNodes].forEach((node,j)=>{if(node.nodeType===3)node.nodeValue=globalThis.AtlasI18n.sourceText(originals[i].childNodes[j])??node.nodeValue;}));
 for(const node of copy.querySelectorAll('[id],[class],[stroke],[fill],[clip-path],[style]')){
  const id=node.getAttribute('id');if(id)node.setAttribute('id','doc-volume-'+id);
  for(const attr of ['stroke','fill','clip-path']){const value=node.getAttribute(attr);if(value?.includes('url(#'))node.setAttribute(attr,value.replace(/url\(#([^)]*)\)/g,'url(#doc-volume-$1)'));}
  node.removeAttribute('class');node.removeAttribute('style');
 }
 copy.querySelector('title').textContent='The Color Atlas OKLab graph';copy.querySelector('desc').textContent='An illustration copied from the editor: height is OKLab L, the horizontal plane contains a and b, and the numbered path is your gradient.';
 globalThis.AtlasI18n?.translateGraphic(copy);host.replaceChildren(copy);return true;
}

// ---- lazy start: build an example the first time its topic is shown
const started = new WeakSet();
function start() {
 if (panel.hidden) return;
 for (const article of panel.querySelectorAll('[data-doc-topic]')) {
  if (article.hidden) continue;
  for(const host of article.querySelectorAll('[data-doc-volume]'))if(!started.has(host)&&mountDocVolume(host,root.querySelector('.mp-vfx-lab')))started.add(host);
  for (const fig of article.querySelectorAll('[data-doc-example]')) {
   if (started.has(fig)) continue; started.add(fig);
   try { examples[fig.getAttribute('data-doc-example')]?.(fig); } catch (error) { console.error('[Color Atlas guide] example failed:', fig.getAttribute('data-doc-example'), error); }
  }
 }
}
new MutationObserver(start).observe(panel, { attributes: true, attributeFilter: ['hidden'], subtree: true });
window.addEventListener('atlas:localechange',()=>{for(const [fig,render]of localeRenders)if(fig.isConnected)render();});
start();
})();
