from pathlib import Path
import json,re,subprocess
BASE=Path(__file__).parent
SOURCE=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
SCRIPT_EDITS=[
    ("(()=>{\nconst root=document.getElementById('munsell-picker');\nconst raw=JSON.parse", "(()=>{\nconst startEditor=()=>{\nconst root=document.getElementById('munsell-picker');\nconst raw=JSON.parse"),
    ("requestAnimationFrame(()=>{fitStudioKeys();drawColorWheel();});\n})();", "requestAnimationFrame(()=>{fitStudioKeys();drawColorWheel();});\n};\nif(window.AtlasStartup)window.AtlasStartup.run(startEditor);else startEditor();\n})();"),
    ('function initializeExplosion(){const image=new Image();image.onload=()=>{', 'function initializeExplosion(){const image=new Image();let ready;window.AtlasStartup?.waitFor(new Promise(resolve=>{ready=resolve;}));image.onerror=()=>ready?.();image.onload=()=>{try{'),
    ('previewReferenceReady(image.src);drawExplosionMap();};image.src=', 'previewReferenceReady(image.src);drawExplosionMap();}finally{ready?.();}};image.src=')
]
def install():
    from build_splash_noise import build
    noise=build()
    markup,n=re.subn(r'<svg class="splash-noise"[\s\S]*?</svg>',lambda _:noise,BASE.joinpath('atlas-splash.html').read_text(),count=1)
    assert n==1
    BASE.joinpath('atlas-splash.html').write_text(markup)
    phrases=json.loads(BASE.joinpath('atlas-splash-phrases.json').read_text())
    assert len(phrases)==20 and all(isinstance(p,str) and p.strip() for p in phrases)
    assert len(set(phrases))==20
    script=BASE.joinpath('atlas-splash.js').read_text()
    script,n=re.subn(r'const pool=\[[^\n]*\];',lambda _:'const pool='+json.dumps(phrases,ensure_ascii=False,separators=(',',':'))+';',script,count=1)
    assert n==1
    BASE.joinpath('atlas-splash.js').write_text(script)
    subprocess.run(['node',str(BASE/'build_splash.cjs')],cwd=BASE.parent,check=True)
    script=BASE.joinpath('atlas-splash-bundle.js').read_text()
    s=SOURCE.read_text()
    for old,new in SCRIPT_EDITS:
        if new not in s:
            assert s.count(old)==1
            s=s.replace(old,new,1)
    markup=BASE.joinpath('atlas-splash.html').read_text().strip()
    if 'id="atlas-splash"' in s:
        s,n=re.subn(r'<dialog id="atlas-splash"[\s\S]*?</dialog>',lambda _:markup,s,count=1)
        assert n==1
    else:
        s=s.replace('<svg class="studio-theme-defs"',markup+'\n<svg class="studio-theme-defs"',1)
    for tag,id,file in [('style','atlas-splash-style','atlas-splash.css'),('script','atlas-splash-ui','atlas-splash.js')]:
        block=f'<{tag} id="{id}">\n'+(script if tag=='script' else BASE.joinpath(file).read_text())+f'</{tag}>'
        if f'id="{id}"' in s:
            s,n=re.subn(r'<'+tag+' id="'+id+r'">[\s\S]*?</'+tag+'>',lambda _:block,s,count=1)
            assert n==1
        else:s+='\n'+block+'\n'
    # Establish the startup gate before the main editor and layout modules execute.
    s,number=re.subn(r'<script id="atlas-splash-ui">[\s\S]*?</script>\n?', '',s,count=1)
    assert number==1
    boot='<script id="atlas-splash-ui">\n'+script+'</script>\n'
    anchor='<script id="color-atlas-preview-fit">'
    assert s.count(anchor)==1
    s=s.replace(anchor,boot+anchor,1)
    # Cover the editor from its first parsed tag, before the startup script runs.
    s=s.replace('<div id="munsell-picker" data-ui-theme="chroma">','<div id="munsell-picker" data-ui-theme="chroma" data-boot="loading">',1)
    style=re.search(r'<style id="atlas-splash-style">[\s\S]*?</style>',s)[0]
    s=s.replace(style,'',1)
    s=style+'\n'+s.lstrip()
    assert len(s.encode())<1_000_000,len(s.encode())
    SOURCE.write_text(s)
    print('Installed startup splash:',len(s.encode()),'bytes')
if __name__=='__main__':install()
