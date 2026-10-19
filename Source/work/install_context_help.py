"""Synchronize lightweight control help by named blocks; no core text patches.

Run after editing atlas-context-help.js/.css, then build_standalone.py. Delegated
listeners bind to the stable root and cover controls created later by extensions.
"""
from pathlib import Path
import re
import sys

WORK = Path(__file__).resolve().parent
CANONICAL = Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')


def patch(source):
    for tag, ident, name in [('style', 'atlas-context-help-style', 'atlas-context-help.css'),
                             ('script', 'atlas-context-help-ui', 'atlas-context-help.js')]:
        body = (WORK / name).read_text()
        assert '</' + tag not in body.lower(), 'Unsafe embedded module boundary'
        block = f'<{tag} id="{ident}">\n{body}</{tag}>'
        pattern = r'<' + tag + ' id="' + ident + r'">[\s\S]*?</' + tag + '>'
        count = len(re.findall(pattern, source))
        assert count <= 1, 'Duplicate help module: ' + ident
        source = re.sub(pattern, lambda _: block, source, count=1) if count else source + '\n' + block + '\n'
    assert len(source.encode()) < 1_000_000, 'Canonical fragment exceeds 1 MB'
    return source


def main():
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else CANONICAL
    target.write_text(patch(target.read_text()))
    print('Installed contextual control help:', target.stat().st_size, 'bytes')


if __name__ == '__main__':
    main()
