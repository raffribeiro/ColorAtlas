# Color Atlas changelog

Changes are tracked from v0.9 onward. Earlier development is represented by this baseline, without reconstructed release history.

## Unreleased

No changes yet.

## v0.10.33 — 2026-10-14

- Match the Authoring Colors startup and Reset view camera to the supplied reference: yaw 3.55 rad, pitch −0.25 rad, zoom 1, centered pan.
- Retain manual camera gestures and the Rotation toggle.

Validation: startup/reset camera values, projected axis directions, rotation and color-drag regression checks, synchronized documentation and package. Reference orientation reconstructed from screenshot; live visual acceptance pending.

## v0.10.32 — 2026-10-14

- Give normal-blend layers a role-scaled midtone chroma floor in all guided Random modes, avoiding muted smoke results.
- Preserve freshly generated hue families instead of rotating them back toward an OFF layer. Named harmony masks remain intact; Free stays unconstrained.
- Retain point luminance, spacing, alpha, ±25% chroma variation and batched rendering.

Validation: 16 successive Smoke randomizations in each of 11 guided modes; hue/chroma diversity, per-step luminance, OFF isolation, named harmony masks, Add endpoints, single final redraw/save and Undo/Redo. Automated DOM/canvas checks; live browser appearance pending.

## v0.10.31 — 2026-10-14

- Batch Random interface redraws and persistence once after the final result, avoiding intermediate layer renders.
- Reuse repeated RGB→OKLab conversions within ColorPlay scoring. Preserve all scoring rules and seeded outputs.
- Retain the 10-action Undo/Redo history.

Validation: exact seeded scenes for all 12 modes and single-layer cases; one final ramp/Preview/save; exception cleanup; Random Undo/Redo; documentation and package checks. Mock DOM/canvas timing improved about 416→271ms for two ON layers; live browser latency unmeasured.

## v0.10.30 — 2026-10-14

- Center COLOR WHEEL across its column while keeping Reset view right-aligned.

Validation: scoped toolbar alignment, documentation and delivered package checks.

## v0.10.29 — 2026-10-14

- Update the Gradient Map ramp, grayscale strip and key list during Color Wheel and 3D color drags, instead of waiting for release.
- Keep one update per animation frame, unchanged-color guards and one final gesture save.

Validation: live ramp/Preview before release for both controls, coalescing, release/cancel flush, fixed alpha/positions/lightness, documentation and package checks.

## v0.10.28 — 2026-10-14

- Use muted neutral gray for Color Wheel hue-name labels. Preserve the colored ring, points and selected-key number.

Validation: scoped exported label style, documentation and release checks.

## v0.10.27 — 2026-10-14

- Move the selected-color swatch below the divider, inside the Color Wheel group.

Validation: swatch identity/order, wheel resizing, documentation and delivered package checks.

## v0.10.26 — 2026-10-14

- Apply the existing Reset view action after every successful Preview preset selection. Center pan and fit the image instead of restoring saved zoom. Failed/superseded loads retain the current view.

Validation: preset selection/reset and legacy presets, failed/superseded-load view retention, camera fit, documentation and package checks.

## v0.10.25 — 2026-10-14

- Add Export Preview to download a 512×512 PNG of the composed images with Gradient Maps, layer blends/opacity, bloom and vision simulation. Preserve alpha; exclude camera framing, UI and attention overlays.
- Report export/loading errors and prevent duplicate encoding clicks.

Validation: render/download pipeline, PNG failure, empty/loading guards, URL cleanup, layer compositing, documentation and package checks. Browser download acceptance pending.

## v0.10.24 — 2026-10-14

- Increase Layers top padding from 8px to 20px to separate its action buttons from the resize handle.
- Remove the successful Default Preview loaded message; retain storage errors.

Validation: layout/style and default-loading checks, documentation and release package checks.

## v0.10.23 — 2026-10-14

- Group the live selected-color swatch inside Color Wheel, followed by the resize divider and wheel. Keep the divider in normal flow after the swatch and recalculate fitted sizes.

Validation: swatch identity/order, divider/grid styling, existing wheel resizing, documentation and release checks.

## v0.10.22 — 2026-10-14

