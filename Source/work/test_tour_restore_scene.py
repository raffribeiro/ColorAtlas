"""Non-default scene must survive tutorial completion and exit."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for outcome in ['skipped', 'done']:
            context = await browser.new_context(viewport={'width':1600,'height':1000})
            page = await context.new_page()
            await page.goto(Path('outputs/munsell-color-picker.html').resolve().as_uri())
            frame = page.frame_locator('#codex-visualization')
            await frame.locator('#atlas-tour:not([hidden])').wait_for(timeout=20000)
            await frame.locator('[data-tour=skip]').click()
            await page.wait_for_timeout(6000)
            await frame.locator('#preview-preset-select').select_option('temp-design')
            await page.wait_for_timeout(1500)
            await frame.locator('#random-type').select_option('triadic')
            await frame.locator('#color-vision').select_option('grayscale')
            await page.wait_for_timeout(600)
            async def state():
                return await frame.locator('#munsell-picker').evaluate('''root => ({
                    keys: [...root.querySelectorAll('.studio-key-row')].map(e=>e.textContent),
                    layers: root.querySelector('#preview-layer-list').textContent,
                    preset: root.querySelector('#preview-preset-select').value,
                    mode: root.querySelector('#random-type').value,
                    vision: root.querySelector('#color-vision').value
                })''')
            before = await state()
            await frame.locator('.atlas-tour-tab').click()
            title = frame.locator('#atlas-tour-title')
            for _ in range(50):
                if await title.text_content() == 'Roll the dice': break
                await frame.locator('[data-tour=next]').evaluate('(e)=>e.click()')
                await page.wait_for_timeout(500)
            assert await title.text_content() == 'Roll the dice'
            await page.wait_for_timeout(1500)
            assert await frame.locator('#preview-preset-select').input_value() == 'codex-use-esse'
            if outcome == 'skipped':
                await frame.locator('[data-tour=skip]').click()
            else:
                for _ in range(35):
                    if await title.text_content() == 'Tutorial complete!': break
                    await frame.locator('[data-tour=next]').evaluate('(e)=>e.click()')
                    await page.wait_for_timeout(500)
                assert await title.text_content() == 'Tutorial complete!'
                await frame.locator('[data-tour=next]').click()
            await page.wait_for_timeout(6500)
            assert await state() == before, (outcome, before, await state())
            assert not await frame.locator('#atlas-tour').is_visible()
            assert await frame.locator('#munsell-picker').evaluate('window.AtlasOnboardingStore.get().status') == outcome
            print('PASS: non-default scene, ramps, random mode and vision restored after '+outcome, flush=True)
            await context.close()
        await browser.close()

asyncio.run(main())
