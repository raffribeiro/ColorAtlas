# PNG export options

The existing Export PNG action opens a native modal dialog, without downloading.
The default remains the active gradient at 256 × 16 px with alpha.

Options:
- Width: integer 1–4096 px.
- Height per layer: integer 1–1024 px.
- Current layer or both layers in a single PNG. Both layers are stacked vertically, Importance 01 above Importance 02; total height is twice the entered height.
- Preserve alpha or export opaque color.
- Editable file name; path characters are replaced and the `.png` suffix is normalized.

The preview and export use the editor's existing `gradientSample` and `encodeSRGB` functions, preserving Smooth/Bands interpolation and the active palette without changing editor state. The PNG is a gradient texture; the explosion image and its preview effects are not included.

The modal supports Escape, its close button, Cancel, and backdrop click. Native dialog focus handling traps focus; closing restores focus to Export PNG. Cancel while encoding aborts the pending download. Blob URLs are released after download.

Source module: `work/atlas-png-export.js`, embedded in the canonical selector's main script.
Style: `work/atlas-png-export.css`, embedded as `atlas-png-export-style`.

Validation: `node work/check_png_export.cjs` first failed because the modal did not exist, then passed after implementation. It exercises open without download, dimensions, file name, alpha, two-layer ordering, live active palette, Bands, pixel endpoints, invalid input, cancel, focus return, URL cleanup and state preservation. Existing app initialization, layout and Motion checks also pass. Live browser acceptance remains unverified because this session's file-browser access was denied.

## Exported host regression

The standalone renderer originally supplied `sandbox="allow-scripts"`. That blocks native form submission before the submit listener runs, and independently blocks downloads. The local `fit_local_page.py` patch now adds only `allow-forms allow-downloads` to this specific export. It preserves the opaque origin, popup/navigation restrictions and both CSPs with `form-action 'none'`; the submit handler still prevents form navigation. The shared renderer is unchanged.

`python3 work/check_png_export_host.py` first failed on the missing `allow-forms` capability, then passed after the host patch. It validates the actual exported iframe, both download requirements and retained restrictions. Run it after rendering and fitting so future regeneration cannot silently reintroduce the blocked download. Live browser download remains unverified under the existing browser access restriction.

Reference: https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#form-submission-algorithm and https://html.spec.whatwg.org/multipage/browsers.html#sandboxing.
