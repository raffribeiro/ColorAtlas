(() => {
const root = document.getElementById('munsell-picker');
if (!root || root.querySelector('#atlas-tour')) return;
const store = window.AtlasOnboardingStore || { get: () => null, set() {} };
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = s => root.querySelector(s);
const visible = el => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2 && getComputedStyle(el).visibility !== 'hidden'; };

const preview = () => $('.mp-explosion-previews');
const shownPresets = () => [...root.querySelectorAll('.studio-library [data-studio-preset]')].filter(visible);
const keyList = () => $('.studio-keys .studio-key-row')?.parentElement;
const solid = () => $('svg.mp-vfx-lab');
const sliders = () => [...($('.studio-author-layout')?.children || [])].filter(el => !el.classList.contains('mp-vfx-visuals'));
let cameraDemoTimer=0,cameraOrbitFrame=0,cameraOrbitResolve=null,cameraRelease=null;
function stopCameraDemo(){
 clearTimeout(cameraDemoTimer);cameraDemoTimer=0;
 cancelAnimationFrame(cameraOrbitFrame);cameraOrbitFrame=0;
 const resolve=cameraOrbitResolve;cameraOrbitResolve=null;resolve?.(null);
 cameraRelease?.();
}
async function orbit(dx, dy, ms = 520) {
 const svg = solid(); if (!svg) return;
 const r = svg.getBoundingClientRect(), x0 = r.left + 24, y0 = r.bottom - 24;
 const ev = (type, x, y, buttons) => new PointerEvent(type, { bubbles: true, cancelable: true, composed: true, pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0, buttons, clientX: x, clientY: y });
 let lastX=x0,lastY=y0,released=false;
 const release=()=>{if(released)return;released=true;if(cameraRelease===release)cameraRelease=null;svg.dispatchEvent(ev('pointerup',lastX,lastY,0));window.dispatchEvent(ev('pointerup',lastX,lastY,0));};
 cameraRelease=release;svg.dispatchEvent(ev('pointerdown', x0, y0, 1));
 const here=at,start=performance.now();let last=0;
 while(!layer.hidden&&at===here){
  const now=await new Promise(res=>{cameraOrbitResolve=res;cameraOrbitFrame=requestAnimationFrame(now=>{cameraOrbitFrame=0;cameraOrbitResolve=null;res(now);});});if(now===null||layer.hidden||at!==here)break;
  const t=Math.min(1,(now-start)/ms);if(now-last<1000/30&&t<1)continue;last=now;
  const e=1-(1-t)**3,x=x0+dx*e,y=y0+dy*e;
  lastX=x;lastY=y;svg.dispatchEvent(ev('pointermove', x, y, 1)); window.dispatchEvent(ev('pointermove', x, y, 1));
  if(t===1)break;
 }
 release();
}
function selectKey(n) {
 const row = [...root.querySelectorAll('.studio-key-row')].find(r => new RegExp('^\\s*' + n + '\\b').test(r.textContent));
 row?.querySelector('[data-gradient-select]')?.click();
}
function rotationHandHint(r,m){
 if(!r)return null;const dx=Math.min(88,r.width*.22),left=r.left+r.width*.16;let top=r.top+Math.min(r.height*.74,r.height-56);
 if(m&&top<m.top+m.height+16&&top+44>m.top-16)top=r.top+r.height*.18;
 return {left,top,width:1,height:1,dx};
}
// Zoom the 3D view
function zoom3D(steps) {
 const svg = solid(); if (!svg) return;
 const r = svg.getBoundingClientRect();
 for (let i = 0; i < steps; i++) svg.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: -100, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }));
}
let tilted = false;
const MISSIONS = [
 { title: 'Pick your colors', icon: '◆', steps: [
  { target: keyList, watch: preview, free: true, title: 'Choose a color key', text: 'A gradient is made of <b>color keys</b>. Select a key from the list to edit its color. Watch the Preview as you make changes.', task: 'Tap any color key', done: { click: '[data-gradient-select]' } },
  { target: () => $('.studio-wheel'), watch: preview, free: true, before: () => selectKey(4), title: 'Paint with the wheel', text: 'Key <b>4</b> is selected. Drag inside the wheel to change <b>hue</b> and <b>chroma</b> (color strength). Lightness stays the same.', task: 'Drag inside the color wheel', done: { pointerup: '.studio-wheel svg' } },
  { target: solid, watch: preview, before: () => selectKey(4), title: 'The color solid', text: 'Key <b>4</b> is selected in this 3D color map. <b>Lightness</b> goes up from black to white. <b>Hue</b> goes around the gray axis. <b>Chroma</b> increases outward. This arrangement was inspired by Munsell; the app uses OKLab.' },
  { target: solid, watch: preview, free: true, hand: () => $('svg.mp-vfx-lab .lab-current-marker'), before: () => { selectKey(4); if (!tilted) { tilted = true; const here=at; cameraDemoTimer=setTimeout(async () => { cameraDemoTimer=0;if(layer.hidden||at!==here)return;await orbit(0,105);if(!layer.hidden&&at===here)zoom3D(2); },350); } }, title: 'Your gradient in 3D', text: 'The numbered circles are your <b>color keys</b>; the dashed line connects them in gradient order. Drag the selected circle, key <b>4</b>, to change its color. The view tilts to help you see the available colors.', task: 'Drag the selected circle to recolor it', done: { pointerup: 'svg.mp-vfx-lab' } },
  { target: () => [solid(), $('#lab-auto-rotate')?.closest('label')], watch: preview, free: true, gesture: 'rotate', title: 'Look around', text: 'Drag away from the selected circle to <b>rotate</b>. Scroll to zoom; middle-drag to pan. <b>Shift-drag</b> always rotates. Use <b>Reset view</b> to return to the starting angle, or enable <b>Rotation</b> for an automatic spin.', task: 'Rotate the view', done: { pointerup: 'svg.mp-vfx-lab', change: '#lab-auto-rotate' } },
  { target: sliders, watch: preview, title: 'Fine-tune', text: 'Use <b>Lightness</b>, the two color axes and <b>Saturation</b> for precise adjustments. You can also enter a HEX color and press <b>Apply</b>. <b>Lock base to sRGB</b> keeps slider edits within the displayable range.' },
  { target: () => [$('.studio-ramp'), keyList()], split: true, watch: preview, free: true, title: 'Shape the gradient', text: 'Drag a marker to change where its color appears in the ramp. <b>Smooth</b> blends colors; <b>Bands</b> creates hard steps. Click empty ramp space to add a key.', task: 'Move a marker, pick a key or switch Smooth / Bands', done: { pointerup: 'svg.mp-gradient', change: '#artist-transition', click: '[data-gradient-select]' } },
  { target: () => [$('[data-action="gradient-add"]')?.parentElement, $('#gradient-position')?.parentElement, [...root.querySelectorAll('[data-copy-hex]')].find(visible)], split: true, pad: 6, watch: preview, title: 'Key tools', text: 'Use <b>+</b> to add a key or <b>−</b> to remove the selected key (at least two remain). <b>Position</b> places a key precisely. <b>Copy HEX</b> copies its color for use elsewhere.' },
  { target: () => $('.atlas-history-controls'), pad: 8, title: 'Undo and Redo', text: 'Use <b>Undo</b> to reverse an edit and <b>Redo</b> to bring it back. The last 10 edits are kept; a complete drag counts as one. Shortcuts: Ctrl/⌘+Z and Ctrl/⌘+Shift+Z.' }
 ] },
 { title: 'See them in action', icon: '◉', steps: [
  { target: () => [$('.mp-explosion-previews'), $('[data-preview-camera="reset"]')], split: true, title: 'Live preview', text: 'Dark image pixels use the <b>left</b> of the ramp; bright pixels use the <b>right</b>. Scroll to zoom and middle-drag to pan. <b>Reset view</b> fits the image in the Preview.' },
  { target: () => $('#preview-layer-list'), watch: preview, title: 'Layers', text: 'Each image has its own ramp. Select a layer to edit it, or Shift-click to select several. The checkbox controls visibility. Layers higher in the list appear in front.' },
  { target: () => ['add', 'replace', 'rename', 'remove', 'up', 'down', 'export'].map(a => $(`[data-preview-action="${a}"]`)), pad: 5, watch: preview, title: 'Build the scene', text: 'Use <b>+</b> to add an image and <b>Replace image</b> to keep the layer while changing its picture. Rename, remove or reorder layers with the other controls. <b>Export Preview</b> downloads the composite as a PNG.' },
  { target: () => $('#preview-opacity')?.parentElement, live: true, pad: 5, watch: preview, title: 'Blend and opacity', text: '<b>Blend mode</b> controls how the selected layer mixes with the layers behind it. Try <b>Add</b> for light or <b>Multiply</b> to darken. <b>Opacity</b> controls its contribution.' },
  { target: () => $('[data-preview-action="normalize-values"]')?.closest('label'), live: true, pad: 5, watch: preview, title: 'Normalize values', text: 'Enable <b>Normalize values</b> to stretch this image’s dark-to-light range across the whole ramp. Turn it off to use the original range. This setting belongs to the selected layer.' },
  { target: () => [...root.querySelectorAll('#preview-layer-list .preview-layer-random')].filter(visible), pad: 6, watch: preview, free: true, before: prepareRandom, title: 'Choose what Random can touch', text: 'We loaded the <b>Default</b> explosion for this exercise. The <b>ON / OFF</b> chips control which layers Random recolors. Keep at least one layer ON. The next step will use your choice.', task: 'Switch a chip ON or OFF', done: { click: '.preview-layer-random' } },
  { target: () => [$('[data-action="random-all-layers"]'), $('#random-type'), $('#random-type-options')], live: true, pad: 8, watch: preview, free: true, hand: () => $('[data-action="random-all-layers"]'), title: 'Roll the dice', text: 'Press <b>Random</b> to recolor the layers marked ON. We start with <b>Harmonic</b>; the menu offers other styles. Try a few results and use <b>Undo</b> to return to one you liked.', task: 'Press Random', done: { click: '[data-action="random-all-layers"]' } },
  { target: () => [$('#color-vision'), $('#color-vision-options')], live: true, pad: 8, watch: preview, free: true, title: 'See it as others do', text: 'Choose a <b>color-vision</b> simulation to inspect how colors may appear with different types of color vision. Drag the divider to compare it with Regular Vision. <b>Grayscale</b> helps you check light–dark contrast.', task: 'Pick a vision mode', done: { change: '#color-vision', click: '#color-vision-options [role="option"], #color-vision-options li, #color-vision-options button' } },
  { target: () => [$('.studio-attention-control'), $('#explosion-bloom')?.parentElement], split: true, watch: preview, before: () => { const vision = $('#color-vision'); vision.value = 'normal'; vision.dispatchEvent(new Event('change', { bubbles: true })); }, title: 'Attention and bloom', text: 'We returned to <b>Regular Vision</b>. The <b>eye</b> highlights up to three areas of visual attention. <b>Bloom</b> adds glow to bright areas. Both affect the Preview display; they do not edit your ramp.' }
 ] },
 { title: 'Build your library', icon: '★', steps: [
  { target: () => $('.studio-library'), title: 'Browse the library', text: 'Open a folder to browse its presets. <b>Favorites</b> holds starred presets, and <b>My palettes</b> holds the palettes you save. Next, try finding a preset by name.' },
  { target: () => $('#studio-search'), pad: 8, title: 'Search presets', text: 'Search by name or theme. Try <b>fire</b>, <b>ice</b> or <b>smoke</b>. A matching result unlocks the next step.', task: 'Search for something', done: { input: '#studio-search' }, accept: () => shownPresets().length > 0, retry: () => 'No presets found. Try <b>fire</b>, <b>ice</b> or <b>smoke</b>.' },
  { target: () => $('.studio-library'), watch: preview, free: true, before: () => { if (!shownPresets().length) { const q = $('#studio-search'); if (q) { q.value = ''; q.dispatchEvent(new Event('input', { bubbles: true })); } } }, title: 'Apply a preset', text: 'Select a preset to replace the selected layer’s ramp. Try a few and watch the Preview. Use the <b>star</b> to keep a preset in Favorites.', task: 'Tap a preset', done: { click: '[data-studio-preset]' } },
  { target: () => $('[data-action="gradient-save"]'), pad: 10, title: 'Save your palette', text: '<b>Save palette</b> stores your ramp in <b>My palettes</b>. Give it a name so you can find and reuse it.' },
  { target: () => [$('.studio-folder-personal') || $('.studio-library'), $('.atlas-library-io')], split: true, title: 'My palettes', text: '<b>Export</b> backs up your library to a file. <b>Import</b> restores it or moves it to another browser or computer. Keep a backup before clearing browser data or moving the app.' },
  { target: () => $('.preview-preset-toolbar'), title: 'Save the whole scene', text: '<b>Preview presets</b> save the image stack and its ramps together. Use <b>New preset</b> to create one, then <b>Save</b> to update it after editing.' },
  { target: () => $('[data-action="gradient-png"]'), pad: 10, title: 'Ship it', text: '<b>Export PNG</b> opens the ramp export options. Save a lookup texture for your engine, or choose the Unity C# or Unreal JSON output. Documentation explains the engine setup.' }
 ] }
];
const GUIDE = { target: () => $('[data-studio-view="documentation"]'), pad: 6, title: 'Explore Documentation', text: 'Open <b>Documentation</b> in the top bar for interactive examples, control explanations and Unreal / Unity setup guides.' };
const FINAL = { target: () => $('.atlas-tour-tab'), pad: 6, title: 'Tutorial complete!', text: 'You’re ready to create. Open <b>Tutorial</b> in the top bar whenever you want to replay this tour.' };

