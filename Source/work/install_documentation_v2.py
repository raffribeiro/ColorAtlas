"""Install the regenerated guide into the canonical fragment and the standalone export.

Replaces, by named markers only, the documentation <section>, the
atlas-documentation-style block and the atlas-documentation-examples script
(added after atlas-documentation-ui). Usage, from the workspace root:
  python3 work/install_documentation_v2.py [canonical.html] [outputs/munsell-color-picker.html]
"""
from pathlib import Path
import html, re, sys

WORK = Path(__file__).parent
CANONICAL = Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
EXPORT = WORK.parent / 'outputs' / 'munsell-color-picker.html'
section = (WORK / 'atlas-documentation.html').read_text().strip()
style = (WORK / 'atlas-documentation.css').read_text()
examples = (WORK / 'atlas-documentation-examples.js').read_text()
navigation = (WORK / 'atlas-documentation-bundle.js').read_text()
assert '</script' not in examples.lower()


def patch(s):
    a = s.index('<section id="atlas-documentation"')
    b = s.index('</section>', s.index('atlas-docs-pagination', a)) + len('</section>')
    s = s[:a] + section + s[b:]
    s, n = re.subn(r'(<style id="atlas-documentation-style">\n?)[\s\S]*?(</style>)', lambda m: m[1] + style + m[2], s, count=1)
    assert n == 1, 'documentation style block'
    s, n = re.subn(r'(<script id="atlas-documentation-ui">\n?)[\s\S]*?(</script>)', lambda m: m[1] + navigation + m[2], s, count=1)
    assert n == 1, 'documentation navigation block'
    tag = '<script id="atlas-documentation-examples">'
    if tag in s:
        a = s.index(tag)
        b = s.index('</script>', a) + len('</script>')
        s = s[:a] + tag + '\n' + examples + '</script>' + s[b:]
    else:
        ui = s.index('<script id="atlas-documentation-ui">')
        end = s.index('</script>', ui) + len('</script>')
        s = s[:end] + '\n' + tag + '\n' + examples + '</script>' + s[end:]
    assert s.count('id="atlas-documentation"') == 1 and s.count(tag) == 1
    return s


def main():
    canonical = Path(sys.argv[1]) if len(sys.argv) > 1 else CANONICAL
    export = Path(sys.argv[2]) if len(sys.argv) > 2 else EXPORT
    s = patch(canonical.read_text())
    assert len(s.encode()) < 1_000_000, 'canonical fragment must stay below 1 MB'
    canonical.write_text(s)
    print('canonical:', f'{len(s.encode()):,} bytes')
    if export.exists():
        e = export.read_text()
        m = re.search(r'data-srcdoc="([^"]*)"', e)
        frame = patch(html.unescape(m[1]))
        e = e[:m.start(1)] + html.escape(frame, quote=True) + e[m.end(1):]
        export.write_text(e)
        print('export:', f'{len(e.encode()):,} bytes')


if __name__ == '__main__':
    main()
