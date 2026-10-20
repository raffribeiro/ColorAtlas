// Public page-load count only. Never inspect editor state or browser storage.
(() => {
  if (window.top !== window.self || window.__atlasHitsStarted ||
      location.origin !== 'https://raffribeiro.github.io' ||
      !['/ColorAtlas/', '/ColorAtlas/index.html'].includes(location.pathname) ||
      navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true ||
      navigator.webdriver) return;
  window.__atlasHitsStarted = true;
  function countVisiblePage() {
    if (document.prerendering || document.visibilityState !== 'visible') return;
    document.removeEventListener('visibilitychange', countVisiblePage);
    document.removeEventListener('prerenderingchange', countVisiblePage);
    // No referrer, query string, names, images, palettes or persistent visitor ID.
    const hit = new Image();
    hit.referrerPolicy = 'no-referrer';
    hit.fetchPriority = 'low';
    hit.src = 'https://hits.sh/raffribeiro.github.io/ColorAtlas.svg?_=' + Date.now() + '-' + Math.random();
  }
  document.addEventListener('visibilitychange', countVisiblePage);
  document.addEventListener('prerenderingchange', countVisiblePage);
  countVisiblePage();
})();
