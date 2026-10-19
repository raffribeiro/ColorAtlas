"""Real browser acceptance for hover help, section navigation and local examples.

Uses isolated browser profiles and real UI; never modifies the user's live data.
"""
import asyncio
import json
import sys
from pathlib import Path
from playwright.async_api import async_playwright

APP = Path(sys.argv[1] if len(sys.argv) > 1 else 'outputs/munsell-color-picker.html').resolve()


async def workspace(frame):
    return await frame.evaluate('''() => ({hex:document.querySelector('[data-field="vfx-hex"]').textContent,
      keys:document.querySelector('[data-field="studio-keys"]')?.textContent || [...document.querySelectorAll('.studio-key-row')].map(e=>e.textContent).join('|'),
      layers:document.querySelector('#preview-layer-list').textContent,
      random:document.querySelector('#random-type').value})''')


async def example_state(fig, save=False):
    return await fig.evaluate('''(fig,save) => {
      const arrays=[...fig.querySelectorAll('canvas')].map(c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data);
      if(save)fig._testBaselinePixels=arrays.map(bytes=>bytes.slice());
      return {readouts:[...fig.querySelectorAll('[data-r]')].map(e=>e.textContent),
       controls:[...fig.querySelectorAll('[data-k]')].map(e=>({key:e.dataset.k,value:e.value,checked:e.checked||false,min:e.getAttribute('min'),max:e.getAttribute('max'),disabled:e.disabled})),
       pixels:arrays.map((bytes,index)=>{const before=fig._testBaselinePixels[index];let changed=0,max=0;for(let i=0;i<bytes.length;i++)if(bytes[i]!==before[i]){changed++;max=Math.max(max,Math.abs(bytes[i]-before[i]));}return {changed,max,total:bytes.length};})};
    }''', save)


def assert_reset(initial, actual, name):
    assert actual['controls'] == initial['controls'], 'Reset controls: ' + name
    assert actual['readouts'] == initial['readouts'], 'Reset readouts: ' + name
    # Chromium can change tiny antialias roundoffs on identical canvas redraws.
    # Actual diagnosis:45 of313600 bytes changed by1, controls/readouts identical.
    # Keep geometry/color acceptance strict: max1 and <=0.1% differing bytes.
    for canvas in actual['pixels']:
        assert canvas['max'] <= 1 and canvas['changed'] <= canvas['total']*.001, ('Reset canvas', name, canvas)


async def boot(browser, width):
    context = await browser.new_context(viewport={'width': width, 'height': 983})
    page = await context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    await page.goto(APP.as_uri())
    frame = await (await page.locator('#codex-visualization').element_handle()).content_frame()
    await frame.locator('#atlas-tour:not([hidden])').wait_for(timeout=120000)
    await frame.locator('[data-tour=skip]').hover()
    await page.wait_for_timeout(750)
    assert await frame.locator('#atlas-context-help:visible').count()==0, 'Help suppressed during tour'
    await frame.locator('[data-tour=skip]').click()
    await page.wait_for_timeout(6000)
    frame = await (await page.locator('#codex-visualization').element_handle()).content_frame()
    return context, page, frame, errors


