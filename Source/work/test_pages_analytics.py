"""Pages transform must preserve offline and sandbox security contracts."""
import unittest
from pathlib import Path
from build_pages import build_pages, COUNTER

class PagesAnalytics(unittest.TestCase):
 def test_only_host_image_policy_changes(self):
  offline=Path('outputs/munsell-color-picker.html').read_text()
  online=build_pages(offline)
  self.assertNotIn('id="atlas-hits"',offline)
  self.assertIn('id="atlas-hits"',online)
  self.assertIn("img-src blob: data: "+COUNTER,online)
  self.assertEqual(online.count(COUNTER),2)
  import re
  self.assertEqual(re.search(r'data-srcdoc="([^"]*)"',offline)[1],re.search(r'data-srcdoc="([^"]*)"',online)[1])
  self.assertIn("connect-src 'none'",online)
  self.assertNotIn('allow-same-origin',re.search(r'<iframe[^>]+>',online)[0])
 def test_duplicate_or_unexpected_template_fails(self):
  offline=Path('outputs/munsell-color-picker.html').read_text()
  with self.assertRaises(ValueError):build_pages(build_pages(offline))
  with self.assertRaises(ValueError):build_pages('<html></html>')

if __name__=='__main__':unittest.main()
