# Color Atlas VFX

Offline browser tool for authoring OKLab colors, gradient maps and layered VFX/design previews. Open the delivered `ColorAtlas/App/COLOR_ATLAS_START_HERE.html`. No server is required.

For development, read [AGENTS.md](AGENTS.md), then [the architecture map](docs/ARCHITECTURE.md). App-facing documentation remains in English and ships inside the app.

## Find the right source

```sh
python3 work/project_index.py context graphics
python3 work/project_index.py context history
python3 work/project_index.py inventory
python3 work/project_index.py validate
```

Features: graphics, history, random, preview, onboarding, documentation, library, motion, workspace, analysis, export, build, release. [module-map.json](work/module-map.json) is the curated source/install/check routing map and the exact export-extension order. The index reads file metadata and symbol names; it does not duplicate the app or print embedded image payloads.

## Validate

```sh
python3 work/check_project.py --list
python3 work/check_project.py
python3 work/check_project.py --group graphics
.venv-playwright/bin/python work/check_project.py --group graphics --browser wheel --browser drag-guides
```

Browser checks require the existing Playwright environment and Chromium. They use isolated profiles. The full onboarding suite is `--browser onboarding` and takes several minutes. Known failures and historical checks are listed separately in the manifest, never counted as successful; `--audit-known` executes them and exits nonzero if they fail.

## Build and deliver

1. Claim sources through `work/agent_lock.py`; claim `@build` before installation/build/release.
2. Edit module sources, compile their bundle if needed, then inspect the per-source `routes` entry and run its compiler/installer. Feature installer lists are not an automatic chain; legacy migration warnings apply. A standalone build does not replay all historical installers.
3. For documentation: `python3 work/build_documentation.py`, then `python3 work/install_documentation_v2.py`.
4. Build with `python3 work/build_standalone.py`. It preserves the previous output if assembly fails. Run affected checks and browser acceptance.
5. Follow [release maintenance](work/RELEASES.md): increment `VERSION`, prepend `CHANGELOG.md`, then `python3 work/package_standalone.py`. Packaging writes the live App and commits its local release branch; it is not a test command.

The canonical core is the absolute HTML fragment identified in `AGENTS.md` and the manifest. `outputs/` and `*-bundle.js` are generated. Existing installers synchronize editable modules into the canonical core; export-only modules are injected later. Never edit generated HTML to fix a source problem.

[Review findings and evidence](reports/codebase-review.md) distinguish actual checks, historical debt and measurement limits. Previous releases, personal Data JSON and legacy source snapshots are preserved.
