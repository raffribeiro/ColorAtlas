---
title: Reviewed, measurable and navigable Color Atlas sources
type: refactor
created: 2026-10-16
status: done
baseline_commit: NO_VCS
context: []
---

<frozen-after-approval reason="User requested an autonomous code review, organization, comments and optimization for LLM maintenance">
## Intent

Review the complete source inventory and the active app/build paths, then make the code easier to navigate, safer to modify and cheaper to execute where evidence justifies it. The project mixes a canonical HTML app, editable modules, export-only integrations, compiled bundles, historical patches and generated pages; without a map an agent can edit the wrong file or replay an obsolete installer. Deliver a maintained entry point, explicit source ownership, reproducible validation and focused improvements backed by checks.

## Boundaries & Constraints

Always preserve user data, storage scope, all existing modes, rendering interactions, English app documentation, release archives and file URLs. Keep the offline standalone browser distribution and the canonical fragment contract. Use project locks and update affected documentation with implementation. Comment contracts, units, ownership, performance assumptions and non-obvious lifecycle decisions; avoid narrating obvious statements. Treat generated assets as outputs, not new editable authorities.

Do not relocate/delete legacy files, reformat the whole embedded monolith, introduce a framework/package manager, migrate persistence or change numerical color algorithms solely for appearance. Such changes create avoidable risk and invalidate many established integration checks. No external publication or remote operations.

## I/O & Edge-Case Matrix

| Scenario | State | Expected behavior | Failure handling |
|---|---|---|---|
| Find implementation | Feature named by a user | Short map points to source, installation and relevant tests | Unknown feature yields clear error/list |
| Build unchanged sources | Current canonical + editable modules | Valid offline standalone, Graphic Design variants retained | Missing/duplicate integration anchors fail before publishing |
| Review all files | Current workspace | Every source file classified; generated/history distinguished | Unknown ownership is reported, never guessed |
| Cached graphics | Same lightness, moving camera | Same geometry/colors; avoid recomputing invariant serialization | Cache stays bounded and respects math identity |
| Verification | Focused or full checks | Captured pass/fail and durations; actionable failures | Exit nonzero on failure; historical incompatible checks labeled explicitly |
</frozen-after-approval>

## Code Map

- `build_standalone.py`, `fit_local_page.py`: canonical assembly and export-only integrations.
- `atlas-lab-surface.js`, `atlas-neutral-axis.js`: projected constant-lightness graphics and neutral reference.
- `atlas-onboarding.js`, `atlas-history-core.js`, Preview/Random modules: lifecycle, transactions and heavy work.
- `install_*.py`, `check_*.cjs`, `test_*.py`: source synchronization and historical/current regressions.
- Root `AGENTS.md`, `work/DOCUMENTATION.md`, `work/RELEASES.md`: existing constraints.

## Tasks & Acceptance

- [x] Review the complete file inventory and active dependency paths; record verified findings and limits in `reports/codebase-review.md`.
- [x] Add root `README.md`, `docs/ARCHITECTURE.md`, curated `work/module-map.json` and concise `work/AGENTS.md` so future agents can load relevant context only.
- [x] Add `work/project_index.py` and its checks to generate/search a bounded source index without embedding image payloads or duplicating editable code.
- [x] Add `work/check_project.py` for explicit current validation groups, clear timing and failure reports; do not silently count obsolete tests as passing.
- [x] Apply measured runtime/build improvements identified in review, using existing modules and their installers. Add focused regression coverage before behavior changes.
- [x] Add useful comments to touched ownership/performance/lifecycle boundaries and update affected English docs.
- [x] Rebuild, validate desktop/narrow interactions and onboarding, package the next patch and verify data preservation and release consistency.

Acceptance: Given a feature, an agent can identify its authoritative sources and relevant checks without reading the generated standalone. Given unchanged input, build refactoring preserves runtime behavior and integration order. Given a graphics cache hit, rendered geometry stays identical while invariant work is reused. Given a failed check, validation does not hide it. Given the packaged app, wheel/graph gestures, undo, tutorial restoration and bundled modes continue to work.

## Design Notes

The source map complements the existing architecture rather than creating another source copy. Review coverage will distinguish inventory/static inspection from dynamic acceptance, and actual measurements from projected savings. Preserve historical fixtures; list incompatible ones as maintenance debt instead of mass editing tests to mirror new implementation.

## Verification

Run current graph/surface/axes/live-editing checks, color/gradient/history/random checks compatible with the active code, documentation/source synchronization, source-index/runner checks and Python/JS syntax. Use existing isolated Playwright scenarios for onboarding, desktop/narrow wheel and drag guide lifecycle. Compare targeted invariant-work counters or timings before/after; never claim a whole-app speedup from one microbenchmark. Package and verify tracked release files and runtime Data hashes.

## Suggested Review Order

**Ownership**

- Source authority, runtime contracts and safe agent editing workflow.
  [ARCHITECTURE.md:1](../docs/ARCHITECTURE.md#L1)

**Runtime**

- Camera events coalesce without changing synchronous core draw contracts.
  [atlas-lab-live-color.js:5](atlas-lab-live-color.js#L5)

**Runtime**

- Immutable snapshot signatures avoid repeated large serializations.
  [atlas-history-core.js:1](atlas-history-core.js#L1)

**Runtime**

- Invariant contours share bounded lightness cache with rasters.
  [atlas-lab-surface.js:68](atlas-lab-surface.js#L68)

**Build**

- Explicit wrapper order and atomic output replacement.
  [atlas_build.py:1](atlas_build.py#L1)

**Build**

- Reject branch, immutable-version and archive-integrity conflicts before live writes.
  [release_preflight.py:1](release_preflight.py#L1)

**Navigation**

- Small feature contexts and metadata-only pruned inventory.
  [project_index.py:1](project_index.py#L1)

**Validation**

- Union current checks, preserve failures and allow full browser-suite timeouts.
  [check_project.py:1](check_project.py#L1)

**Evidence**

- Verified findings, measurements, remaining debt and actual validation limits.
  [codebase-review.md:1](../reports/codebase-review.md#L1)


Delivery: v1.0.7, local release commit `339e3c9`. All45 current checks pass; onboarding9/9, graphics browser8/8 and actual extracted ZIP desktop/narrow wheel acceptance pass. No remote operation.