- Move the live L value from the graph header to a centered readout above Black–White.
- Pulse its scale briefly when the value changes; unchanged redraws do not pulse. Respect reduced-motion preferences.

Validation: readout placement, changed/unchanged values, interrupted animation and reduced motion; generated documentation and package checks.

## v0.10.21 — 2026-10-14

- Rename Slow rotation to Rotation. Increase Layers action-button spacing from 2px to 8px, retaining wrapping.

Validation: delivered label/style assertions, documentation and package checks.

## v0.10.20 — 2026-10-14

- Add Save for the current Preview preset with Save/Cancel confirmation. Update the same preset ID/name with current images, maps, zoom and Random toggles.
- Disable Save for Default and reject default-overwrite requests in browser storage. New preset can create a personal copy.

Validation: confirmation/cancel, overwrite identity/snapshot, failure/retry, Default UI/storage protection, generated documentation and package checks. Live browser acceptance pending.

## v0.10.19 — 2026-10-14

- Remove the empty Preview presets menu option. Select Default on startup and as fallback; retain selection of newly created presets.

Validation: preset menu options/selection/fallback, compiled Preview module, documentation and release checks.

## v0.10.18 — 2026-10-14

- Synchronize the compiled Preview module and guide in the final package.

Validation: compiled status visibility, Preview controls, documentation and delivered HTML checks.

## v0.10.17 — 2026-10-14

- Hide routine Restored locally and Saved locally messages beneath Preview layers. Keep actionable errors visible.

Validation: status visibility tests, Preview controls, generated documentation and package checks.

## v0.10.16 — 2026-10-14

- Rename the built-in Preview preset to Default. Offer one-time confirmation to remove all other Preview presets.
- Remember completed cleanup per app URL; presets created later are retained. Cancellation or storage failure preserves retryability.

Validation: default name/scene, confirmation/cancel/offline paths, persistent cleanup marker, scene retention and release checks. Live browser acceptance pending.

## v0.10.15 — 2026-10-14

- Center the Palettes/Authoring divider handle within the actual gap between columns.
- Add left/right edge handles to resize the centered app width on wide displays, with bounds, keyboard controls and Home/double-click reset.

Validation: width/divider geometry, pointer release/cancel, keyboard/reset/bounds, existing workspace resizing and generated package checks. Live browser acceptance pending.

## v0.10.14 — 2026-10-14

- Use browser IndexedDB for Preview presets/images and localStorage for palettes/settings. Remove Connect Data from the runnable browser edition.
- Seed the embedded Codex Use Esse preset in browser storage without replacing personal presets. New preset no longer requests folder permission.
- Preserve legacy Data files and the folder-store implementation for the future portable edition; no automatic legacy-file import.

Validation: IndexedDB save/load/reopen, default seeding, personal-preset retention, New preset, palette persistence, documentation and standalone package checks. Live browser acceptance pending.

## v0.10.13 — 2026-10-14

- Regenerate the guide with toolbar feedback changes; separate app assets from external bibliography entries.

Validation: generated guide, exported styles and standalone package checks.

## v0.10.12 — 2026-10-14

- Remove palette status messages from the Gradient Map toolbar. Save/delete dialogs retain storage feedback.

Validation: source/export style checks, documentation checks and standalone package verification.

## v0.10.11 — 2026-10-14

- Embed the supplied Explosion_Emissive, Explosion_Smoke and BG PNGs as the Codex Use Esse startup preset, in that visual order. Emissive uses Add with a black low endpoint.
- Include default preset metadata and PNG sources in Data and clean sharing ZIPs; retain unrelated personal presets and settings.

Validation: disconnected/connected startup, order/blend, Data persistence and package asset checks. Live browser acceptance pending.

## v0.10.10 — 2026-10-14

- Keep New preset actionable without connected storage; request Data access and open the preset form after authorization, without reloading the current Preview.
- Save preset images as deduplicated PNG files in Data/Images and store references in preview.json. Load legacy embedded images and migrate them during connection. Built-in reference images are captured when saving presets.
- Exclude runtime image PNGs from Git and clean sharing ZIPs. Unreferenced image files are retained.

Validation: folder image round-trip, failed-write retention and preset connection action tests. Live browser folder-picker acceptance pending.

