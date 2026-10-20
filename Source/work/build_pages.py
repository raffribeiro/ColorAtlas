"""Create a reviewable Pages-only variant; never package, commit or publish.

The offline distribution stays network-disabled. Only the top-level online image
policy permits the fixed counter URL; the opaque editor frame stays untouched.
"""
from pathlib import Path
import argparse
from atlas_build import atomic_write

WORK = Path(__file__).resolve().parent
COUNTER = 'https://hits.sh/raffribeiro.github.io/ColorAtlas.svg'

def build_pages(offline):
    if 'id="atlas-hits"' in offline:
        raise ValueError('Pages counter already installed')
    start = offline.find('<meta http-equiv="Content-Security-Policy"')
    end = offline.find('>', start) + 1
    policy = offline[start:end]
    if start < 0 or "img-src blob: data:;" not in policy or "connect-src 'none'" not in policy:
        raise ValueError('Unexpected host security policy')
    policy = policy.replace('img-src blob: data:;', 'img-src blob: data: ' + COUNTER + ';', 1)
    page = offline[:start] + policy + offline[end:]
    if '</body>' not in page:
        raise ValueError('Missing host body')
    before, after = page.rsplit('</body>', 1)
    return before + '<script id="atlas-hits">\n' + (WORK/'atlas-hits.js').read_text() + '</script>\n</body>' + after

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', nargs='?', default='outputs/munsell-color-picker.html')
    parser.add_argument('--output', default='outputs/pages-index.html')
    args = parser.parse_args()
    if Path(args.input).resolve() == Path(args.output).resolve():
        parser.error('Keep the offline input separate from the Pages output')
    atomic_write(Path(args.output), build_pages(Path(args.input).read_text()))
    print('PASS Pages review built; no packaging or publication performed')
