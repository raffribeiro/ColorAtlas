# Release maintenance

VERSION and CHANGELOG.md in the development workspace are the canonical version and change history. Current public release series starts at v0.9; iteration continues toward v1.0.

## Delivery layout

- /Users/raffribeiro/Documents/ColorAtlas/App: runnable browser HTML, README, VERSION and Data.
- /Users/raffribeiro/Documents/ColorAtlas/Realase: changelog, current manifest, release instructions, Manifests and Archives. The spelling Realase is intentional, requested by the user.
- /Users/raffribeiro/Documents/ColorAtlas is a local Git repository on branch release. It tracks App and release metadata. Personal Data JSON and ZIP archives are ignored. No remote/push is configured.

## Every delivered change

1. Update CHANGELOG.md in English. Preserve past release entries. Increment VERSION: patch for fixes/polish, minor for substantial features until v1.0.
2. Regenerate and validate affected documentation and the final page.
3. Run work/package_standalone.py from the development workspace. This updates App while preserving its existing Data JSON. It automatically runs work/sync_release_folder.py.
4. The sync validates the version and HTML hash, creates a sharing ZIP with empty Data templates, copies release metadata to Realase and commits branch release if tracked content changed.
5. Confirm the release branch is clean and matches App. Never overwrite an existing published ZIP with different HTML; use a new version.

Use Realase/Archives/ColorAtlas-v<VERSION>.zip when sharing a clean build. Runtime data is not part of Git or generated sharing archives. Manually zipping App may include your current Data; close app tabs before copying it.

Automated checks are distinct from live browser acceptance. Record actual validation and limitations. Chrome/Edge directory access requires the user's permission; other browsers do not support this edition. Existing browser data is not migrated automatically.
