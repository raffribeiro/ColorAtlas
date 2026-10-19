"""Pure standalone post-processing: embed local assets, extensions and host storage.

fit_page() returns text and never writes. CLI publication uses an atomic replace.
Extension order is declared in module-map.json; it matters because wrappers capture
previous functions inside the editor closure. Preserve that order when editing.
"""
from pathlib import Path
import base64
import html
import re
import json
from atlas_build import ROOT, atomic_write, export_integrations

def fit_page(s):
    s=re.sub(r'<title>[\s\S]*?</title>','<title>Color Atlas</title>',s,count=1)
    # The PNG modal uses a native submit event followed by a download hyperlink.
    # The generic renderer blocks both by default. Enable only those capabilities
    # for this task-owned export; CSP still prevents actual form navigation.
    blocked_frame = 'id="codex-visualization" sandbox="allow-scripts"'
    download_frame = 'id="codex-visualization" sandbox="allow-scripts allow-forms allow-downloads"'
    assert 'id="codex-visualization"' in s and ('sandbox="allow-scripts"' in s or 'sandbox="allow-scripts allow-forms allow-downloads"' in s)
    s=s.replace('sandbox="allow-scripts"','sandbox="allow-scripts allow-forms allow-downloads"',1)
    s=s.replace(' allow="fullscreen *" allowfullscreen','',1)
    s=s.replace('id="codex-visualization" style="visibility:hidden"','id="codex-visualization"',1)
    # Editor modules are embedded without a fullscreen control.
    def editor_frame(match):
     frame=html.unescape(match[1])
     frame=re.sub(r'// Image value normalization integration[\s\S]*?// End Image value normalization integration\n','',frame)
     frame=re.sub(r'// Graphic Design Random integration[\s\S]*?// End Graphic Design Random integration\n','',frame)
     # Shipped loading art and release label; no dependency on the source Desktop file.
     frame=frame.replace('<h1 id="atlas-splash-title">Color Atlas <small>VFX</small></h1>','<h1 id="atlas-splash-title"><span class="studio-brand">COLOR ATLAS</span><small>VFX</small></h1>',1)

     frame=re.sub(r'<style id="atlas-loading-art-style">[\s\S]*?</style>','',frame)
     frame+='<style id="atlas-loading-art-style">'+(ROOT / 'work/atlas-loading-art.css').read_text()+'</style>'
     art='data:image/png;base64,'+base64.b64encode((ROOT / 'work/Explosion_Loading.png').read_bytes()).decode('ascii')
     frame=re.sub(r'<div class="splash-art" aria-hidden="true">[\s\S]*?</div>',lambda _: '<div class="splash-art" aria-hidden="true"><img src="'+art+'" alt="" decoding="async"></div>',frame,count=1)
     frame=re.sub(r'<span class="splash-version">[^<]*</span>','',frame)
     frame=frame.replace('<div class="splash-progress-row">','<span class="splash-version">Version '+(ROOT / 'VERSION').read_text().strip()+'</span><div class="splash-progress-row">',1)

     frame=re.sub(r'<style id="atlas-wheel-swatch-style">[\s\S]*?</style>','',frame)
     frame+='<style id="atlas-wheel-swatch-style">'+(ROOT / 'work/atlas-wheel-swatch.css').read_text()+'</style>'
     frame=re.sub(r'// Wheel swatch grouping integration[\s\S]*?// End Wheel swatch grouping integration\n','',frame)
     frame=re.sub(r'<style id="atlas-lightness-readout-style">[\s\S]*?</style>','',frame)
     frame+='<style id="atlas-lightness-readout-style">'+(ROOT / 'work/atlas-lightness-readout.css').read_text()+'</style>'
     frame=re.sub(r'// Lightness readout integration[\s\S]*?// End Lightness readout integration\n','',frame)
     frame=re.sub(r'<style id="atlas-app-width-style">[\s\S]*?</style>','',frame)
     frame+='<style id="atlas-app-width-style">'+(ROOT / 'work/atlas-app-width.css').read_text()+'</style>'
     frame=re.sub(r'// App width handles integration[\s\S]*?// End App width handles integration\n','',frame)
     frame=re.sub(r'<style id="atlas-slider-style">[\s\S]*?</style>','',frame)
     frame+='<style id="atlas-slider-style">'+(ROOT / 'work/atlas-slider-style.css').read_text()+'</style>'
     frame=re.sub(r'<style id="atlas-text-selection">[\s\S]*?</style>','',frame)
     frame+='<style id="atlas-text-selection">'+(ROOT / 'work/atlas-text-selection.css').read_text()+'</style>'
     frame=re.sub(r'// Atlas history integration[\s\S]*?// End Atlas history integration\n','',frame)
     frame=re.sub(r'// Bright-source Random integration[\s\S]*?// End Bright-source Random integration\n','',frame)
     frame=re.sub(r'// Random performance integration[\s\S]*?// End Random performance integration\n','',frame)
     frame=re.sub(r'// Preview composition PNG export integration[\s\S]*?// End Preview composition PNG export integration\n','',frame)
     frame=re.sub(r'// Save current Preview preset integration[\s\S]*?// End Save current Preview preset integration\n','',frame)
     frame=re.sub(r'// Preview preset connection integration[\s\S]*?// End Preview preset connection integration\n','',frame)
     frame=re.sub(r'// Precise Gradient editing integration[\s\S]*?// End Precise Gradient editing integration\n','',frame)
     frame=re.sub(r'// Layer image drop integration[\s\S]*?// End Layer image drop integration\n','',frame)
     frame=re.sub(r'// Default Preview integration[\s\S]*?// End Default Preview integration\n','',frame)
     frame=re.sub(r'// Scene-role Random integration[\s\S]*?// End Scene-role Random integration\n','',frame)
     assert frame.count('initializePreviewLayers();')==1
     frame=frame.replace('initializePreviewLayers();','// Default Preview integration\nconst AtlasBuiltinPreview='+(ROOT / 'work/default-preview.json').read_text()+';\n'+(ROOT / 'work/atlas-default-preview.js').read_text()+'initializePreviewLayers();',1)
     anchor='new ResizeObserver(()=>{drawScene();drawStrip();drawLch();'
     assert frame.count(anchor)==1
     frame=frame.replace(anchor,export_integrations()+anchor,1)
     frame=re.sub(r'<script id="atlas-fullscreen-ui">[\s\S]*?</script>','',frame)
     # Locale packs stay outside the size-limited canonical editor. The final
     # distribution remains one offline file, with no translation service.
     for block in ('atlas-language-packs','atlas-i18n-ui','atlas-i18n-style'):
      frame=re.sub(r'<(?:script|style) id="'+block+r'"[^>]*>[\s\S]*?</(?:script|style)>','',frame)
     packs={p.stem:{**json.loads(p.read_text()),**json.loads((ROOT/'work/locales/full'/p.name).read_text()),**json.loads((ROOT/'work/locales/supplement'/p.name).read_text()),**json.loads((ROOT/'work/locales/extra'/p.name).read_text())} for p in sorted((ROOT/'work/locales').glob('*.json')) if p.stem!='en'}
     catalog=json.dumps(packs,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
     frame+='<script id="atlas-language-packs" type="application/json">'+catalog+'</script>'
     frame+='<style id="atlas-i18n-style">'+(ROOT/'work/atlas-i18n.css').read_text()+'</style>'
     frame+='<script id="atlas-i18n-ui">'+(ROOT/'work/atlas-i18n.js').read_text()+'</script>'
     return 'data-srcdoc="'+html.escape(frame,quote=True)+'"'
    s,n=re.subn(r'data-srcdoc="([^"]*)"',editor_frame,s,count=1)
    assert n==1
    # Apply the dark shell before parsing body content; reveal the frame only after
    # its app document has loaded, with the splash already covering editor warmup.
    s=re.sub(r'<style id="atlas-initial-background">[\s\S]*?</style>\s*','',s)
    s=s.replace('</head>','<style id="atlas-initial-background">:root,html,body,iframe{background:#07090f}</style>\n</head>',1)
    s=re.sub(r'<script id="atlas-frame-reveal">[\s\S]*?</script>\s*','',s)
    s=s.replace('id="codex-visualization" ', 'id="codex-visualization" style="visibility:hidden" ',1)
    reveal='''<script id="atlas-frame-reveal">
document.getElementById('codex-visualization').addEventListener('load',function(){if(this.hasAttribute('srcdoc'))this.style.visibility='visible';});
</script>'''
    s=s.replace('</iframe>','</iframe>\n'+reveal,1)
    asset=(ROOT / 'outputs/default-explosion.webp').resolve()
    if asset.exists():
        s=s.replace(asset.as_uri(),'data:image/webp;base64,'+base64.b64encode(asset.read_bytes()).decode('ascii'))
    study=(ROOT / 'work/attention-reference-study.png').resolve()
    if study.exists():
        s=s.replace(study.as_uri(),'data:image/png;base64,'+base64.b64encode(study.read_bytes()).decode('ascii'))
    # Keep the iframe's logical width equal to its visible width. The renderer already
    # measures content height; scaling it back to the viewport caused square previews
    # to grow the logical width repeatedly and made all controls unreadably small.
    s=re.sub(r'<style>html,body\{height:100%;overflow:hidden\}.*?</script>\s*','',s,flags=re.S)
    s=re.sub(r'<style id="color-atlas-viewport">.*?</style>\s*','',s,flags=re.S)
    patch='''<style id="color-atlas-viewport">
html{height:auto;min-height:100%;overflow-y:auto;overflow-x:hidden}
body{height:auto;min-height:100vh;box-sizing:border-box;padding:12px!important;display:block;overflow-y:auto;overflow-x:hidden}
#codex-visualization{display:block;flex:none;width:100%;max-width:none;min-width:0;transform:none;margin:0}
@media(min-width:1000px) and (min-height:800px){
 html,body{height:100%;min-height:0;overflow:hidden}
 #codex-visualization{height:calc(100dvh - 24px)!important}
}
</style>'''
    s=re.sub(r'<script id="atlas-preview-storage">[\s\S]*?</script>\s*','',s)
    bridge='<script id="atlas-preview-storage">\n'+'const AtlasBuiltinPreview='+(ROOT / 'work/default-preview.json').read_text()+';\n'+'const AtlasDesignPreview='+(ROOT / 'work/design-preview.json').read_text()+';\n'+(ROOT / 'work/atlas-preview-storage.js').read_text()+'</script>'
    assert '</body>' in s
    locale_host='<script id="atlas-i18n-host">'+(ROOT/'work/atlas-i18n-host.js').read_text()+'</script>'
    s=re.sub(r'<script id="atlas-i18n-host">[\s\S]*?</script>\s*','',s)
    return s.replace('</body>',patch+'\n'+bridge+'\n'+locale_host+'\n</body>')


def main():
    import sys
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'outputs/munsell-color-picker.html'
    atomic_write(path, fit_page(path.read_text()))
    print('PASS: desktop iframe fits viewport height; smaller windows retain scrolling; embedded preview retained.')


if __name__ == '__main__':
    main()
