"""Review-build regression: bloom range, actual rendering, history and reload."""
import asyncio, sys
from pathlib import Path
from playwright.async_api import async_playwright
APP = Path(sys.argv[1] if len(sys.argv)>1 else 'outputs/munsell-color-picker.html').resolve()
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  page=await browser.new_page(viewport={'width':1744,'height':983});errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  await page.goto(APP.as_uri())
  async def frame(): return await (await page.locator('#codex-visualization').element_handle()).content_frame()
  f=await frame();await f.locator('#atlas-tour:not([hidden])').wait_for(timeout=120000);await f.locator('[data-tour=skip]').click();await page.wait_for_timeout(6500);f=await frame()
  slider=f.locator('#explosion-bloom');readout=f.locator('[data-field="explosion-bloom-value"]')
  assert await slider.get_attribute('max')=='7'
  assert await slider.input_value()=='1' and await readout.text_content()=='100%'
  # Observe actual rendered preview, not just UI labels.
  async def image():return await f.locator('[data-field="explosion-mapped"]').evaluate('(e)=>e.toDataURL()')
  before=await image()
  await slider.focus();await slider.press('End');await page.wait_for_timeout(300)
  assert await slider.input_value()=='7' and await readout.text_content()=='700%'
  after=await image();assert after!=before,'700% must change rendered bloom'
  undo=f.locator('.atlas-history-controls button').nth(0);redo=f.locator('.atlas-history-controls button').nth(1)
  await undo.click();await page.wait_for_timeout(200);assert await slider.input_value()=='1';assert await image()==before
  await redo.click();await page.wait_for_timeout(200);assert await slider.input_value()=='7';assert await image()==after
  await page.screenshot(path='/tmp/coloratlas-bloom-700.png')
  # Existing startup deliberately reapplies the authored default; keep that policy.
  await page.reload();await page.wait_for_timeout(6500);f=await frame();assert await f.locator('#explosion-bloom').input_value()=='1';assert await f.locator('[data-field="explosion-bloom-value"]').text_content()=='100%'
  await f.locator('[data-studio-view=documentation]').click();await f.locator('.atlas-docs-sidebar [data-doc-link="analysis"]').click()
  example=f.locator('[data-doc-example="bloom"]');assert await example.locator('input[type=range]').get_attribute('max')=='700'
  # Exact guide/catalog coverage is validated by check_i18n; verify visible range here.
  assert '700%' in await f.locator('#doc-analysis').text_content()
  assert not errors,errors
  print('PASS: 100% default, 700% keyboard/readout/rendering, Undo/Redo exact preview restoration, authored startup default after reload and guide range; no browser errors.')
  await browser.close()
asyncio.run(main())
