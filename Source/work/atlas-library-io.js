// Library backup: export My palettes, favorites and Preview presets to one JSON
// file, and import such a file (merging, never deleting). The library lives in
// this browser profile and file path, so this is the way to move or keep it.
(() => {
const root = document.getElementById('munsell-picker');
const store = window.AtlasOnboardingStore;
if (!root || !store || root.querySelector('.atlas-library-io')) return;
const FORMAT = 'color-atlas-library', BUILTIN = new Set(['codex-use-esse', 'temp-design']), BUDGET = 8 * 1024, MAX_LIBRARY_BYTES = 64 * 1024 * 1024;
let seq = 0;
function hostStore(action, payload) {
 return new Promise((resolve, reject) => {
  const id = 'atlas-io-' + (++seq) + '-' + Date.now();
  const timer = setTimeout(() => { removeEventListener('message', reply); reject(new Error('timeout')); }, 8000);
  function reply(e) { const d = e.data; if (e.source !== parent || d?.channel !== 'color-atlas-preview-store' || typeof d.id !== 'string' || d.id !== id || typeof d.ok !== 'boolean') return; clearTimeout(timer); removeEventListener('message', reply); d.ok ? resolve(d.payload) : reject(new Error('store')); }
  addEventListener('message', reply);
  try { parent.postMessage({ channel: 'color-atlas-preview-store', id, action, payload }, '*'); } catch (error) { clearTimeout(timer); removeEventListener('message', reply); reject(error); }
 });
}
const model = () => { const s = store.current() || window.openai?.widgetState || {}; return { state: s, m: s.modelContent || s }; };
const appVersion = () => (root.querySelector('.studio-credit')?.textContent.match(/v(\d+\.\d+\.\d+)/) || [])[1] || null;

// ---- UI: two quiet buttons on the PALETTES heading, plus a status line
const heading = root.querySelector('.studio-sidebar .studio-eyebrow');
const bar = document.createElement('span');
bar.className = 'atlas-library-io';
bar.innerHTML = '<button type="button" data-library-io="export" title="Save My palettes, favorites and Preview presets to a file">Export</button><button type="button" data-library-io="import" title="Add palettes, favorites and Preview presets from a Color Atlas library file">Import</button><input type="file" accept="application/json,.json" hidden data-library-io="file">';
heading?.classList.add('atlas-library-heading');
heading?.appendChild(bar);
const status = document.createElement('p');
status.className = 'atlas-library-status'; status.setAttribute('role', 'status'); status.hidden = true;
heading?.after(status);
let statusTimer = 0;
function say(text, keep = false) { status.textContent = text; status.hidden = false; clearTimeout(statusTimer); if (!keep) statusTimer = setTimeout(() => { status.hidden = true; }, 6000); }

async function exportLibrary() {
 say('Preparing library…', true);
 const { m } = model();
 const presets = [];
 try {
  for (const p of await hostStore('preset-list') || []) {
   if (BUILTIN.has(p.id)) continue;
   const doc = await hostStore('preset-read', { id: p.id });
   if (doc) presets.push({ id: p.id, name: p.name, doc });
  }
 } catch { say('Preview presets are unavailable here; exporting palettes and favorites only.', true); }
 const data = { format: FORMAT, version: 1, app: appVersion(), exportedAt: new Date().toISOString(),
  palettes: Array.isArray(m.userPalettes) ? m.userPalettes : [], favorites: Array.isArray(m.favoritePresets) ? m.favoritePresets : [],
  folders: m.libraryFolders && typeof m.libraryFolders === 'object' ? m.libraryFolders : {}, previewPresets: presets };
 const blob = new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' });
 const a = document.createElement('a');
 a.href = URL.createObjectURL(blob); a.download = `color-atlas-library-${data.exportedAt.slice(0, 10)}.json`;
 a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); // detached: in-document links are routed to the host as external links
 say(`Exported ${data.palettes.length} palette${data.palettes.length === 1 ? '' : 's'}, ${data.favorites.length} favorite${data.favorites.length === 1 ? '' : 's'} and ${presets.length} Preview preset${presets.length === 1 ? '' : 's'}.`);
}

async function importLibrary(file) {
 if (!file || !Number.isFinite(file.size) || file.size < 0 || file.size > MAX_LIBRARY_BYTES) return say('Choose a library JSON up to 64 MB.');
 let data;
 try { data = JSON.parse(await file.text()); } catch { return say('That file is not a Color Atlas library (invalid JSON).'); }
 if (data?.format !== FORMAT || data.version !== 1) return say('That file is not a Color Atlas library.');
 // Validate every collection before the first host request or state write.
 // Missing collections remain valid for older partial library backups.
 const record = v => v !== null && typeof v === 'object' && !Array.isArray(v);
 const array = (key, max, item) => data[key] === undefined || (Array.isArray(data[key]) && data[key].length <= max && data[key].every(item));
 if (!array('palettes', 256, p => record(p) && window.AtlasPreviewValidation?.palette(p) === true) ||
     !array('favorites', 2048, id => typeof id === 'string' && /^[a-z0-9_-]{1,120}$/i.test(id)) ||
     !array('previewPresets', 256, p => record(p) && typeof p.name === 'string' && record(p.doc) && p.doc.version === 1 && Array.isArray(p.doc.layers) && p.doc.layers.length <= 8 && p.doc.layers.every(record) && window.AtlasPreviewValidation?.document(p.doc) === true) ||
     (data.folders !== undefined && (!record(data.folders) || Object.keys(data.folders).length > 256))) return say('That library has invalid or too many entries.');
 say('Importing…', true);
 const { state, m } = model();
 // Palettes: add the ones not already present, within the storage budget.
 const palettes = Array.isArray(m.userPalettes) ? [...m.userPalettes] : [], ids = new Set(palettes.map(p => p?.id));
 let added = 0, skipped = 0;
 for (const p of Array.isArray(data.palettes) ? data.palettes : []) {
  if (!p || typeof p !== 'object' || ids.has(p.id)) continue;
  const next = [...palettes, p];
  if (new TextEncoder().encode(JSON.stringify(next)).length > BUDGET) { skipped++; continue; }
  palettes.push(p); ids.add(p.id); added++;
 }
 const favorites = [...new Set([...(Array.isArray(m.favoritePresets) ? m.favoritePresets : []), ...(Array.isArray(data.favorites) ? data.favorites : []).filter(id => typeof id === 'string' && /^[a-z0-9_-]{1,120}$/i.test(id))])];
 const newFavorites = favorites.length - (Array.isArray(m.favoritePresets) ? m.favoritePresets.length : 0);
 // Preview presets: saved under their id; a clash with a different preset gets a new id.
 let scenes = 0, sceneErrors = 0;
 try {
  const existing = new Map((await hostStore('preset-list') || []).map(p => [p.id, p.name]));
  for (const p of Array.isArray(data.previewPresets) ? data.previewPresets : []) {
   if (!p?.doc || typeof p.name !== 'string' || BUILTIN.has(p.id)) continue;
   let id = typeof p.id === 'string' && /^[-A-Za-z0-9]{1,64}$/.test(p.id) ? p.id : 'imported-' + Date.now().toString(36);
   if (existing.has(id) && existing.get(id) !== p.name) id = (id.slice(0, 50) + '-' + Date.now().toString(36)).slice(0, 64);
   try { await hostStore('preset-save', { id, name: p.name.slice(0, 64), doc: p.doc }); existing.set(id, p.name); scenes++; } catch { sceneErrors++; }
  }
 } catch { sceneErrors += (data.previewPresets || []).length; }
 const merged = { ...state, modelContent: { ...m, userPalettes: palettes, favoritePresets: favorites } };
 await store.replace(merged);
 const parts = [`${added} palette${added === 1 ? '' : 's'}`, `${Math.max(0, newFavorites)} favorite${newFavorites === 1 ? '' : 's'}`, `${scenes} Preview preset${scenes === 1 ? '' : 's'}`];
 const notes = (skipped ? ` ${skipped} palette${skipped === 1 ? '' : 's'} did not fit the 8 KiB library.` : '') + (sceneErrors ? ` ${sceneErrors} Preview preset${sceneErrors === 1 ? '' : 's'} could not be saved.` : '');
 say(`Imported ${parts.join(', ')}.${notes} Reloading…`, true);
 const progress = store.get();
 store.set({ ...(progress || {}), skipSplash: true });
 setTimeout(() => hostStore('reload').catch(() => {
  window.dispatchEvent(new CustomEvent('openai:set_globals', { detail: { globals: { widgetState: merged } } }));
  say(`Imported ${parts.join(', ')}.${notes} Reload the page to see new Preview presets.`);
 }), 1400);
}

bar.querySelector('[data-library-io="export"]').addEventListener('click', () => exportLibrary().catch(() => say('Export failed. Try again.')));
const input = bar.querySelector('[data-library-io="file"]');
bar.querySelector('[data-library-io="import"]').addEventListener('click', () => input.click());
input.addEventListener('change', () => { const f = input.files?.[0]; input.value = ''; if (f) importLibrary(f).catch(() => say('Import failed. Your library was not changed.')); });
window.AtlasLibraryIO = { export: exportLibrary, import: importLibrary };
})();
