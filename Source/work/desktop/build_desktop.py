from pathlib import Path
import re,plistlib,subprocess,shutil
root=Path('/Users/raffribeiro/Documents/ColorAtlas')
app=root/'Color Atlas.app';contents=app/'Contents';resources=contents/'Resources';binary=contents/'MacOS';resources.mkdir(parents=True,exist_ok=True);binary.mkdir(exist_ok=True)
s=(root/'COLOR_ATLAS_START_HERE.html').read_text()
s,n=re.subn(r'<script id="atlas-preview-storage">[\s\S]*?</script>','',s,count=1);assert n==1
s=s.replace('<head>','<head>\n<script>'+Path('work/desktop/desktop-bridge.js').read_text()+'</script>',1)
s=s.replace('const localStorage = globalThis.localStorage;','const localStorage = globalThis.AtlasDesktopStorage;')
s=re.sub(r'const storageKey = `codex:visualization-widget-state-v2:[\s\S]*?\]\)}`;', 'const storageKey = "color-atlas-editor";',s,count=1)
s=s.replace('channel.port1.addEventListener("message", (event) => {','channel.port1.addEventListener("message", async (event) => {')
s=s.replace('storage.setItem(storageKey, JSON.stringify(state));','await storage.setItem(storageKey, JSON.stringify(state));')
assert 'await storage.setItem' in s and 'const storageKey = "color-atlas-editor";' in s
(resources/'COLOR_ATLAS_START_HERE.html').write_text(s)
version=Path('VERSION').read_text().strip()
info={'CFBundleName':'Color Atlas','CFBundleDisplayName':'Color Atlas','CFBundleIdentifier':'com.raffribeiro.coloratlas','CFBundleExecutable':'ColorAtlas','CFBundlePackageType':'APPL','CFBundleShortVersionString':version,'CFBundleVersion':version,'LSMinimumSystemVersion':'13.0','NSHighResolutionCapable':True}
(contents/'Info.plist').write_bytes(plistlib.dumps(info))
for arch in ('arm64','x86_64'):
 subprocess.run(['xcrun','swiftc','work/desktop/ColorAtlas.swift','-module-cache-path','/private/tmp/color-atlas-swift-cache','-target',arch+'-apple-macosx13.0','-o','/private/tmp/ColorAtlas-'+arch,'-framework','Cocoa','-framework','WebKit'],check=True)
subprocess.run(['lipo','-create','/private/tmp/ColorAtlas-arm64','/private/tmp/ColorAtlas-x86_64','-output',str(binary/'ColorAtlas')],check=True)
subprocess.run([str(binary/'ColorAtlas'),'--self-test'],check=True)
import os
for item in [app,*app.rglob('*')]:
 try:os.removexattr(item,'com.apple.FinderInfo')
 except OSError:pass
subprocess.run(['codesign','--force','--deep','--sign','-',str(app)],check=True)
for name,initial in [('settings.json','{}\n'),('preview.json','{"presets":[]}\n')]:
 p=root/'Data'/name
 if not p.exists():p.write_text(initial)
(root/'Data'/'README.txt').write_text('COLOR ATLAS DESKTOP DATA\n\nsettings.json: editor settings and My palettes.\npreview.json: Preview stack, presets and embedded imported image assets.\nThe desktop app reads and writes these files automatically. Keep Data beside Color Atlas.app.\nQuit the app before copying or editing Data. Back up this folder to preserve your work.\nThe HTML-only version still uses browser storage. Existing browser data is not migrated automatically.\n')
(root/'DESKTOP_README.txt').write_text('COLOR ATLAS DESKTOP v'+version+'\n\nOpen Color Atlas.app on macOS 13 or later (Apple silicon or Intel).\nKeep the Data folder beside the app. No internet or server is required.\nThe HTML entry remains available, but only the desktop app writes directly to Data.\n\nThis test app is ad-hoc signed and is not notarized. macOS may require approval in Privacy & Security when downloaded.\nBrowser presets are not automatically imported. Back up Data while the app is closed.\n')
print('PASS: universal macOS app built; native Data persistence self-test passed. Live UI acceptance pending.')
