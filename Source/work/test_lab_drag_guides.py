"""Actual pointer drag dims graph guides, then release/cancel restores them."""
import asyncio,sys
from pathlib import Path
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch()
  page=await browser.new_page(viewport={'width':1744,'height':983})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto(Path(sys.argv[1] if len(sys.argv)>1 else 'outputs/munsell-color-picker.html').resolve().as_uri())
  f=await (await page.locator('#codex-visualization').element_handle()).content_frame()
  await f.locator('#atlas-tour:not([hidden])').wait_for(timeout=120000)
  await f.locator('[data-tour=skip]').click();await page.wait_for_timeout(6000)
  f=await (await page.locator('#codex-visualization').element_handle()).content_frame()
  graph=f.locator('svg.mp-vfx-lab')
  async def opacity(sel):return await graph.locator(sel).first.evaluate('(e)=>Number(getComputedStyle(e).opacity)')
  selectors=['[data-neutral-axis]','[data-lab-axis]','line:has(+ [data-lab-axis])','.lab-axis-label:not([data-lab-node-rank])']
  normal=[await opacity(s) for s in selectors]
  for cancel in [False,True]:
   box=await graph.locator('.lab-current-marker').bounding_box();x=box['x']+box['width']/2;y=box['y']+box['height']/2
   await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+15,y+8,steps=5);await page.wait_for_timeout(150)
   assert await graph.get_attribute('data-editing-color')=='true'
   for s,n in zip(selectors,normal):assert await opacity(s)<n*.2,(s,await opacity(s),n)
   await graph.screenshot(path='/tmp/atlas-drag-guides.png')
   if cancel:await graph.evaluate('(el)=>el.dispatchEvent(new PointerEvent("pointercancel",{bubbles:true,pointerId:1}))')
   await page.mouse.up();await page.wait_for_timeout(150)
   assert await graph.get_attribute('data-editing-color')=='false'
   for s,n in zip(selectors,normal):assert abs(await opacity(s)-n)<.001
  b=await graph.bounding_box();x=b['x']+b['width']*.15;y=b['y']+b['height']*.65
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+20,y+8,steps=4)
  assert await graph.get_attribute('data-editing-color')=='false'
  for s,n in zip(selectors,normal):assert abs(await opacity(s)-n)<.001
  await page.mouse.up();assert not errors,errors
  await browser.close();print('PASS: color drag dims axes, under-strokes, neutral column and labels; release/cancel restore; camera drag keeps guides visible.')
asyncio.run(main())
