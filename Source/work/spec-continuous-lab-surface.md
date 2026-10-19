---
title: Continuous selected-lightness color surface
type: feature
created: 2026-10-16
status: done
baseline_commit: NO_VCS
context: []
---

<frozen-after-approval reason="User directly requested greater coverage or a continuous color area; proceed under existing implementation authorization">

## Intent

The selected-lightness dots leave visible holes at the edge of sRGB, making a valid selected color appear outside the illustrated choices. Replace that slice with a continuous color surface following the actual sRGB gamut at the selected OKLab lightness. Preserve the faint surrounding cloud and existing editing/camera gestures.

## Boundaries & Constraints

Always use the editor's existing OKLab math, fixed-lightness radial gamut fitting, projection and state. Reuse a bounded cached raster during camera and fixed-L color movement rather than adding thousands of SVG nodes. Keep the opaque selected marker and its contrast rings, context opacity, gradient-key selection, undo, wheel and preview semantics. Documentation stays in English; delivery retains the current preview URL and user data. No unrelated performance refactor.

## I/O & Edge-Case Matrix

| Scenario | Input | Expected behavior |
|---|---|---|
| Surface | L in (0,100) | Smooth continuous colors, clipped to sRGB at that L |
| Boundary selection | Saturated RGB colors | Marker center matches the visible surface boundary within raster/contour precision |
| Camera | Rotate, pan, zoom | Surface follows existing orthographic projection, no raster rebuild at unchanged L |
| Endpoint | L 0 or 100 | Neutral endpoint, no large colored area or NaN |
| Edge-on | Pitch near zero | Degenerate plane remains finite; existing picking behavior retained |
| Documentation | Clone editor SVG | Embedded raster and clip references survive cloning |

</frozen-after-approval>

## Code Map

- Canonical `munsell-selector.html`: drawLabPlane, projectLab, fitLabToSRGB and context cloud.
- `work/install_lab_volume.py`: historical sampling edit chain, preserved.
- `work/atlas-lab-surface.js`: new pure-to-editor helper using a canvas-backed cached image and projected SVG markup.
- `work/install_lab_surface.py`, `work/lab-surface-script-edits.json`: reversible installer/module injection.
- `work/build_documentation.py`: guide description and graph caption.
- `work/check_documentation_content.py`: reviewed-edit reversal and module synchronization.

## Tasks & Acceptance

- [x] Add bounded cached surface helper; render using passed existing color math and projection.
- [x] Install surface in place of selected dots; keep the 1,881 faint context points and axis/marker visibility.
- [x] Update focused gamut, projection, caching and endpoint checks, plus existing density expectations.
- [x] Update guide source, rebuild documentation and standalone; inspect the generated app visually.
- [x] Exercise real rotate/pan/zoom/color gestures and check performance against the recent baseline.
- [x] Run affected regression checks and onboarding suite; version and package the final artifact.

Given a saturated selected color, when the 3D view renders, then its center lies on or inside the illustrated constant-L surface within subpixel tolerance. Given a camera move at fixed L, when the graph redraws, then the raster is reused and color data does not change. Given a point drag, when it ends, then the live gradient/preview and undo remain functional. Given Documentation opens, then its editor illustration includes the new surface.

## Design Notes

Use an embedded raster with a finite gamut contour and affine SVG projection. This removes slice sampling holes without growing the DOM. The helper receives the editor math instead of introducing another color conversion. Show the colored plane before the existing axes and markers so labels and control affordances remain legible. At exact black/white, render only a neutral endpoint.

## Verification

Focused Node checks cover gamut contour accuracy, transform mapping and cache reuse. Existing graph axes, labels, node selection and live color checks cover integration. Documentation structure/math checks cover guide synchronization. Chromium screenshots and Playwright gestures cover actual image rendering and interactions in the standalone, followed by packaging and release-folder verification.

## Spec Change Log


Review findings resolved: adaptive boundary refinement avoids cutting off saturated red; the documentation clone rewrites clip-path references alongside fill/stroke so its contour is independent of the editor. Focused regressions failed before each correction and now pass.


Final verification: graph density/axes/labels/live color/node selection/node numbers/tools checks pass; guide content/math/volume checks pass; 9/9 onboarding Chromium scenarios pass. Real-browser surface inspection confirms camera and fixed-L color drags reuse the raster, saturated/black/white selections render, and documentation owns its clip path. Calibrated 4× CPU lightness median: previous 395.6 ms, current 400.2 ms (seven samples each). Published App v0.90.19 smoke-tested in an isolated browser, no page errors. Package manifest hash matches App; Data JSON unchanged; tracked release files clean (unrelated untracked Images/ retained).

## Suggested Review Order

- Continuous gamut coverage and reusable raster: [atlas-lab-surface.js:7](atlas-lab-surface.js#L7).
- Editor integration and reversible installation: [install_lab_surface.py:14](install_lab_surface.py#L14).
- Independent documentation clipping: [atlas-documentation-examples.js:382](atlas-documentation-examples.js#L382).
- Boundary, camera and cache regressions: [check_lab_surface.cjs:1](check_lab_surface.cjs#L1).
