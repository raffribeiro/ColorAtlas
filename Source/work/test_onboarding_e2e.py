"""End-to-end tests for the Color Atlas onboarding tour (Playwright, headless Chromium).

Usage (from the workspace root):
  python3 -m venv .venv-playwright
  .venv-playwright/bin/python -m pip install -r work/requirements-test.txt
  .venv-playwright/bin/python -m playwright install chromium
  .venv-playwright/bin/python work/test_onboarding_e2e.py [path/to/app.html]
Default page: outputs/munsell-color-picker.html. Exit code 1 on any failure.

Each scenario starts from a fresh browser profile, so first-launch behavior is real.
"""
import asyncio, json, sys, time
from pathlib import Path
from playwright.async_api import async_playwright

APP = Path(sys.argv[1] if len(sys.argv) > 1 else 'outputs/munsell-color-picker.html').resolve().as_uri()
BOOT_MS = 9000          # splash + editor reveal + 700 ms tour delay
results, failures = [], []


def check(cond, msg):
    if not cond:
        raise AssertionError(msg)


class Tour:
    def __init__(self, page):
        self.page, self.errors = page, []
        page.on('pageerror', lambda e: self.errors.append(str(e)))
        page.on('console', lambda m: self.errors.append(m.text) if m.type == 'error' and 'autofocus' not in m.text.lower() else None)

    @property
    def fr(self):
        return self.page.frames[1]

    async def boot(self):
        await self.page.goto(APP)
        await self.page.wait_for_timeout(BOOT_MS)

    async def state(self):
        return await self.fr.evaluate("""() => { const t = document.querySelector('#atlas-tour'), c = t.querySelector('.atlas-tour-card'), n = c.querySelector('[data-tour=next]');
          return { open: !t.hidden, kind: c.dataset.kind, title: c.querySelector('h2').textContent, label: c.querySelector('.atlas-tour-mission').textContent,
                   waiting: c.dataset.waiting === 'true', success: c.dataset.success === 'true', next: n.hidden ? null : n.textContent,
                   back: !c.querySelector('[data-tour=back]').hidden, spot: t.dataset.spot, xp: parseFloat(c.querySelector('.atlas-tour-xp i').style.width) || 0,
                   watch: !t.querySelector('.atlas-tour-watch').hidden, saved: window.AtlasOnboardingStore.get() } }""")

    async def next(self):
        await self.fr.click('[data-tour=next]')
        await self.page.wait_for_timeout(450)

    async def card_visible(self):
        """Card fully inside the browser viewport (works when the host page scrolls the frame)."""
        box = await (await self.fr.query_selector('.atlas-tour-card')).bounding_box()
        vp = self.page.viewport_size
        return box and box['x'] >= -1 and box['y'] >= -1 and box['x'] + box['width'] <= vp['width'] + 1 and box['y'] + box['height'] <= vp['height'] + 1

    async def geometry(self):
        """Spotlight hole, linked preview ring and card rectangles (frame coordinates)."""
        return await self.fr.evaluate("""() => { const r = s => { const e = document.querySelector(s); if (!e || e.hidden || getComputedStyle(e).display === 'none') return null; const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom }; };
          return { hole: r('#atlas-tour .atlas-tour-hole'), watch: r('#atlas-tour .atlas-tour-watch'), card: r('#atlas-tour .atlas-tour-card') } }""")

    async def target_in_hole(self, selector):
        return await self.fr.evaluate("""s => { const el = document.querySelector(s), h = document.querySelector('#atlas-tour .atlas-tour-hole'); if (!el) return false;
          const a = el.getBoundingClientRect(), b = h.getBoundingClientRect(); return a.left >= b.left - 1 && a.right <= b.right + 1 && a.top >= b.top - 1 && a.bottom <= b.bottom + 1; }""", selector)


async def until(t, cond, timeout=5000, every=150):
    end = time.time() + timeout / 1000
    while time.time() < end:
        s = await t.state()
        if cond(s): return s
        await t.page.wait_for_timeout(every)
    return await t.state()


def overlap(a, b):
    return a and b and a['l'] < b['r'] and a['r'] > b['l'] and a['t'] < b['b'] and a['b'] > b['t']


