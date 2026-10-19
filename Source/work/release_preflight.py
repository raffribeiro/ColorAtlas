"""Read-only guards shared by release packaging and isolated regression checks.

The caller supplies final HTML bytes: version decoration and optional dependency
stripping must finish before comparing with an immutable published artifact.
This module never creates directories, changes Git state or updates release data.
"""
from pathlib import Path
import hashlib
import re
import subprocess
import zipfile


def check_release_preflight(root: Path, version: str, entry_bytes: bytes) -> None:
    """Fail before publication writes when this destination cannot accept bytes.

    A missing repository is allowed: the existing sync command initializes it.
    Repackaging identical HTML is allowed; a different published version requires
    the caller to increment VERSION rather than replacing the existing archive.
    """
    if not re.fullmatch(r'\d+\.\d+(?:\.\d+)?', version):
        raise ValueError('Invalid release version: ' + repr(version))
    if (root / '.git').exists():
        branch = subprocess.check_output(
            ['git', '-C', str(root), 'branch', '--show-current'], text=True
        ).strip()
        if branch != 'release':
            raise RuntimeError('Switch to release before updating this package')
    archive = root / 'Realase' / 'Archives' / f'ColorAtlas-v{version}.zip'
    if archive.exists():
        with zipfile.ZipFile(archive) as published:
            if published.testzip() is not None:
                raise RuntimeError('Published archive is corrupt')
            previous = published.read('App/COLOR_ATLAS_START_HERE.html')
        if hashlib.sha256(previous).digest() != hashlib.sha256(entry_bytes).digest():
            raise RuntimeError('Published archive differs: increment VERSION before repackaging')