const layer = document.createElement('div');
layer.id = 'atlas-tour'; layer.hidden = true;
layer.innerHTML = `<svg class="atlas-tour-shade" aria-hidden="true"><path fill-rule="evenodd"/></svg>
<div class="atlas-tour-hole" aria-hidden="true"></div><div class="atlas-tour-hole atlas-tour-hole-extra" aria-hidden="true" hidden></div><div class="atlas-tour-hole atlas-tour-hole-extra" aria-hidden="true" hidden></div><div class="atlas-tour-watch" aria-hidden="true"><span>Live preview</span></div><div class="atlas-tour-hand" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M12 4.5a2.5 2.5 0 0 1 5 0V14l7.2 1.6a3 3 0 0 1 2.3 3.4L25 28H12.6L6.4 19.3a2.2 2.2 0 0 1 3.3-2.8L12 18.8Z" fill="#fff" stroke="#141a26" stroke-width="1.6" stroke-linejoin="round"/></svg></div>
<section class="atlas-tour-card" role="dialog" aria-modal="false" aria-labelledby="atlas-tour-title" aria-describedby="atlas-tour-text" tabindex="-1">
 <div class="atlas-tour-badge" aria-hidden="true"><span></span></div>
 <header class="atlas-tour-head"><span class="atlas-tour-mission"></span></header>
 <div class="atlas-tour-xp" aria-hidden="true"><i></i></div>
 <h2 id="atlas-tour-title"></h2><p id="atlas-tour-text"></p>
 <p class="atlas-tour-task" role="status" aria-live="polite"></p>
 <footer class="atlas-tour-actions"><button type="button" class="atlas-tour-skip" data-tour="skip">Skip tutorial</button><span class="atlas-tour-spacer"></span><button type="button" data-tour="back">Back</button><button type="button" class="atlas-tour-primary" data-tour="next">Next</button></footer>
</section>
<canvas class="atlas-tour-confetti atlas-tour-sparks" aria-hidden="true"></canvas>`;
const toast = document.createElement('div');
toast.className = 'atlas-tour-toast'; toast.setAttribute('role', 'status'); toast.hidden = true; toast.textContent = 'Restoring your workspace…';
root.appendChild(toast);
root.appendChild(layer);
const card = layer.querySelector('.atlas-tour-card'), hole = layer.querySelector('.atlas-tour-hole'), hand = layer.querySelector('.atlas-tour-hand');
const extraRings = [...layer.querySelectorAll('.atlas-tour-hole-extra')];
const shade = layer.querySelector('.atlas-tour-shade'), shadePath = shade.querySelector('path'), watchRing = layer.querySelector('.atlas-tour-watch'), confetti = layer.querySelector('.atlas-tour-confetti');
const badge = card.querySelector('.atlas-tour-badge span');
const ui = { mission: card.querySelector('.atlas-tour-mission'), xp: card.querySelector('.atlas-tour-xp i'), title: card.querySelector('h2'), text: card.querySelector('#atlas-tour-text'), task: card.querySelector('.atlas-tour-task'), back: card.querySelector('[data-tour="back"]'), next: card.querySelector('[data-tour="next"]'), skip: card.querySelector('[data-tour="skip"]') };