async def drag(page, fr, selector, dx=25, dy=-20):
    box = None
    for _ in range(20):                                  # the 3D view re-renders its markers while it moves
        el = await fr.query_selector(selector)
        box = el and await el.bounding_box()
        if box: break
        await page.wait_for_timeout(150)
    check(box, f'nothing to drag at {selector}')
    x, y = box['x'] + box['width'] / 2, box['y'] + box['height'] / 2
    await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + dx, y + dy, steps=6); await page.mouse.up()


# Each entry: (kind, title, selector expected inside the spotlight, action, live preview ring shown, user advances after the action)
async def do_key(t): await t.fr.click('[data-gradient-select]')
async def do_wheel(t): await drag(t.page, t.fr, '.studio-wheel svg')
async def do_ramp(t): await t.fr.select_option('#artist-transition', 'bands')
async def do_random(t): await t.fr.click('[data-action="random-all-layers"]')
async def do_search(t): await t.fr.fill('#studio-search', 'fire')
async def do_preset(t): await t.fr.click('[data-studio-preset]')
async def do_chip(t): await t.fr.click('#preview-layer-list .preview-layer-random[aria-pressed=false]')
async def do_vision(t):
    await t.fr.click('#color-vision'); await t.page.wait_for_timeout(300)
    await t.fr.click('#color-vision-options [role="option"]:nth-child(3)')
async def do_circle(t): await drag(t.page, t.fr, 'svg.mp-vfx-lab .lab-current-marker', 12, -8)
async def do_rotate(t):
    box = await (await t.fr.query_selector('svg.mp-vfx-lab')).bounding_box()
    x, y = box['x'] + 30, box['y'] + box['height'] - 30
    await t.page.mouse.move(x, y); await t.page.mouse.down(); await t.page.mouse.move(x + 60, y - 10, steps=6); await t.page.mouse.up()
PLAN = [
    ('mission', 'Pick your colors', None, None, False, False),
    ('step', 'Choose a color key', '.studio-key-row[data-selected=true]', do_key, True, True),
    ('step', 'Paint with the wheel', '.studio-wheel', do_wheel, True, True),
    ('step', 'The color solid', 'svg.mp-vfx-lab', None, True, False),
    ('step', 'Your gradient in 3D', 'svg.mp-vfx-lab', do_circle, True, True),
    ('step', 'Look around', 'svg.mp-vfx-lab', do_rotate, True, True),
    ('step', 'Fine-tune', '#mp-vfx-l', None, True, False),
    ('step', 'Shape the gradient', '.studio-ramp', do_ramp, True, True),
    ('step', 'Key tools', '[data-action="gradient-add"]', None, True, False),
    ('step', 'Undo and Redo', '.atlas-history-controls', None, False, False),
    ('reward', None, None, None, False, False),
    ('mission', 'See them in action', None, None, False, False),
    ('step', 'Live preview', '.mp-explosion-previews', None, False, False),
    ('step', 'Layers', '#preview-layer-list', None, True, False),
    ('step', 'Build the scene', '[data-preview-action="replace"]', None, True, False),
    ('step', 'Blend and opacity', '#preview-blend', None, True, False),
    ('step', 'Normalize values', '[data-preview-action="normalize-values"]', None, True, False),
    ('step', 'Choose what Random can touch', '.preview-layer-random', do_chip, True, True),
    ('step', 'Roll the dice', '[data-action="random-all-layers"]', do_random, True, True),
    ('step', 'See it as others do', '#color-vision', do_vision, True, True),
    ('step', 'Attention and bloom', '.studio-attention-control', None, True, False),
    ('reward', None, None, None, False, False),
    ('mission', 'Build your library', None, None, False, False),
    ('step', 'Browse the library', '.studio-library', None, False, False),
    ('step', 'Search presets', '#studio-search', do_search, False, False),
    ('step', 'Apply a preset', '.studio-library', do_preset, True, True),
    ('step', 'Save your palette', '[data-action="gradient-save"]', None, False, False),
    ('step', 'My palettes', None, None, False, False),
    ('step', 'Save the whole scene', '.preview-preset-toolbar', None, False, False),
    ('step', 'Ship it', '[data-action="gradient-png"]', None, False, False),
    ('reward', None, None, None, False, False),
    ('guide', 'Explore Documentation', '[data-studio-view="documentation"]', None, False, False),
    ('final', 'Tutorial complete!', '.atlas-tour-tab', None, False, False),
]


