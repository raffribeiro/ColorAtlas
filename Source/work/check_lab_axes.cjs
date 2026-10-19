// 3D graph axes (v0.90.15): the Red–Green and Yellow–Blue axes lie on the
// selected-lightness plane and are colored with the OKLab colors in their own
// directions, so they agree with the slice dots they cross.
// Usage: node work/check_lab_axes.cjs [canonical.html]
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const canonical = process.argv[2] || '/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const source = fs.readFileSync(canonical, 'utf8');
const between = (a, b) => { const i = source.indexOf(a), j = source.indexOf(b, i); assert(i >= 0 && j > i, 'source slice ' + a); return source.slice(i, j); };
const svg = { clientWidth: 640, clientHeight: 420, setAttribute() {} };
const state = { system: 'vfx', vfx: { l: 62, a: 30, b: 12 }, gradientSelection: { kind: 'color', index: 0 }, gradientColors: [{ t: 1, hex: '#d0604f' }, { t: 0, hex: '#101010' }], lab: { l: 50, a: 0, b: 0 } };
const c = { state,window:{AtlasLabSurface:{svg:()=>''},AtlasNeutralAxis:{svg:()=>''}}, labView: { yaw: .25, pitch: -.75, zoom: 1, panX: 0, panY: 0 }, lab3dDrag: null, field: () => ({ style: {}, textContent: '' }), toLch: () => ({ l: 50, c: 0, h: 0 }),
  activeLabSvg: () => svg, activeLabColor: () => state.vfx, dpath: () => '', selectionStrokeSVG: () => '', markerAnimationDelay: () => '', vfxColors: () => ({ base: '#d0604f' }), Math, Map };
vm.createContext(c);
vm.runInContext(between('function oklabLinear(', 'const oklabKeyCache'), c);
vm.runInContext(between('const decodeSRGB=', 'function vfxAxisRange('), c);
vm.runInContext('var labVolume=[];' + between('function projectLab(', '// Two restrained OKLab spectra'), c);
vm.runInContext(between('function layoutLabLabels(', "for(const k of ['l','a','b'])$('#mp-cart-"), c);

const hue = hex => { const q = c.rgbToLab(hex); return { h: (Math.atan2(q.b, q.a) * 180 / Math.PI + 360) % 360, c: Math.hypot(q.a, q.b) }; };
const angleGap = (x, y) => Math.abs(((x - y) % 360 + 540) % 360 - 180);
for (const L of [35, 50, 62, 80]) {
  for (const yaw of [.25, 1.3, 2.6]) {
    state.vfx = { l: L, a: 20, b: 10 }; c.labView.yaw = yaw; c.drawLabPlane();
    const html = svg.innerHTML;
    const axis = id => { const m = html.match(new RegExp(`<line x1="([^"]+)" y1="([^"]+)" x2="([^"]+)" y2="([^"]+)" data-lab-axis="${id}"`)); assert(m, 'axis line ' + id); return m.slice(1).map(Number); };
    const center = c.projectLab({ l: L, a: 0, b: 0 }, svg.clientWidth, svg.clientHeight);
    for (const id of ['a', 'b']) {
      const [x1, y1, x2, y2] = axis(id);
      assert(Math.abs((x1 + x2) / 2 - center.x) < .01 && Math.abs((y1 + y2) / 2 - center.y) < .01, `${id} axis crosses the gray axis at the selected lightness L ${L}`);
      const stops = [...html.matchAll(new RegExp(`<linearGradient id="vfx-axis-${id}"[^>]*>([\\s\\S]*?)</linearGradient>`, 'g'))][0][1].match(/#[0-9a-f]{6}/gi);
      assert.equal(stops.length, 3);
      assert(hue(stops[1]).c < .6, 'middle stop is the neutral gray of that lightness');
      const want = id === 'a' ? [180, 0] : [270, 90];
      [stops[0], stops[2]].forEach((s, i) => {
        const q = hue(s);
        if (q.c > 4) assert(angleGap(q.h, want[i]) < 4, `${id} axis end ${i} has the hue of its direction at L ${L}: ${s} h ${q.h.toFixed(1)}`);
      });
    }
    const labels = Object.fromEntries([...html.matchAll(/<text[^>]*>(Red|Green|Yellow|Blue)<\/text>/g)].map(m => [m[1], true]));
    assert.equal(Object.keys(labels).length, 4, 'four chromatic axis labels');
  }
}
// The old L 50 axes are gone: at L 62 the a axis no longer passes through the L 50 center.
state.vfx = { l: 62, a: 20, b: 10 }; c.labView.yaw = .25; c.drawLabPlane();
const old = c.projectLab({ l: 50, a: 0, b: 0 }, svg.clientWidth, svg.clientHeight), m = svg.innerHTML.match(/<line x1="([^"]+)" y1="([^"]+)" x2="([^"]+)" y2="([^"]+)" data-lab-axis="a"/).slice(1).map(Number);
assert(Math.abs((m[1] + m[3]) / 2 - old.y) > 5, 'chromatic axes moved off L 50');
console.log('PASS: Red–Green and Yellow–Blue axes cross the gray axis on the selected-lightness plane at 4 lightnesses × 3 angles; end colors carry their direction’s OKLab hue and the middle is that lightness’s gray.');
