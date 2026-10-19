---
title: Lighter onboarding without flow changes
type: refactor
status: verified
baseline_commit: NO_VCS
created: 2026-10-16
context: []
---

## Intent

Reduce idle geometry work and recurring paint during the tutorial while preserving every step, interaction requirement, key-4 preparation, responsive placement, accessibility, user-state snapshots and restoration. Keep the immutable v1.0.0 ZIP; deliver a measured patch.

## Plan

- Replace the perpetual placement animation-frame loop in `atlas-onboarding.js` with coalesced invalidation on user input, scrolling, viewport messages, observed layout/DOM changes and step changes. Follow moving marker hints while needed; avoid reacting to the overlay’s own DOM writes. Disconnect/cancel observers, timers and frames on exit.
- Cache geometry measurements within each placement pass. Retain current candidate scoring and viewport/clipping rules.
- Simplify CSS highlight paint cost, keeping static visible outlines and transform/opacity hints. Reduce particle counts, blur and update frequency with bounded concurrent particles. Cancel delayed camera animation once a step is left.
- Update the English guide and maintenance notes, install modules and rebuild standalone.
- Measure old/new stationary tour layout calls and Chromium task duration using isolated profiles. Add scheduler tests for coalescing, stability, moving graphics, resize/scroll/host viewport and stop cleanup. Run all nine onboarding browser scenarios and test the packaged artifact before delivery.

## Acceptance

Given a stationary step, after layout settles no recurring placement frames read geometry. Given input/scroll/resize/host movement or external DOM changes, the overlay follows the target and remains in view. Given a moving selected marker hint, its position updates. Given the tour exits, scheduled callbacks and observers stop. Given the user completes or leaves the tour, the original workspace returns. Existing steps and reduced-motion behavior remain.

## Verification

`work/check_onboarding_performance.cjs`, current structural/viewport/key checks and `work/test_onboarding_e2e.py`; before/after benchmark records distinguish measurement overhead and CPU emulation. Preserve app data and prior ZIPs during v1.0.1 packaging.

## Results

All nine onboarding browser scenarios passed on the final tutorial revision. Scheduler/camera cleanup checks pass. In isolated 2.5-second stationary samples, tour geometry reads fell from about 576/s (native wheel step) and 1190/s (4x CPU wheel step) to zero. Renderer task duration at native speed varied upward; these short runs do not establish an overall app speedup. At 4x CPU the wheel sample fell from 2134 to 978 ms, including underlying app work. See `reports/onboarding-performance-v1.0.1.json`.

User requested a decorative neutral cylinder during final validation. Added a thin Black–White spine with a selected-lightness ring, using existing OKLab color math and camera projection. No extra animation loop or input target. Projection, axes and live editing checks pass.