async def play_through(t, narrow=False):
    s = await t.state()
    check(s['open'] and s['kind'] == 'intro' and s['next'] == 'Tutorial', f'intro card on first launch: {s}')
    check('gradient maps' in await t.fr.evaluate("document.querySelector('#atlas-tour-text').textContent"), 'intro states the purpose: gradient maps and color palettes')
    await t.next()
    xp = -1
    for i, (kind, title, target, action, linked, free) in enumerate(PLAN):
        s = await t.state()
        where = f'#{i} {kind} {title}'
        check(s['open'] and s['kind'] == kind, f'{where}: expected {kind}, got {s}')
        if title: check(s['title'] == title, f'{where}: title {s["title"]!r}')
        if kind in ('guide', 'final'):
            text = await t.fr.locator('#atlas-tour-text').inner_text()
            check(('interactive examples' in text) if kind == 'guide' else ('replay this tour' in text), 'ending explains one destination at a time')
        check(s['xp'] >= xp, f'{where}: progress went backwards ({xp} → {s["xp"]})'); xp = s['xp']
        check('Mission' not in s['label'] and '★' not in s['label'], f'{where}: wording uses steps, no stars: {s["label"]!r}')
        check(await t.card_visible(), f'{where}: card outside the visible viewport' + (' (narrow)' if narrow else ''))
        if title == 'Choose what Random can touch':
            s = await until(t, lambda x: x['title'] == title and x['spot'] == 'on' and x['waiting'])
        if target:
            check(s['spot'] == 'on', f'{where}: spotlight off')
            if not narrow: check(await t.target_in_hole(target), f'{where}: {target} not inside the spotlight')
            if title == 'Roll the dice':
                check(await t.fr.locator('.preview-layer-random[aria-pressed=true]').count() == 2, 'Random retains the layer choices from the preceding step')
                await t.fr.locator('#preview-preset-select:not([disabled])').wait_for()
                check(await t.fr.locator('#preview-preset-select').input_value() == 'codex-use-esse', 'Random starts from Default')
                check(await t.fr.locator('#random-type').input_value() == 'auto', 'Random starts in Harmonic')
            if title == 'Attention and bloom':
                check(await t.fr.locator('#color-vision').input_value() == 'normal', 'Attention and bloom restores Regular Vision')
                check(not await t.fr.locator('#vision-comparison').is_visible(), 'Vision comparison is hidden')
            if title == 'Look around':
                check(await t.fr.locator('.atlas-tour-hand').get_attribute('data-gesture') == 'rotate', 'Look around demonstrates a drag gesture')
            if title in ('Paint with the wheel', 'The color solid', 'Your gradient in 3D'):
                await t.page.wait_for_timeout(1400)
                check(await t.fr.evaluate("document.querySelector('.studio-key-row[data-selected=true]')?.textContent.trim().startsWith('4')"), f'{where}: key 4 selected for the user')
            if not narrow and title == 'Shape the gradient':
                check(await t.fr.evaluate("[...document.querySelectorAll('#atlas-tour .atlas-tour-hole-extra')].some(e => !e.hidden)"), f'{where}: key list spotlight missing')
        if not narrow:
            g = await t.geometry()
            check(s['watch'] == linked, f'{where}: live preview ring {"missing" if linked else "unexpected"}')
            if linked: check(not overlap(g['card'], g['watch']), f'{where}: card covers the live preview')
        if action:
            check(s['waiting'] and s['next'] is None, f'{where}: task step must wait for the action ({s})')
            await action(t)
            s2 = await until(t, lambda x: x['success'] or x['title'] != title)
            check(s2['success'] or s2['title'] != title, f'{where}: action not recognized')
            if free:
                await t.page.wait_for_timeout(1200)
                s3 = await t.state()
                check(s3['title'] == title and s3['next'] == 'Next', f'{where}: color step must wait for Next so the user can keep playing ({s3})')
                if linked: check(s3['watch'], f'{where}: live preview stays lit while playing')
                await t.next()
            else:
                s3 = await until(t, lambda x: x['title'] != title or x['kind'] != kind)
                check(s3['title'] != title or s3['kind'] != kind, f'{where}: did not advance after the action')
        else:
            check(s['next'] is not None, f'{where}: missing Next button')
            await t.next()
    s = await t.state()
    check(not s['open'] and s['saved'] and s['saved']['status'] == 'done', f'completion saved: {s}')


