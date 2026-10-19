"""Named documentation/help installers are import-safe and repeatable."""
from pathlib import Path
import importlib
import unittest
from unittest.mock import patch


class DocumentationInstall(unittest.TestCase):
    def test_documentation_import_does_not_write(self):
        with patch.object(Path, 'write_text', side_effect=AssertionError('Import wrote a file')):
            module = importlib.import_module('install_documentation_v2')
            importlib.reload(module)

    def test_documentation_patch_is_idempotent(self):
        import install_documentation_v2 as doc
        current = doc.CANONICAL.read_text()
        installed = doc.patch(current)
        self.assertEqual(doc.patch(installed), installed)
        self.assertIn(doc.navigation.strip(), installed)
        self.assertEqual(installed.count('<script id="atlas-documentation-ui">'), 1)
        self.assertEqual(installed.count('<script id="atlas-documentation-examples">'), 1)

    def test_help_patch_is_idempotent_and_rejects_duplicates(self):
        from install_context_help import patch as install_help
        first = install_help('<div>untouched core</div>')
        self.assertTrue(first.startswith('<div>untouched core</div>'))
        self.assertEqual(install_help(first), first)
        with self.assertRaises(AssertionError):
            install_help(first + first)


if __name__ == '__main__':
    unittest.main()