const nav = $('.studio-workspace-nav');
const tab = document.createElement('button');
tab.type = 'button'; tab.className = 'studio-tab atlas-tour-tab'; tab.textContent = 'Tutorial'; tab.title = 'Replay the guided tour';
nav?.appendChild(tab);

async function prepareRandom() {
 const preset = $('#preview-preset-select');
 if (!preset || preset.disabled) throw Error('Preset unavailable');
 preset.value = 'codex-use-esse';
 preset.dispatchEvent(new Event('change', { bubbles: true }));
 while (preset.disabled) await new Promise(resolve => setTimeout(resolve, 50));
 if ($('#preview-preset-status')?.textContent) throw Error('Preset failed');
 const mode = $('#random-type');
 mode.value = 'auto'; mode.dispatchEvent(new Event('change', { bubbles: true }));
}

const LIBRARY_FIELDS = ['userPalettes', 'favoritePresets', 'favoriteDefaultsVersion', 'libraryFolders', 'atlasOnboarding'];
let requestSeq = 0;
function hostStore(action, payload) {
 return new Promise((resolve, reject) => {
  const id = 'atlas-tour-' + (++requestSeq) + '-' + Date.now();
  const timer = setTimeout(() => { removeEventListener('message', reply); reject(new Error('timeout')); }, 4000);
  function reply(e) { const d = e.data; if (e.source !== parent || d?.channel !== 'color-atlas-preview-store' || typeof d.id !== 'string' || d.id !== id || typeof d.ok !== 'boolean') return; clearTimeout(timer); removeEventListener('message', reply); d.ok ? resolve(d.payload) : reject(new Error('store')); }
  addEventListener('message', reply);
  try { parent.postMessage({ channel: 'color-atlas-preview-store', id, action, payload }, '*'); } catch (error) { clearTimeout(timer); removeEventListener('message', reply); reject(error); }
 });
}
const editorPart = state => { const m = { ...(state?.modelContent || state || {}) }; for (const k of LIBRARY_FIELDS) delete m[k]; return JSON.stringify(m); };
let snapshot = null;
async function takeSnapshot() {
 snapshot = { widget: store.current?.() || null, stack: window.AtlasTourPreviewSnapshot?.(), preset: $('#preview-preset-select')?.value };
 try { if (snapshot.stack === undefined) snapshot.stack = await hostStore('read'); } catch { /* host storage unavailable: editor state only */ }
}
async function restoreWorkspace() {
 const before = snapshot; snapshot = null;
 if (!before?.widget || !store.replace) return;
 await new Promise(r => setTimeout(r, 450)); // let the editor's debounced saves land first
 const now = store.current?.();
 let stackNow = window.AtlasTourPreviewSnapshot?.(); try { if (stackNow === undefined) stackNow = await hostStore('read'); } catch { stackNow = before.stack; }
 const changed = editorPart(now) !== editorPart(before.widget) || (before.stack !== undefined && JSON.stringify(stackNow) !== JSON.stringify(before.stack));
 if (!changed) return;
 toast.hidden = false;
 const keep = Object.fromEntries(LIBRARY_FIELDS.filter(k => now?.modelContent && k in now.modelContent).map(k => [k, now.modelContent[k]]));
 const merged = { ...before.widget, modelContent: { ...(before.widget.modelContent || before.widget), ...keep } };
 try {
  if (before.stack !== undefined) await hostStore('write', before.stack);
  store.set({ ...(store.get() || {}), skipSplash: true, restorePreview: { preset: before.preset } });
  await store.replace(merged);
 } catch { toast.hidden = true; return; }
 try { await hostStore('reload'); } catch {
  window.dispatchEvent(new CustomEvent('openai:set_globals', { detail: { globals: { widgetState: merged } } }));
  toast.hidden = true;
 }
}