async def scenario(name, fn, viewport=(1600, 1000), reduced=False):
    import os
    if os.environ.get('ONLY') and os.environ['ONLY'].lower() not in name.lower(): return
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(viewport={'width': viewport[0], 'height': viewport[1]}, reduced_motion='reduce' if reduced else 'no-preference')
        t = Tour(await ctx.new_page())
        started = time.time()
        try:
            await t.boot()
            await fn(t)
            check(not t.errors, f'console/page errors: {t.errors}')
            results.append(f'PASS  {name} ({time.time() - started:.0f}s)'); print(results[-1], flush=True)
        except Exception as e:  # noqa: BLE001 - report every scenario
            import traceback
            failures.append(f'FAIL  {name}: {e}\n' + ''.join(traceback.format_exc().splitlines(True)[-4:])); print(failures[-1], flush=True)
            await t.page.screenshot(path=f'/tmp/onboarding-fail-{name.split()[0].lower()}.png')
        finally:
            await browser.close()


async def s_first_launch(t):
    s = await t.state()
    check(s['open'] and s['kind'] == 'intro', 'tour opens by itself after the splash')
    check(not await t.fr.evaluate("document.getElementById('atlas-splash').open"), 'splash closed before the tour')
    check(await t.fr.evaluate("document.querySelector('.studio-workspace-nav .atlas-tour-tab')?.textContent.trim() === 'Tutorial'"), 'Tutorial button beside Editor/Documentation')
    check(await t.fr.evaluate("[...document.querySelectorAll('.studio-workspace-nav button')].map(b=>b.textContent.trim()).join('|').includes('Editor|Documentation|Tutorial')"), 'button order Editor, Documentation, Tutorial')
    check(await t.fr.evaluate("!document.querySelector('#atlas-tour').innerHTML.includes('atlas-guide')"), 'no mascot')
    check(not await t.fr.evaluate("document.getElementById('lab-auto-rotate').checked"), '3D rotation starts off')
    same = await t.fr.evaluate("""() => { const a = getComputedStyle(document.querySelector('.atlas-lockup .studio-brand')), b = getComputedStyle(document.querySelector('#atlas-splash h1 .studio-brand'));
      const m1 = getComputedStyle(document.querySelector('.atlas-lockup-mark')), m2 = getComputedStyle(document.querySelector('#atlas-splash .splash-mark'));
      return a.backgroundImage === b.backgroundImage && a.fontFamily === b.fontFamily && m1.backgroundImage === m2.backgroundImage }""")
    check(same, 'loading screen and header share the brand gradient, font and mark')


async def s_full(t):
    await play_through(t)
    await t.page.reload(); await t.page.wait_for_timeout(BOOT_MS)
    s = await t.state()
    check(not s['open'] and s['saved']['status'] == 'done', 'completed tour does not reopen after reload')
    # editor writes keep the flag
    await t.fr.click('[data-gradient-select]'); await t.page.wait_for_timeout(600)
    await t.page.reload(); await t.page.wait_for_timeout(BOOT_MS)
    check(not (await t.state())['open'], 'progress survives editor writes')
    # overlay is gone: editor is clickable
    await t.fr.click('[data-action="gradient-add"]', timeout=3000)


