# Color Atlas v1.2.3 — approved favicon and public counter release

Owner approved the presented counter and favicon on 2026-10-20. Only those changes and corresponding docs/tests/release metadata were integrated from develop.

## Artifacts

- Source integration: afdd3c90f9233685ea6e0c5af7202a5e7fb09219.
- Local distribution commit: 1145d65.
- Pages commit: 7b6277e7f8f57a76823b6868c34d77cd134ea7e2.
- Pages deployment: https://github.com/raffribeiro/ColorAtlas/actions/runs/39495501524 — success.
- Offline App SHA256: 4064e07f09492ffadf2cd14cb8eb02216d20feb24a3e6bd9f640e88f1979a622.
- Pages SHA256: e2687378f3830923768cb0841f13f1fe80c9cca4f7524aae8720619f202fe8bd.
- The difference is the deterministic Pages-only host counter/policy transform. Release ZIP still matches offline App exactly.

## Validation

The implementation review passed all 55 current checks. After approval, six build-group checks, exact nine-language embedding, documentation/core synchronization and strict offline CSP checks passed again. Packaged Pages browser acceptance passed with intercepted counter requests, including failure/local guards. Personal Data JSON hashes and all older release archives were preserved; ZIP integrity and entry bytes match App. No personal files were committed.

Real HTTPS acceptance confirmed live bytes equal the generated Pages artifact, favicon data SVG present, exactly one intentional validation hit received with HTTP200 and an SVG reporting hits:1. Public dashboard weekly/monthly/total each showed1. There were no page errors or CSP violations. WebDriver exclusion was disabled only in the isolated validation context; other automated tests sent no real service hits. Dashboard verification blocked its preview badge to prevent a second validation hit.

## Interpretation

Public stats: https://hits.sh/raffribeiro.github.io/ColorAtlas/ . The initial hit is this verification, not an external visitor. Counts are approximate loads, not unique people; public badge requests, dashboard badge previews, bots, repeated loads, caching and blockers can affect them. There is no private dashboard or authenticated protection against fabricated hits. Historical visits cannot be reconstructed. Offline App remains uncounted; no editor images/palettes/presets/query/referrer data is read or sent by the counter integration.

Runtime personal folders Images/ and VERSIONS/ found untracked in the local distribution repository were preserved. Both Git checkouts have clean tracked state; main/develop publication remains manually approval-gated and Pages remains gh-pages root.