async def check(browser, width):
    context, page, frame, errors = await boot(browser, width)
    before = await workspace(frame)
    random = frame.locator('[data-action="random-all-layers"]')
    tip = frame.locator('#atlas-context-help')
    coverage = await frame.evaluate('window.AtlasContextHelp.coverage().map(({element,...v})=>v)')
    missing = [c for c in coverage if c['source'] == 'fallback' or not c['text'].strip()]
    assert not missing, missing[:10]
    await random.evaluate('(e)=>e.setAttribute("aria-describedby","existing-description")')
    await random.hover()
    await page.wait_for_timeout(180)
    assert await tip.count() == 0 or not await tip.is_visible(), 'No immediate hover popup'
    await tip.wait_for(state='visible', timeout=3000)
    assert 'Random' in await tip.text_content()
    assert 'existing-description' in await random.get_attribute('aria-describedby')
    await page.keyboard.press('Escape')
    assert not await tip.is_visible()
    assert await random.get_attribute('aria-describedby') == 'existing-description'
    await page.keyboard.press('Tab')
    await random.focus()
    await tip.wait_for(state='visible', timeout=3000)
    assert await random.evaluate('(e)=>document.activeElement===e'), 'Help never takes focus'
    await page.keyboard.press('Escape')
    await frame.locator('[data-action="gradient-png"]').click()
    dialog=frame.locator('#png-export-dialog')
    await dialog.wait_for(state='visible')
    # On narrow hosts the iframe is a long scrolling document. Native dialogs
    # center inside that frame; bring the actual dialog into the host viewport.
    if width < 1000:
        box=await dialog.bounding_box()
        await page.evaluate('(y)=>window.scrollBy(0,y-innerHeight/2)',box['y']+box['height']/2)
    await dialog.locator('[data-action="png-export-download"]').hover()
    await tip.wait_for(state='visible', timeout=3000)
    assert await tip.evaluate('(e)=>e.matches(":popover-open")'), 'Help stays above native dialogs'
    await dialog.locator('[data-action="png-export-cancel"]').click()
    await frame.locator('[data-studio-view="documentation"]').click()
    assert await frame.locator('.doc-ex-goal').count() == 11
    assert await frame.locator('[data-doc-reset]').count() == 11
    search = frame.locator('#atlas-doc-search')
    await search.fill('Normalize')
    hits = frame.locator('.atlas-docs-search-hit')
    assert await hits.count() > 0
    assert await hits.first.locator('.atlas-docs-hit-snippet').text_content()
    assert await hits.first.locator('mark').count() > 0
    await hits.first.click()
    assert await frame.locator('[data-doc-topic]:not([hidden]) mark[data-doc-search-mark]').count() > 0
    focused = await frame.evaluate('document.activeElement.dataset.docSection')
    assert focused, 'Search jumps and focuses a section heading'
    await search.fill('no-match-zxy-987')
    assert 'No matching sections' in await frame.locator('#atlas-doc-results').text_content()
    assert await frame.locator('[data-doc-topic]:not([hidden])').count() == 1, 'Search keeps reading chapter intact'
    await search.press('Escape')
    assert await search.input_value() == ''
    await search.fill('Start from a preset. Search')
    await frame.locator('.atlas-docs-search-hit').first.click()
    assert await frame.locator('[data-doc-topic]:not([hidden]) mark[data-doc-search-mark]').count() >= 2, 'Highlight phrase across inline markup'
    await search.press('Escape')
    await frame.locator('[data-studio-view="editor"]').click()
    await frame.evaluate("window.AtlasDocumentation.open('editing-color')")
    assert await frame.evaluate("document.activeElement.matches('#doc-editing-color h1')"), 'Programmatic chapter opening focuses visible heading'

    assert await frame.locator('mark[data-doc-search-mark]').count() == 0
    # Topic A -> topic B -> A and Editor -> Documentation preserve each scroll.
    await frame.locator('.atlas-docs-sidebar [data-doc-link="editing-color"]').click()
    reader = frame.locator('.atlas-docs-reading')
    await reader.evaluate('(e)=>{e.scrollTop=280}')
    await page.wait_for_timeout(80)
    saved = await reader.evaluate('(e)=>e.scrollTop')
    assert saved > 100
    await frame.locator('.atlas-docs-sidebar [data-doc-link="quick-start"]').click()
    await frame.locator('.atlas-docs-sidebar [data-doc-link="editing-color"]').click()
    assert abs(await reader.evaluate('(e)=>e.scrollTop') - saved) < 3
    await frame.locator('[data-studio-view="editor"]').click()
    await frame.locator('[data-studio-view="documentation"]').click()
    assert abs(await reader.evaluate('(e)=>e.scrollTop') - saved) < 3
    toc = frame.locator('[data-doc-topic="editing-color"] [data-doc-section-link]')
    assert await toc.count() > 0
    await toc.last.click()
    assert await frame.evaluate('!!document.activeElement.dataset.docSection')
    # Every example resets controls and actual canvas pixels, including hidden pick state.
    examples = await frame.locator('[data-doc-example]').evaluate_all('(els)=>els.map(e=>({name:e.dataset.docExample,topic:e.closest("[data-doc-topic]").dataset.docTopic}))')
    for ex in examples:
        await frame.locator(f'.atlas-docs-sidebar [data-doc-link="{ex["topic"]}"]').click()
        fig = frame.locator(f'[data-doc-example="{ex["name"]}"]')
        await fig.scroll_into_view_if_needed()
        await page.wait_for_timeout(60)
        initial = await example_state(fig, save=True)
        await fig.locator('[data-k]').first.evaluate('''e=>{
          if(e.type==='checkbox')e.checked=!e.checked;
          else if(e.type==='color')e.value=e.value==='#336699'?'#ff9900':'#336699';
          else if(e.tagName==='SELECT')e.selectedIndex=(e.selectedIndex+1)%e.options.length;
          else e.value=Number(e.value)===Number(e.max)?e.min:e.max;
          e.dispatchEvent(new Event('input',{bubbles:true}));}''')
        if ex['name'] == 'slice':
            canvas = fig.locator('canvas').first
            box = await canvas.bounding_box()
            await page.mouse.click(box['x']+box['width']*.6, box['y']+box['height']*.55)
        await fig.locator('[data-doc-reset]').click()
        await page.wait_for_timeout(30)
        assert_reset(initial, await example_state(fig), ex['name'])
        await fig.locator('[data-doc-reset]').click()
        actual = await example_state(fig)
        assert_reset(initial, actual, 'repeated ' + ex['name'])
    await frame.locator('[data-studio-view="editor"]').click()
    assert await workspace(frame) == before, 'Documentation/help changed the authored workspace'
    await random.hover()
    await tip.wait_for(state='visible', timeout=3000)
    box = await tip.bounding_box()
    assert 0 <= box['x'] and box['x']+box['width'] <= width+1
    assert 0 <= box['y'] and box['y']+box['height'] <= 984, ('Tooltip outside visible host viewport',box)
    await page.screenshot(path=f'/tmp/atlas-documentation-help-{width}.png')
    assert not errors, errors
    print(f'PASS {width}px: delayed pointer/keyboard help, coverage, ARIA, section search/jump/highlights, chapter scroll, 11 pixel/control resets, workspace unchanged; no errors.', flush=True)
    await context.close()


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for width in [1744, 430]:
            await check(browser, width)
        await browser.close()


if __name__ == '__main__':
    asyncio.run(main())
