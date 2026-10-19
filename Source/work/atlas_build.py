"""Small, side-effect-free build primitives. Importing this module never writes.

Only export integrations are ordered here via module-map.json. Existing named
canonical installers remain authoritative; this does not replay historical patches.
"""
from pathlib import Path
import json
import os
import tempfile

ROOT = Path(__file__).resolve().parent.parent
WORK = ROOT / 'work'


def export_integrations(work=WORK):
    """Assemble closure-scoped extensions in their established wrapping order."""
    manifest = json.loads((work / 'module-map.json').read_text())
    pieces = []
    for item in manifest['export_integrations']:
        if isinstance(item, str):
            pieces.append((work / item).read_text())
        else:
            marker = item['marker']
            pieces.append('// ' + marker + '\n'
                          + ''.join((work / name).read_text() for name in item['files'])
                          + '\n// End ' + marker + '\n')
    return ''.join(pieces)


def atomic_write(path, text):
    """Replace a generated text file only after a complete successful transform.

    The temp file stays on the destination filesystem so os.replace is atomic.
    Existing permissions are preserved; failure removes only the temporary file.
    """
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix='.' + path.name + '-', dir=path.parent)
    try:
        with os.fdopen(fd, 'w') as output:
            output.write(text)
            output.flush()
            os.fsync(output.fileno())
        if path.exists():
            os.chmod(temporary, path.stat().st_mode & 0o777)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)