async def s_not_now(t):
    await t.fr.click('[data-tour=skip]'); await t.page.wait_for_timeout(400)
    s = await t.state()
    check(not s['open'] and s['saved']['status'] == 'skipped', f'Not now closes and remembers: {s}')
    await t.page.reload(); await t.page.wait_for_timeout(BOOT_MS)
    check(not (await t.state())['open'], 'skipped tour does not reopen')
    await t.fr.click('[data-studio-view=documentation]'); await t.page.wait_for_timeout(300)
    await t.fr.click('.atlas-tour-tab'); await t.page.wait_for_timeout(600)
    s = await t.state()
    check(s['open'] and s['kind'] == 'mission' and await t.fr.evaluate("document.getElementById('munsell-picker').dataset.view") == 'editor', 'Tutorial replays from Documentation in the Editor view')


async def s_controls(t):
    await t.next(); await t.next()                        # intro → mission 1 → first step
    s = await t.state(); check(s['waiting'] and s['next'] is None, 'task step hides Next')
    await t.page.wait_for_timeout(6400)
    s = await t.state(); check(s['next'] == 'Skip step', f'Skip step appears after 6 s: {s["next"]}')
    await t.next(); s = await t.state(); check(s['title'] == 'Paint with the wheel', 'Skip step advances')
    await t.fr.click('[data-tour=back]'); await t.page.wait_for_timeout(400)
    check((await t.state())['title'] == 'Choose a color key', 'Back returns to the previous step')
    await t.fr.click('[data-tour=skip]'); await t.page.wait_for_timeout(6000) # allow workspace restoration/reload
    await t.fr.click('.atlas-tour-tab'); await t.page.wait_for_timeout(500)
    await t.fr.focus('[data-tour=next]'); await t.page.keyboard.press('ArrowRight'); await t.page.wait_for_timeout(400)
    check((await t.state())['title'] == 'Choose a color key', 'ArrowRight advances')
    await t.page.keyboard.press('Escape'); await t.page.wait_for_timeout(6000) # reacquire the restored frame
    check(not (await t.state())['open'], 'Escape leaves the tour')
    # clicks outside the spotlight are blocked while it runs
    await t.fr.click('.atlas-tour-tab'); await t.page.wait_for_timeout(400); await t.next(); await t.page.wait_for_timeout(300)
    before = await t.fr.evaluate("document.querySelector('#studio-search').value")
    blocked = await t.fr.evaluate("""() => { const r = document.querySelector('#studio-search').getBoundingClientRect(); const e = document.elementFromPoint(r.left + 5, r.top + 5); return !!e.closest('#atlas-tour'); }""")
    check(blocked and before == '', 'controls outside the spotlight are shielded')


async def s_search(t):
    # jump to the library: intro → mission 1 … skip steps until Search presets
    await t.next()
    for _ in range(40):
        s = await t.state()
        if s['title'] == 'Search presets': break
        if s['next'] is None: await t.page.wait_for_timeout(6300)
        await t.next()
    check((await t.state())['title'] == 'Search presets', 'reached the search step')
    await t.fr.fill('#studio-search', 'zzqqxx'); await t.page.wait_for_timeout(700)
    s = await t.state(); task = await t.fr.evaluate("document.querySelector('.atlas-tour-task').textContent")
    check(s['title'] == 'Search presets' and s['waiting'] and 'No presets found.' in task, f'a search with no results does not complete the step ({task!r})')
    await t.fr.fill('#studio-search', 'ice')
    check((await until(t, lambda x: x['title'] == 'Apply a preset'))['title'] == 'Apply a preset', 'a search with results completes the step')
    # coming back with an empty result: the apply step clears the search so presets are visible
    await t.fr.click('[data-tour=back]'); await t.page.wait_for_timeout(400)
    await t.page.wait_for_timeout(6300); await t.fr.fill('#studio-search', 'zzqqxx'); await t.page.wait_for_timeout(500)
    await t.next()
    check((await t.state())['title'] == 'Apply a preset', 'skip to apply')
    check(await t.fr.evaluate("document.querySelector('#studio-search').value") == '' and await t.fr.evaluate("[...document.querySelectorAll('.studio-library [data-studio-preset]')].some(b=>b.getBoundingClientRect().width>0)"), 'apply step restores visible presets')


