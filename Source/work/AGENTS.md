# Working in Color Atlas sources

Inherit root `AGENTS.md`; it owns locks, canonical path, documentation and release rules.

Before broad searches, read `../docs/ARCHITECTURE.md` or run:

```sh
python3 work/project_index.py context <feature>
python3 work/check_project.py --group <feature>
```

Run commands from the workspace root. `module-map.json` records exact source/installer/check routes and ordered export integrations. It does not make every legacy installer safe to replay.

- Edit readable module sources. `*-bundle.js`, `atlas-documentation.html` and `../outputs/` are generated.
- Canonical HTML remains the source for core closure/state/math/rendering. Installed module bodies come from their source files; edit and reinstall them there.
- Comment contracts, units, ordering, cache lifetime and teardown; avoid repetitive narration.
- Keep synchronous core draw contracts. Coalesce hot event callers and flush at gesture end.
- Use current validation groups; list known/historical failures honestly. Never import installers as a discovery technique: some old scripts still write on import.
- Publishing is `package_standalone.py`, not a QA check. Preserve all existing release archives and personal data.
