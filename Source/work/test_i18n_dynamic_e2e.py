"""Browser regressions for semantic locale bindings and live example labels.

Uses a fresh file-based profile. Canvas assertions observe real fillText calls;
we do not alter color math or compare backend-dependent pixel hashes.
"""
import asyncio
import json
import re
import sys
from pathlib import Path
from playwright.async_api import async_playwright

APP = Path(sys.argv[1] if len(sys.argv) > 1 else 'outputs/munsell-color-picker.html').resolve()
LANGUAGES = ('pt-BR', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'zh-CN')
SAVE_TITLE = 'Save changes to the selected Preview preset'
SENTENCE = 'The outlined radial chip is your selected color.'
FAMILIES = ((1, '5YR', 'Yellow-Red'), (5, '5BG', 'Blue-Green'), (9, '5RP', 'Red-Purple'))

async def text(frame, source):
    return await frame.evaluate('(s) => AtlasI18n.t(s)', source)

async def change(fig, key, value):
    await fig.locator('[data-k="' + key + '"]').evaluate('''(element,value) => {
      element.value=String(value);element.dispatchEvent(new Event('input',{bubbles:true}));
    }''', value)

async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1744, 'height': 983})
        page = await context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        await page.goto(APP.as_uri())
        frame = await (await page.locator('#codex-visualization').element_handle()).content_frame()
        await frame.locator('#atlas-tour:not([hidden])').wait_for(timeout=120000)
        await frame.locator('[data-tour=skip]').click()
        await page.wait_for_timeout(6000)
        frame = await (await page.locator('#codex-visualization').element_handle()).content_frame()
        # Record translated strings drawn to actual example canvases.
        await frame.evaluate('''() => {
          window.__localeCanvasLabels=[];
          const original=CanvasRenderingContext2D.prototype.fillText;
          CanvasRenderingContext2D.prototype.fillText=function(label,...rest){
            const figure=this.canvas.closest('[data-doc-example]');
            if(figure)window.__localeCanvasLabels.push({example:figure.dataset.docExample,label:String(label)});
            return original.call(this,label,...rest);
          };
        }''')
        packs = json.loads(await frame.locator('#atlas-language-packs').text_content())
        svg = frame.locator('.mp-vfx-lab').first
        svg_label = await svg.get_attribute('aria-label')
        assert svg_label, '3D graph must have an accessible label'
        scene = '''() => ({name:document.querySelector('#preview-preset-name').value,
          color:document.querySelector('[data-field="vfx-hex"]').textContent,
          blend:document.querySelector('#preview-blend').value,
          random:document.querySelector('#random-type').value,
          keys:[...document.querySelectorAll('.mp-gradient circle')].map(e=>e.getAttribute('cx'))})'''
        before = await frame.evaluate(scene)
        menu = frame.locator('#atlas-language')
        await frame.locator('[data-studio-view=documentation]').click()
        await frame.locator('.atlas-docs-sidebar [data-doc-link="editing-color"]').click()
        munsell = frame.locator('[data-doc-example="munsell"]')
        plane = frame.locator('[data-doc-example="slice"] canvas')
        await plane.wait_for()
        plane_label = await plane.get_attribute('aria-label')
        assert plane_label, 'Interactive canvas must have an accessible label'
        for locale in LANGUAGES:
            await menu.select_option(locale)
            await page.wait_for_timeout(80)
            pack = packs[locale]
            assert await frame.locator('[data-preview-preset="save"]').get_attribute('title') == pack[SAVE_TITLE], (locale, 'Save title was captured by an overly broad count template')
            assert await svg.get_attribute('aria-label') == pack[svg_label], (locale, 'SVG ARIA not localized')
            assert await plane.get_attribute('aria-label') == pack[plane_label], (locale, 'Canvas ARIA not localized')
            await frame.locator('.atlas-docs-sidebar [data-doc-link="editing-color"]').click()
            await change(munsell, 'V', 5)
            for index, notation, name in FAMILIES:
                await change(munsell, 'H', index)
                await change(munsell, 'C', 2)
                await page.wait_for_timeout(35)
                expected = notation + ' · ' + pack[name]
                assert await munsell.locator('[data-o="H"]').text_content() == expected, (locale, index, 'Visible hue name')
                assert await munsell.locator('[data-k="H"]').get_attribute('aria-valuetext') == expected, (locale, index, 'Accessible hue name')
                result = await munsell.locator('[data-r="out"]').text_content()
                assert pack[name] in result and pack[SENTENCE] in result, (locale, index, 'Munsell semantic bindings', result)
                maximum = await munsell.locator('[data-k="C"]').get_attribute('aria-valuetext')
                assert 'available maximum' not in maximum, (locale, 'Chroma ARIA not localized')
            await change(munsell, 'C', 0)
            await page.wait_for_timeout(35)
            assert pack['At zero chroma, every hue is the same gray.'] in await munsell.locator('[data-r="out"]').text_content(), (locale, 'Neutral sentence')
            # Notation/HEX/numeric values are bindings, whereas names are semantic.
            source = '#123ABC  ·  L 24  ·  hue 40°'
            expected = pack['{0} · L {1} · hue {2}°'].format('#123ABC', 24, 40)
            actual=await text(frame, source)
            assert actual == expected, (locale, 'Double-space template', actual, expected)
            assert await text(frame,'3 Preview presets remain untouched')=='3 Preview presets remain untouched','Count templates must not consume prose suffixes'
            favorite = await text(frame, 'Adicionar Normal aos favoritos')
            assert favorite == pack['Adicionar {0} aos favoritos'].format('Normal'), (locale, 'Authored preset name was translated', favorite)
            remove = await text(frame, 'Remover Normal dos favoritos')
            assert remove == pack['Remover {0} dos favoritos'].format('Normal'), (locale, 'Authored removal name')
            counts = [await text(frame, s) for s in ('3 palettes', '2 favorites', '2 Preview presets')]
            if locale in ('ja', 'ko', 'zh-CN'):
                assert all(not re.search(r'\bs\b|s$', value) for value in counts), (locale, 'English plural suffix', counts)
            if locale == 'de':
                assert 'Paletten' in counts[0], counts
            if locale == 'it':
                assert 'tavolozze' in counts[0].lower(), counts
            await frame.locator('.atlas-docs-sidebar [data-doc-link="random"]').click()
            harmony = frame.locator('[data-doc-example="harmony"]')
            # Capture post-render canvas strings, not only t() results.
            for mode, degrees in (('warm', 35), ('cool', 200)):
                await frame.evaluate('window.__localeCanvasLabels=[]')
                await change(harmony, 'mode', mode)
                labels = await frame.evaluate('window.__localeCanvasLabels.filter(e=>e.example==="harmony").map(e=>e.label)')
                expected_mode = await text(frame, f'{mode} · base {degrees}°')
                assert expected_mode in labels, (locale, mode, labels)
                assert pack[mode.capitalize()] in expected_mode, (locale, mode, 'Mode binding remains English', expected_mode)
                assert not any(' ·  hue ' in label or ' · hue ' in label for label in labels), (locale, 'Canvas hue remained English', labels)
            await frame.locator('[data-studio-view="editor"]').click()
            library_search=frame.locator('#studio-search')
            await library_search.fill('')
            total=await frame.locator('.studio-library [data-studio-preset]').count()
            await library_search.fill(pack['Fire'])
            found=await frame.locator('.studio-library [data-studio-preset]').count()
            assert 0<found<total,(locale,'Localized library query',found,total)
            assert await library_search.input_value()==pack['Fire'],'Query must remain authored'
            await library_search.fill('')
            await frame.locator('[data-studio-view="documentation"]').click()
            print(f'PASS {locale}: graphic/canvas ARIA, dynamic Munsell hues, canvas/template bindings, plurals, preserved names, exact Save title and translated library search.', flush=True)
        await menu.select_option('en')
        await page.wait_for_timeout(80)
        assert await svg.get_attribute('aria-label') == svg_label, 'English SVG restoration'
        assert await plane.get_attribute('aria-label') == plane_label, 'English canvas restoration'
        assert await frame.locator('[data-preview-preset="save"]').get_attribute('title') == SAVE_TITLE
        assert await frame.evaluate(scene) == before, 'Localization changed authored scene'
        assert not errors, errors
        print('PASS: English restored; authored scene unchanged; no browser errors.', flush=True)
        await context.close()
        await browser.close()

asyncio.run(main())
