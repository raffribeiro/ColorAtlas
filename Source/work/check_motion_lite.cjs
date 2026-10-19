// motion-lite: embedded in canonical, same call shape as the Motion subset it replaced.
// Usage: node work/check_motion_lite.cjs [canonical.html]
const fs = require('fs'), vm = require('vm'), path = require('path'), assert = require('node:assert/strict');
const canonical = process.argv[2] || '/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const html = fs.readFileSync(canonical, 'utf8'), lite = fs.readFileSync(path.join(__dirname, 'atlas-motion-lite.js'), 'utf8');
assert.equal(html.match(/<script id="atlas-motion-vendor" data-version="atlas-lite-1">\n([\s\S]*?)<\/script>/)?.[1], lite, 'embedded motion-lite matches work/atlas-motion-lite.js');
assert(!html.includes('Motion B.V.'), 'Motion 14 bundle removed');

function load() {
  let now = 0; const q = [], el = [];
  const ctx = { performance: { now: () => now }, requestAnimationFrame: cb => (q.push(cb), q.length), cancelAnimationFrame() {}, getComputedStyle: () => ({ opacity: '1' }), Math, Promise, window: {} };
  vm.createContext(ctx); vm.runInContext(lite, ctx);
  const tick = (ms = 8) => { now += ms; q.splice(0).forEach(cb => cb(now)); };
  return { M: ctx.window.Motion, tick, el };
}
// Selection pulse as called by atlas-motion-ui: reference values sampled from Motion 14 (8 ms frames).
{
  const { M, tick } = load(); const out = []; let done = false;
  const a = M.animate(1, [1, 1.56, 1], { duration: .24, delay: 0, times: [0, .16, 1], ease: [[.16, 1, .3, 1], [.22, 1, .36, 1]], onUpdate: v => out.push(v) });
  a.finished.then(() => { done = true; });
  for (let i = 0; i < 40; i++) tick();
  const ref = { 0: 1.5302, 2: 1.4447, 4: 1.1753, 7: 1.0333, 10: 1.0040 }; // frame index (16 ms steps from 16 ms) -> Motion 14 value
  for (const [k, v] of Object.entries(ref)) assert(Math.abs(out[2 * k + 1] - v) < .002, `pulse at ${16 * (+k + 1)} ms: ${out[2 * k + 1]} vs Motion ${v}`);
  assert.equal(out.at(-1), 1, 'ends at rest');
  setTimeout(() => assert(done, 'finished resolves'), 0);
}
// Cancel stops updates and resolves finished.
{
  const { M, tick } = load(); let n = 0, resolved = false;
  const a = M.animate(0, [0, 1], { duration: 1, onUpdate: () => n++ }); tick(); a.cancel(); a.finished.then(() => { resolved = true; });
  const before = n; tick(); tick(); assert.equal(n, before, 'no updates after cancel');
  setTimeout(() => assert(resolved, 'cancel resolves finished'), 0);
}
// Element keyframes: shorthand transforms, from-values, per-segment easing, springs, delay and fill.
{
  const { M } = load(); const calls = [];
  const el = { animate(frames, opts) { const a = { frames, opts, cancel() { a.canceled = true; }, finished: Promise.resolve() }; calls.push(a); return a; }, style: {} };
  M.animate(el, { scale: [.75, 1.22, 1], rotate: [-12, 8, 0] }, { duration: .34, ease: [.22, 1, .36, 1] });
  let c = calls.at(-1);
  assert.deepEqual(Array.from(c.frames, f => f.transform), ['rotate(-12deg) scale(0.75)', 'rotate(8deg) scale(1.22)', 'rotate(0deg) scale(1)']);
  assert.deepEqual(Array.from(c.frames, f => f.offset), [0, .5, 1]);
  assert.equal(c.frames[0].easing, 'cubic-bezier(0.22,1,0.36,1)', 'Motion applies the ease to each segment');
  assert.equal(c.opts.duration, 340); assert.equal(c.opts.fill, 'both');
  M.animate(el, { scale: .94, y: 1 }, { duration: .09 });                       // press: single values start from the last tracked values
  c = calls.at(-1); assert.deepEqual(Array.from(c.frames, f => f.transform), ['translateY(0px) scale(1)', 'translateY(1px) scale(0.94)']);
  M.animate(el, { scale: 1.025, y: -1 }, { type: 'spring', duration: .3, bounce: .28 }); // release springs from the pressed state
  c = calls.at(-1); assert.deepEqual(Array.from(c.frames, f => f.transform), ['translateY(1px) scale(0.94)', 'translateY(-1px) scale(1.025)']);
  assert(c.opts.easing.startsWith('linear(0,') && c.opts.easing.split(',').some(v => parseFloat(v) > 1), 'spring easing overshoots like a bounce');
  M.animate(el, { opacity: [.7, 1], y: [-4, 0] }, { duration: .16, delay: .05 });
  c = calls.at(-1); assert.deepEqual(Array.from(c.frames, f => [f.opacity, f.transform]), [[.7, 'translateY(-4px)'], [1, 'translateY(0px)']]); assert.equal(c.opts.delay, 50);
}
setTimeout(() => console.log('PASS: motion-lite embedded; selection pulse matches Motion 14 within 0.002; cancel/finished; element keyframes, from-values, per-segment easing, springs, delay and fill.'), 5);
