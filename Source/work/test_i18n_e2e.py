"""Offline language switching preserves user scene data and internal identifiers."""
import asyncio, json, sys
from pathlib import Path
from playwright.async_api import async_playwright
APP=Path(sys.argv[1] if len(sys.argv)>1 else 'outputs/munsell-color-picker.html').resolve()
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  for width in (1744,430):
   context=await browser.new_context(viewport={'width':width,'height':983})
   page=await context.new_page(); errors=[]
   page.on('pageerror',lambda error:errors.append(str(error)))
   await page.goto(APP.as_uri())
   frame=await (await page.locator('#codex-visualization').element_handle()).content_frame()
   await frame.locator('#atlas-tour:not([hidden])').wait_for(timeout=120000)
   await frame.locator('[data-tour=skip]').click();await page.wait_for_timeout(6000)
   frame=await (await page.locator('#codex-visualization').element_handle()).content_frame()
   menu=frame.locator('#atlas-language');assert await menu.input_value()=='en'
   await frame.locator('#preview-preset-name').evaluate("e=>e.value='My custom Design / Normal'")
   snapshot="""() => ({name:document.querySelector('#preview-preset-name').value,hex:document.querySelector('[data-field="vfx-hex"]').textContent,layers:[...document.querySelectorAll('#preview-layer-list button:not(.preview-layer-random)')].map(e=>e.textContent),dice:[...document.querySelectorAll('.preview-layer-random')].map(e=>e.getAttribute('aria-pressed')),random:document.querySelector('#random-type').value,blend:document.querySelector('#preview-blend').value,positions:[...document.querySelectorAll('.mp-gradient circle')].map(e=>e.getAttribute('cx'))})"""
   initial=await frame.evaluate(snapshot)
   for locale in ('pt-BR','es','fr','de','it','ja','ko','zh-CN','en'):
    await menu.select_option(locale);await page.wait_for_timeout(80)
    pack=json.loads((Path('work/locales')/(locale+'.json')).read_text())
    expected='Documentation' if locale=='en' else pack['Documentation']
    assert await frame.locator('[data-studio-view=documentation]').text_content()==expected,locale
    expected='Save palette' if locale=='en' else pack['Save palette']
    assert await frame.locator('[data-action=gradient-save]').text_content()==expected,locale
    assert await frame.evaluate(snapshot)==initial,locale+' modified scene'
    # Recreated controls retain localization without translating stored names.
    await frame.evaluate("""() => {const old=document.getElementById('i18n-test');old?.remove();const b=document.createElement('button');b.id='i18n-test';b.textContent='Cancel';document.querySelector('.studio-topbar').append(b);}""")
    await page.wait_for_timeout(50)
    assert await frame.locator('#i18n-test').text_content()==('Cancel' if locale=='en' else pack['Cancel'])
    await frame.locator('#i18n-test').evaluate("e=>e.setAttribute('aria-label','Save')")
    await page.wait_for_timeout(50)
    assert await frame.locator('#i18n-test').get_attribute('aria-label')==('Save' if locale=='en' else pack['Save'])
    await frame.locator('#i18n-test').evaluate('(e)=>e.remove()')
   await menu.select_option('ja');await page.wait_for_timeout(80)
   await page.reload();await page.wait_for_timeout(6500)
   frame=await (await page.locator('#codex-visualization').element_handle()).content_frame()
   assert await frame.locator('#atlas-language').input_value()=='ja','Remember chosen language'
   assert await frame.locator('[data-studio-view=documentation]').text_content()=='ドキュメント'
   assert await frame.locator('#atlas-documentation').get_attribute('lang')=='ja'
   box=await frame.locator('#atlas-language').bounding_box();assert box['x']>=0 and box['x']+box['width']<=width
   await page.screenshot(path=f'/tmp/atlas-languages-{width}.png',full_page=False)
   assert not errors,errors
   print(f'PASS {width}px: English default, 9 languages, restored English, dynamic controls, scene unchanged, reload persistence, no errors.',flush=True)
   await context.close()
  await browser.close()
asyncio.run(main())
