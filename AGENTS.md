# Color Atlas — GitHub workflow

Respond in Brazilian Portuguese unless asked otherwise. Read `Source/AGENTS.md`, `Source/docs/ARCHITECTURE.md` and `GITHUB.md` for source ownership and build constraints.

## Explicit approval gate (owner decision, 2026-10-19)

- Default working branch: `develop`. Use `feature/<name>` from develop to isolate concurrent requests.
- Prepare every requested change on a development branch, including source, documentation and a validated review build. Commits/pushes to develop are allowed; they must not deploy the site.
- `main` contains approved work. `gh-pages` contains only the approved published distribution. `release` preserves distribution history. Do not develop directly on these branches.
- Publish only after the human owner explicitly approves the presented revision (“ok” or equivalent). Approval is specific to that revision, not future changes or unrelated pending work.
- If develop includes unapproved work, integrate only approved commits. Never publish all pending changes merely because one request was approved.
- Before approval: build, run relevant checks and provide a local preview/artifact; do not run packaging that overwrites the live local App/release records.
- After approval: integrate approved changes into main, complete versioning/package checks as needed, update gh-pages from the validated distribution and verify the deployment plus live URL.
- Pages must stay configured to `gh-pages` root. Do not enable auto-publication on pushes to main/develop or bypass approval via automation.
- Preserve personal browser data, Data JSON, existing release archives and local preview URLs. Never commit personal runtime files.

The original workspace is not itself a Git checkout. Keep edited source modules, canonical snapshot and relevant generated review artifacts synchronized into `Source/` on the development branch; generated HTML alone is not an adequate source commit.
