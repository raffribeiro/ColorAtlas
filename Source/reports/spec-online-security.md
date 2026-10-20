---
title: Harden online Color Atlas and improve project presentation
type: chore
created: 2026-10-19
status: complete
baseline_commit: 0d7e959
context: []
---

## Intent

Owner authorizes implementing AND publishing the security recommendations from the initial review, and improving GitHub presentation. Work on develop; publish only after relevant validations. This explicit authorization covers this release, not future unrelated changes.

## Boundaries

Preserve offline use, opaque sandbox (no allow-same-origin), editor math, authored bloom default, browser data/URLs, export/import format and localized experience. Do not add backend, tracking, login or secrets. Keep packaging/archive invariants. Do not promise absolute security or claim approval rules are technically enforced if only documented.

## Work

- Restrict host CSP: remove eval/wasm-eval and unused remote sources; retain narrowly needed inline scripts/styles, data/blob assets and self frame. Verify runtime with CSP violation monitoring.
- Validate source+correlation+boolean response for library/tutorial request replies; inspect all frame message boundaries. Wildcard target for opaque iframe is necessary and retained with source checks.
- Reject oversized library JSON before file.text(), bound import collections and validate malformed payloads without changing existing library.
- Guard image dimensions before drawing and, where practical, before decode; preserve PNG/JPEG/WebP20MB support. Add focused tests first and user-facing limits docs/translations.
- Enable GitHub secret scanning/push protection, available dependency alerts/updates and private vulnerability reporting. Protect main/gh-pages against force push/deletion without blocking owner-approved publication. Keep workflow permissions read-only. No automatic app deploy from develop/main.
- Improve repository homepage with a clear branded banner, screenshot, concise useful structure and security reporting path; use repo-native SVG assets.

## Acceptance

Valid import/export roundtrip, tour/replay, language menus, layers and image import continue working. Invalid sender cannot spoof host replies, oversized inputs rejected before expensive work, strict CSP no violations in normal workflows. Tests cover malformed/oversized files and cross-window messages. Repo settings read back; actual Pages deployment smoke checked. Security and app docs updated together. All source/generated files synchronized on develop before approved integration/main publication. Version patch expected1.2.2.

## Verification

Focused red-green regressions; current static checks; browser security/import/export/tour/language tests on generated and final HTTPS app; validate GitHub rendered homepage/settings and final release hash/preservation.

## Authorized steering before publication

Owner additionally requested bloom up to700% with explicit permission to publish, then requested uploaded images be stored in the browser. Existing IndexedDB writes were bypassed on normal startup by the Default wrapper. Extend this release to retain the saved working image stack on reload, first-launch/offline fallback to builtin, no deletion of user presets; preserve opaque sandbox and per-address local storage. Bloom default100 remains unchanged.

## Review fixes and evidence

Security review found incomplete palette validation and a drag/drop predecode bypass. Palette imports now reuse cleanUserPalettes schema; drop and chooser share metadata guard before decode. Browser backup test now creates a real palette, favorite and image Preview preset, imports its exported file in a clean profile and compares nonempty data. Reviews accepted the schema/roundtrip fixes. Initial50 static checks and9 onboarding cases passed; final range/persistence checks follow.

## Final result

v1.2.2 packaged and published; 53 current checks passed, focused browser regressions passed locally and on HTTPS. Live HTML matches the packaged hash. See online-security-release.md for artifact identities, settings readback and preservation evidence.
