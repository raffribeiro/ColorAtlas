"""Standalone security acceptance in isolated profiles; supports file or live URL.

Checks normal app workflows under CSP before intentionally probing blocked eval.
All images/library files are generated fixtures, never personal browser data.
"""
import asyncio,base64,json,sys,html
from pathlib import Path
from playwright.async_api import async_playwright
TARGET=sys.argv[1] if len(sys.argv)>1 else Path('outputs/munsell-color-picker.html').resolve().as_uri()
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch();context=await browser.new_context(viewport={'width':1744,'height':983},accept_downloads=True);page=await context.new_page();errors=[];remote=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('request',lambda r:remote.append(r.url) if r.resource_type in ('script','font','image') and r.url.startswith(('http:','https:')) else None)
  await page.add_init_script("window.__cspViolations=[];addEventListener('securitypolicyviolation',e=>__cspViolations.push({directive:e.effectiveDirective,blocked:e.blockedURI}));")
  await page.goto(TARGET,timeout=60000)
  async def frame():return await (await page.locator('#codex-visualization').element_handle()).content_frame()
  f=await frame();await f.locator('#atlas-tour:not([hidden])').wait_for(timeout=120000);await f.locator('[data-tour=skip]').click();await page.wait_for_timeout(6500);f=await frame()
  assert 'allow-same-origin' not in await page.locator('#codex-visualization').get_attribute('sandbox')
  assert await f.evaluate("()=>{try{parent.document.body;return false}catch(e){return e.name==='SecurityError'}}"),'Frame must remain opaque'
  state="() => JSON.stringify(AtlasOnboardingStore.current())"
  before=await f.evaluate(state)
  assert await f.evaluate("""async()=>{let read=false;await AtlasLibraryIO.import({size:64*1024*1024+1,text:async()=>{read=true;throw Error('must not read')}});return !read}""")
  assert '64 MB' in await f.locator('.atlas-library-status').text_content();assert await f.evaluate(state)==before
  for obj in [{'palettes':{}},{'favorites':{}},{'previewPresets':[{'name':'Bad','doc':{'version':1,'layers':[None]}}]}]:
   await f.evaluate("async o=>AtlasLibraryIO.import(new File([JSON.stringify({format:'color-atlas-library',version:1,...o})],'bad.json',{type:'application/json'}))",obj)
   assert await f.evaluate(state)==before
  print('PASS: opaque sandbox; oversize JSON never read; malformed imports leave state unchanged.',flush=True)
  # Metadata-only PNG fixture exceeds bounds, so browser decoding is never reached.
  invalid=bytearray(24);invalid[:16]=bytes([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82]);invalid[16:20]=(20000).to_bytes(4,'big');invalid[20:24]=(20000).to_bytes(4,'big')
  fileinput=f.locator('#preview-layer-file');names=await f.locator('#preview-layer-list').text_content()
  await fileinput.set_input_files({'name':'oversized.png','mimeType':'image/png','buffer':bytes(invalid)});await page.wait_for_timeout(200)
  assert await f.locator('#preview-layer-list').text_content()==names
  # A valid generated image still imports and reaches actual canvas rendering.
  png=await f.evaluate("()=>{const c=document.createElement('canvas');c.width=c.height=16;const g=c.getContext('2d');g.fillStyle='#ff8040';g.fillRect(0,0,16,16);return c.toDataURL().split(',')[1]}")
  async with page.expect_file_chooser() as chooser:
   await f.locator('[data-preview-action=add]').click()
  await (await chooser.value).set_files({'name':'security-fixture.png','mimeType':'image/png','buffer':base64.b64decode(png)})
  await f.get_by_text('security-fixture.png',exact=True).wait_for(timeout=10000)
  assert await f.locator('.mp-vfx-lab circle').count()>20
  # Create real authoring content, export it, then restore into a clean profile.
  await f.locator('[data-action=gradient-save]').click();await f.locator('#palette-save-name').fill('Security roundtrip palette')
  await f.locator('[data-palette-save-submit]').click();await page.wait_for_timeout(200)
  palette=await f.evaluate("()=>{const s=AtlasOnboardingStore.current();return (s.modelContent||s).userPalettes.find(p=>p.name==='Security roundtrip palette')}")
  assert palette and palette['layers']
  favorite=f.locator('[data-studio-favorite="'+palette['id']+'"]');await favorite.evaluate('(e)=>e.click()')
  await f.locator('[data-preview-preset=new]').click();await f.locator('#preview-preset-dialog input').fill('Security roundtrip preview')
  await f.locator('[data-preview-preset=confirm]').click();await f.locator('#preview-preset-dialog').wait_for(state='hidden')
  async with page.expect_download() as dl:await f.locator('[data-library-io=export]').click()
  download=await dl.value;path=await download.path();payload=json.loads(Path(path).read_text())
  assert payload['format']=='color-atlas-library' and palette['id'] in payload['favorites']
  assert any(p['name']=='Security roundtrip preview' for p in payload['previewPresets'])
  transfer=await browser.new_context(viewport={'width':1744,'height':983},accept_downloads=True);tp=await transfer.new_page();tp.on('pageerror',lambda e:errors.append(str(e)))
  await tp.goto(TARGET,timeout=60000);tf=await (await tp.locator('#codex-visualization').element_handle()).content_frame()
  await tf.locator('#atlas-tour:not([hidden])').wait_for(timeout=120000);await tf.locator('[data-tour=skip]').click();await tp.wait_for_timeout(6500)
  tf=await (await tp.locator('#codex-visualization').element_handle()).content_frame()
  await tf.locator('[data-library-io=file]').set_input_files(str(path));await tp.wait_for_timeout(7500)
  tf=await (await tp.locator('#codex-visualization').element_handle()).content_frame()
  async with tp.expect_download() as rd:await tf.locator('[data-library-io=export]').click()
  restored=json.loads(Path(await (await rd.value).path()).read_text())
  assert restored['palettes']==payload['palettes']
  assert sorted(restored['favorites'])==sorted(payload['favorites'])
  assert sorted(restored['previewPresets'],key=lambda p:p['id'])==sorted(payload['previewPresets'],key=lambda p:p['id'])
  assert not errors,errors;await transfer.close()
  print('PASS: nonempty palette, favorite and image Preview preset roundtrip into a clean browser profile.',flush=True)
  # Normal flows must produce neither remote runtime loads nor CSP violations.
  for fr in page.frames:assert not await fr.evaluate('window.__cspViolations||[]'),await fr.evaluate('window.__cspViolations||[]')
  assert not remote,remote;assert not errors,errors
  await f.locator('#atlas-language').select_option('ja');await page.wait_for_timeout(100);await f.locator('[data-studio-view=documentation]').click();assert await f.locator('#atlas-documentation').get_attribute('lang')=='ja'
  # Spoofed messages from the host itself must not modify language persistence.
  await page.evaluate("()=>dispatchEvent(new MessageEvent('message',{source:window,data:{channel:'color-atlas-language',action:'write',locale:'de'}}))")
  await page.reload();await page.wait_for_timeout(6500);f=await frame();assert await f.locator('#atlas-language').input_value()=='ja'
  # DevTools can bypass CSP for evaluation and code it injects. Parse a fresh
  # sandboxed fixture with the exact deployed policy, not an automation eval.
  policy=await page.locator('meta[http-equiv="Content-Security-Policy"]').get_attribute('content')
  assert policy==await f.locator('meta[http-equiv="Content-Security-Policy"]').get_attribute('content')
  meta='<meta http-equiv="Content-Security-Policy" content="'+html.escape(policy,quote=True)+'">'
  child='<!doctype html>'+meta+"<script>window.__evalBlocked=false;try{eval('1+1')}catch(e){window.__evalBlocked=e.name==='EvalError'}</script>"
  probe=await context.new_page();probe_url='https://atlas-csp-probe.invalid/'
  fixture='<!doctype html>'+meta+'<iframe sandbox="allow-scripts" srcdoc="'+html.escape(child,quote=True)+'"></iframe>'
  await probe.route(probe_url,lambda route:route.fulfill(status=200,content_type='text/html',body=fixture))
  await probe.goto(probe_url);pf=await (await probe.locator('iframe').element_handle()).content_frame()
  assert await pf.evaluate('window.__evalBlocked') is True
  await probe.close()
  await page.screenshot(path='/tmp/coloratlas-security.png')
  print('PASS: oversized image rejected, valid image import + library export/import + reload + localized docs; no normal-flow CSP violations, remote assets or page errors; spoofed host message ignored; eval blocked.',flush=True)
  await browser.close()
asyncio.run(main())
