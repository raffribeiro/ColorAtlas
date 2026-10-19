from pathlib import Path
import re,json
BASE=Path(__file__).parent
SOURCE=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
EDITS_FILE=BASE/'preview-layers-script-edits.json'
SCRIPT_EDITS=json.loads(EDITS_FILE.read_text()) if EDITS_FILE.exists() else []
def install():
 global SCRIPT_EDITS
 s=SOURCE.read_text();backup=BASE/'selector-before-preview-layers.html'
 if not backup.exists():backup.write_text(s)
 if not SCRIPT_EDITS:
  start=s.index('function drawExplosionMap(){');a=s.index('const lut=Array.from({length:256}',start);b=s.index('ctx.putImageData(pixels,0,0);',a)
  SCRIPT_EDITS=[
   ['function drawExplosionMap(){if(!explosionPixels)return;','function drawExplosionMap(){syncPreviewLayer();if(!explosionPixels)return;'],
   ['const signature=JSON.stringify([state.gradientLayers','const signature=JSON.stringify([previewRevision,state.gradientLayers'],
   [s[a:b],'previewComposite(pixels.data,previewImages);'],
   ['ctx.putImageData(pixels,0,0);drawExplosionMap();};image.src=', 'ctx.putImageData(pixels,0,0);previewReferenceReady(image.src);drawExplosionMap();};image.src='],
   ['loadGradientColor();initializeExplosion();','initializePreviewLayers();loadGradientColor();initializeExplosion();'],
   ["for(const heading of panel.querySelectorAll?.(':scope > h3, .studio-preview-toolbar h3')||[])heading.remove();", "for(const heading of panel.querySelectorAll?.(':scope > h3, .studio-preview-toolbar h3')||[])if(!heading.classList?.contains('studio-panel-title'))heading.remove();"]
  ];EDITS_FILE.write_text(json.dumps(SCRIPT_EDITS,ensure_ascii=False,indent=2)+'\n')
 # Later startup instrumentation wraps the reference-image callback. Recognize
 # the installed preview edit through that wrapper instead of applying it twice.
 from install_splash import SCRIPT_EDITS as STARTUP_EDITS
 probe=s
 for old,new in reversed(STARTUP_EDITS):probe=probe.replace(new,old,1)
 for old,new in SCRIPT_EDITS:
  if new not in s and new not in probe:assert s.count(old)==1,old[:100];s=s.replace(old,new,1)
 module=BASE.joinpath('atlas-preview-layers-bundle.js').read_text()
 if '// Independent image Gradient Maps;' in s:s=re.sub(r'// Independent image Gradient Maps;[\s\S]*?// End Preview image stack\.\n',lambda _:module,s,count=1)
 else:s=s.replace('function drawExplosionMap(){',module+'function drawExplosionMap(){',1)
 for kind,title in [('author','AUTHORING COLORS'),('preview','PREVIEW')]:
  opening=re.search(r'<section class="studio-card studio-'+kind+r'"[^>]*>',s)[0]
  heading='<h3 class="studio-panel-title">'+title+'</h3>'
  if opening+heading not in s:s=s.replace(opening,opening+heading,1)
 presets=BASE.joinpath('atlas-preview-presets.html').read_text().strip()
 if 'id="preview-preset-select"' not in s:s=s.replace('<h3 class="studio-panel-title">PREVIEW</h3>','<h3 class="studio-panel-title">PREVIEW</h3>'+presets,1)
 else:
  s=re.sub(r'<div class="preview-preset-toolbar">[\s\S]*?</dialog>',lambda _:presets,s,count=1)
 markup=BASE.joinpath('atlas-preview-layers.html').read_text().strip()
 if 'id="preview-layers"' in s:s=re.sub(r'<section id="preview-layers"[\s\S]*?</section>',lambda _:markup,s,count=1)
 else:
  a=s.index('<section class="studio-card studio-preview"');b=s.index('</section></div>',a);s=s[:b]+markup+s[b:]
 style='<style id="atlas-preview-layers-style">\n'+BASE.joinpath('atlas-preview-layers.css').read_text()+'</style>'
 if 'id="atlas-preview-layers-style"' in s:s=re.sub(r'<style id="atlas-preview-layers-style">[\s\S]*?</style>',lambda _:style,s,count=1)
 else:s+='\n'+style+'\n'
 vendor='<script id="atlas-motion-vendor" data-version="14.0.0">\n'+'/*!\n'+BASE.joinpath('vendor/Motion-LICENSE.md').read_text().replace('[Motion](https://motion.dev)','Motion')+'*/\n'+BASE.joinpath('vendor/motion-14.0.0-animate.js').read_text()+'</script>'
 s,n=re.subn(r'<script id="atlas-motion-vendor"[^>]*>[\s\S]*?</script>',lambda _:vendor,s,count=1);assert n==1
 assert len(s.encode())<1_000_000,len(s.encode())
 SOURCE.write_text(s);print('Installed preview layers:',len(s.encode()),'bytes')
if __name__=='__main__':install()
