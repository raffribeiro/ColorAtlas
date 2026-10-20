# Public page-load counter — review pending

2026-10-20. Owner chose the simple no-account Hits.sh counter. No publication approval was requested or assumed; main, gh-pages, App, Realase and VERSION are unchanged.

## Scope

`work/build_pages.py` creates a separate Pages-only variant from the offline artifact. The top-level image policy gains only the exact counter SVG URL. No remote script, connect-src access or editor iframe changes. The fixed counter key is `raffribeiro.github.io/ColorAtlas`; the public dashboard is https://hits.sh/raffribeiro.github.io/ColorAtlas/ . These are loads, not unique-person analytics; bots, repeat visits and blocking/caching affect totals. No retrospective counts.

The embedded first-party `atlas-hits.js` counts only visible top-level pages at the exact production origin/path. No local addresses, different deployments, WebDriver, DNT or GPC. No editor state or storage access. No user query/hash/referrer/preset/image data is sent. The cache-buster is random per request, not a persistent user identifier. Counter failures never gate app startup. The offline distribution remains network-disabled.

## Validation

- 55 current checks passed, zero failed; known/historical checks stay separate.
- Unit tests cover one count after duplicate initialization, visibility delay, offline/other origins, wrong paths, frames, bot/opt-out guards and fixed URL fields.
- Pages transform tests preserve iframe bytes and sandbox, restrict the added host image path, preserve connect-src none and refuse duplicate injection.
- Chromium acceptance intercepts production and counter requests: one per open/reload, no query/referrer leakage, zero CSP violations, local variant silent, blocked service leaves editor available. No real service hits sent during tests.
- English guide and all nine offline catalogs regenerated and validated; source navigation registers build/runtime/tests.

## Approval and activation

Review artifacts: `outputs/munsell-color-picker.html` (normal offline) and `outputs/pages-index.html` (Pages variant; still silent when opened locally). Sources and artifacts are on develop with the previously prepared favicon. Approval is still required before packaging/versioning/main/gh-pages. At publication generate Pages from the approved packaged App, then compare live bytes to that transformed Pages file. Do not compare the live Pages hash directly to offline App after this feature.

Activation and a real dashboard increment remain unverified until publication. Do not claim live analytics before that verification.
