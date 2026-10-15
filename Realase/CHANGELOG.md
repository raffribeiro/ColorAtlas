# Color Atlas changelog

Changes are tracked from v0.9 onward. Earlier development is represented by this baseline, without reconstructed release history.

## Unreleased

No changes yet.

## v0.13.5 — 2026-10-15

- Update library Fire to the authored seven-color ramp, including black at 0% and dark ember at 7.2%; retain the remaining stops at 20%, 40%, 60%, 80% and 100%.
- Use Fire as the default Explosion_Emissive ramp with Add blending. Refresh the protected Default browser preset without modifying personal presets or other layers.
- Synchronize the guide and interactive fire examples.

Validation: exact colors/positions in library and default seed, protected Default refresh and personal-preset retention, library checks, documentation and standalone package.

## v0.13.4 — 2026-10-15

- Set the Authoring 3D default camera to the requested tilted reference: Green left, Red right, Yellow above and Blue below.
- Use the same orientation on startup and Reset view; retain centered framing, zoom and rotation off by default.

Validation: projected axis directions/slopes and startup/reset state in source and delivered HTML; documentation and standalone checks. Visual acceptance pending.

## v0.13.3 — 2026-10-15

- Deliver both Graphic Design - Smooth and Graphic Design - Bands with the current tutorial and branding updates preserved.
- Synchronize the guide: only pressing Random applies the chosen interpolation. Both variants share harmony, value/chroma variation, fixed points and Add accents. Legacy Graphic Design restores as Bands.

Validation: both seeded variants, restoration and actual Undo/Redo; documentation synchronization and standalone package checks.

## v0.13.2 — 2026-10-15

