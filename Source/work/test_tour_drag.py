"""A tap must not satisfy a tutorial drag exercise."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch()
        page=await browser.new_page(viewport={'width':1600,'height':1000})
        await page.goto(Path('outputs/munsell-color-picker.html').resolve().as_uri())
        frame=page.frame_locator('#codex-visualization')
        await frame.locator('#atlas-tour:not([hidden])').wait_for(timeout=20000)
        await page.screenshot(path='/tmp/color-atlas-tour-intro.png')
        for _ in range(2):
            await frame.locator('[data-tour=next]').click()
            await page.wait_for_timeout(450)
        await frame.locator('[data-gradient-select]').first.click()
        await page.wait_for_timeout(400)
        await frame.locator('[data-tour=next]').click()
        await page.wait_for_timeout(450)
        assert await frame.locator('#atlas-tour-title').inner_text()=='Paint with the wheel'
        wheel=frame.locator('.studio-wheel svg')
        await wheel.click()
        await page.wait_for_timeout(400)
        assert await frame.locator('.atlas-tour-card').get_attribute('data-waiting')=='true'
        assert await frame.locator('[data-tour=next]').is_hidden()
        box=await wheel.bounding_box()
        x,y=box['x']+box['width']/2,box['y']+box['height']/2
        await page.mouse.move(x,y)
        await page.mouse.down()
        await page.mouse.move(x+24,y-16,steps=6)
        await page.mouse.up()
        await page.wait_for_timeout(400)
        assert await frame.locator('.atlas-tour-card').get_attribute('data-success')=='true'
        assert await frame.locator('[data-tour=next]').inner_text()=='Next'
        await page.screenshot(path='/tmp/color-atlas-tour-wheel.png')
        await page.set_viewport_size({'width':430,'height':900})
        await page.wait_for_timeout(400)
        await page.screenshot(path='/tmp/color-atlas-tour-wheel-narrow.png')
        print('PASS: click leaves drag task waiting; actual drag completes it and keeps manual Next.')
        await browser.close()

asyncio.run(main())
