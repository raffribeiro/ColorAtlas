# GitHub repository

Color Atlas v1.2.1.

- `App/`: runnable offline app; open `App/COLOR_ATLAS_START_HERE.html`.
- `Source/`: development modules, canonical HTML snapshot, catalogs, documentation, build scripts and tests.
- `Realase/`: release metadata and manifests. Archive ZIPs remain local.
- `release` branch: original distribution history; `main`: distribution plus development snapshot.

## Build snapshot

From `Source/`, run `python3 work/build_standalone.py canonical/munsell-selector.html`. Output: `Source/outputs/munsell-color-picker.html`.

Some installers, packaging tools and tests retain original macOS workspace paths or sibling tool dependencies. Read `Source/AGENTS.md` and `Source/docs/ARCHITECTURE.md` before running them elsewhere. Configure target paths before release packaging.

Personal runtime Data, virtual environments, logs, old HTML backups and archive ZIPs are excluded. Built-in default assets are included. The repository is public, as requested by its owner.

## Online app — GitHub Pages

Open https://raffribeiro.github.io/ColorAtlas/ . Pages publishes only the static `gh-pages` branch at `/`. That branch contains the tracked distribution App files with `COLOR_ATLAS_START_HERE.html` served as `index.html`, plus `.nojekyll`; it excludes development sources and personal runtime files.

Publication currently uses a validated snapshot, not an automatic deployment from `main` or `release`. For an update, copy tracked `App/` files from the tested release into `gh-pages`, rename the entry to `index.html`, preserve `.nojekyll`, and test via HTTP before pushing. Verify Pages deployment and the live URL afterward. Never copy personal `App/Data` files.

Browser workspaces are scoped to their address and browser profile. Existing local-file workspaces do not move automatically to the HTTPS site; use the app's Export/Import controls where available.

## Approval-gated workflow

Owner decision (2026-10-19): new changes go to `develop` (or an isolated `feature/<name>` branch), not directly to the live site. The owner reviews a validated local preview/build. Only an explicit approval of that revision authorizes integration into `main`, release packaging and publication to `gh-pages`.

Approval does not include unrelated pending work. If several changes are in progress, integrate only approved commits. Pushes to `main` and `develop` must not deploy automatically; Pages remains configured to the `gh-pages` root. See root `AGENTS.md` for the operational rules.
