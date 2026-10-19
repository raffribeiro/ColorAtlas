// Onboarding: embedded modules in sync, state shim ordering, persistence through
// widget-state writes, and every tour target present in the editor markup.
const fs = require('fs'), vm = require('vm'), assert = require('assert'), path = require('path');
const canonical = process.argv[2] || '/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html';
const html = fs.readFileSync(canonical, 'utf8'), read = f => fs.readFileSync(path.join(__dirname, f), 'utf8');
const block = (tag, id) => html.match(new RegExp(`<${tag} id="${id}">\\n?([\\s\\S]*?)</${tag}>`))?.[1];
assert.equal(block('script', 'atlas-onboarding-state'), read('atlas-onboarding-state.js'), 'state shim differs from work/atlas-onboarding-state.js');
assert.equal(block('style', 'atlas-onboarding-style'), read('atlas-onboarding.css'), 'styles differ from work/atlas-onboarding.css');
assert.equal(block('script', 'atlas-onboarding-ui'), read('atlas-onboarding.js'), 'tour differs from work/atlas-onboarding.js');
assert.equal(block('style', 'atlas-brand-style'), read('atlas-brand.css'), 'header lockup styles differ from work/atlas-brand.css');
assert.equal(block('script', 'atlas-library-io-ui'), read('atlas-library-io.js'), 'library export/import differs from work/atlas-library-io.js');
assert.equal(block('style', 'atlas-library-io-style'), read('atlas-library-io.css'), 'library export/import styles differ');
assert(read('atlas-preview-storage.js').includes("'reload'"), 'host storage answers the tour and import reload request');
assert(html.includes('<h2 class="atlas-lockup" aria-label="Color Atlas VFX"><span class="atlas-lockup-mark" aria-hidden="true">Ca</span>') && !html.includes('>COLOR ATLAS</span>'), 'header uses the Color Atlas lockup');
assert(!/Prism|atlas-guide/.test(read('atlas-onboarding.js')), 'tour has no guide character');
assert(html.includes('<h1 id="atlas-splash-title"><span class="studio-brand">Color <span class="atlas-lockup-accent">Atlas</span></span> <small>VFX</small></h1>'), 'loading screen uses the shared wordmark');
assert(html.indexOf('id="atlas-brand-style"') < html.indexOf('<script id="atlas-splash-ui">'), 'brand tokens load before the splash');
assert(html.includes('<input id="lab-auto-rotate" type="checkbox" class="form-check-input">'), '3D rotation starts off');
assert(html.indexOf('id="atlas-onboarding-state"') < html.indexOf('const raw=JSON.parse'), 'shim must run before the editor writes widget state');
assert(html.length < 1_000_000 * 1.0 && Buffer.byteLength(html) < 1_000_000, 'canonical fragment below 1 MB');

// Persistence: saved progress is read back, and later editor writes keep it.
const writes = [];
const host = { widgetState: { modelContent: { gradientVersion: 1, atlasOnboarding: { status: 'done', version: 1 } } }, setWidgetState: s => { writes.push(s); return Promise.resolve(); } };
const ctx = { window: { openai: host } }; vm.createContext(ctx); vm.runInContext(read('atlas-onboarding-state.js'), ctx);
assert.equal(ctx.window.AtlasOnboardingStore.get().status, 'done', 'saved progress is restored');
host.setWidgetState({ modelContent: { gradientVersion: 1, x: 2 }, privateContent: null });
assert.equal(writes.at(-1).modelContent.atlasOnboarding.status, 'done', 'editor writes carry the progress');
assert.equal(writes.at(-1).modelContent.x, 2, 'editor fields are preserved');
const fresh = { widgetState: null, setWidgetState: s => { writes.push(s); } };
const ctx2 = { window: { openai: fresh } }; vm.createContext(ctx2); vm.runInContext(read('atlas-onboarding-state.js'), ctx2);
assert.equal(ctx2.window.AtlasOnboardingStore.get(), null, 'first launch has no progress');
fresh.setWidgetState({ modelContent: { a: 1 } }); assert(!('atlasOnboarding' in writes.at(-1).modelContent), 'nothing injected before completion');
ctx2.window.AtlasOnboardingStore.set({ status: 'skipped', version: 1 });
assert.equal(writes.at(-1).modelContent.atlasOnboarding.status, 'skipped'); assert.equal(writes.at(-1).modelContent.a, 1, 'completion keeps the latest editor state');

// Tour targets exist in the editor markup (selectors from atlas-onboarding.js).
const tour = read('atlas-onboarding.js');
assert(tour.includes("title: 'Explore Documentation'") && tour.includes("seq.push({ kind: 'guide' }, { kind: 'final' })"), 'separate Documentation card precedes completion');
assert(tour.includes('in the top bar for interactive examples'), 'final card explains where to open the guide and what it offers');
for (const marker of ['studio-keys', 'studio-key-row', 'data-gradient-select', 'studio-wheel', 'studio-author', 'studio-ramp', 'mp-gradient', 'id="artist-transition"', 'mp-explosion-previews', 'id="preview-layers"', 'data-action="random-all-layers"', 'id="color-vision"', 'studio-attention-control', 'id="explosion-bloom"', 'id="studio-search"', 'studio-library', 'data-action="gradient-save"', 'preview-preset-toolbar', 'data-action="gradient-png"', 'studio-workspace-nav', 'id="atlas-splash"']) {
  assert(html.includes(marker) || /studio-preset|studio-folder-personal/.test(marker), 'missing tour target in editor: ' + marker);
}
assert(tour.includes("'[data-studio-preset]'") && html.includes('studioPreset') || html.includes('data-studio-preset'), 'library preset buttons');
console.log('PASS: onboarding and header lockup synchronized, state shim before the editor, progress restored and preserved across editor writes, all tour targets present.');
