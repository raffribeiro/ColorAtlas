/* Constant-lightness sRGB surface, using the editor's existing OKLab math. */
(function (global) {
  'use strict';
  const SIZE = 160, BOUND = 110, DIRECTIONS = 360, LIMIT = 8;
  const cache = new Map();
  let colorMath, gamutMath, builds = 0;

  function get(lightness, labColor, fitLabToSRGB) {
    const l = Math.max(0, Math.min(100, Number(lightness)));
    if (!Number.isFinite(l)) throw new TypeError('Surface lightness must be finite');
    // A cache belongs to one pair of editor conversion functions.
    if (colorMath !== labColor || gamutMath !== fitLabToSRGB) {
      cache.clear(); colorMath = labColor; gamutMath = fitLabToSRGB;
    }
    if (cache.has(l)) {
      const found = cache.get(l);
      cache.delete(l); cache.set(l, found);
      return found;
    }
    const endpoint = l === 0 || l === 100;
    const points = [];
    if (endpoint) points.push(Object.freeze({ a: 0, b: 0 }));
    else {
      const sample = angle => {
        const fit = fitLabToSRGB(l, 155 * Math.cos(angle), 155 * Math.sin(angle));
        return Object.freeze({ a: fit.a, b: fit.b });
      };
      const chordError = (p, start, end) => {
        const da = end.a - start.a, db = end.b - start.b;
        const t = Math.max(0, Math.min(1, ((p.a - start.a) * da + (p.b - start.b) * db) / (da * da + db * db || 1)));
        return Math.hypot(p.a - start.a - t * da, p.b - start.b - t * db);
      };
      // Refine sharp gamut cusps; equally spaced angles alone can cut off primaries.
      const appendArc = (angle, endAngle, start, end, depth) => {
        const middleAngle = (angle + endAngle) / 2, middle = sample(middleAngle);
        if (depth < 10 && chordError(middle, start, end) > 0.015) {
          appendArc(angle, middleAngle, start, middle, depth + 1);
          appendArc(middleAngle, endAngle, middle, end, depth + 1);
        } else points.push(start);
      };
      let start = sample(0);
      for (let i = 0; i < DIRECTIONS; i++) {
        const angle = i * Math.PI * 2 / DIRECTIONS, endAngle = (i + 1) * Math.PI * 2 / DIRECTIONS;
        const end = sample(endAngle);
        appendArc(angle, endAngle, start, end, 0);
        start = end;
      }
    }
    let href = null;
    if (!endpoint) {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = SIZE;
      const context = canvas.getContext('2d');
      const pixels = context.createImageData(SIZE, SIZE);
      const step = 2 * BOUND / SIZE;
      for (let y = 0; y < SIZE; y++) {
        const b = -BOUND + (y + 0.5) * step;
        for (let x = 0; x < SIZE; x++) {
          const a = -BOUND + (x + 0.5) * step;
          // Opaque clipped RGB beyond the gamut supplies edge bleed for image filtering.
          // The vector contour, not raster alpha, determines the visible boundary.
          const hex = labColor(l, a, b).hex;
          const offset = (y * SIZE + x) * 4;
          pixels.data[offset] = parseInt(hex.slice(1, 3), 16);
          pixels.data[offset + 1] = parseInt(hex.slice(3, 5), 16);
          pixels.data[offset + 2] = parseInt(hex.slice(5, 7), 16);
          pixels.data[offset + 3] = 255;
        }
      }
      context.putImageData(pixels, 0, 0);
      href = canvas.toDataURL('image/png');
    }
    // Contour coordinates are independent of camera and viewport. Serialize them
    // with the raster once; 3D rotation and wheel panning change only the matrix.
    const contour = points.map((p, i) => (i ? 'L' : 'M') + p.a + ',' + p.b).join('') + 'Z';
    const result = Object.freeze({ l, endpoint, href, contour, points: Object.freeze(points),
      size: SIZE, bounds: Object.freeze({ min: -BOUND, max: BOUND }) });
    builds++;
    cache.set(l, result);
    if (cache.size > LIMIT) cache.delete(cache.keys().next().value);
    return result;
  }

  function svg(l, labColor, fitLabToSRGB, project, idPrefix) {
    const surface = get(l, labColor, fitLabToSRGB);
    const origin = project({ l: surface.l, a: 0, b: 0 });
    if (surface.endpoint) {
      return '<circle class="lab-color-surface" cx="' + origin.x + '" cy="' + origin.y +
        '" r="2.2" fill="' + labColor(surface.l, 0, 0).hex + '" pointer-events="none"/>';
    }
    const a = project({ l: surface.l, a: 1, b: 0 });
    const b = project({ l: surface.l, a: 0, b: 1 });
    const matrix = [a.x - origin.x, a.y - origin.y, b.x - origin.x, b.y - origin.y, origin.x, origin.y];
    if (!matrix.every(Number.isFinite)) return '';
    const id = 'lab-surface-' + String(idPrefix || 'editor').replace(/[^a-zA-Z0-9_-]/g, '-');
    const contour = surface.contour;
    return '<g class="lab-color-surface" pointer-events="none" transform="matrix(' + matrix.join(' ') + ')">' +
      '<defs><clipPath id="' + id + '" clipPathUnits="userSpaceOnUse"><path d="' + contour + '"/></clipPath></defs>' +
      '<image x="-110" y="-110" width="220" height="220" preserveAspectRatio="none" href="' +
      surface.href + '" clip-path="url(#' + id + ')"/></g>';
  }

  global.AtlasLabSurface = Object.freeze({ get, svg,
    stats: () => ({ builds, entries: cache.size, limit: LIMIT, size: SIZE }),
    clear: () => { cache.clear(); builds = 0; }
  });
})(window);
