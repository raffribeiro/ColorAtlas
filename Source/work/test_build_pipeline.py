"""Build invariants with temporary outputs; never publish to the live App folder."""
from pathlib import Path
import importlib
import tempfile
import unittest
from unittest.mock import patch

import atlas_build


class BuildPipelineTests(unittest.TestCase):
    def test_surface_reinstall_preserves_later_neutral_integration(self):
        from install_lab_surface import patch as install_surface, CANONICAL
        current = CANONICAL.read_text()
        installed = install_surface(current)
        self.assertIn("'vfx':'lab','back');", installed)
        self.assertIn("'vfx':'lab','front');", installed)
        self.assertEqual(install_surface(installed), installed)

    def test_manifest_preserves_established_extension_order(self):
        names = ['atlas-random-luma.js', 'atlas-random-roles.js', 'atlas-layer-drop.js',
                 'atlas-gradient-editing.js', 'atlas-preset-connection.js', 'atlas-preset-update.js']
        expected = ''.join((atlas_build.WORK / n).read_text() for n in names)
        expected += '// Atlas history integration\n'
        expected += (atlas_build.WORK / 'atlas-history-core.js').read_text()
        expected += (atlas_build.WORK / 'atlas-history-ui.js').read_text()
        expected += '\n// End Atlas history integration\n'
        expected += ''.join((atlas_build.WORK / n).read_text() for n in [
            'atlas-app-width.js', 'atlas-lightness-readout.js', 'atlas-wheel-swatch.js',
            'atlas-preview-export.js', 'atlas-graphic-design.js', 'atlas-normalize-values.js',
            'atlas-random-performance.js', 'atlas-i18n-graphics.js', 'atlas-i18n-library.js'])
        self.assertEqual(atlas_build.export_integrations(), expected)

    def test_browser_tab_icon_is_embedded_brand_mark(self):
        from html.parser import HTMLParser
        from urllib.parse import unquote
        import xml.etree.ElementTree as ET
        class Icons(HTMLParser):
            def __init__(self): super().__init__(); self.icons = []
            def handle_starttag(self, tag, attrs):
                a = dict(attrs)
                if tag == 'link' and a.get('rel') == 'icon': self.icons.append(a)
        page = Icons(); page.feed((atlas_build.WORK / 'standalone-shell.html').read_text())
        self.assertEqual(len(page.icons), 1, 'The top-level page owns the browser tab icon')
        icon = page.icons[0]
        self.assertEqual(icon['type'], 'image/svg+xml')
        self.assertTrue(icon['href'].startswith('data:image/svg+xml,'), 'Icon must work offline')
        svg = ET.fromstring(unquote(icon['href'].split(',', 1)[1]))
        self.assertEqual(svg.attrib['viewBox'], '0 0 32 32')
        self.assertIn('Ca', ''.join(svg.itertext()))
        self.assertGreaterEqual(len(list(svg.iter('{http://www.w3.org/2000/svg}stop'))), 5)
        self.assertNotIn('script', icon['href'])

    def test_import_has_no_publication_side_effect(self):
        with patch.object(atlas_build, 'atomic_write', side_effect=AssertionError('Import wrote')):
            module = importlib.import_module('fit_local_page')
            importlib.reload(module)

    def test_invalid_frame_fails_without_changing_files(self):
        from fit_local_page import fit_page
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'output.html'
            path.write_text('last good output')
            with self.assertRaises(AssertionError):
                atlas_build.atomic_write(path, fit_page('<html>missing frame</html>'))
            self.assertEqual(path.read_text(), 'last good output')

    def test_replace_failure_preserves_output_and_cleans_temporary(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'output.html'
            path.write_text('last good output')
            with patch.object(atlas_build.os, 'replace', side_effect=OSError('disk error')):
                with self.assertRaises(OSError):
                    atlas_build.atomic_write(path, 'new output')
            self.assertEqual(path.read_text(), 'last good output')
            self.assertEqual(list(Path(folder).iterdir()), [path])

    def test_successful_replace_preserves_permissions(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'output.html'
            path.write_text('old'); path.chmod(0o640)
            atlas_build.atomic_write(path, 'new')
            self.assertEqual(path.read_text(), 'new')
            self.assertEqual(path.stat().st_mode & 0o777, 0o640)


if __name__ == '__main__':
    unittest.main()