## v0.10.9 — 2026-10-14

- Use plain white circular slider thumbs, centered on consistent 28px tracks.
- Place Saturation label, slider and its live percentage on one row, aligned with the other authoring sliders.
- Remove fixed 0%/100% saturation endpoint labels.

Validation: exported saturation markup, dynamic value binding and slider styling/package checks. Live visual acceptance pending.

## v0.10.8 — 2026-10-14

- Removed the app Fullscreen button from the header.

Validation: exported interface and shareable package contain no fullscreen control; release branch synchronized.

## v0.10.7 — 2026-10-14

- Prevent text selection in the app interface; editable fields retain normal selection and clipboard editing.

Validation: exported selection styles and package/release synchronization.

## v0.10.6 — 2026-10-14

- Fix Gradient Map click positions using SVG screen transforms, including scaled and letterboxed layouts.
- Select the nearest marker with selected-circle priority; preserve grab offset when dragging.
- Delete removes the selected gradient point after confirmation; text editing retains native Delete.
- Confirm point, layer and legacy saved-color removal. Existing palette/preset dialogs remain; automatic removal of other default presets now also requests consent. Cancel keeps data unchanged.

Validation: SVG coordinate and selection tests; point creation, no-jump dragging, Delete/cancel and layer confirmation tests; default cleanup consent, history and package checks. Live browser acceptance pending.

## v0.10.5 — 2026-10-14

- Show Drag here hints on valid layer rows while a file is dragged over the app, retaining readable layer names.
- Highlight the hovered target; clear hints on leaving, drop, Escape or window blur.

Validation: drag hint lifecycle, target replacement and existing history/package checks. Live drag acceptance remains pending.

## v0.10.4 — 2026-10-14

- Set the browser tab title to Color Atlas.

Validation: title verified in the exported page and synchronized App package.

## v0.10.3 — 2026-10-14

- Drag a PNG, JPEG or WebP (up to 20 MB) onto a Preview layer row to replace its image.
- Preserve the layer name, palette, opacity, blend mode, visibility, selection and Random state; image replacement supports Undo/Redo.
- Reject multiple/invalid files; ignore pending replacements if the target is removed or restored, and retain the previous image on decoding failure.

Validation: replacement preservation and invalid/deleted-target tests, history checks and package/release synchronization. Live drag-and-drop acceptance pending.

## v0.10.2 — 2026-10-14

- Removed VERSION from the shareable App folder; release tracking retains it in Realase and validates the embedded HTML version.

Validation: package layout, embedded version, ZIP contents and release branch consistency.

## v0.10.1 — 2026-10-14

- Organized the shareable browser distribution in App and all release records in Realase.
- Added a local release Git branch synchronized by the packaging workflow; personal Data files are excluded from Git and generated sharing archives.
- Preserved previous ZIP releases.

Validation: folder layout, archived package hashes, and release branch/package consistency. No new browser behavior changes.

## v0.10 — 2026-10-14

- Added Connect Data in the browser app (Chrome/Edge). Select the Data folder once and authorize read/write access.
- Store editor settings and My palettes in Data/settings.json; Preview stack, presets and imported images in Data/preview.json.
- Remember only the folder permission handle in the browser; reconnect if permission is no longer granted.

Validation: folder persistence/reopen, failed-write retention and packaging checks. Live browser directory-picker acceptance is pending. Safari/Firefox do not support this folder edition. Earlier browser data is not migrated automatically.

## v0.9 — 2026-10-14

First version shared for feedback from friends.

- Standalone offline HTML with embedded code, reference images, built-in palettes and English documentation.
- Color authoring, Gradient Map editing, layer stacks and local Preview presets.
- Guided Random modes with 60/30/10 roles, Add accent constraints and point luminance preservation; Free uses unrestricted random RGB.
- Save palette captures the selected ramp; export retains the active ramp and its alpha.
- Preview zoom/pan, adjustable workspace, fullscreen and 10-action Undo/Redo.

Validation: automated checks for packaging dependencies, Random behavior, history and documentation. Live offline browser acceptance remains to be confirmed by testers.

Storage: saved palettes, imported images and Preview presets are local to the browser and file path. The author's existing browser preset data is not included in this distribution.
