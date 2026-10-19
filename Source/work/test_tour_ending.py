"""Focused browser regression: separate ending highlights and Back navigation."""
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
            if await title.text_content() == 'Explore Documentation':
                break
            await frame.locator('[data-tour=next]').evaluate('(button) => button.click()')
            await page.wait_for_timeout(500)
        assert await title.text_content() == 'Explore Documentation'
        async def one_highlight():
            assert await frame.locator('.atlas-tour-hole-extra:visible').count() == 0
        await one_highlight()
        await page.screenshot(path='/tmp/color-atlas-ending-docs.png')
        await frame.locator('[data-tour=next]').click()
        await page.wait_for_timeout(450)
        assert await title.text_content() == 'Tutorial complete!'
        await one_highlight()
        assert await frame.locator('[data-tour=next]').inner_text() == 'Start creating'
        await page.screenshot(path='/tmp/color-atlas-ending-tutorial.png')
        await frame.locator('[data-tour=back]').click()
        await page.wait_for_timeout(450)
        assert await title.text_content() == 'Explore Documentation'
        await one_highlight()
        print('PASS: Chromium verified separate ending popups, one highlight each and Back navigation.')
        await browser.close()

asyncio.run(main())
