(() => {
  const root = document.getElementById('munsell-picker');
  const motion = window.Motion;
  if (!root || !motion?.animate) return;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Map(), pressed = new Map(), hovered = new Set();
  let pendingFrame = 0, pending = new Set(), pendingOrigin = null, disposed = false;
  let editGesture = false, gestureHasWave = false, pointerEdit = false, deferredSelection = null;
  const editKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'];
  const selectionViews = [
    ['author', '.mp-vfx-lab [data-selected-color]'],
    ['keys', '.studio-key-row[data-selected="true"] .studio-key-swatch'],
    ['wheel', '[data-field="color-wheel"] .wheel-color-marker.is-selected'],
    ['ramp', '.mp-gradient .color-marker.is-selected']
  ];
  root.dataset.motion = 'ready';
  const enabled = () => !disposed && !preference.matches && !document.hidden && root.isConnected;
  const scoped = el => el && (root.contains(el) || el.closest('.harmony-dropdown'));
  const usable = el => scoped(el) && el.isConnected && !el.disabled && el.getAttribute('aria-disabled') !== 'true' && !el.closest('[hidden]');
  const control = target => {
    const el = target?.closest?.('button, summary, input[type="checkbox"]');
    // Color selectors have one scale owner: the propagated pulse, never a parent button.
    return usable(el) && !el.closest('[data-gradient-select]') ? el : null;
  };
  const resetStyle = (el, original) => {
    for (const [property, value] of Object.entries(original)) {
      if (value) el.style[property] = value;
      else el.style.removeProperty(property);
    }
  };
  // One owner per element: rapid gestures replace effects rather than stacking.
  function play(el, values, options = {}, hold = false) {
    prune();
    if (!enabled() || !el?.isConnected) return;
    const prior = running.get(el);
    const original = prior?.original || {transform: el.style.transform, opacity: el.style.opacity};
    prior?.animation.cancel();
    resetStyle(el, original);
    const animation = motion.animate(el, values, {duration: .22, ease: [.22, 1, .36, 1], ...options});
    const record = {animation, original};
    running.set(el, record);
    Promise.resolve(animation.finished).then(() => {
      if (running.get(el) !== record || hold) return;
      animation.cancel();
      resetStyle(el, original);
      running.delete(el);
    }).catch(() => {});
  }
  function eventOrigin(e) {
    if (Number.isFinite(e?.clientX) && Number.isFinite(e?.clientY) && !(e.type === 'click' && e.detail === 0))
      return {x: e.clientX, y: e.clientY};
    const el = e?.target;
    const box = el?.getBoundingClientRect?.() || root.getBoundingClientRect();
    let x = box.left + box.width / 2;
    if (el?.type === 'range') {
      const min = Number(el.min || 0), max = Number(el.max || 100);
      const t = max > min ? (Number(el.value) - min) / (max - min) : .5;
      x = box.left + box.width * Math.max(0, Math.min(1, t));
    }
    return {x, y: box.top + box.height / 2};
  }
  function cancelSelectionWaves() {
    for (const [id] of selectionViews) {
      const key = 'selection:' + id;
      running.get(key)?.animation.cancel(); running.delete(key);
      root.style.setProperty('--atlas-scale-' + id, '1');
    }
  }
  function selectionPulse(origin) {
    if (!enabled()) return;
    cancelSelectionWaves();
    const views = selectionViews.map(([id, selector]) => {
      const el = root.querySelector(selector), box = el?.getBoundingClientRect?.();
      if (!box || box.width <= 0 || box.height <= 0 || !el.isConnected) return null;
      return {id, distance: Math.hypot(box.left + box.width / 2 - origin.x, box.top + box.height / 2 - origin.y)};
    }).filter(Boolean).sort((a, b) => a.distance - b.distance);
    // All visible selectors start on the same frame, without a stagger.
    for (const {id} of views) {
      const delay = 0;
      const key = 'selection:' + id, property = '--atlas-scale-' + id;
      // Inherited variables keep new SVG nodes on the same timeline during redraws.
      const peak = id === 'ramp' ? 1.56 : 1.28;
      const animation = motion.animate(1, [1, peak, 1], {
        duration: .24, delay, times: [0, .16, 1], ease: [[.16, 1, .3, 1], [.22, 1, .36, 1]],
        onUpdate: value => root.style.setProperty(property, String(value))
      });
      const record = {animation};
      running.set(key, record);
      Promise.resolve(animation.finished).then(() => {
        if (running.get(key) !== record) return;
        root.style.setProperty(property, '1'); running.delete(key);
      }).catch(() => {});
    }
  }
  function feedback(kind, event) {
    if (!enabled()) return;
    if (kind === 'selection' && pointerEdit) { deferredSelection = event; return; }
    pending.add(kind);
    if (kind === 'selection' || kind === 'palette') pendingOrigin = eventOrigin(event);
    if (pendingFrame) return;
    // Read the final DOM after the editor's synchronous render; never repaint data.
    pendingFrame = requestAnimationFrame(() => {
      pendingFrame = 0;
      const effects = pending;
      const origin = pendingOrigin;
      pending = new Set();
      pendingOrigin = null;
      if (!enabled()) return;
      prune();
      if (effects.has('selection') || effects.has('palette')) selectionPulse(origin || eventOrigin());
      if (effects.has('palette')) {
        play(root.querySelector('[data-field="explosion-mapped"]'), {opacity: [.82, 1], scale: [.992, 1]}, {duration: .2});
        play(root.querySelector('[data-ramp-fill]'), {opacity: [.65, 1]}, {duration: .24});
        play(root.querySelector('[data-field="selected-color-preview"]'), {scaleY: [.88, 1]}, {type: 'spring', duration: .32, bounce: .2});
      }
      for (const effect of effects) if (effect.startsWith('favorite:')) {
        const id = effect.slice(9);
        const star = root.querySelector(`[data-studio-favorite="${id}"] svg`);
        play(star, {scale: [.75, 1.22, 1], rotate: [-12, 8, 0]}, {duration: .34});
      }
    });
  }
  const restingScale = el => hovered.has(el) ? 1.025 : 1;
  document.addEventListener('pointerover', e => {
    if (e.pointerType === 'touch' || !enabled()) return;
    const el = control(e.target);
    if (!el || el.contains(e.relatedTarget)) return;
    hovered.add(el);
    play(el, {scale: restingScale(el), y: -1}, {duration: .16}, true);
  }, true);
  document.addEventListener('pointerout', e => {
    const el = control(e.target);
    if (!el || el.contains(e.relatedTarget)) return;
    hovered.delete(el);
    play(el, {scale: 1, y: 0}, {type: 'spring', duration: .26, bounce: .16});
  }, true);
  document.addEventListener('pointerdown', e => {
    if (e.button !== 0 || !enabled()) return;
    const el = control(e.target);
    if (el) {
      pressed.set(e.pointerId, el);
      play(el, {scale: .94, y: 1}, {duration: .09}, true);
    }
    if (scoped(e.target)) {
      editGesture = true; gestureHasWave = false; pointerEdit = true; deferredSelection = null; cancelSelectionWaves();
      if (e.target.closest('[data-gradient-kind], [data-wheel-key], [data-field="color-wheel"]')) {
        feedback('selection', e); gestureHasWave = true;
      }
    }
  }, true);
  function release(e) {
    pointerEdit = false;
    const finalSelection = deferredSelection; deferredSelection = null;
    editGesture = false; gestureHasWave = false;
    if (finalSelection) feedback('selection', finalSelection);
    const el = pressed.get(e.pointerId);
    if (!el) return;
    pressed.delete(e.pointerId);
    prune();
    if (e.type === 'pointercancel') hovered.delete(el);
    play(el, {scale: restingScale(el), y: hovered.has(el) ? -1 : 0}, {type: 'spring', duration: .3, bounce: .28}, hovered.has(el));
  }
  document.addEventListener('pointerup', release, true);
  document.addEventListener('pointercancel', release, true);
  document.addEventListener('keydown', e => {
    if (scoped(e.target) && e.target.type === 'range' && editKeys.includes(e.key)) {
      editGesture = true;
      if (!e.repeat) gestureHasWave = false;
    }
    if (e.repeat || ![' ', 'Enter'].includes(e.key)) return;
    const el = control(e.target);
    if (el) play(el, {scale: .94, y: 1}, {duration: .09}, true);
  }, true);
  document.addEventListener('keyup', e => {
    if (editKeys.includes(e.key)) {
      editGesture = false; gestureHasWave = false;
    }
    if (![' ', 'Enter'].includes(e.key)) return;
    const el = control(e.target);
    if (el) play(el, {scale: 1, y: 0}, {type: 'spring', duration: .3, bounce: .28});
  }, true);
  document.addEventListener('click', e => {
    if (!scoped(e.target)) return;
    const star = e.target.closest('[data-studio-favorite]');
    if (star) {feedback('favorite:' + star.getAttribute('data-studio-favorite')); return;}
    if (e.target.closest('[data-studio-preset], [data-action="random-all-layers"], [data-action="gradient-toggle-layer"], [data-action="gradient-add"], [data-action="gradient-remove"]')) feedback('palette', e);
    else if (e.target.closest('[data-gradient-select], [data-selected-marker]')) feedback('selection', e);
  }, true);
  document.addEventListener('input', e => {
    if (!scoped(e.target) || !['vfx-saturation', 'mp-vfx-l', 'mp-vfx-a', 'mp-vfx-b', 'gradient-position'].includes(e.target.id)) return;
    if (gestureHasWave) return;
    feedback('selection', e);
    gestureHasWave = editGesture;
  }, true);
  document.addEventListener('change', e => {
    if (!scoped(e.target)) return;
    if (['gradient-layer', 'artist-transition', 'explosion-view', 'color-vision'].includes(e.target.id)) feedback('palette', e);
    if (e.target.matches?.('input[type="checkbox"]')) play(e.target, {scale: [.85, 1.08, 1]}, {duration: .25});
  }, true);
  document.addEventListener('toggle', e => {
    if (e.isTrusted && scoped(e.target) && e.target.open && e.target.hasAttribute('data-studio-folder'))
      play(e.target.querySelector('.studio-folder-items'), {opacity: [.65, 1], y: [-4, 0]}, {duration: .18});
  }, true);
  function settle() {
    if (pendingFrame) cancelAnimationFrame(pendingFrame);
    pendingFrame = 0; pending.clear(); pendingOrigin = null; pressed.clear(); hovered.clear();
    editGesture = false; gestureHasWave = false; pointerEdit = false; deferredSelection = null;
    for (const [el, record] of running) {
      record.animation.cancel();
      if (record.original) resetStyle(el, record.original);
    }
    running.clear();
    cancelSelectionWaves();
    root.style.setProperty('--atlas-selection-scale', '1');
  }
  function prune() {
    for (const [el, record] of running) if (typeof el !== 'string' && !el.isConnected) {
      record.animation.cancel(); resetStyle(el, record.original); running.delete(el);
    }
    for (const el of hovered) if (!el.isConnected) hovered.delete(el);
    for (const [id, el] of pressed) if (!el.isConnected) pressed.delete(id);
  }
  window.AtlasMotion = {
    colorChanged: e => feedback('selection', e),
    menu: el => play(el, {opacity: [.7, 1], y: [-4, 0]}, {duration: .16}),
    copied: el => play(el, {opacity: [.45, 1]}, {duration: .16})
  };
  preference.addEventListener('change', () => {if (preference.matches) settle();});
  document.addEventListener('visibilitychange', () => {if (document.hidden) settle();});
  window.addEventListener('blur', settle);
  window.addEventListener('pagehide', () => {disposed = true; settle();});
  window.addEventListener('pageshow', () => {disposed = false;});
})();
