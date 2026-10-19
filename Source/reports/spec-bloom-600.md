---
title: Extend Preview bloom to 600 percent
type: feature
created: 2026-10-19
status: done
baseline_commit: 7283f483a25f404fe8cc31d30414c2577599c7da
context: []
---

## Intent

User requests more intensity range above 100%, ending at 600%, on Post-process bloom. Implement on develop and provide a local review build. Publishing requires later explicit owner approval; the implementation request authorizes preparing this change, not updating the live site.

## Boundaries & Constraints

Preserve default 100%, zero behavior, existing values, color math, layer controls, existing local data, synchronous render and bounded passes. Update English authored docs plus all nine full-localization catalogs; preserve exact catalog key sets/placeholders. No publish, release packaging, VERSION change or live App/Realase write before approval.

## I/O matrix

| Scenario | Input | Expected |
|---|---|---|
| Initial/reset | fresh state/default reset | 1 (100%) |
| Full range | slider maximum | 6 (600%) with live output |
| Restored higher intensity | 2,4,6 | retain requested finite value |
| Out of range | -1,9 | clamp to 0,6 |
| Invalid restore | nonfinite | preserve prior valid state |
| Renderer | 6 | finite alpha <=1, bounded screen passes, visibly stronger than 1 |

## Code Map

- Canonical munsell-selector.html: slider HTML, restore and drawHotBloom implementation.
- work/check_bloom_default.cjs: existing baseline restore/default VM regression.
- work/build_documentation.py: Bloom explanation and example markup.
- work/atlas-documentation-examples.js: interactive Bloom example controls/render if range needs alignment.
- work/locales/full/*.json: exact prose keys/values containing the old 0–200% range.
- work/build_standalone.py / fit_local_page.py: build review output only.

## Tasks & Acceptance

- [x] Extend focused failing regression before source changes, then minimal canonical update.
- [x] Update docs and localized copies/range in interactive example if applicable.
- [x] Generate/install docs, build standalone and run affected static/browser checks.
- [x] Synchronize source/build changes into github-repository Source on develop; create local commit for review. Do not push site/main or run packaging.

Acceptance: 600% is reachable, shows correctly, survives explicit state restoration and Undo/Redo; reload retains the existing authored-default policy (100%); 100% stays default; English and localized docs match; live site stays on old published SHA.

## Verification

node work/check_bloom_default.cjs; relevant documentation/localization/history checks; isolated browser review build at 100%,600%, undo/redo and authored-default reload; bounded renderer-pass assertions. No broad full tutorial rerun unless controls targeted by tutorial change.

## Spec Change Log

Browser reload exposed the existing unconditional resetDefaultExplosion startup policy. Preserve that established behavior: fresh/reloaded app opens at100%; explicit restore accepts6 and Undo/Redo retain6 within the session. No new persistence policy is introduced by this range-only change.

## Verification results

- RED: focused regression failed at slider maximum600 before canonical edits. GREEN: node work/check_bloom_default.cjs and START_VFX=1 both pass. Renderer at600 uses11 finite alpha-bounded passes.
- 48 current checks pass; known/historical checks separate. New browser test passed actual rendered changes, Undo/Redo exact preview restoration,600 readout and authored100 startup on reload, guide max600; no browser errors.
- Blind/edge/acceptance reviews reported no actionable introduced defects. Acceptance reviewer confirmed authored-startup preservation and narrow exact clamp normalization in the core-equivalence audit.
- Source/canonical/generated review output synchronized to local develop checkout. No version increment, package, main push or site publication.

## Suggested Review Order

- Slider and state restoration share the reviewed600% limit.
  [munsell-selector.html](../github-repository/Source/canonical/munsell-selector.html#L59)
- Guide prose and interactive example cover the full range.
  [build_documentation.py:270](../work/build_documentation.py#L270)
- Focused range/default/renderer regression.
  [check_bloom_default.cjs](../work/check_bloom_default.cjs#L14)
- Browser assertions cover preview pixels, history and startup policy.
  [test_bloom_range_e2e.py](../work/test_bloom_range_e2e.py#L17)
