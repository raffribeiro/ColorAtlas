"""Focused browser regression: search retry text wraps as one inline sentence."""
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
            if await title.text_content() == 'Search presets':
                break
            await frame.locator('[data-tour=next]').evaluate('(button) => button.click()')
            await page.wait_for_timeout(500)
        assert await title.text_content() == 'Search presets'
        await frame.locator('#studio-search').fill('gato')
        copy = frame.locator('.atlas-tour-task-copy')
        await copy.wait_for()
        assert await copy.inner_text() == 'No presets found. Try fire, ice or smoke.'
        assert await copy.locator('b').count() == 3
        assert await copy.evaluate('(el) => el.parentElement.children.length === 2')
        assert await copy.evaluate('(el) => el.scrollWidth <= el.clientWidth + 1')
        await page.screenshot(path='/tmp/color-atlas-search-retry.png')
        await frame.locator('#studio-search').fill('ice')
        await page.wait_for_timeout(1800)
        assert await title.text_content() == 'Apply a preset'
        print('PASS: Chromium verified no-results message layout and successful search recovery.')
        await browser.close()

asyncio.run(main())
