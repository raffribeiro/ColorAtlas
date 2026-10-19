"""Local Chromium responsiveness benchmark. Does not modify the app or user data."""
import asyncio, hashlib, json, math, os, statistics, subprocess, sys, time
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
REPORT = ROOT / 'reports/color-atlas-performance-v0.90.18.json'
APP = ROOT / 'outputs/munsell-color-picker.html'
MODES = ['auto', 'perceptual', 'colorplay', 'graphic-design-smooth', 'graphic-design-bands', 'true-random']
HEADLESS = os.environ.get('HEADLESS', '1') != '0'
RATES = [float(x) for x in os.environ.get('RATES', '1,4,6').split(',')]


def stats(values):
    values = sorted(values)
    return {'n':len(values), 'median_ms':statistics.median(values),
            'p95_ms':values[max(0, math.ceil(.95*len(values))-1)], 'max_ms':max(values)}


def checkpoint(data):
    subprocess.run([sys.executable, str(ROOT/'work/agent_lock.py'), 'check', 'codex', str(REPORT.relative_to(ROOT))], check=True, capture_output=True, cwd=ROOT)
    REPORT.parent.mkdir(exist_ok=True)
    if REPORT.exists(): REPORT.read_text()
    REPORT.write_text(json.dumps(data, indent=2)+'\n')


async def timed(frame, selector, value=None, event='input'):
    return await frame.evaluate('''async ({selector,value,event})=>{
      const el=document.querySelector(selector);if(!el)throw Error(selector);
      const before=document.querySelector('[data-field="vfx-hex"]')?.textContent;
      const start=performance.now();if(value!==null)el.value=String(value);
      if(event==='click')el.click();else el.dispatchEvent(new Event(event,{bubbles:true}));
      const sync=performance.now()-start;
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
      return {sync_ms:sync,frame_ms:performance.now()-start,before,after:document.querySelector('[data-field="vfx-hex"]')?.textContent};
    }''', {'selector':selector,'value':value,'event':event})


async def memory(browser, session):
    metrics={x['name']:x['value'] for x in (await session.send('Performance.getMetrics'))['metrics']}
    result={'js_heap_used_mib':metrics.get('JSHeapUsedSize',0)/2**20,'js_heap_total_mib':metrics.get('JSHeapTotalSize',0)/2**20,'dom_nodes':metrics.get('Nodes')}
    root=await browser.new_browser_cdp_session()
    try:
        gpu=(await root.send('SystemInfo.getInfo'))['gpu'];result['gpu_devices']=gpu.get('devices');result['gpu_features']=gpu.get('featureStatus');
        procs=(await root.send('SystemInfo.getProcessInfo'))['processInfo']
        ids=','.join(str(int(p['id'])) for p in procs)
        raw=subprocess.check_output(['/bin/ps','-o','rss=','-p',ids],text=True)
        result['browser_process_rss_sum_mib']=sum(int(x) for x in raw.split())/1024
        result['process_count']=len(procs)
    except Exception as e: result['rss_unavailable']=type(e).__name__
    await root.detach()
    return result


async def scene(frame, layers):
    await timed(frame,'#mp-vfx-l',55)
    await timed(frame,'#artist-transition','smooth','change')
    edits=[]
    for value in [35,65,45,72,40,60,55]:
        edits.append(await timed(frame,'#mp-vfx-l',value))
    saturation=[]
    for value in [45,80,55,90,50,75,65]:
        saturation.append(await timed(frame,'#vfx-saturation',value))
    assert any(x['before']!=x['after'] for x in edits), 'lightness input must change the selected color'
    randoms={}
    for mode in MODES:
        await timed(frame,'#random-type',mode,'change')
        samples=[await timed(frame,'[data-action="random-all-layers"]',None,'click') for _ in range(5)]
        randoms[mode]={'sync':stats([x['sync_ms'] for x in samples]),'to_frame':stats([x['frame_ms'] for x in samples])}
        print(f"  {layers} layers {mode}: {randoms[mode]['to_frame']['median_ms']:.1f} ms",flush=True)
    await timed(frame,'#mp-vfx-l',55)
    rotation=await frame.evaluate('''async()=>{
      const svg=document.querySelector('svg.mp-vfx-lab'),checkbox=document.querySelector('#lab-auto-rotate');
      const measure=async spin=>{checkbox.checked=spin;let draws=0,intervals=[],last=performance.now(),start=last;
        const observer=new MutationObserver(()=>draws++);observer.observe(svg,{childList:true});
        await new Promise(resolve=>{function step(now){intervals.push(now-last);last=now;if(now-start<2200)requestAnimationFrame(step);else resolve()}requestAnimationFrame(step)});
        observer.disconnect();const duration=performance.now()-start;intervals=intervals.slice(4).sort((a,b)=>a-b);
        return {duration_ms:duration,graph_redraws_per_second:draws*1000/duration,browser_frames_per_second:intervals.length*1000/intervals.reduce((a,b)=>a+b,0),frame_p95_ms:intervals[Math.floor(intervals.length*.95)],frames_over_50ms:intervals.filter(x=>x>50).length};};
      const idle=await measure(false),rotating=await measure(true);checkbox.checked=false;return {idle,rotating};
    }''')
    long_tasks=await frame.evaluate('window.__appBenchTasks.splice(0)')
    return {'layer_count':layers,'random_layers':await frame.locator('.preview-layer-random[aria-pressed=true]').count(),
            'lightness':{'sync':stats([x['sync_ms'] for x in edits]),'to_frame':stats([x['frame_ms'] for x in edits])},
            'saturation':{'sync':stats([x['sync_ms'] for x in saturation]),'to_frame':stats([x['frame_ms'] for x in saturation])},
            'random':randoms,'rotation':rotation,'long_tasks':{'count':len(long_tasks),'total_ms':sum(long_tasks),'max_ms':max(long_tasks,default=0)}}


