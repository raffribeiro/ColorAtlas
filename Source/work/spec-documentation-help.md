---
title: Contextual help and task-oriented in-app documentation
status: verified
type: feature
created: 2026-10-16
baseline_commit: NO_VCS
context: []
---

## Intent

User approved documentation improvements 1,2,3,6: delayed hover help covering app controls, examples with a clear objective and Reset, section search with snippets/highlights and direct jumps, and remembered reading position per chapter plus a small section index. App guide/help stays English. No new recipe chapter or comparison feature was requested.

## Constraints

Preserve editor state and file/storage scope. Lightweight delegated help must handle dynamic controls, keyboard focus, disabled controls and dialogs without stealing focus or obstructing editing. Hold-to-open delay, dismiss on Escape/press/scroll, no polling loop. Existing help attributes must be restored when temporarily suppressed. Narrow viewport and reduced-motion behavior remain. Guide examples operate independently of live authoring and reset canvas/control state without accumulating listeners.

## Sources

- `atlas-context-help.js/.css`: new source-owned utility installed by named blocks.
- `atlas-documentation.js/.css`: article/section navigation, search and per-topic scroll.
- `build_documentation.py`, `atlas-documentation-examples.js`: goal labels, reset controls and lifecycle.
- `install_context_help.py`: import-safe named installer, no historical patch replay.
- `test_documentation_help_e2e.py`: actual pointer/focus/search/reset/scroll and state-preservation acceptance.

## Tasks

- [x] Implement delegated hover/focus help with broad curated control coverage and safe fallbacks.
- [x] Add section-level search/snippets/highlight and exact section navigation.
- [x] Restore scroll per topic; add a compact section index.
- [x] Give every example a clear short goal and Reset restoring all local state.
- [x] Synchronize modules, source map, English documentation and final standalone.
- [x] Verify controls/dialogs/tutorial interactions, search recovery, reset, preserved editor state, desktop/narrow layouts and current regressions.
- [x] Version, package, validate actual ZIP and preserve personal data/archives.

## Acceptance

Given pointer resting on any active app control or keyboard focus, help describes its actual action without changing state. Given a drag or active tutorial, help does not obscure it. Given a section search, results preview and highlight relevant text and open the exact section. Given chapter switches or a trip to the Editor, each chapter restores its scroll. Given any modified example, Reset restores the initial inputs and rendered state. Current interactions, math and onboarding remain valid.

## Verification

Current checks: 48 passing, known/historical checks kept separate. Browser acceptance at 1744px and 430px covers delayed hover/focus, native modal tooltip, section search including inline markup, chapter scroll, 11 repeatable resets and unchanged editor state. Canvas reset allows only <=0.1% byte differences of magnitude1, diagnosed as Chromium antialias rounding; controls/readouts remain exact. Follow-up offline language menu scope is editor UI/navigation only, with nine selections and separate preference persistence. Final archive verification follows packaging.

## Delivery

v1.1.0 packaged into App and Realase/Archives/ColorAtlas-v1.1.0.zip. Local release commit1188f4d. App SHA2565ddc0e4091555052fad2db44632ec962ebba93b540bd98f037db71fa66164f19. Tracked branch clean; committed App equals extracted ZIP. Three existing Data JSON files,104 prior archives and existing untracked files preserved. Full onboarding:9/9 scenarios pass, including narrow/reduced-motion and workspace restoration. Final extracted-ZIP locale acceptance is recorded in reports/language-menu.md.
