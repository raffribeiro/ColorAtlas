# Color Atlas changelog

Changes are tracked from v0.9 onward. Earlier development is represented by this baseline, without reconstructed release history.

## Unreleased

No changes yet.

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
