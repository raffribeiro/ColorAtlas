"""Compare stationary onboarding cost in isolated Chromium; no user-state writes."""
import asyncio
import json
import subprocess
import sys
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
REPORT = ROOT / 'reports/onboarding-performance-v1.0.1.json'
INSTRUMENT = """() => {
 const n={rects:0,sizes:0};window.__tourCosts=n;
 const rect=Element.prototype.getBoundingClientRect;
 Element.prototype.getBoundingClientRect=function(){n.rects++;return rect.call(this)};
 for(const [proto,key] of [[Element.prototype,'scrollHeight'],[HTMLElement.prototype,'offsetWidth'],[HTMLElement.prototype,'offsetHeight']]){
  const d=Object.getOwnPropertyDescriptor(proto,key);if(!d?.get)continue;
  Object.defineProperty(proto,key,{...d,get(){n.sizes++;return d.get.call(this)}});
 }
}"""


async def profile(p, path, rate):
    browser = await p.chromium.launch(headless=False)
    context = await browser.new_context(viewport={'width': 1440, 'height': 900})
    page = await context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    session = await context.new_cdp_session(page)
    await session.send('Performance.enable')
    await page.goto(path.as_uri())
    frame = await (await page.query_selector('#codex-visualization')).content_frame()
    await frame.locator('#atlas-tour:not([hidden])').wait_for(timeout=120000)
    try:
        session = await context.new_cdp_session(frame)
        await session.send('Performance.enable')
    except Exception:
        pass
    await session.send('Emulation.setCPUThrottlingRate', {'rate': rate})
    calibration = await frame.evaluate('''()=>{const run=()=>{let t=performance.now(),s=0;for(let i=0;i<2500000;i++)s+=Math.sin(i*.001);return performance.now()-t};run();return [run(),run(),run()]}''')
    await frame.evaluate(INSTRUMENT)
    phases = {}
    for title in ['Welcome to Color Atlas', 'Paint with the wheel']:
        for _ in range(10):
            if await frame.locator('#atlas-tour-title').text_content() == title:
                break
            # Setup only: traverse the real handlers; user-flow acceptance is separate.
            await frame.locator('[data-tour=next]').evaluate('(el)=>el.click()')
            await page.wait_for_timeout(150)
        assert await frame.locator('#atlas-tour-title').text_content() == title
        await page.wait_for_timeout(900)
        await frame.evaluate('window.__tourCosts.rects=window.__tourCosts.sizes=0')
        before = {x['name']: x['value'] for x in (await session.send('Performance.getMetrics'))['metrics']}
        await page.wait_for_timeout(2500)
        after = {x['name']: x['value'] for x in (await session.send('Performance.getMetrics'))['metrics']}
        counts = await frame.evaluate('window.__tourCosts')
        duration = after['Timestamp'] - before['Timestamp']
        phases[title] = {**counts, 'duration_seconds': duration,
                         'geometry_reads_per_second': sum(counts.values()) / duration,
                         'main_thread_task_ms': 1000 * (after['TaskDuration'] - before['TaskDuration']),
                         'layout_ms': 1000 * (after['LayoutDuration'] - before['LayoutDuration']),
                         'style_recalc_ms': 1000 * (after['RecalcStyleDuration'] - before['RecalcStyleDuration'])}
        print(f'CPU {rate} {title}: {phases[title]}', flush=True)
    await browser.close()
    assert not errors, errors
    return {'cpu_throttle': rate, 'calibration_ms': calibration, 'phases': phases, 'page_errors': errors}


async def main():
    label = sys.argv[1]
    path = Path(sys.argv[2]).resolve()
    data = json.loads(REPORT.read_text()) if REPORT.exists() else {'method': 'Headed Chromium, Apple M4 Pro/24GiB, 1440x900, isolated profiles. Geometry instrumentation applied equally to both builds. 2.5s stationary samples after 0.9s settling. CPU emulation is not a real low-end machine; task duration covers the measured renderer, including underlying app.', 'variants': {}}
    data['variants'][label] = []
    async with async_playwright() as p:
        for rate in [1, 4]:
            data['variants'][label].append(await profile(p, path, rate))
    subprocess.run([sys.executable, 'work/agent_lock.py', 'check', 'codex', str(REPORT.relative_to(ROOT))], cwd=ROOT, check=True)
    if REPORT.exists():
        REPORT.read_text()
    REPORT.write_text(json.dumps(data, indent=2) + '\n')


if __name__ == '__main__':
    asyncio.run(main())