let seq = [], at = 0, cleanupTask = null, frame = 0, skipTimer = 0;
function build() {
 seq = [{ kind: 'intro' }];
 MISSIONS.forEach((mission, m) => { seq.push({ kind: 'mission', m }); mission.steps.forEach((_, s) => seq.push({ kind: 'step', m, s })); seq.push({ kind: 'reward', m }); });
 seq.push({ kind: 'guide' }, { kind: 'final' });
}
const totalSteps = MISSIONS.reduce((n, m) => n + m.steps.length, 0);
function stepIndex(pos) { let n = 0; for (let i = 0; i < pos; i++) if (seq[i].kind === 'step') n++; return n; }

function start(fromButton = false) {
 if (!layer.hidden) return;
 if (root.dataset.view === 'documentation') root.querySelector('[data-studio-view="editor"]')?.click();
 build(); at = 0; tilted = false; layer.hidden = false; root.dataset.tour = 'on'; watchViewport(true);
 takeSnapshot();
 tab.setAttribute('aria-pressed', 'true');
 requestAnimationFrame(() => { if (!layer.hidden) show(fromButton ? 1 : 0); });
 startPlacement();
}
function finish(outcome) {
 if (ui.next.disabled) return;
 stopTask(); stopCameraDemo(); stopPlacement(); clearTimeout(skipTimer);
 clearTimeout(liveTimer); delete watchRing.dataset.live; stopSparks();
 layer.hidden = true; delete root.dataset.tour; tab.setAttribute('aria-pressed', 'false'); watchViewport(false);
 store.set({ status: outcome, version: 1, at: new Date().toISOString().slice(0, 10) });
 tab.focus({ preventScroll: true });
 if (tilted) $('[data-action="lab-reset-zoom"]')?.click();
 restoreWorkspace();
}

