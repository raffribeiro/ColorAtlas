"""Check the real exported host, not just a mocked download handler."""
from html.parser import HTMLParser
from pathlib import Path
import re


class ExportPage(HTMLParser):
    def __init__(self):
        super().__init__()
        self.frames = []
        self.policies = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "iframe" and attrs.get("id") == "codex-visualization":
            self.frames.append(attrs)
        if tag == "meta" and attrs.get("http-equiv") == "Content-Security-Policy":
            self.policies.append(attrs["content"])


page = ExportPage()
page.feed(Path("outputs/munsell-color-picker.html").read_text())
assert len(page.frames) == 1
frame = page.frames[0]
flags = set(frame["sandbox"].split())
# Native form submission is aborted before firing `submit` without allow-forms.
# Even when encoding succeeds, a download hyperlink is blocked without allow-downloads.
assert "allow-forms" in flags, "The native PNG submit button is blocked before its event handler"
assert "allow-downloads" in flags, "The PNG download link is blocked by the exported iframe"
assert flags == {"allow-scripts", "allow-forms", "allow-downloads"}, "Keep the other sandbox restrictions"
inner = frame["data-srcdoc"]
assert 'type="submit" data-action="png-export-download"' in inner
assert re.search(r"\.addEventListener\([\"']submit[\"']", inner), "Export submit handling is embedded"
assert ".preventDefault()" in inner
assert ".toBlob(" in inner and ".download=" in inner
assert 'id="png-export-dialog"' in inner and 'id="png-export-form"' in inner
inner_page = ExportPage()
inner_page.feed(inner)
assert page.policies and inner_page.policies
assert all("form-action 'none'" in csp for csp in page.policies + inner_page.policies), "Forms must not navigate or send data"
print("PASS: exported host permits the native PNG action and downloads; origin, popup, navigation and form-action restrictions remain intact.")
