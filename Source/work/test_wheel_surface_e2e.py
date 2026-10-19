"""Continuous Color Wheel acceptance on the generated or packaged app, isolated profiles."""
import asyncio
import sys
from pathlib import Path
from playwright.async_api import async_playwright

APP = Path(sys.argv[1] if len(sys.argv) > 1 else 'outputs/munsell-color-picker.html').resolve()


async def check(browser, width):
    context = await browser.new_context(viewport={'width': width, 'height': 983})
    page = await context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    await page.goto(APP.as_uri())
    frame = await (await page.locator('#codex-visualization').element_handle()).content_frame()
    await frame.locator('#atlas-tour:not([hidden])').wait_for(timeout=120000)
    await frame.locator('[data-tour=skip]').click()
    await page.wait_for_timeout(6000)  # Tutorial restores the workspace and may reload the frame.
    frame = await (await page.locator('#codex-visualization').element_handle()).content_frame()
    await frame.locator('#paste-hex').fill('#893FDC')
    await frame.locator('[data-action="apply-hex"]').click()
    wheel = frame.locator('[data-field="color-wheel"]')
    await wheel.scroll_into_view_if_needed()
    await page.wait_for_timeout(300)
    assert await wheel.locator('[data-wheel-color-surface] image').count() == 1
    assert await wheel.locator('.wheel-chroma-sample').count() == 0
    assert (await wheel.locator('image').get_attribute('href')).startswith('data:image/png;')
    before = await frame.locator('[data-field="vfx-hex"]').text_content()
    builds = (await frame.evaluate('window.AtlasLabSurface.stats()'))['builds']
    view = await wheel.get_attribute('viewBox')
    box = await wheel.bounding_box()
    x, y = box['x'] + box['width'] / 2, box['y'] + box['height'] / 2
    await page.mouse.move(x, y)
    await page.mouse.wheel(0, -120)
    await page.wait_for_timeout(150)
    assert await wheel.get_attribute('viewBox') != view, 'Wheel must zoom'
    view = await wheel.get_attribute('viewBox')
    await page.mouse.down(button='middle')
    await page.mouse.move(x + 16, y + 8, steps=5)
    await page.mouse.up(button='middle')
    assert await wheel.get_attribute('viewBox') != view, 'Wheel must pan'
    assert (await frame.evaluate('window.AtlasLabSurface.stats()'))['builds'] == builds
    assert await frame.locator('[data-field="vfx-hex"]').text_content() == before
    await frame.locator('[data-action="wheel-reset-view"]').click()
    await page.wait_for_timeout(200)
    marker = await wheel.locator('.wheel-color-marker.is-selected').bounding_box()
    x, y = marker['x'] + marker['width'] / 2, marker['y'] + marker['height'] / 2
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x - 18, y - 8, steps=8)
    await page.mouse.up()
    await page.wait_for_timeout(200)
    assert await frame.locator('[data-field="vfx-hex"]').text_content() != before, 'Dragging must edit color'
    await frame.locator('.atlas-history-controls button').first.click()
    await page.wait_for_timeout(200)
    assert await frame.locator('[data-field="vfx-hex"]').text_content() == before, 'Undo restores color'
    await wheel.screenshot(path=f'/tmp/atlas-wheel-surface-{width}.png')
    for color in ['#FF0000', '#00FF00', '#0000FF', '#000000', '#FFFFFF']:
        await frame.locator('#paste-hex').fill(color)
        await frame.locator('[data-action="apply-hex"]').click()
        assert await wheel.locator('[data-wheel-color-surface]').count() == 1
    assert not errors, errors
    await context.close()
    print(f'PASS: {width}px wheel surface renders, zoom/pan reuse cache, drag edits, undo restores, primaries and endpoints render; no page errors.', flush=True)


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for width in [1744, 430]:
            await check(browser, width)
        await browser.close()


if __name__ == '__main__':
    asyncio.run(main())
