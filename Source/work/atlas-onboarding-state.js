// Onboarding progress rides along with the editor's own widget state.
// Installed before the editor script so every setWidgetState write carries it.
// It also lets the tour put the workspace back the way it was (see restore).
(() => {
 const host = window.openai, KEY = 'atlasOnboarding';
 const saved = host?.widgetState?.modelContent?.[KEY] ?? host?.widgetState?.[KEY] ?? null;
 let value = saved && typeof saved === 'object' ? saved : null, last = null, write = null;
 const copy = x => x == null ? x : JSON.parse(JSON.stringify(x));
 if (host && typeof host.setWidgetState === 'function') {
  write = host.setWidgetState.bind(host);
  host.setWidgetState = next => {
   if (next && typeof next === 'object') {
    last = next;
    if (value) next = { ...next, modelContent: { ...(next.modelContent || {}), [KEY]: value } };
   }
   return write(next);
  };
 }
 window.AtlasOnboardingStore = {
  restorePreview: saved?.restorePreview || null,
  persistent: !!write && host.statePersistence !== 'none',
  get: () => value,
  set(next) {
   value = next;
   if (!write) return undefined;
   const base = last || host.widgetState || { modelContent: {} };
   try { return write({ ...base, modelContent: { ...(base.modelContent || {}), [KEY]: value } })?.catch?.(() => {}); } catch { return undefined; }
  },
  // The editor's latest saved state (what a reload would restore).
  current: () => copy(last || host?.widgetState || null),
  // Replace the editor's saved state; the onboarding field is kept.
  replace(state) {
   if (!write || !state) return Promise.resolve();
   last = state;
   try { return Promise.resolve(write({ ...state, modelContent: { ...(state.modelContent || {}), [KEY]: value } })).catch(() => {}); } catch { return Promise.resolve(); }
  }
 };
 // After the tour restores the workspace it reloads once; skip the splash then.
 if (value?.skipSplash) {
  const style = document.createElement('style');
  style.textContent = '#atlas-splash{display:none!important}';
  document.head.appendChild(style);
  const done = () => { document.querySelector('[data-splash-skip]')?.click(); setTimeout(() => { style.remove(); window.AtlasOnboardingStore.set(value); }, 1500); };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', done, { once: true }) : setTimeout(done);
  value = { ...value }; delete value.skipSplash; delete value.restorePreview;
 }
})();
