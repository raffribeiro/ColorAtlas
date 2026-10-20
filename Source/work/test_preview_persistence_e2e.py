"""Imported working images/layers restore from browser IndexedDB after reload."""
import asyncio,base64,sys
from pathlib import Path
from playwright.async_api import async_playwright
TARGET=sys.argv[1] if len(sys.argv)>1 else Path('outputs/munsell-color-picker.html').resolve().as_uri()
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch();page=await b.new_page(viewport={'width':1744,'height':983});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto(TARGET,timeout=60000)
  async def frame():return await (await page.locator('#codex-visualization').element_handle()).content_frame()
  f=await frame();await f.locator('#atlas-tour:not([hidden])').wait_for(timeout=120000);await f.locator('[data-tour=skip]').click();await page.wait_for_timeout(6500);f=await frame()
  png=await f.evaluate("()=>{const c=document.createElement('canvas');c.width=c.height=24;const x=c.getContext('2d');x.fillStyle='white';x.fillRect(0,0,12,24);x.fillStyle='#333';x.fillRect(12,0,12,24);return c.toDataURL().split(',')[1]}")
  async with page.expect_file_chooser() as chooser:await f.locator('[data-preview-action=add]').click()
  await (await chooser.value).set_files({'name':'Saved-local-image.png','mimeType':'image/png','buffer':base64.b64decode(png)})
  await f.get_by_text('Saved-local-image.png',exact=True).wait_for();await page.wait_for_timeout(750)
  snapshot="() => {const d=AtlasTourPreviewSnapshot();return {selected:d.selected,layers:d.layers.map(({id,name,asset,visible,opacity,blend,map})=>({id,name,asset,visible,opacity,blend,map}))}}"
  before=await f.evaluate(snapshot);assert any(l['name']=='Saved-local-image.png' for l in before['layers'])
  assert next(l for l in before['layers'] if l['name']=='Saved-local-image.png')['asset'].startswith('data:image/png;base64,')
  await page.reload();await page.wait_for_timeout(6500);f=await frame()
  after=await f.evaluate(snapshot);assert after==before,'Reload must retain uploaded image bytes, layer selection, maps and settings'
  # A second reload proves the initial restore did not overwrite the stored stack.
  await page.reload();await page.wait_for_timeout(6500);f=await frame();assert await f.evaluate(snapshot)==before
  assert not errors,errors
  print('PASS: uploaded image asset, selected layer, maps and settings restored from browser storage across two reloads; no browser errors.')
  await b.close()
asyncio.run(main())
