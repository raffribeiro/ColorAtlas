# Color Atlas: editor layout

Authoring Colors and Preview have aligned panel headings. Keys retains its
Color Wheel toolbar title. Sections keep their accessible labels. Preview
toolbar migration preserves the two current panel headings.

The Color Wheel, toolbar and resize divider sit below the selected-color strip in Place Keys.
Position, Export PNG, Gradient Map and interpolation share the ramp toolbar
row, with wrapping on compact viewports. Gradient Map spans Authoring Colors
and Keys; Preview spans both rows beside them and holds its image-layer stack.
The structure and Importance dropdowns were removed. Structures are chosen
automatically; the existing layer toggle preserves access to both layers, with
a tooltip and accessible label identifying the current layer. The harmony hue-range dropdown was removed;
soft, wide and bold ranges are selected automatically during harmonic generation. Export PNG and Random share the same primary
action styling (Chroma outline, transparent rest, darker hover, press Motion). Author Color retains compact single-line HEX controls without the redundant
Base sRGB caption. Desktop column weights remain 1.05 / .65 / 1.4, with 260 px and
200 px minimums for Author Color and Place Keys.

The default wheel viewport height is 200 px, matching the latest supplied reference
approximately. The key list and Author graph fill their available height,
so the same proportions adapt to the window. Manual divider adjustments
override the wheel default for the current page. A reload starts at 200 px.

The wheel divider trades height with the scrollable key list. Measured fixed
controls, wheel toolbar, padding and gaps are reserved before dividing the
remaining Keys height. Requests preserve an 84 px list and 80 px wheel whenever
164 px is available, with wheel requests bounded at 200 px; smaller budgets
shrink both proportionally. The Author graph fills its own remaining height
and wheel resizing never changes that graph. The wheel toolbar uses one compact row for the title and Reset view.
The all-colors toggle was removed. The Black–White track keeps its gradient
without a surrounding box stroke. Saturation shows its current value above
a slider with 0% and 100% endpoint labels.

Editable source:
`/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html`.
`author-wheel-layout.css` is the readable copy of `atlas-author-wheel-layout`.
The workspace build embeds the same CSS without comments. Centered desktop
dividers now resize neighboring columns, the Gradient Map boundary and the
Preview/Layers boundary. The graph handle is visible again on desktop and
manual graph height is constrained to its independently fitted budget. New
handles support arrow keys and double-click/Home reset, and retain sizes for
the current page. Their scoped styles and compiled module are installed by
`install_workspace_resize.py` after other installers.

Verification: `check_wheel_layout.py`, `check_key_panel_budget.cjs`,
`check_author_wheel_resize.cjs`, and existing Motion, live wheel preview,
selection and fullscreen export checks. The changed layout, budget and resize
checks failed against the previous implementation. Live browser visual
acceptance remains unavailable in this session.

## Wheel orientation

Yellow / positive OKLab b is above the center; Blue / negative b is below.
Green / negative a remains left and Red / positive a remains right. The chroma
samples, hue-ring geometry and arc sweeps, selected markers, nearest-key hit
test and pointer-to-Lab conversion all use this orientation. Existing colors,
lightness, alpha, key positions, zoom and pan values retain their meanings.

`node work/check_wheel_orientation.cjs` failed first against the old Yellow
label position, then passed after the change. Resolution and live press/drag
preview regressions also pass.

## Palette sidebar default

For viewports at least 1200 px wide, the palette column starts at 310 px,
approximating the user reference at 1744 × 980. Smaller viewports retain the
existing compact layout. The pointer/keyboard divider continues to override
this default via its existing inline important grid-template-columns setting;
manual bounds remain 140–420 px. No persisted palette state changes.