async function show(index) {
 stopCameraDemo(); stopTask(); clearTimeout(skipTimer);
 at = Math.max(0, Math.min(seq.length - 1, index));
 const item = seq[at];
 card.dataset.kind = item.kind;
 ui.task.textContent = ''; ui.task.hidden = true; ui.next.hidden = false; ui.back.hidden = at <= 1;
 ui.skip.textContent = item.kind === 'final' ? '' : 'Skip tutorial'; ui.skip.hidden = item.kind === 'final';
 const n = item.kind === 'step' ? stepIndex(at) : item.kind === 'final' ? totalSteps : stepIndex(at);
 ui.xp.style.width = `${Math.round(100 * n / totalSteps)}%`;
 if (item.kind === 'intro') {
  badge.textContent = '✦'; ui.mission.textContent = 'Welcome';
  ui.title.textContent = 'Welcome to Color Atlas';
  ui.text.innerHTML = 'Create <b>gradient maps</b> and <b>color palettes</b> for VFX. This tour covers editing colors, previewing images and saving your work. Try the highlighted controls, then choose <b>Next</b>. You can skip a step or leave at any time. Your previous workspace returns when you finish or leave.';
  ui.next.textContent = 'Tutorial'; ui.back.hidden = true; ui.skip.textContent = 'Not now';
  focusTarget(null);
 } else if (item.kind === 'mission') {
  const mission = MISSIONS[item.m];
  badge.textContent = mission.icon; ui.mission.textContent = `Step ${item.m + 1} of 3`;
  ui.title.textContent = mission.title;
  ui.text.innerHTML = item.m === 0 ? 'Select a key, edit its color and shape the ramp.' : item.m === 1 ? 'Work with image layers, try Random and inspect the result.' : 'Find a preset, save a palette and export your work.';
  ui.next.textContent = 'Start';
  focusTarget(null);
 } else if (item.kind === 'step') {
  const step = MISSIONS[item.m].steps[item.s];
  ui.mission.textContent = `Step ${item.m + 1} · ${MISSIONS[item.m].title}`;
  ui.title.textContent = step.title; ui.text.innerHTML = step.text; ui.next.textContent = 'Next';
  const preparation = step.before?.();
  if (preparation?.then) {
   focusTarget(null);
   for (const control of [ui.next, ui.back, ui.skip]) control.disabled = true;
   try { await preparation; }
   catch { ui.text.textContent = 'Default Preview could not load. Continue to the next step, or restart the tutorial when presets are ready.'; return; }
   finally { for (const control of [ui.next, ui.back, ui.skip]) control.disabled = false; }
  }
  const target = focusTarget(step);
  if (step.task && target) {
   ui.task.hidden = false; ui.task.innerHTML = `<span class="atlas-tour-task-icon">▶</span> ${step.task}`;
   ui.next.hidden = true; card.dataset.waiting = 'true';
   waitFor(step, e => succeed(step, e));
   skipTimer = setTimeout(() => { ui.next.hidden = false; ui.next.textContent = 'Skip step'; }, 6000);
  } else delete card.dataset.waiting;
 } else if (item.kind === 'reward') {
  badge.textContent = '✓'; ui.mission.textContent = `Step ${item.m + 1} complete`;
  ui.title.textContent = ['Colors explored', 'Preview explored', 'Library explored'][item.m];
  ui.text.innerHTML = `You finished <b>${MISSIONS[item.m].title.toLowerCase()}</b>. ${item.m < 2 ? 'Ready for the next step?' : 'One last thing…'}`;
  ui.next.textContent = item.m < 2 ? 'Next step' : 'Continue';
  focusTarget(null); burst();
 } else {
  badge.textContent = '✓'; ui.mission.textContent = 'All steps complete';
  const ending = item.kind === 'guide' ? GUIDE : FINAL;
  ui.title.textContent = ending.title; ui.text.innerHTML = ending.text;
  ui.next.textContent = item.kind === 'guide' ? 'Next' : 'Start creating';
  focusTarget(ending); if (item.kind === 'final') burst();
 }
 delete card.dataset.success;
 if (item.kind !== 'step' || !MISSIONS[item.m].steps[item.s].task) delete card.dataset.waiting;
 (ui.next.hidden ? card : ui.next).focus({ preventScroll: true }); queuePlace();
}

