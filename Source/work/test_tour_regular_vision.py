"""Focused browser regression: Attention and bloom clears vision simulation."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1600, 'height': 1000})
        await page.goto(Path('outputs/munsell-color-picker.html').resolve().as_uri())
        frame = page.frame_locator('#codex-visualization')
        title = frame.locator('#atlas-tour-title')
        await frame.locator('#atlas-tour:not([hidden])').wait_for(timeout=20000)
        # Advance setup steps directly; this regression targets vision reset only.
        for _ in range(45):
            if await title.text_content() == 'See it as others do':
                break
            await frame.locator('[data-tour=next]').evaluate('(button) => button.click()')
            await page.wait_for_timeout(500)
        assert await title.text_content() == 'See it as others do'
        await frame.locator('#color-vision').select_option('protanopia')
        await page.wait_for_timeout(300)
        assert await frame.locator('#vision-comparison').is_visible()
        await frame.locator('[data-tour=next]').click()
        await page.wait_for_timeout(500)
        assert await title.text_content() == 'Attention and bloom'
        assert await frame.locator('#color-vision').input_value() == 'normal'
        assert not await frame.locator('#vision-comparison').is_visible()
        await page.screenshot(path='/tmp/color-atlas-regular-vision.png')
        print('PASS: Chromium verified Regular Vision and hidden comparison at Attention and bloom.')
        await browser.close()

asyncio.run(main())
