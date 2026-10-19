/**
 * Ten-action, in-memory history. read() owns snapshot isolation; apply() restores
 * it synchronously. signature() must be pure and snapshots must stay immutable.
 * Gesture depth groups many edits into one action. A failed restore retains both
 * stacks and tries to restore the last known current snapshot before rethrowing.
 */
function createAtlasHistory({read, apply, signature, changed}) {
  const LIMIT = 10;
  let past = [], future = [], current = read();
  // Images can make signatures large. Cache the immutable current snapshot's key;
  // each candidate still gets a fresh key so unannounced edits remain detectable.
  let currentSignature = signature(current), depth = 0, busy = false;
  const notify = () => changed?.();

  function commit(label) {
    if (busy || depth) return false;
    const next = read(), nextSignature = signature(next);
    if (nextSignature === currentSignature) return false;
    past.push({snap: current, label});
    if (past.length > LIMIT) past.shift();
    future = [];
    current = next;
    currentSignature = nextSignature;
    notify();
    return true;
  }

  function move(redo) {
    if (busy || depth) return false;
    commit('Edit');
    const from = redo ? future : past, to = redo ? past : future;
    const entry = from.at(-1);
    if (!entry) return false;
    busy = true;
    try {
      apply(entry.snap);
      const restored = read(), restoredSignature = signature(restored);
      // Change stacks only after restoration and its signature both succeed.
      from.pop();
      to.push({snap: current, label: entry.label});
      current = restored;
      currentSignature = restoredSignature;
    } catch (error) {
      try { apply(current); } catch {}
      throw error;
    } finally {
      busy = false;
      notify();
    }
    return true;
  }

  return {
    commit,
    undo: () => move(false),
    redo: () => move(true),
    begin() { commit('Edit'); depth++; notify(); },
    end(label) { depth = Math.max(0, depth - 1); if (!depth) commit(label); notify(); },
    reset() {
      const next = read(), nextSignature = signature(next);
      past = []; future = []; current = next; currentSignature = nextSignature;
      notify();
    },
    canUndo: () => !busy && !depth && !!past.length,
    canRedo: () => !busy && !depth && !!future.length,
    entries: () => past.map(p => ({label: p.label, undone: false}))
      .concat([...future].reverse().map(p => ({label: p.label, undone: true}))),
    isBusy: () => busy
  };
}