const STEP = 40, seen = new Set();
let sentinels = null, io = null, hostViewport = null;
addEventListener('message',e=>{const d=e.data;if(e.source!==parent||d?.channel!=='color-atlas-tour-viewport'||layer.hidden||!Number.isFinite(d.top)||!Number.isFinite(d.bottom)||d.bottom<=d.top)return;if(hostViewport?.top===Math.max(0,d.top)&&hostViewport?.bottom===d.bottom)return;hostViewport={top:Math.max(0,d.top),bottom:d.bottom};queuePlace();});
function watchViewport(on) {
 hostViewport=null;parent.postMessage({channel:'color-atlas-tour-viewport',active:on},'*');
 io?.disconnect(); sentinels?.remove(); sentinels = io = null; seen.clear();
 if (!on || typeof IntersectionObserver !== 'function') return;
 const H = Math.max(innerHeight, document.documentElement.scrollHeight);
 sentinels = document.createElement('div');
 sentinels.setAttribute('aria-hidden', 'true');
 sentinels.style.cssText = 'position:absolute;left:0;top:0;width:1px;height:0;pointer-events:none;opacity:0';
 io = new IntersectionObserver(entries => { for (const e of entries) { const k = Number(e.target.dataset.k); e.isIntersecting ? seen.add(k) : seen.delete(k); } queuePlace(); });
 for (let k = 0; k * STEP < H; k++) { const d = document.createElement('i'); d.dataset.k = k; d.style.cssText = `position:absolute;left:0;top:${k * STEP}px;width:1px;height:1px`; sentinels.appendChild(d); io.observe(d); }
 document.body.appendChild(sentinels);
}
const viewport = () => {
 if(hostViewport)return hostViewport;
 const H = Math.max(innerHeight, document.documentElement.scrollHeight);
 if (!seen.size) return { top: 0, bottom: Math.min(H, innerHeight) };
 const ks = [...seen];
 return { top: Math.max(0, Math.min(...ks) * STEP - STEP / 2), bottom: Math.min(H, Math.max(...ks) * STEP + STEP / 2) };
};
let active = null;
function resolve(step, isVisible = visible) {
 if (!step) return null;
 const found = [].concat(step.target?.() ?? []).filter(isVisible);
 return found.length ? found : null;
}
function focusTarget(step) {
 active = step ? { step, els: resolve(step), watch: [].concat(step.watch?.() ?? []).filter(visible) } : null;
 if (active && !active.watch.length) active.watch = null;
 if (active?.els) {
  const r = rectOf(active.els, 0), v = viewport();
  const narrow = innerWidth <= 640; // card goes below the target, so bring the target to the top
  if (narrow || r.t < v.top || r.b > v.bottom) active.els[0].scrollIntoView?.({ block: narrow || r.b - r.t > v.bottom - v.top ? 'start' : 'center', inline: 'nearest' });
 }
 layer.dataset.spot = active?.els ? 'on' : 'off';
 lastGeometry = '';
 observePlacementTargets(); queuePlace();
 return active?.els?.[0] || null;
}
function rectOf(els, pad, measure = e => e.getBoundingClientRect(), H = Math.max(innerHeight, document.documentElement.scrollHeight)) {
 const rs = els.map(measure);
 const l = Math.min(...rs.map(r => r.left)) - pad, t = Math.min(...rs.map(r => r.top)) - pad, r = Math.max(...rs.map(r => r.right)) + pad, b = Math.max(...rs.map(r => r.bottom)) + pad;
 return { l: Math.max(4, l), t: Math.max(4, t), r: Math.min(innerWidth - 4, r), b: Math.min(H - 4, b) };
}
const area = (a, b) => a && b ? Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t)) : 0;
function trim(w, boxes) {
 let q = { ...w };
 for (const b of boxes) {
  if (!area(q, b)) continue;
  const cuts = [{ ...q, t: b.b + 6 }, { ...q, b: b.t - 6 }, { ...q, l: b.r + 6 }, { ...q, r: b.l - 6 }].filter(c => c.r - c.l > 60 && c.b - c.t > 60);
  if (!cuts.length) return null;
  q = cuts.sort((x, y) => (y.r - y.l) * (y.b - y.t) - (x.r - x.l) * (x.b - x.t))[0];
 }
 return q;
}
let lastGeometry = '', lastSpot = null;
function place() {
 const measured=new Map(),measure=el=>{if(!measured.has(el))measured.set(el,el.getBoundingClientRect());return measured.get(el);};
 const isVisible=el=>{if(!el||el.isConnected===false)return false;const r=measure(el);return r.width>2&&r.height>2&&getComputedStyle(el).visibility!=='hidden';};
 const W = innerWidth, H = Math.max(innerHeight, document.documentElement.scrollHeight), v = viewport(), VT = v.top, VB = v.bottom;
 if (active?.step?.live || (active?.els && !active.els.every(isVisible))) active.els = resolve(active.step,isVisible) || active.els;
 const pad = active?.step?.pad ?? 12;
 const boxes = active?.els ? (active.step.split ? active.els.map(el => rectOf([el], pad,measure,H)) : [rectOf(active.els, pad,measure,H)]) : [];
 const box = boxes.length ? rectOf(active.els, pad,measure,H) : null; // union, for the hand and card placement
 const watch = box && active.watch?.length ? rectOf(active.watch, 8,measure,H) : null;
 const linked = watch ? trim(watch, boxes) : null;
 const cw = card.offsetWidth, ch = card.offsetHeight;
 const rotating=active?.step?.gesture==='rotate';
 const handNode=active?.step?.hand?.(),marker=rotating?$('svg.mp-vfx-lab .lab-current-marker'):null,graph=rotating?solid():null;
 const handAt=rotating?rotationHandHint(graph&&measure(graph),marker&&measure(marker)):handNode?measure(handNode):null;
 hand.dataset.gesture=rotating?'rotate':'tap';if(rotating&&handAt)hand.style.setProperty('--tour-drag-x',handAt.dx+'px');
 const geometry = JSON.stringify([W, H, VT, VB, cw, ch, card.dataset.kind, boxes, linked, handAt && [handAt.left | 0, handAt.top | 0]].map(x => x && typeof x === 'object' ? JSON.stringify(x) : x));
 if (geometry === lastGeometry) return;
 lastGeometry = geometry;
 const round = (q, rad = 10) => `M${q.l + rad} ${q.t}H${q.r - rad}A${rad} ${rad} 0 0 1 ${q.r} ${q.t + rad}V${q.b - rad}A${rad} ${rad} 0 0 1 ${q.r - rad} ${q.b}H${q.l + rad}A${rad} ${rad} 0 0 1 ${q.l} ${q.b - rad}V${q.t + rad}A${rad} ${rad} 0 0 1 ${q.l + rad} ${q.t}Z`;
 shade.setAttribute('width', W); shade.setAttribute('height', H); shade.setAttribute('viewBox', `0 0 ${W} ${H}`);
 shadePath.setAttribute('d', `M0 0H${W}V${H}H0Z` + boxes.map(q => round(q)).join('') + (linked ? round(linked) : ''));
 const ring = (el, q) => Object.assign(el.style, { left: q.l + 'px', top: q.t + 'px', width: (q.r - q.l) + 'px', height: (q.b - q.t) + 'px' });
 if (boxes[0]) ring(hole, boxes[0]);
 extraRings.forEach((el, i) => { const q = boxes[i + 1]; el.hidden = !q; if (q) ring(el, q); });
 if (handAt && handAt.width) { hand.style.left = (handAt.left + handAt.width / 2) + 'px'; hand.style.top = (handAt.top + handAt.height / 2) + 'px'; }
 else if (boxes[0]) { hand.style.left = (boxes[0].l + (boxes[0].r - boxes[0].l) / 2) + 'px'; hand.style.top = (boxes[0].t + (boxes[0].b - boxes[0].t) / 2) + 'px'; }
 watchRing.hidden = !linked;
 if (linked) ring(watchRing, linked);

 const m = 12, gap = 18, headroom = ['intro', 'mission', 'reward'].includes(card.dataset.kind) ? 40 : 12;
 const clampX = x => Math.max(m, Math.min(W - cw - m, x)), clampY = y => Math.max(VT + headroom, Math.min(VB - ch - m, y));
 let x = clampX((W - cw) / 2), y = clampY(VT + (VB - VT - ch) / 2), side = 'center';
 if (box) {
  const cx = (box.l + box.r) / 2, cy = (box.t + box.b) / 2, cands = [];
  for (const q of boxes.concat(boxes.length > 1 ? [box] : [])) {
   const qx = (q.l + q.r) / 2, qy = (q.t + q.b) / 2;
   cands.push(['right', q.r + gap, qy - ch / 2], ['left', q.l - gap - cw, qy - ch / 2], ['bottom', qx - cw / 2, q.b + gap], ['top', qx - cw / 2, q.t - gap - ch]);
  }
  cands.push(['sheet', (W - cw) / 2, VB - ch - m]);
  for (let gy = VT + headroom; gy <= VB - ch - m; gy += 36) for (let gx = m; gx <= W - cw - m; gx += 36) cands.push(['free', gx, gy]);
  let best = null;
  for (const [s, px, py] of cands) {
   const qx = clampX(px), qy = clampY(py), r = { l: qx, t: qy, r: qx + cw, b: qy + ch };
   const cost = 8 * area(r, linked) + 5 * boxes.reduce((n, b) => n + area(r, b), 0) + 0.6 * Math.hypot(qx + cw / 2 - cx, qy + ch / 2 - cy) + (s === 'free' ? 40 : 0) + (lastSpot && Math.abs(lastSpot[0] - qx) + Math.abs(lastSpot[1] - qy) < 2 ? -30 : 0);
   if (!best || cost < best[0]) best = [cost, s, qx, qy];
  }
  [, side, x, y] = best;
 }
 lastSpot = [x, y];
 card.style.left = Math.round(x) + 'px';
 card.style.top = Math.round(y) + 'px';
 card.dataset.side = side;
}
// On-demand tour placement
let placementOn=false,placementResize=null,placementMutation=null;
const placementTargets=new Set();
const PLACEMENT_EVENTS=['pointerdown','pointermove','pointerup','input','change','click','keydown','transitionend','animationend'];
function queuePlace(){
 if(!placementOn||layer.hidden||frame)return;
 frame=requestAnimationFrame(()=>{frame=0;if(!placementOn||layer.hidden)return;place();observePlacementTargets();});
}
function observePlacementTargets(){
 if(!placementResize)return;
 const next=new Set([root,card,...(active?.els||[]),...(active?.watch||[])].filter(el=>el&&el.isConnected!==false));
 for(const el of placementTargets)if(!next.has(el)){placementResize.unobserve(el);placementTargets.delete(el);}
 for(const el of next)if(!placementTargets.has(el)){placementTargets.add(el);placementResize.observe(el);}
}
function placementChanged(records){
 const movingHand=!!active?.step?.hand||active?.step?.gesture==='rotate';
 if(records.some(({target})=>!layer.contains(target)&&target!==toast&&(movingHand||!target.closest?.('svg,[data-field="lab-view-lightness"]'))))queuePlace();
}
function placementEvent(e){
 if(layer.contains(e.target)||(e.type==='pointermove'&&!e.buttons))return;
 queuePlace();
}
function startPlacement(){
 stopPlacement();placementOn=true;
 if(typeof ResizeObserver==='function'){placementResize=new ResizeObserver(queuePlace);observePlacementTargets();}
 if(typeof MutationObserver==='function'){placementMutation=new MutationObserver(placementChanged);placementMutation.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class','style','open']});}
 for(const type of PLACEMENT_EVENTS)root.addEventListener(type,placementEvent,{capture:true,passive:true});
 window.addEventListener('resize',queuePlace,{passive:true});window.addEventListener('scroll',queuePlace,{capture:true,passive:true});
 for(const type of PULSE_EVENTS)document.addEventListener(type,pulse,true);
 queuePlace();
}
function stopPlacement(){
 placementOn=false;cancelAnimationFrame(frame);frame=0;
 placementResize?.disconnect();placementMutation?.disconnect();placementResize=placementMutation=null;placementTargets.clear();
 for(const type of PLACEMENT_EVENTS)root.removeEventListener(type,placementEvent,true);
 window.removeEventListener('resize',queuePlace);window.removeEventListener('scroll',queuePlace,true);
 for(const type of PULSE_EVENTS)document.removeEventListener(type,pulse,true);
}
// End on-demand tour placement

function isTourDrag(start, e) {
 return !!start && Math.hypot(e.clientX - start.x, e.clientY - start.y) >= 4;
}
function waitFor(step, onDone) {
 let settle = 0, dragStart = null;
 const down = e => { if (e.isTrusted && e.button === 0 && !layer.contains(e.target) && e.target.closest?.(step.done.pointerup)) dragStart = { x: e.clientX, y: e.clientY }; };
 const cancel = () => { dragStart = null; };
 if (step.done.pointerup) { document.addEventListener('pointerdown', down, true); document.addEventListener('pointercancel', cancel, true); }
 const handlers = Object.entries(step.done).map(([type, selector]) => {
  const fn = e => {
   if ((!e.isTrusted && e.type.startsWith('pointer')) || !(e.target instanceof Element) || !e.target.closest(selector) || layer.contains(e.target)) return; // ignore the tour's own camera moves
   if (type === 'pointerup') { const moved = isTourDrag(dragStart, e); dragStart = null; if (!moved) return; }
   const query = String(e.target.value ?? '').trim();
   if (type === 'input' && !query) return;
   if (!step.accept) return onDone(e);
   clearTimeout(settle);
   settle = setTimeout(() => {
    if (step.accept()) onDone(e);
    else ui.task.innerHTML = `<span class="atlas-tour-task-icon">▶</span> <span class="atlas-tour-task-copy">${step.retry?.(query.replace(/[<>&]/g, '')) ?? step.task}</span>`;
   }, 260);
  };
  document.addEventListener(type, fn, true);
  return () => document.removeEventListener(type, fn, true);
 });
 cleanupTask = () => { clearTimeout(settle); handlers.forEach(off => off()); document.removeEventListener('pointerdown', down, true); document.removeEventListener('pointercancel', cancel, true); };
}
function stopTask() { cleanupTask?.(); cleanupTask = null; }
function succeed(step, e) {
 stopTask(); clearTimeout(skipTimer);
 card.dataset.success = 'true'; delete card.dataset.waiting;
 burstAt(e, hole);
 if (step?.free) {
  ui.task.innerHTML = '<span class="atlas-tour-task-icon">✓</span> Keep experimenting, or choose Next.';
  ui.next.hidden = false; ui.next.textContent = 'Next'; ui.next.focus({ preventScroll: true });
  return;
 }
 ui.task.innerHTML = '<span class="atlas-tour-task-icon">✓</span> Done.';
 const here = at;
 setTimeout(() => { if (!layer.hidden && at === here) show(at + 1); }, reduceMotion() ? 350 : 900);
}

let liveTimer = 0;
function pulse(e) {
 if ((!e.isTrusted && e.type.startsWith('pointer')) || layer.hidden || !active?.watch || watchRing.hidden || !(e.target instanceof Element) || layer.contains(e.target)) return;
 if (e.type === 'pointermove' && !(e.buttons & 1)) return;
 if (!active.els?.some(el => el.contains(e.target))) return;
 watchRing.dataset.live = 'true'; clearTimeout(liveTimer); liveTimer = setTimeout(() => delete watchRing.dataset.live, 700);
}
const PULSE_EVENTS=['pointerdown','pointermove','input','change','click'];

const SPARK_COLORS = ['#fff6e0', '#ffe2a0', '#ffc46b', '#ff9a5e', '#ff86d8', '#9cc3ff', '#7ff0c8'];
let sparks = [], sparkFrame = 0, sparkLast = 0;
function emit(x, y, { count = 24, power = 1, spread = Math.PI * 1.15, up = true } = {}) {
 if (reduceMotion()||layer.hidden) return;
 const c = confetti, v = viewport(), h = Math.max(200, Math.min(v.bottom - v.top, 2400));
 if (c.width !== innerWidth || c.height !== h) { c.width = innerWidth; c.height = h; }
 c.style.top = v.top + 'px'; c.style.height = h + 'px'; y -= v.top;
 const amount=Math.max(0,Math.min(count,64-sparks.length));
 for (let i = 0; i < amount; i++) {
  const ember = i % 4 === 0, ang = (up ? -Math.PI / 2 : 0) + (Math.random() - .5) * (up ? spread : Math.PI * 2);
  const speed = (ember ? 50 + Math.random() * 110 : 170 + Math.random() * 380) * power;
  const hot = Math.random();
  sparks.push({ x, y, px: x, py: y, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, age: 0,
   life: ember ? 1.6 + Math.random() * 1.2 : .7 + Math.random() * .7, w: ember ? 2 + Math.random() * 1.8 : 1.3 + Math.random() * 1.4,
   g: ember ? -45 : 420, drag: ember ? .97 : .945, ember, seed: Math.random() * 6.28,
   color: SPARK_COLORS[hot < .5 ? Math.floor(hot * 6) % 4 : 4 + Math.floor(Math.random() * 3)] });
 }
 if (!sparkFrame) { sparkLast = performance.now(); sparkFrame = requestAnimationFrame(stepSparks); }
}
function stopSparks(){cancelAnimationFrame(sparkFrame);sparkFrame=0;sparks=[];confetti.getContext('2d')?.clearRect(0,0,confetti.width,confetti.height);}
function stepSparks(now) {
 if(layer.hidden){stopSparks();return;}
 if(now-sparkLast<1000/30){sparkFrame=requestAnimationFrame(stepSparks);return;}
 const ctx = confetti.getContext('2d'), dt = Math.min(.033, (now - sparkLast) / 1000); sparkLast = now;
 ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, confetti.width, confetti.height);
 ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
 sparks = sparks.filter(p => (p.age += dt) < p.life && !layer.hidden);
 for (const p of sparks) {
  p.px = p.x; p.py = p.y;
  const k = Math.pow(p.drag, dt * 60); p.vx *= k; p.vy = p.vy * k + p.g * dt;
  if (p.ember) p.vx += Math.sin(p.age * 5 + p.seed) * 14 * dt;
  p.x += p.vx * dt; p.y += p.vy * dt;
  const t = 1 - p.age / p.life, flicker = p.ember ? .55 + .45 * Math.sin(p.age * 22 + p.seed) : 1;
  const tail = p.ember ? 1.5 : 4.5; // longer streaks for fast sparks
  ctx.globalAlpha = Math.max(0, t * flicker);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = p.color; ctx.lineWidth = p.w * (.4 + t);
  ctx.beginPath(); ctx.moveTo(p.x - (p.x - p.px) * tail, p.y - (p.y - p.py) * tail); ctx.lineTo(p.x, p.y); ctx.stroke();
  ctx.globalAlpha = Math.max(0, t * t * .9 * flicker); ctx.fillStyle = '#fffaf0';
  ctx.beginPath(); ctx.arc(p.x, p.y, p.w * .55 * (.5 + t), 0, 6.283); ctx.fill();
 }
 ctx.shadowBlur = 0; ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
 sparkFrame = sparks.length ? requestAnimationFrame(stepSparks) : 0;
 if (!sparkFrame) ctx.clearRect(0, 0, confetti.width, confetti.height);
}
function burst() {
 requestAnimationFrame(() => {
  const x = parseFloat(card.style.left) + card.offsetWidth / 2, y = parseFloat(card.style.top) + card.offsetHeight / 2;
  emit(x, y, { count: 32, power: 1.05, up: false });
 });
}
function burstAt(e, fallback) {
 let x = e?.clientX, y = e?.clientY;
 if (!(x > 0 || y > 0) || e?.type === 'input' || e?.type === 'change') {
  const r = (e?.target?.getBoundingClientRect ? e.target : fallback)?.getBoundingClientRect?.();
  if (!r) return; x = r.left + r.width / 2; y = r.top + r.height / 2;
 }
 emit(x, y, { count: 12, power: .6, up: false });
}

