// The guide's interactive examples must use the editor's own color math.
// Compares AtlasDocMath (work/atlas-documentation-examples.js) with the canonical
// oklabLinear / labColor / rgbToLab / gradientSample on seeded random ramps.
const fs = require('fs'), vm = require('vm'), assert = require('assert');
const canonical = process.argv[2] || '/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const source = fs.readFileSync(canonical, 'utf8');
const examples = fs.readFileSync(__dirname + '/atlas-documentation-examples.js', 'utf8');
assert(source.includes(examples.trim()), 'Canonical source embeds the current examples module');
const colorMath = source.slice(source.indexOf('function oklabLinear('), source.indexOf('function toLch('));
const evaluator = source.slice(source.indexOf('function gradientSample('), source.indexOf('function gradientSelected('));
const app = {}; vm.createContext(app); vm.runInContext('const state={};' + colorMath + '\n' + evaluator + '\nthis.gradientSample=gradientSample;this.labColor=labColor;this.rgbToLab=rgbToLab;', app);
const block = examples.slice(examples.indexOf('// doc-math-start'), examples.indexOf('// doc-math-end'));
const doc = {}; vm.createContext(doc); vm.runInContext(block + '\nthis.M=AtlasDocMath;', doc);
const M = doc.M;
let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const randHex = () => '#' + Array.from({ length: 3 }, () => Math.floor(rnd() * 256).toString(16).padStart(2, '0')).join('');
let checks = 0;
for (let r = 0; r < 200; r++) {
  const n = 2 + Math.floor(rnd() * 6), keys = Array.from({ length: n }, (_, i) => ({ t: i === 0 ? 0 : i === n - 1 ? 1 : rnd(), hex: randHex() }));
  const alphas = [{ t: 0, a: 1 }, { t: 1, a: 1 }];
  for (const mode of ['smooth', 'bands']) for (let i = 0; i <= 40; i++) {
    const t = i / 40, a = app.gradientSample(t, keys, alphas, mode).rgb, b = M.sample(t, keys, mode);
    a.forEach((v, j) => assert(Math.abs(v - b[j]) < 1e-12, `sample mismatch ${mode} t=${t}`)); checks++;
  }
}
for (let i = 0; i < 2000; i++) {
  const l = rnd() * 100, a = (rnd() - .5) * 300, b = (rnd() - .5) * 300, ref = app.labColor(l, a, b);
  assert.equal(M.hex(M.lin(l, a, b)), ref.hex); assert.equal(!M.inside(M.lin(l, a, b)), ref.outside);
  const h = randHex(), p = app.rgbToLab(h), q = M.lab(h); assert(Math.abs(p.l - q[0]) + Math.abs(p.a - q[1]) + Math.abs(p.b - q[2]) < 1e-9);
  const f = M.fit(l, a, b); assert(M.inside(M.lin(...f)) && Math.abs(f[0] - l) < 1e-12); checks += 3;
}
// Linear-RGB export blends decoded channels (documented formula).
const lin = M.sample(.5, [{ t: 0, hex: '#1464e8' }, { t: 1, hex: '#ffbd32' }], 'linear');
['#1464e8', '#ffbd32'].map(M.rgb).reduce((p, q) => p.map((v, j) => (v + q[j]) / 2)).forEach((v, j) => assert(Math.abs(v - lin[j]) < 1e-12));
console.log(`PASS: guide examples match the editor's OKLab conversion, gamut flag, key decoding and Smooth/Bands evaluator (${checks} comparisons); linear-RGB export formula verified.`);