- Tutorial, reviewed end to end:
  - Every step that changes color keeps the Preview lit as "Live preview", including Random and color-key selection; color steps no longer advance on their own — after the action you keep playing and press Next.
  - New 3D steps: what the color solid is (lightness up, hue around, chroma outward, like Munsell's color tree), reading your gradient as a path, and how to rotate, pan and zoom.
  - Shape the gradient spotlights both the ramp and the key list; picking a key there counts.
  - New layer steps: switching the Random ON/OFF chip, and where Replace image, Blend mode, Opacity and Normalize values are. New color-vision step: pick a mode (the dropdown stays usable in the spotlight); attention and bloom get their own step.
  - Search completes only when it finds presets, with suggestions otherwise; Apply a preset clears an empty search.
  - Completion effects are now additive light sparks with drifting embers, also on each finished task.
  - Card placement avoids covering spotlights and the Preview; the tour redraws only when something moves (no per-frame repaint).
- Brand: header and loading screen share one set of brand tokens (mark, OKLab gradient wordmark, VFX tag); the wordmark is larger. The loading screen shows the current version (it showed 0.12.1).
- 3D rotation is off by default.
- Documentation: new "Reading the 3D view" section; Tutorial mention updated.
- Tests: work/test_onboarding_e2e.py (Playwright) covers first launch, full playthrough with every task, persistence, Not now and replay, Skip step/Back/keyboard/Escape/click shield, search with and without results, narrow 430 px with host scrolling, reduced motion and shared branding.

Validation: 7/7 end-to-end scenarios in headless Chromium; onboarding and documentation checks. Live browser acceptance pending.

## v0.13.1 — 2026-10-15

- Tutorial wording: the intro button reads "Tutorial", missions are now steps ("Step 1 of 3", "Next step"), and the stars are removed. The progress bar and completion cards remain.
- While a color control is in play (wheel, sliders and 3D, gradient map, Random, applying a preset), the tutorial keeps the Preview lit as a second spotlight labeled "Live preview"; it glows while you drag or change values, so the edit and its effect read together. The card avoids covering the Preview.
- Header wordmark now carries an OKLab hue gradient at near-constant lightness with chroma varying per stop.
- Documentation Quick start tip updated to match.

Validation: onboarding and documentation checks; headless browser run of the full tour with no console errors. Live browser acceptance pending.

## v0.13.0 — 2026-10-15

- Add a guided onboarding in the style of a mobile game tutorial: three missions (Pick your colors, See them in action, Build your library) with a spotlight on the control in play, hands-on tasks that advance when performed, stars, progress and a reward per mission.
- Open the tutorial automatically after the splash on first launch; remember completion or skip in the app's saved state. Add a Tutorial button beside Editor and Documentation to replay it. Esc leaves; arrow keys navigate.
- Redesign the header logo: "Ca" element-tile mark matching the splash, solid "Color Atlas" wordmark with tighter spacing, outlined VFX tag.
- Documentation: mention the Tutorial in Quick start and Interface and shortcuts.

Validation: onboarding module, persistence and target checks; documentation checks; headless browser run of the full tour (desktop and 430 px narrow) including every task, reload persistence and replay, with no console errors. Live browser acceptance pending.

## v0.12.2 — 2026-10-15

- Rewrite the Documentation page as a shorter, task-first guide: 10 topics instead of 20, about 4,000 words instead of 12,600. Remove implementation trivia, hidden Munsell/OKLCh views, legal disclaimers and per-topic bibliographies; formulas move to one collapsible technical reference.
- Add 10 interactive examples: signal lookup, OKLab slice with gamut fitting, Smooth vs linear RGB vs Bands, Normalize values, blend modes, harmony hues, bloom, color-vision simulation, PNG UV sampling and sRGB decoding.
- Add Unreal Engine 5 setup steps (texture settings, material UVs, Niagara) and a shortcuts table. Examples start only when their topic opens; the editor is unchanged.

Validation: documentation content, navigation and math checks (examples match the editor's color evaluator); headless browser run of every example control without console errors; narrow-layout inspection. Live browser acceptance pending.

## v0.12.1 — 2026-10-14

- Replace one-shot Normalize values with a contextual checkbox for the selected image layer, off by default.
- Preserve source pixels and assets; switching off restores original values. Each layer stores its own toggle in browser state, saved presets and Undo/Redo.
- Use cached normalized fields for preview, PNG export and Random analysis; replacing an image recomputes its field with the current toggle.

Validation: per-layer context, immutable source/alpha, extrema and no-op cases, cache invalidation, document compatibility, compositing and Undo/Redo; documentation and standalone checks.

## v0.12.0 — 2026-10-14

- Add Normalize values to Layers: stretch the selected image’s nontransparent grayscale min/max to 0–255.
- Preserve alpha, gradient maps and other layers. Bake the result into the current layer’s PNG for preset persistence; Undo restores the prior image.
- Leave full-range, constant-value and fully transparent images unchanged. This is a min/max stretch, not histogram equalization or matching area ratios.

Validation: alpha-aware extrema, original/other-layer preservation, PNG encoding, no-op cases and Undo/Redo; documentation and standalone package checks. Temp_Design already spans 0–255 and therefore does not change.

## v0.11.8 — 2026-10-14

- Treat Add layers as the 10% accent role in Graphic Design Random, using the shared palette’s accent hue across their tonal variants.
- Keep Add’s lowest key black and next dark key at low chroma; use vivid accent chroma above them.
- Preserve positions/count, alpha, value ordering, ON/OFF targets, Bands-on-Random and Undo/Redo. The accent role does not force a 10% pixel area or layer opacity.

Validation: 12 seeded mixed Normal/Add scenes, accent hue consistency, black/quiet low keys, OFF isolation and fixed positions; existing Graphic Design and Undo/Redo checks; documentation and package.

## v0.11.7 — 2026-10-14

- Keep current interpolation when choosing a Random mode. Apply Bands for Graphic Design only when Random runs; other Random modes apply Smooth when run.

Validation: menu changes preserve interpolation in both directions; actual Random selects Bands/Smooth; graphic palette and Undo/Redo regressions, documentation and release package checks.

## v0.11.6 — 2026-10-14

- Expand Graphic Design Random to 15 internal families: six hue harmonies plus editorial, Swiss-poster-inspired, Bauhaus-inspired, retro, digital, luxury, botanical, playful and duotone recipes.
- Vary hue and per-point chroma within each recipe, mixing controlled supporting tones with vivid accents.
- Preserve authored points, ordered per-key value, alpha, automatic Bands and Undo/Redo.

Validation: 400 seeded plans cover harmonic and curated families; 24 full palette runs verify structure/value/chroma, other modes and Undo/Redo; documentation and standalone release checks. Recipes are app-authored creative choices, not validated design standards.

## v0.11.5 — 2026-10-14

- Give each Graphic Design point its own ordered value and varied chroma, avoiding repeated flat tones within hue groups.
- Randomize a broad value profile from L 12–20 to 90–96 and per-key chroma at 65–95% of the available gamut. Keep positions/count, alpha, Bands and the 60/30/10 hue-family guide.

Validation: 24 seeded palettes with distinct ordered values and chroma variation, exact point positions/alpha, OFF isolation, other-mode Smooth behavior and actual Undo/Redo; documentation and package checks.

## v0.11.4 — 2026-10-14

- Preserve every existing Graphic Design color point and its exact position; change only colors. Keep ordered value, alpha and automatic Bands.
- Treat 60/30/10 as a color-assignment guide at authored positions, rather than moving points to enforce region widths.

Validation: 24 seeded palettes, exact point count/positions including uneven spacing, value order, alpha/OFF preservation, other modes using Smooth and Undo/Redo; documentation and package checks.

## v0.11.3 — 2026-10-14

- Keep Graphic Design colors in ascending value order while retaining randomized 60/30/10 span assignment and vibrant gamut-relative chroma.
- Use Bands automatically for Graphic Design, with exact nominal region boundaries. Selecting or applying other Random modes uses Smooth.
- Preserve alpha, OFF layers and Undo/Redo. Graphic Design still rebuilds six color stops; it preserves value order, not each original luminance.

Validation: 24 seeded ordered palettes and exact spans; all 12 other modes restore Smooth; alpha/OFF preservation, actual Undo/Redo, documentation and release checks.

## v0.11.2 — 2026-10-14

- Remove the successful “Preset loaded” status line. Keep loading and failure messages; the empty line collapses automatically.

Validation: quiet successful load, existing preset restoration and failure paths, documentation and standalone release checks.

## v0.11.1 — 2026-10-14

- Replace Graphic Design’s ordered dark-to-light ramp with three vivid 60/30/10 regions in randomized grayscale-axis order.
- Randomize value assignment independently; use 80–97% of the available sRGB chroma at each chosen hue/lightness.
- Rebuild six color stops with narrow smooth transitions. Preserve alpha and OFF layers; Undo/Redo restores prior keys. Span widths do not guarantee image-area percentages or text contrast.
- This mode no longer follows VFX Add black-key rules or preserves key positions/value hierarchy. Other modes are unchanged.

Validation: 24 seeded palettes, exact nominal 60/30/10 spans, at least five value orders, vibrant chroma, fixed alpha/OFF layers, actual Undo/Redo, documentation and standalone release checks.

## v0.11.0 — 2026-10-14

- Add Temp_Design from the supplied JPEG, with one Normal image and five opaque grayscale keys from black to white.
- Seed the preset once per browser/path scope, retaining later edits or deletion and existing personal presets. Ship the source image in Data defaults.
- Add Graphic Design Random: shared hue family, neutral ink/paper, secondary tone and colored accent. Ink/paper endpoints have at least 7:1 contrast; intermediate pairs require separate review.
- Preserve key count/spacing, alpha, ON/OFF selection and Undo/Redo. This mode adjusts lightness for design contrast; existing Random modes retain their behavior.

Validation: seeded palette diversity/contrast, grayscale preset structure, one-time browser seeding/deletion, existing Random/history checks, documentation and release package. Live browser acceptance pending.

## v0.10.48 — 2026-10-14

- Shift the loading explosion further left, from 5% to 8%. Retain 2.3× zoom and 5% downward offset.

Validation: exported transform/clipping, embedded image identity, documentation and standalone release checks.

## v0.10.47 — 2026-10-14

- Increase the loading explosion zoom to 2.3× and shift it 5% downward, retaining its 5% left offset and panel clipping.

Validation: exported transform/clipping, embedded image identity, documentation and standalone release checks.

## v0.10.46 — 2026-10-14

- Reuse the header’s studio-brand COLOR ATLAS wordmark in the loading title, matching capitalization, type weight, tracking, size, responsive sizing, gradient and VFX styling.
- Retain the white Ca badge and existing loading layout/artwork.

Validation: shared wordmark class/markup, header typography parity, embedded assets, documentation and standalone package checks. Live visual acceptance pending.

## v0.10.45 — 2026-10-14

- Shift the loading explosion 5% left within its panel, keeping 2× zoom and clipping.

Validation: exported transform/clipping, embedded image identity, documentation and standalone release checks.

## v0.10.44 — 2026-10-14

- Increase the loading explosion zoom from 1.6× to 2×, retaining panel clipping and the focal point.

Validation: exported transform/clipping, embedded image identity, documentation and standalone release checks.

## v0.10.43 — 2026-10-14

- Make loading Ca lettering and badge border white. Apply the main Color Atlas gradient to the loading title; keep VFX muted.

Validation: scoped white badge/title gradient styles, embedded assets, documentation and release package checks.

## v0.10.42 — 2026-10-14

- Increase the loading explosion zoom from 1.3× to 1.6×, preserving the clipped panel and focal point.

Validation: exported image transform/clipping, embedded PNG identity, documentation and standalone package checks.

## v0.10.41 — 2026-10-14

- Defer selection scale feedback until a pointer edit ends. Keep markers steady during Color Wheel, gradient and slider drags while colors/Preview update live.
- Coalesce release and final model feedback into one pulse; clear deferred feedback on blur/reduced motion.

Validation: no pulse during repeated drag updates, one release pulse, blur cleanup, pointer/keyboard feedback and reduced motion; documentation and release package checks.

## v0.10.40 — 2026-10-14

- Use the same active --atlas-chroma theme variable as the final Color Atlas logo style for loading Ca lettering.

Validation: final logo-gradient parity, embedded loading assets, documentation and package checks.

## v0.10.39 — 2026-10-14

- Match the loading Ca lettering to the Color Atlas logo gradient, including its sRGB fallback and OKLab enhancement.

Validation: exact gradient parity, text-only clipping, synchronized documentation and standalone release checks.

## v0.10.38 — 2026-10-14

- Randomize loading phases from 3–6, with distinct messages, varied increasing percentages and 220–420ms holds. Keep bar, text and accessible progress synchronized, ending at 100%.
- Zoom the loading explosion 1.3× inside its clipped panel.
- Preserve startup readiness, Skip/Escape, focus and reduced-motion behavior; progress remains decorative.

Validation: 30 seeded openings, phase/count/timing variation, monotonic synchronized progress, unique phrases, readiness and cancellation regressions; documentation and release package checks.

## v0.10.37 — 2026-10-14

- Further mute Color Wheel hue-name labels from #929292 to #666666. Colored dots, ring and key numbers remain unchanged.

Validation: scoped direct-child SVG text rule, documentation synchronization and release package checks; live visual acceptance pending.

## v0.10.36 — 2026-10-14

- Record Gradient Map point drags as one Undo/Redo action. Capture gesture completion before SVG handlers stop event propagation.
- Preserve the 10-action window and Position slider behavior. No-op selections add no history entry.

Validation: real gradient/history modules with capture/bubble dispatch, multiple moves, pointerup/cancel, position Undo/Redo and no-op selection; existing Random, opacity, shortcut, deletion and history-limit checks; documentation and release packaging.

## v0.10.35 — 2026-10-14

- Focus Delete when the shared deletion confirmation opens, allowing native Enter activation. Escape and Cancel still cancel; no deletion occurs before confirmation.

Validation: initial Delete focus, confirmation/cancel, native text-field Delete and layer-removal checks; synchronized documentation and release package. Browser-native Enter acceptance remains unverified live.

## v0.10.34 — 2026-10-14

- Shorten and center the Post-process bloom control to distinguish it from panel dividers.
- Embed the supplied Explosion_Loading.png in the loading card and display the release version. Keep the dynamic staged percentage and existing readiness/Skip behavior.

Validation: embedded PNG byte identity, version label, scoped responsive slider bounds, loading progression/Skip/reduced-motion tests, documentation and standalone release checks. Live visual acceptance pending.

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
