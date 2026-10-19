# Source ownership and runtime contracts

Read root `AGENTS.md` first. This map describes the current browser app; it is not a framework migration or a new copy of editable sources. For one task, load the relevant feature with `python3 work/project_index.py context <feature>`.

## Assembly and authority

```text
Editable modules ── optional build_* compiler ── named install_* ─┐
Canonical HTML core (color math, state, rendering, bindings) ────┤
                                                               ↓
standalone shell + frame prefix/suffix → build_standalone.py
                                       → fit_local_page.fit_page()
                                         + ordered export integrations
                                         + offline images + host storage bridge
                                       → atomic generated output
                                       → checks / browser acceptance
                                       → package + preflight + local release commit
```

`work/module-map.json` owns feature routes and export integration order. Root `AGENTS.md` owns the canonical absolute path. Existing sources are intentionally not moved: installers/tests use these paths. Inventory classifies unmapped sources explicitly; classification alone does not prove a file is obsolete.

| Area | Read first | Synchronization |
|---|---|---|
| Core color math and state | Canonical functions `labColor`, `fitLabToSRGB`, `projectLab`, `drawLabPlane` | Core HTML is authoritative; reversible edit JSON records reviewed integrations |
| 3D gestures | `work/atlas-lab-live-color.js` | `build_lab_live_color.cjs`, then `install_lab_live_color.py` |
| Continuous gamut / neutral axis | `atlas-lab-surface.js`, `atlas-neutral-axis.js` | Respective named installers |
| History | `atlas-history-core.js`, `atlas-history-ui.js` | Export-only, injected by `fit_local_page` |
| Preview | `atlas-preview-layers-core.js`, `atlas-preview-layers.js`, `atlas-preview-presets.js` | Preview compiler/installer; host storage remains separate |
| Random | `atlas-random-generation.js`, `atlas-random-roles.js`, `atlas-graphic-design.js`, `atlas-random-performance.js` | Mixed canonical/export wrappers; preserve manifest order |
| Tutorial / library I/O | `atlas-onboarding*`, `atlas-library-io*` | `install_onboarding.py` |
| Guide | `build_documentation.py`, `atlas-documentation*` | Generate then `install_documentation_v2.py` |
| Offline editor languages | `atlas-i18n.js/.css`, `atlas-i18n-host.js`, `locales/*.json` | Export-only; `fit_local_page.py` embeds runtime/catalogs. Includes guide/tutorial/help and example labels. Preference is independent of authoring/history; English authored source remains canonical. |
| Build / publication | `atlas_build.py`, `build_standalone.py`, `fit_local_page.py`, `package_standalone.py`, `sync_release_folder.py` | Build prepares output; package changes live App and Git |

Paths in this table without a directory are under `work/`. The manifest lists exact files and checks, with per-source `routes` for compiled modules (compiler, installer and embedded target). Feature-level install lists are synchronization paths, not an automatic chain: choose the route for the source you edited. Some legacy installers are one-time migration scripts, not idempotent modern entry points. In particular `install_preview_layers.py` also reinstalls an old Motion vendor, and the full refinement installer can conflict with later geometry; inspect these before use and preserve motion-lite/current patches. For CSS-only refinement edits use `install_editor_refinements.py --styles-only`.

## Color and geometry

The editor uses OKLab scaled for display: L ×100, a/b ×250. Munsell is the organizing inspiration and a separate reference dataset, not a numeric conversion between scales. Hue/chroma are the polar reading of the a/b plane. Preserve matrices, gamut fitting and gradient interpolation unless a tested color-math change is intended.

`projectLab` returns screen x/y and camera depth (positive depth is farther). A horizontal constant-L slice is projected affinely. The neutral spine has separate far/near passes around that slice. At negative pitch, White is in front and Black behind. A graph camera gesture must not edit colors, positions or alpha.

The selected marker edits on its fixed L plane. SVG elements are rebuilt, so pointer capture and drag ownership live on the stable SVG, not a child marker. Color and camera edits each coalesce to one frame; completion flushes pending state. `drawLabPlane()` itself stays synchronous for other callers. Never replace it globally with an asynchronous wrapper.

## State, persistence and undo

The core closure owns `state`, preview layers, gradients and draw functions. Export extensions execute **inside that closure** and frequently capture/wrap earlier functions. Import order therefore changes behavior. History uses immutable snapshots; `read` must isolate mutable state, `signature` must be pure, and `apply` synchronous. Typed image arrays are retained by identity and must not be edited in place. History is bounded to ten actions; a gesture is one transaction.

Host `atlas-preview-storage.js` owns IndexedDB for images/previews; iframe widget state is bounded and excludes bulk assets. Scoped keys use `location.pathname + location.search`: changing the live URL changes the saved workspace scope. Message handlers validate the sending frame/action. Preserve user JSON, current browser data, and Default/Temp_Design seed rules. Session Random dice selection differs from preset/tour snapshot selection; the review records this inconsistency without changing storage policy.

## Performance boundaries

- Surface raster **and serialized contour** share an eight-entry exact-L LRU. Camera movement changes only projection, not color math. Cache invalidates when conversion-function identity changes.
- Preview scalar fields and LUTs are derived caches; normalization leaves imported bytes immutable. Buffers are reused.
- History reuses the current immutable signature; candidate snapshots are always checked.
- Tutorial placement is event-driven. No perpetual geometry polling; stop observers/timers on exit. Reduced motion remains supported.
- Keep per-event DOM reads and large `innerHTML` writes out of hot loops. Optimize with measured counters and equivalent output checks, not speculative cache growth.

## Agent workflow and comments

1. Locate the feature/source owner; inspect only its functions and neighboring contracts. Do not feed generated base64 HTML or all historical logs into context.
2. Claim files; capture baseline; add the relevant behavior regression before changing code.
3. Comment **why**, units, cache invalidation, wrapper ordering and teardown ownership. Do not add line-by-line narration or minify editable sources for token savings.
4. Compile/install only touched modules. Syntax and source synchronization checks are distinct from runtime/browser acceptance. `check_bundle_sync.cjs` executes compilers against a read-only filesystem facade and compares normalized JS outputs, catching stale bundles without writing them.
5. Use current check groups; review historical failures explicitly. Never weaken a behavioral assertion to make a refactor green.
6. Regenerate affected English docs and final page; validate the deliverable, package and verify release/Data invariants.

`work/DOCUMENTATION.md` is an append-only maintenance history; read its current contract and targeted sections, not the whole file by default. `work/doc-v1-backup-*`, before snapshots and older release notes remain historical. Legacy folder-store/fullscreen modules are not part of the current browser export.

## Build limits and tooling

The canonical fragment stays under 1 MB. Self-contained output is larger because it contains images and data. Builds use Python stdlib and Node; bundle compilation currently locates esbuild via `COLOR_ATLAS_ESBUILD` or the pre-existing sibling-project fallback. This external build dependency is documented, not silently removed. Runtime has no external asset fetches.

`fit_page()` is import-safe and returns transformed text; only CLI/build publication writes atomically. Release preflight prevents known branch/version conflicts before package writes. It does not make the whole multi-file release a transaction or protect against concurrent external edits; `@build` remains mandatory.