ui.next.addEventListener('click', () => { if (seq[at].kind === 'final') finish('done'); else show(at + 1); });
ui.back.addEventListener('click', () => { let i = at - 1; while (i > 0 && seq[i].kind === 'reward') i--; show(i); });
ui.skip.addEventListener('click', () => finish('skipped'));
tab.addEventListener('click', () => layer.hidden ? start(true) : finish('skipped'));
shadePath.addEventListener('pointerdown', e => { e.preventDefault(); card.animate?.([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 260 }); });
document.addEventListener('keydown', e => {
 if (layer.hidden) return;
 if (ui.next.disabled) { e.preventDefault(); return; }
 if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish('skipped'); }
 else if (layer.contains(e.target) && (e.key === 'ArrowRight') && !ui.next.hidden) { e.preventDefault(); ui.next.click(); }
 else if (layer.contains(e.target) && e.key === 'ArrowLeft' && !ui.back.hidden) { e.preventDefault(); ui.back.click(); }
}, true);

window.AtlasOnboarding = { start: () => start(true), stop: () => finish('skipped'), get active() { return !layer.hidden; } };
if (!store.get()?.status) {
 const splash = document.getElementById('atlas-splash');
 const ready = () => root.dataset.boot !== 'loading' && !(splash && splash.open) && visible($('.studio-keys'));
 let tries = 0;
 const wait = () => { if (store.get()?.status || !layer.hidden) return; if (ready()) setTimeout(() => { if (!store.get()?.status && layer.hidden && ready()) start(false); }, 700); else if (++tries < 240) setTimeout(wait, 250); };
 wait();
}
})();