async def profile(p, rate, url):
    browser=await p.chromium.launch(headless=HEADLESS,args=['--enable-precise-memory-info'])
    context=await browser.new_context(viewport={'width':1440,'height':900},device_scale_factor=1)
    await context.add_init_script("window.__appBenchTasks=[];try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__appBenchTasks.push(e.duration)}).observe({type:'longtask',buffered:true})}catch{}")
    page=await context.new_page();errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    main=await context.new_cdp_session(page)
    await main.send('Performance.enable');await main.send('Emulation.setCPUThrottlingRate',{'rate':rate})
    start=time.perf_counter();await page.goto(url,wait_until='domcontentloaded',timeout=120000)
    dom_ms=(time.perf_counter()-start)*1000
    await page.locator('#codex-visualization').wait_for()
    frame=await page.locator('#codex-visualization').element_handle();frame=await frame.content_frame()
    session=main;independent=False
    try:
        child=await context.new_cdp_session(frame)
        await child.send('Performance.enable');await child.send('Emulation.setCPUThrottlingRate',{'rate':rate})
        session=child;independent=True
    except Exception: pass
    await frame.locator('#atlas-tour:not([hidden])').wait_for(timeout=120000)
    startup_ms=(time.perf_counter()-start)*1000
    await frame.locator('[data-tour=skip]').click(timeout=120000)
    await page.wait_for_timeout(800)
    calibration=await frame.evaluate('''()=>{const run=()=>{const t=performance.now();let sum=0;for(let i=0;i<2500000;i++)sum+=Math.sin(i*.001);return {ms:performance.now()-t,sum}};run();return [run().ms,run().ms,run().ms]}''')
    await frame.evaluate('window.__appBenchTasks=[]')
    normal=await scene(frame,3);normal['memory']=await memory(browser,session);normal['live_dom_nodes']=await frame.locator('*').count()
    asset=next((ROOT/'work/default-preview-images').glob('*.png'))
    for n in range(4,9):
        await frame.locator('#preview-layer-file').set_input_files(str(asset),timeout=120000)
        await frame.wait_for_function('(n)=>document.querySelectorAll(".preview-layer-row").length===n',arg=n,timeout=120000)
    await frame.evaluate('''()=>{for(const b of document.querySelectorAll('.preview-layer-random'))if(b.getAttribute('aria-pressed')!=='true')b.click();for(const c of document.querySelectorAll('.preview-layer-row>input[type=checkbox]'))if(!c.checked){c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}))}}''')
    await frame.evaluate('window.__appBenchTasks=[]')
    heavy=await scene(frame,8);heavy['memory']=await memory(browser,session);heavy['live_dom_nodes']=await frame.locator('*').count()
    result={'cpu_throttle':rate,'browser':browser.version,'iframe_separate_cdp_session':independent,
            'startup':{'dom_content_loaded_ms':dom_ms,'tour_visible_ms':startup_ms,'fresh_browser_profile':True},
            'calibration':stats(calibration),'scenes':{'default':normal,'eight_layers_all_random':heavy},'page_errors':errors}
    await browser.close();return result


async def main():
    source=APP.read_bytes();digest=hashlib.sha256(source).hexdigest()
    snapshot=Path('/tmp/color-atlas-performance-v0.90.18.html');snapshot.write_bytes(source)
    data={'version':(ROOT/'VERSION').read_text().strip(),'app_sha256':digest,'viewport':[1440,900],
          'reference':{'cpu':'Apple M4 Pro','ram_gib':24,'logical_cpus':12},
          'headless':HEADLESS,'method':'Chromium; rendering backend recorded per profile; isolated fresh profiles; CPU emulation only, no GPU/RAM/disk throttling; local immutable HTML copy; synthetic input includes actual editor handlers and two animation frames.',
          'profiles':[]}
    async with async_playwright() as p:
        for rate in RATES:
            print(f'CPU x{rate:g}',flush=True)
            data['profiles'].append(await profile(p,rate,snapshot.as_uri()));checkpoint(data)
    print('Saved',REPORT,flush=True)

