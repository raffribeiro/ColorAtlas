# Color Atlas: Motion UI

Since v0.90.16 the app embeds `work/atlas-motion-lite.js` (about 4.6 KB) in the
`atlas-motion-vendor` block instead of the 126.7 KB Motion 14 subset. It implements the
`Motion.animate()` calls this controller makes on the Web Animations API: element
keyframes (opacity, x, y, scale, scaleX, scaleY, rotate), per-segment cubic ease,
`times`, `delay`, duration-based springs (stiffness fitted to Motion 14) and numeric
tweens with `onUpdate`. Measured against Motion 14 in Chromium: the selection pulse
matches within 0.0003, springs within 0.015, keyframe animations within frame jitter.
Install with `python3 work/install_motion_lite.py`; verify with
`node work/check_motion_lite.cjs`. The Motion 14 distribution, MIT license and the
earlier subset stay in `work/vendor/` for reference.

The source of truth is:
`/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html`.

`atlas-motion-ui.js` and `atlas-motion-ui.css` are readable copies of the embedded
controller and styles. Keep them synchronized when changing the source.

- Buttons: gentle hover lift, press compression, spring release; keyboard support.
- Selected circles (centers and borders): `1 → 1.28 → 1`; the Gradient Map
  selector alone uses `1 → 1.56 → 1`, twice the amplitude. All share a 240 ms
  duration: peak at 38 ms, fast ease-out return, no preparatory contraction or rebound. Each view owns an inherited scale
  variable so 3D redraws preserve its timeline.
- Propagation starts at the initiating pointer location, or the activating
  control center for keyboard actions. Selected circle centers are measured in
  viewport coordinates and sorted by distance. Distance determines the array order only; all visible circles now start
  together with zero delay, preserving the 240 ms snap pulse. The wheel is located by its
  actual `data-field="color-wheel"` attribute, including pointer gesture origins.
- Ramp circles use a 6 px base radius, with a modest 8 px radius for the selected
  circle. A transparent 13 px hit target preserves clicking/dragging. The selected
  border matches its 8 px base radius.
  Key selection buttons skip parent hover/press scale to avoid multiplying the pulse.
- Palette changes: short preview/ramp feedback after the editor's render.
- Continuous slider/color edits: one selection wave per drag or held arrow key;
  no additional data rendering or preview fades. Valid HEX and graph color
  changes explicitly pass the originating event to the motion controller.
- Favorites, folder expansion, custom menus and copy confirmation: short feedback.
- Rapid interactions: coalesced frame, replacement animations and detached-node cleanup.
- Reduced motion, hidden tab, blur and page lifecycle: cancel and settle effects.
- No changes to palette contents, persistence or gradient math.

Verification: `node work/check_motion_propagation.cjs`; existing editor regression
checks. The official Motion bundle's numeric keyframes were also exercised with
a 120 ms delay, compression, expansion and final scale of 1.
Live visual browser acceptance was unavailable in this session.

Official documentation: https://motion.dev/docs/animate
