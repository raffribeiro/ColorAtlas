"""Regression checks for build purity and rejected-release non-mutation.

All package executions use an isolated fixture; never run publication against App.
"""
from pathlib import Path
import html
import os
import subprocess
import sys
import tempfile
import unittest
import zipfile
from release_preflight import check_release_preflight

WORK = Path(__file__).resolve().parent


class BuildSafety(unittest.TestCase):
    def test_compiler_only_writes_generated_files(self):
        # A VM filesystem records writes without rebuilding actual workspace artifacts.
        code = r"""
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(process.argv[1],'utf8'),writes=[];
const fakeFs={readFileSync(path){return path.endsWith('atlas-library-folders.js')
 ? '// Presentation taxonomy only;\nold rules\nfunction studioLibraryGroups(){}'
 : path.endsWith('library-theme-rules.js')?'// Presentation taxonomy only;\nnew rules\n':'// source\nbody';},
 writeFileSync(path,code){writes.push([path,code]);}};
vm.runInNewContext(source,{require(name){return name==='fs'?fakeFs:{transformSync(raw){return {code:raw};}};},process:{env:{}},console:{log(){}}});
assert(writes.length>0);
assert(writes.every(([path])=>/-bundle\.(js|css)$/.test(path)),JSON.stringify(writes));
assert(writes.find(([path])=>path.endsWith('atlas-library-folders-bundle.js'))[1].includes('new rules'));
"""
        subprocess.run(['node', '-e', code, str(WORK / 'build_workspace_modules.cjs')], check=True)

    def package_fixture(self, failure):
        with tempfile.TemporaryDirectory(prefix='atlas-build-safety-') as folder:
            base = Path(folder)
            root = base / 'release'
            root.mkdir()
            (root / 'App').mkdir()
            (root / 'App' / 'sentinel.txt').write_text('existing delivery')
            (base / 'outputs').mkdir()
            (base / 'VERSION').write_text('9.8.7')
            frame = '<div>Created by Raff Ribeiro codex-use-esse const AtlasBuiltinPreview=</div>'
            source = '<head></head><body><iframe id="codex-visualization" sandbox="allow-downloads" data-srcdoc="' + html.escape(frame, quote=True) + '"></iframe><script id="atlas-preview-storage"></script></body>'
            (base / 'outputs' / 'munsell-color-picker.html').write_text(source)
            subprocess.run(['git', 'init', '-q', '-b', 'wrong' if failure == 'branch' else 'release', str(root)], check=True)
            if failure == 'archive':
                archives = root / 'Realase' / 'Archives'
                archives.mkdir(parents=True)
                with zipfile.ZipFile(archives / 'ColorAtlas-v9.8.7.zip', 'w') as archive:
                    archive.writestr('App/COLOR_ATLAS_START_HERE.html', 'already published bytes')
            # Change only the fixture destination; source and package validation remain real.
            script = (WORK / 'package_standalone.py').read_text().replace("Path('/Users/raffribeiro/Documents/ColorAtlas')", 'Path(' + repr(str(root)) + ')')
            (base / 'package.py').write_text(script)
            before = {str(p.relative_to(root)): p.read_bytes() for p in root.rglob('*') if p.is_file()}
            run = subprocess.run([sys.executable, str(base / 'package.py')], cwd=base, capture_output=True, text=True, env={**os.environ, 'PYTHONPATH': str(WORK)})
            after = {str(p.relative_to(root)): p.read_bytes() for p in root.rglob('*') if p.is_file()}
            self.assertNotEqual(run.returncode, 0)
            self.assertIn('Switch to release' if failure == 'branch' else 'Published archive differs', run.stderr)
            self.assertEqual(before, after, 'Rejected release modified live delivery')

    def test_wrong_branch_rejected_before_writes(self):
        self.package_fixture('branch')

    def test_changed_published_version_rejected_before_writes(self):
        self.package_fixture('archive')

    def test_preflight_accepts_new_destination_without_creating_it(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder) / 'new-release'
            check_release_preflight(root, '1.2.3', b'new app')
            self.assertFalse(root.exists())

    def test_preflight_accepts_identical_published_html(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            archive = root / 'Realase' / 'Archives' / 'ColorAtlas-v1.2.3.zip'
            archive.parent.mkdir(parents=True)
            with zipfile.ZipFile(archive, 'w') as published:
                published.writestr('App/COLOR_ATLAS_START_HERE.html', b'identical app')
            before = archive.read_bytes()
            check_release_preflight(root, '1.2.3', b'identical app')
            self.assertEqual(before, archive.read_bytes())

    def test_preflight_rejects_corrupt_non_html_member(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            archive = root / 'Realase' / 'Archives' / 'ColorAtlas-v1.2.3.zip'
            archive.parent.mkdir(parents=True)
            with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_STORED) as published:
                published.writestr('App/COLOR_ATLAS_START_HERE.html', b'identical app')
                published.writestr('App/Data/image.png', b'unique-image-payload')
            raw = archive.read_bytes().replace(b'unique-image-payload', b'broken-image-payload', 1)
            archive.write_bytes(raw)
            with self.assertRaises((zipfile.BadZipFile, RuntimeError)):
                check_release_preflight(root, '1.2.3', b'identical app')
            self.assertEqual(archive.read_bytes(), raw)

    def test_preflight_rejects_invalid_version_and_corrupt_archive(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            with self.assertRaises(ValueError):
                check_release_preflight(root, '../invalid', b'app')
            archive = root / 'Realase' / 'Archives' / 'ColorAtlas-v1.2.3.zip'
            archive.parent.mkdir(parents=True)
            archive.write_bytes(b'corrupt zip')
            with self.assertRaises(zipfile.BadZipFile):
                check_release_preflight(root, '1.2.3', b'app')
            self.assertEqual(archive.read_bytes(), b'corrupt zip')


if __name__ == '__main__':
    unittest.main()
