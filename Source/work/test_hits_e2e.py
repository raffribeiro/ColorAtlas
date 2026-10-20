"""Intercept the real production address/counter: never pollute public stats."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch();ctx=await b.new_context();requests=[];errors=[]
  await ctx.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>false});window.cspErrors=[];document.addEventListener('securitypolicyviolation',e=>cspErrors.push(e.violatedDirective));")
  html=Path('outputs/pages-index.html').read_text()
  await ctx.route('https://raffribeiro.github.io/ColorAtlas/**',lambda r:r.fulfill(status=200,content_type='text/html',body=html))
  async def hit(route):
   requests.append(route.request);await route.fulfill(status=200,content_type='image/svg+xml',body='<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>')
  await ctx.route('https://hits.sh/**',hit)
  page=await ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto('https://raffribeiro.github.io/ColorAtlas/?private=DO-NOT-SEND#private');await page.wait_for_timeout(1500)
  assert len(requests)==1,len(requests)
  assert 'DO-NOT-SEND' not in requests[0].url and 'private' not in requests[0].url
  assert 'referer' not in requests[0].headers
  assert await page.evaluate('window.cspErrors')==[]
  await page.reload();await page.wait_for_timeout(1000);assert len(requests)==2
  await page.goto(Path('outputs/pages-index.html').resolve().as_uri());await page.wait_for_timeout(1000);assert len(requests)==2,'Local variant must not count'
  assert not errors,errors
  await ctx.close()
  ctx=await b.new_context();await ctx.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>false});")
  await ctx.route('https://raffribeiro.github.io/ColorAtlas/**',lambda r:r.fulfill(status=200,content_type='text/html',body=html))
  await ctx.route('https://hits.sh/**',lambda r:r.abort())
  page=await ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)));await page.goto('https://raffribeiro.github.io/ColorAtlas/');await page.wait_for_timeout(1500)
  frame=await (await page.locator('#codex-visualization').element_handle()).content_frame()
  assert await frame.locator('#munsell-picker').count()==1
  assert not errors,errors
  print('PASS mocked production: one request per load/reload, no private query/referrer, no CSP violations; local use silent; blocked counter leaves editor available; no real hits sent')
  await b.close()
asyncio.run(main())