async def gesture_profile(p, rate, url):
    browser=await p.chromium.launch(headless=False)
    context=await browser.new_context(viewport={'width':1440,'height':900})
    page=await context.new_page();session=await context.new_cdp_session(page)
    await session.send('Emulation.setCPUThrottlingRate',{'rate':rate})
    await page.goto(url)
    f=await (await page.query_selector('iframe')).content_frame()
    try:
        child=await context.new_cdp_session(f);await child.send('Emulation.setCPUThrottlingRate',{'rate':rate})
    except Exception: pass
    await f.locator('#atlas-tour:not([hidden])').wait_for(timeout=120000)
    await f.locator('[data-tour=skip]').click();await page.wait_for_timeout(800)
    results={}
    for kind in ['rotate','pan','zoom','color_point']:
        await f.locator('[data-action="lab-reset-zoom"]').click()
        await page.wait_for_timeout(250)
        selector='svg.mp-vfx-lab .lab-current-marker' if kind=='color_point' else 'svg.mp-vfx-lab'
        box=await f.locator(selector).bounding_box()
        if kind=='color_point':x,y=box['x']+box['width']/2,box['y']+box['height']/2
        else:x,y=box['x']+box['width']*.15,box['y']+box['height']*.75
        await page.mouse.move(x,y)
        await f.evaluate("""()=>{const svg=document.querySelector('svg.mp-vfx-lab');window.__gesture={start:performance.now(),frames:[],draws:[],moves:0,before:document.querySelector('[data-field="vfx-hex"]').textContent,html:svg.innerHTML,live:true};const g=window.__gesture;g.observer=new MutationObserver(()=>g.draws.push(performance.now()));g.observer.observe(svg,{childList:true});g.moved=()=>g.moves++;svg.addEventListener('pointermove',g.moved);let last=g.start;function tick(now){if(!g.live)return;g.frames.push(now-last);last=now;requestAnimationFrame(tick)}requestAnimationFrame(tick)}""")
        button='middle' if kind=='pan' else 'left'
        if kind!='zoom':await page.mouse.down(button=button)
        jobs=[];start=time.perf_counter();steps=36;duration=.8
        for i in range(1,steps+1):
            fraction=i/steps
            if kind=='zoom':jobs.append(asyncio.create_task(page.mouse.wheel(0,-12)))
            else:
                dx,dy=(40,-18) if kind=='color_point' else (110,-35)
                jobs.append(asyncio.create_task(page.mouse.move(x+dx*fraction,y+dy*fraction)))
            await asyncio.sleep(max(0,start+duration*fraction-time.perf_counter()))
        await asyncio.gather(*jobs)
        if kind!='zoom':await page.mouse.up(button=button)
        end_ms=(time.perf_counter()-start)*1000
        measured=await f.evaluate("""()=>{const g=window.__gesture;g.live=false;g.observer.disconnect();document.querySelector('svg.mp-vfx-lab').removeEventListener('pointermove',g.moved);const frames=g.frames.slice(2).sort((a,b)=>a-b),elapsed=performance.now()-g.start;return {elapsed_ms:elapsed,redraws:g.draws.length,redraws_per_second:g.draws.length*1000/elapsed,frame_p95_ms:frames[Math.floor(frames.length*.95)],frames_over_50ms:frames.filter(x=>x>50).length,pointer_moves_received:g.moves,color_changed:g.before!==document.querySelector('[data-field="vfx-hex"]').textContent,graph_changed:g.html!==document.querySelector('svg.mp-vfx-lab').innerHTML}}""")
        assert measured['graph_changed'],kind+' must move the actual graph'
        if kind=='color_point':assert measured['color_changed'],'drag must change the actual color'
        measured['intended_input_duration_ms']=800;measured['input_commands']=steps;measured['input_and_release_wall_ms']=end_ms
        results[kind]=measured
        print(f"CPU x{rate:g} {kind}: {measured['redraws_per_second']:.1f} updates/s, total {measured['elapsed_ms']:.0f} ms",flush=True)
        await page.wait_for_timeout(400)
    await browser.close()
    return {'cpu_throttle':rate,'gestures':results}


async def gesture_main():
    data=json.loads(REPORT.read_text());url=Path('/tmp/color-atlas-performance-v0.90.18.html').as_uri()
    data['manual_3d_gestures']=[]
    async with async_playwright() as p:
        for rate in RATES:
            data['manual_3d_gestures'].append(await gesture_profile(p,rate,url));checkpoint(data)


if __name__=='__main__':asyncio.run(gesture_main() if os.environ.get('GESTURES_ONLY') else main())
