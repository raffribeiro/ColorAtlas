# Private GitHub repository

Color Atlas v1.2.0.

- `App/`: runnable offline app; open `App/COLOR_ATLAS_START_HERE.html`.
- `Source/`: development modules, canonical HTML snapshot, catalogs, documentation, build scripts and tests.
- `Realase/`: release metadata and manifests. Archive ZIPs remain local.
- `release` branch: original distribution history; `main`: distribution plus development snapshot.

## Build snapshot

From `Source/`, run `python3 work/build_standalone.py canonical/munsell-selector.html`. Output: `Source/outputs/munsell-color-picker.html`.

Some installers, packaging tools and tests retain original macOS workspace paths or sibling tool dependencies. Read `Source/AGENTS.md` and `Source/docs/ARCHITECTURE.md` before running them elsewhere. Configure target paths before release packaging.

Personal runtime Data, virtual environments, logs, old HTML backups and archive ZIPs are excluded. Built-in default assets are included. No hosting or public deployment is configured.
