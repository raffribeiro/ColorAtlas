"""Routing/inventory checks. No generated app writes or installer imports."""
from pathlib import Path
import unittest
import tempfile
from unittest.mock import patch
from project_index import ROOT, classify, context, inventory, load_map, validate_map


class IndexChecks(unittest.TestCase):
    def test_all_declared_paths_exist(self):
        self.assertEqual(validate_map(load_map()), [])
        for route in load_map()['routes'].values():
            for key in ['compile', 'install']:
                if route[key]:
                    self.assertTrue((ROOT / route[key].split()[0]).is_file())

    def test_generated_historical_and_unknown_are_distinct(self):
        self.assertEqual(classify(ROOT / 'work/a-bundle.js', set()), 'generated')
        self.assertEqual(classify(ROOT / 'work/doc-v1-backup/a.js', set()), 'historical')
        self.assertEqual(classify(ROOT / 'work/new-module.js', set()), 'unmapped-source')

    def test_inventory_never_reads_payloads(self):
        entries = inventory(load_map())
        self.assertGreater(len(entries), 500)
        self.assertTrue(all(set(e) == {'path', 'kind', 'bytes'} for e in entries))
        self.assertFalse(any('.venv' in e['path'] or '__pycache__' in e['path'] for e in entries))

    def test_inventory_prunes_dependencies_and_hidden_directories(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            for name in ['.venv', 'node_modules', '__pycache__', 'work']:
                (root / name).mkdir()
                (root / name / 'example.js').write_text('irrelevant payload')
            with patch('project_index.ROOT', root):
                paths = [item['path'] for item in inventory(load_map())]
            self.assertEqual(paths, ['work/example.js'])

    def test_feature_context_is_small_and_points_to_source(self):
        text = context('graphics', load_map())
        self.assertIn('work/atlas-lab-live-color.js', text)
        self.assertIn('script#atlas-preview-camera-ui', text)
        self.assertIn('check_lab_camera_schedule.cjs', text)
        self.assertIn('Validate: python3 work/check_project.py --group graphics', text)
        self.assertLess(len(text), 6000)
        self.assertNotIn('base64,', text)


if __name__ == '__main__':
    unittest.main()
