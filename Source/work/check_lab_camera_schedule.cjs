// Exercise editable gesture source without rebuilding the canonical HTML.
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

function fixture() {
  const frames = new Map(), draws = [], handlers = {};
  let nextFrame = 0, captured = false;
  const target = {
    clientWidth: 370, clientHeight: 240,
    addEventListener(type, callback) { handlers[type] = callback; },
    getScreenCTM() { return { inverse() { return {}; } }; },
    createSVGPoint() { return { matrixTransform() { return { x: this.x, y: this.y }; } }; },
    getBoundingClientRect() { return { width: 370, height: 240 }; },
    setAttribute() {},
    setPointerCapture() { captured = true; },
    hasPointerCapture() { return captured; },
    releasePointerCapture() { captured = false; }
  };
  const context = {
    state: { system: 'vfx', vfx: { l: 55, a: 0, b: 0 }, gradientSelection: { kind: 'color', index: 0 }, gradientColors: [{ hex: '#abcabc' }] },
    labView: { yaw: 0, pitch: .5, zoom: 1, panX: 0, panY: 0 },
    lab3dDrag: null, vfxLab: target, labPlane: { ...target, addEventListener() {} },
    projectLab() { return { x: 185, y: 120 }; },
    rgbToLab() { return { l: 55, a: 0, b: 0 }; },
    fitLabToSRGB(l, a, b) { return { l, a, b }; },
    requestAnimationFrame(callback) { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame(id) { frames.delete(id); },
    drawLabPlane() { draws.push({ ...context.labView }); },
    drawSystem() { throw Error('Camera gesture must not edit authored colors'); },
    remember() { throw Error('Camera gesture must not save authored colors'); },
    window: {}
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('work/atlas-lab-live-color.js', 'utf8'), context);
  const event = (x, y, button = 0, pointerId = 1) => ({ clientX: x, clientY: y, button, pointerId, preventDefault() {} });
  const tick = () => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback()); };
  return { context, handlers, frames, draws, event, tick };
}

for (const [button, mode] of [[0, 'rotate'], [1, 'pan']]) {
  const f = fixture();
  f.handlers.pointerdown(f.event(30, 30, button));
  assert.equal(f.context.lab3dDrag.mode, mode);
  for (let i = 1; i <= 24; i++) f.handlers.pointermove(f.event(30 + i, 30 + i / 2, button));
  assert.equal(f.draws.length, 0, 'Camera events defer rendering until the next frame');
  assert.equal(f.frames.size, 1, 'A camera event burst queues only one render');
  const latest = JSON.stringify(f.context.labView);
  f.tick();
  assert.equal(f.draws.length, 1);
  assert.equal(JSON.stringify(f.draws[0]), latest, 'The frame renders the latest camera state');
  f.handlers.pointermove(f.event(90, 60, button));
  assert.equal(f.frames.size, 1);
  f.handlers.pointerup(f.event(90, 60, button));
  assert.equal(f.draws.length, 2, 'Release flushes the final camera state synchronously');
  assert.equal(f.frames.size, 0, 'Release cancels the queued callback');
  assert.equal(f.context.lab3dDrag, null);
  f.tick();
  assert.equal(f.draws.length, 2, 'No renderer callback remains after release');
}

const f = fixture();
f.handlers.pointerdown(f.event(30, 30));
f.handlers.pointermove(f.event(60, 45));
f.handlers.pointercancel(f.event(60, 45, 0, 9));
assert.equal(f.frames.size, 1, 'Another pointer cannot cancel the active gesture');
f.handlers.pointercancel(f.event(60, 45));
assert.equal(f.draws.length, 1, 'Cancellation flushes the visible camera position');
assert.equal(f.frames.size, 0);
f.handlers.pointerdown(f.event(30, 30));
f.handlers.pointerup(f.event(30, 30));
assert.equal(f.draws.length, 1, 'A stationary camera click does not queue a redraw');
f.tick();
assert.equal(f.draws.length, 1, 'No callback leaks into the next gesture');
console.log('PASS: camera burst coalescing, latest state, final release/cancel flush, pointer ownership and no late renders.');
