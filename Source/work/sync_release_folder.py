"""Validate App, preserve release archives, and commit the local release branch."""
from pathlib import Path
import subprocess,hashlib,json,zipfile,shutil,re
from html.parser import HTMLParser
root=Path('/Users/raffribeiro/Documents/ColorAtlas');app=root/'App';release=root/'Realase';archives=release/'Archives';records=release/'Manifests'
archives.mkdir(exist_ok=True);records.mkdir(exist_ok=True)
version=Path('VERSION').read_text().strip();manifest=json.loads((release/'release.json').read_text());entry=app/manifest['entry']
assert (release/'VERSION').read_text().strip()==version==manifest['version']
assert not (app/'VERSION').exists(), 'VERSION belongs only to Realase'
assert hashlib.sha256(entry.read_bytes()).hexdigest()==manifest['sha256']
assert f'content="{version}"' in entry.read_text() and f'v{version}' in entry.read_text()
assert (app/'Data').is_dir()
assert not (root/'COLOR_ATLAS_START_HERE.html').exists(),'Obsolete root entry must not remain'
# Keep all release information under Realase. Legacy records retain original hashes.
for p in Path('releases').glob('v*.json'):
 record=json.loads(p.read_text());old=Path(record.get('archive','')).name
 if old and (archives/old).exists():record['archive']=str(archives/old)
 dest=records/p.name
 if not dest.exists():dest.write_text(json.dumps(record,indent=2)+'\n')
(release/'RELEASES.md').write_bytes(Path('work/RELEASES.md').read_bytes())
(release/'README.md').write_text('# Color Atlas release records\n\nCurrent version: '+version+'\n\nCHANGELOG.md records changes. release.json identifies the current HTML and its hash. Manifests records validated deliveries; Archives preserves the ZIPs already shared.\n\nThe local Git branch release tracks App plus this metadata. Archives and personal runtime Data files are excluded from Git. No remote is configured.\n')
(root/'README.md').write_text('# Color Atlas\n\nOpen App/COLOR_ATLAS_START_HERE.html in your browser. Presets, images, palettes and settings are saved in that browser profile.\n\nApp is the runnable, shareable folder. Realase contains all release records and archived sharing ZIPs.\n\nTo share a clean build, use the current ZIP in Realase/Archives. Generated ZIPs contain the built-in default preset and images, without personal saved work.\n')
(root/'.gitignore').write_text('.DS_Store\n**/.DS_Store\n/App/Data/*.json\n/App/Data/*.tmp\n/App/Data/Images/*.png\n/Realase/Archives/*.zip\n')
archive=archives/f'ColorAtlas-v{version}.zip'
if not archive.exists():
 with zipfile.ZipFile(archive,'x',compression=zipfile.ZIP_DEFLATED) as z:
  for p in sorted(app.rglob('*')):
   if p.is_file() and p.name!='.DS_Store' and not (p.relative_to(app).parts[0]=='Data' and p.name!='README.txt' and 'Defaults' not in p.relative_to(app).parts):
    z.write(p,'App/'+p.relative_to(app).as_posix())
  z.writestr('App/Data/settings.json','{}\n');z.write(app/'Data'/'Defaults'/'preview.json','App/Data/preview.json')
  for image in (p for p in (app/'Data'/'Defaults').iterdir() if p.suffix.lower() in ('.png','.jpeg')):z.write(image,'App/Data/Images/'+image.name)
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None
 assert hashlib.sha256(z.read('App/COLOR_ATLAS_START_HERE.html')).hexdigest()==manifest['sha256'],'Published archive differs: increment VERSION before repackaging'
record={**manifest,'archive':str(archive),'archiveSha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'validation':'automated browser-storage/package checks; live browser acceptance pending'}
(records/f'v{version}.json').write_text(json.dumps(record,indent=2)+'\n')
Path('releases').mkdir(exist_ok=True);Path(f'releases/v{version}.json').write_text(json.dumps(record,indent=2)+'\n')
def git(*args):return subprocess.check_output(['git','-C',str(root),*args],text=True).strip()
if not (root/'.git').exists():git('init','-b','release')
assert git('branch','--show-current')=='release','Switch to release before updating this package'
git('add','--','App','Realase','README.md','.gitignore')
if subprocess.run(['git','-C',str(root),'diff','--cached','--quiet']).returncode:
 subprocess.run(['git','-C',str(root),'-c','user.name=Color Atlas Release','-c','user.email=release@coloratlas.local','commit','-m',f'Release v{version}: synchronize App and release records'],check=True,stdout=subprocess.DEVNULL)
for name in git('ls-files','App').splitlines():
 tracked=subprocess.check_output(['git','-C',str(root),'show','HEAD:'+name]);assert tracked==(root/name).read_bytes(),name
assert not git('ls-files','App/Data/settings.json','App/Data/preview.json')
assert not git('status','--porcelain','--untracked-files=no'),git('status','--porcelain','--untracked-files=no')
print(f'PASS: App v{version}, immutable ZIP, and local release branch {git("rev-parse","--short","HEAD")} synchronized; personal Data excluded.')
