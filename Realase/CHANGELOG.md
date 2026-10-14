# Color Atlas changelog

Changes are tracked from v0.9 onward. Earlier development is represented by this baseline, without reconstructed release history.

## Unreleased

No changes yet.

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
