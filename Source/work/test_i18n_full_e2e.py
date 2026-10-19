"""Full offline locale acceptance; isolated profiles, real controls and canvases."""
import asyncio,json,sys
from pathlib import Path
from playwright.async_api import async_playwright
APP=Path(sys.argv[1] if len(sys.argv)>1 else 'outputs/munsell-color-picker.html').resolve()
def pack(code):
 result={}
 for folder in ('','full','supplement'):
  result.update(json.loads((Path('work/locales')/folder/(code+'.json')).read_text()))
 return result
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  for width in (1744,430):
   context=await browser.new_context(viewport={'width':width,'height':983})
   await context.add_init_script('''window.__canvasCopy=new WeakMap();const draw=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(text,...args){const list=window.__canvasCopy.get(this.canvas)||[];list.push(String(text));window.__canvasCopy.set(this.canvas,list.slice(-100));return draw.call(this,text,...args)};window.addEventListener('atlas:beforelocalechange',()=>window.__canvasCopy=new WeakMap());''')
   page=await context.new_page();errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
   await page.goto(APP.as_uri());frame=await (await page.locator('#codex-visualization').element_handle()).content_frame()
   await frame.locator('#atlas-tour:not([hidden])').wait_for(timeout=120000);await frame.locator('[data-tour=skip]').click();await page.wait_for_timeout(6000)
   frame=await (await page.locator('#codex-visualization').element_handle()).content_frame()
   menu=frame.locator('#atlas-language');assert await menu.input_value()=='en'
   state="""()=>({keys:[...document.querySelectorAll('.studio-key-row')].map(e=>e.querySelector('[data-action]')?.dataset.action||e.textContent.match(/#[A-Fa-f0-9]{6}/)?.[0]),layers:[...document.querySelectorAll('#preview-layer-list button:not(.preview-layer-random)')].map(e=>e.textContent),blend:document.querySelector('#preview-blend').value,random:document.querySelector('#random-type').value,position:document.querySelector('#gradient-position').value})"""
   initial=await frame.evaluate(state)
   await frame.evaluate("AtlasDocumentation.open('editing-color')")
   slider=frame.locator('[data-doc-example=slice] [data-k=L]');await slider.fill('35');await slider.dispatch_event('input')
   english=await frame.locator('[data-doc-topic=editing-color] h1').text_content()
   first_lead=await frame.locator('[data-doc-topic=quick-start] .atlas-docs-lead').count()
   search=frame.locator('#atlas-doc-search')
   for code in ('pt-BR','es','fr','de','it','ja','ko','zh-CN'):
    menu=frame.locator('#atlas-language');search=frame.locator('#atlas-doc-search')
    await frame.evaluate("AtlasDocumentation.open('editing-color')")
    slider=frame.locator('[data-doc-example=slice] [data-k=L]');await slider.fill('35');await slider.dispatch_event('input')
    words=pack(code);await menu.select_option(code);await page.wait_for_timeout(120)
    assert await frame.locator('[data-doc-topic=editing-color] h1').text_content()==words['Editing color'],code+' heading'
    assert await slider.input_value()=='35',code+' example state'
    assert await frame.locator('#atlas-documentation').get_attribute('lang')==code
    labels=await frame.locator('[data-doc-example=slice] canvas').evaluate('(e)=>window.__canvasCopy.get(e)||[]')
    assert words['Yellow'] in labels,(code,'canvas text',labels)
    await frame.evaluate("AtlasDocumentation.open('quick-start')")
    lead=frame.locator('[data-doc-topic=quick-start] > p').first
    assert 'builds gradient maps for VFX' not in await lead.text_content(),code+' guide prose'
    # Search the selected language, then switch while matches/highlights exist.
    await search.fill(words['Normalize values'].split(' ')[0]);await page.wait_for_timeout(80)
    assert await frame.locator('.atlas-docs-search-hit').count()>0,(code,'localized index/search')
    await frame.locator('.atlas-docs-search-hit').first.click()
    assert await frame.locator('mark[data-doc-search-mark]').count()>0,code+' highlight'
    await menu.select_option('en');await page.wait_for_timeout(80)
    await frame.evaluate("AtlasDocumentation.open('editing-color')")
    assert await frame.locator('[data-doc-topic=editing-color] h1').text_content()==english,code+' English restore'
    await menu.select_option(code)
    await frame.locator('[data-studio-view=editor]').click()
    random=frame.locator('[data-action=random-all-layers]');await random.hover()
    tip=frame.locator('#atlas-context-help');await tip.wait_for(state='visible',timeout=3000)
    expected=words['Generate new palettes for layers whose dice toggle is ON, using the chosen Random mode. Undo restores the previous colors.']
    assert await tip.text_content()==expected,(code,'context help')
    assert await tip.get_attribute('lang')==code
    await page.keyboard.press('Escape')
    await frame.locator('.atlas-tour-tab').click();await page.wait_for_timeout(100)
    title=await frame.locator('#atlas-tour-title').text_content()
    assert title in words.values() and title!='Welcome to Color Atlas',(code,'tutorial title',title)
    await frame.locator('[data-tour=next]').click();await page.wait_for_timeout(120)
    assert 'Step ' not in await frame.locator('.atlas-tour-mission').text_content(),(code,'step template')
    # Tour restoration may reload the sandbox frame through its host bridge.
    await frame.locator('[data-tour=skip]').click();await page.wait_for_timeout(6000)
    frame=await (await page.locator('#codex-visualization').element_handle()).content_frame()
    assert await frame.evaluate(state)==initial,code+' modified workspace'
    await frame.evaluate("AtlasDocumentation.open('editing-color')")
    print('PASS',width,code,'guide/search/highlight restoration, help, tutorial, canvas and preserved scene',flush=True)
   menu=frame.locator('#atlas-language');await frame.evaluate("AtlasDocumentation.open('editing-color')")
   slider=frame.locator('[data-doc-example=slice] [data-k=L]');await slider.fill('35');await slider.dispatch_event('input')
   await menu.select_option('en')
   assert await slider.input_value()=='35'
   await frame.locator('[data-doc-example=slice] [data-doc-reset]').click();assert await slider.input_value()=='70'
   assert not errors,errors
   await menu.select_option('ja');await page.screenshot(path=f'/tmp/atlas-full-languages-{width}.png',full_page=False)
   await context.close()
  await browser.close()
asyncio.run(main())
