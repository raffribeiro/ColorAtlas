/* Color Atlas motion-lite: the part of Motion's animate() this app calls, on the Web Animations API.
   animate(element, {opacity, x, y, scale, scaleX, scaleY, rotate}, {duration, delay, ease, times, type:'spring', bounce})
   animate(number, number[], {duration, delay, ease, times, onUpdate}). Returns {cancel(), finished}. */
(() => {
 const bez = (x1, y1, x2, y2) => {
  const f = (t, a, b) => 3 * a * (1 - t) ** 2 * t + 3 * b * (1 - t) * t * t + t ** 3;
  return x => { if (x <= 0 || x >= 1) return x; let lo = 0, hi = 1; for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; f(m, x1, x2) < x ? lo = m : hi = m; } return f((lo + hi) / 2, y1, y2); };
 };
 const OUT = [0, 0, .58, 1], seg = (ease, i) => Array.isArray(ease?.[0]) ? ease[i] || ease.at(-1) : Array.isArray(ease) ? ease : OUT;
 // Duration-based spring: damping 1 − bounce; stiffness fitted to Motion 14 (max error 0.015).
 const spring = (duration, bounce = .25) => {
  const z = Math.min(1, Math.max(.05, 1 - bounce)), w = 7.1 / (z * duration), d = w * Math.sqrt(Math.max(1e-6, 1 - z * z));
  return p => { const t = p * duration, e = Math.exp(-z * w * t); return z >= 1 ? 1 - e * (1 + w * t) : 1 - e * (Math.cos(d * t) + z * w / d * Math.sin(d * t)); };
 };
 const offsets = (n, times) => times?.length === n ? times : Array.from({ length: n }, (_, i) => n > 1 ? i / (n - 1) : 1);
 const done = p => p.then(() => {}, () => {});

 function tween(from, keys, o) {
  const values = keys.length > 1 ? keys : [from, ...keys], at = offsets(values.length, o.times), ms = (o.duration ?? .3) * 1000, delay = (o.delay || 0) * 1000;
  const springEase = o.type === 'spring' ? spring(o.duration ?? .3, o.bounce) : null, eases = values.slice(1).map((_, i) => springEase || bez(...seg(o.ease, i)));
  let raf = 0, start = performance.now(), stop, resolve;
  const finished = new Promise(r => resolve = r);
  const value = p => { let i = 1; while (i < values.length - 1 && p > at[i]) i++; const span = at[i] - at[i - 1] || 1, q = Math.min(1, Math.max(0, (p - at[i - 1]) / span)); return values[i - 1] + (values[i] - values[i - 1]) * eases[i - 1](q); };
  const step = now => { if (stop) return; const p = Math.min(1, Math.max(0, (now - start - delay) / (ms || 1))); o.onUpdate?.(value(p)); if (p < 1 && !stop) raf = requestAnimationFrame(step); else { stop = true; resolve(); } };
  raf = requestAnimationFrame(step);
  return { cancel() { stop = true; cancelAnimationFrame(raf); resolve(); }, stop() { this.cancel(); }, finished };
 }

 const last = new WeakMap(), BASE = { opacity: 1, x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1, rotate: 0 };
 function element(el, props, o) {
  if (!el?.animate) return { cancel() {}, stop() {}, finished: Promise.resolve() };
  const prev = last.get(el) || {}, tracks = {};
  for (const [k, v] of Object.entries(props)) {
   if (!(k in BASE)) continue;
   const from = prev[k] ?? (k === 'opacity' ? parseFloat(getComputedStyle(el).opacity) : BASE[k]);
   tracks[k] = Array.isArray(v) ? v.length > 1 ? v : [from, v[0]] : [from, v];
  }
  last.set(el, { ...prev, ...Object.fromEntries(Object.entries(tracks).map(([k, v]) => [k, v.at(-1)])) });
  const n = Math.max(2, ...Object.values(tracks).map(v => v.length)), at = offsets(n, o.times), get = (v, i) => v[Math.min(i, v.length - 1)];
  const isSpring = o.type === 'spring', ms = (o.duration ?? .3) * 1000;
  const frames = at.map((offset, i) => {
   const f = { offset }, t = tracks;
   if (t.opacity) f.opacity = get(t.opacity, i);
   const tf = (t.x ? `translateX(${get(t.x, i)}px) ` : '') + (t.y ? `translateY(${get(t.y, i)}px) ` : '') + (t.rotate ? `rotate(${get(t.rotate, i)}deg) ` : '') + (t.scale ? `scale(${get(t.scale, i)}) ` : '') + (t.scaleX ? `scaleX(${get(t.scaleX, i)}) ` : '') + (t.scaleY ? `scaleY(${get(t.scaleY, i)})` : '');
   if (tf) f.transform = tf.trim();
   if (!isSpring && i < n - 1) f.easing = `cubic-bezier(${seg(o.ease, i).join(',')})`;
   return f;
  });
  if (el.ownerSVGElement) { el.style.transformBox = 'fill-box'; el.style.transformOrigin = 'center'; }
  let easing = 'linear';
  if (isSpring) { const s = spring(ms / 1000, o.bounce); easing = `linear(${Array.from({ length: 33 }, (_, i) => +s(i / 32).toFixed(4)).join(',')})`; }
  const a = el.animate(frames, { duration: ms, delay: (o.delay || 0) * 1000, easing, fill: 'both' });
  return { cancel() { a.cancel(); }, stop() { a.cancel(); }, finished: done(a.finished) };
 }

 const animate = (target, keyframes, options = {}) => typeof target === 'number' ? tween(target, [].concat(keyframes), options) : element(target, keyframes, options);
 window.Motion = { animate, version: 'atlas-lite-1' };
})();