async def s_restore(t):
    keys = "[...document.querySelectorAll('.studio-key-row')].map(r=>r.textContent.replace(/Copy HEX/g,'').trim()).join('|')"
    chips = "[...document.querySelectorAll('.preview-layer-random')].map(b=>b.getAttribute('aria-pressed')).join()"
    await t.fr.click('[data-tour=skip]'); await t.page.wait_for_timeout(600)
    before = (await t.fr.evaluate(keys), await t.fr.evaluate(chips))
    await t.fr.click('.atlas-tour-tab'); await t.page.wait_for_timeout(500)
    await t.next()                                                     # mission → key step
    await t.fr.click('.studio-key-row:nth-of-type(2) [data-gradient-select]'); await t.page.wait_for_timeout(400)
    await t.next()
    await drag(t.page, t.fr, '.studio-wheel svg', -40, 30); await t.page.wait_for_timeout(400)
    await t.fr.click('#preview-layer-list .preview-layer-random', force=True); await t.page.wait_for_timeout(400)
    await t.fr.click('[data-action="random-all-layers"]', force=True); await t.page.wait_for_timeout(600)
    check(await t.fr.evaluate(keys) != before[0], 'the tour changed colors')
    await t.page.keyboard.press('Escape')
    await t.page.wait_for_timeout(6000)                                # restore + host reload
    after = (await t.fr.evaluate(keys), await t.fr.evaluate(chips))
    check(after == before, f'workspace restored after the tutorial: {before} → {after}')
    check(not await t.fr.evaluate("document.getElementById('atlas-splash').open"), 'no splash after the restore reload')
    check((await t.state())['saved']['status'] == 'skipped' and not (await t.state())['open'], 'tutorial stays closed after the restore')


async def s_library_io(t):
    await t.fr.click('[data-tour=skip]'); await t.page.wait_for_timeout(400)
    check(await t.fr.evaluate("!!document.querySelector('.atlas-library-io [data-library-io=export]')"), 'Export / Import on the library heading')
    async with t.page.expect_download() as dl:
        await t.fr.click('[data-library-io=export]')
    path = await (await dl.value).path()
    data = json.loads(Path(path).read_text())
    check(data['format'] == 'color-atlas-library' and isinstance(data['favorites'], list) and isinstance(data['previewPresets'], list), f'export file shape: {list(data)}')
    data['palettes'] = data['palettes'] + [{'id': 'user-e2e-imported', 'name': 'E2E imported', 'description': '', 'activeLayer': 'emission', 'layers': {'emission': {'colors': [{'t': 0, 'hex': '#101010'}, {'t': 1, 'hex': '#FFEEAA'}], 'alphas': [{'t': 0, 'a': 1}, {'t': 1, 'a': 1}], 'transition': 'smooth'}}}]
    imp = Path('/tmp/onboarding-import.json'); imp.write_text(json.dumps(data))
    await t.fr.set_input_files('[data-library-io=file]', str(imp))
    await t.page.wait_for_timeout(7000)
    lib = await t.fr.evaluate("document.querySelector('.studio-library').textContent")
    check('E2E imported' in lib, 'imported palette appears in My palettes after the reload')
    check(not (await t.state())['open'], 'import does not reopen the tutorial')


async def s_narrow(t):
    await play_through(t, narrow=True)


async def s_reduced(t):
    s = await t.state(); check(s['open'], 'tour opens with reduced motion')
    anim = await t.fr.evaluate("getComputedStyle(document.querySelector('#atlas-tour .atlas-tour-hole')).animationName")
    check(anim == 'none', f'reduced motion disables tour animation ({anim})')


async def main():
    await scenario('First launch and Tutorial button', s_first_launch)
    await scenario('Full playthrough, persistence and editor afterwards', s_full)
    await scenario('Not now, no reopen, replay from Documentation', s_not_now)
    await scenario('Skip step, Back, keyboard, Escape and click shield', s_controls)
    await scenario('Workspace restored after the tutorial', s_restore)
    await scenario('Library export and import', s_library_io)
    await scenario('Search with and without results', s_search)
    await scenario('Narrow 430 px with host-page scrolling', s_narrow, viewport=(430, 900))
    await scenario('Reduced motion', s_reduced, reduced=True)
    print('\n'.join(results + failures))
    print(f'\n{len(results)} passed, {len(failures)} failed')
    sys.exit(1 if failures else 0)

asyncio.run(main())
