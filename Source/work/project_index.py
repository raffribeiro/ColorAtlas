"""Read-only, payload-free navigation for humans and LLMs.

The curated module map owns feature routing. Inventory classification is explicitly
heuristic: an unmapped file is reported, never silently promoted to active source.
Run `context graphics` before opening the embedded monolith or generated output.
"""
from pathlib import Path
import argparse
import collections
import json
import os
import re

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / 'work/module-map.json'
SOURCE_SUFFIXES = {'.js', '.cjs', '.py', '.css', '.html', '.json', '.md'}


def load_map():
    return json.loads(MANIFEST.read_text())


def validate_map(data):
    """Check routing integrity without importing installers or running builds."""
    errors = []
    for name, group in data['groups'].items():
        for role in ('sources', 'install', 'checks'):
            for relative in group[role]:
                path = ROOT / relative
                if not path.is_file():
                    errors.append(f'{name}.{role}: missing {relative}')
                if not path.resolve().is_relative_to(ROOT):
                    errors.append(f'{name}.{role}: path escapes workspace: {relative}')
    for relative in data['current_checks'] + list(data['browser_suites'].values()):
        if not (ROOT / relative).is_file():
            errors.append('Missing check: ' + relative)
    for item in data['export_integrations']:
        names = [item] if isinstance(item, str) else item['files']
        for name in names:
            if not (ROOT / 'work' / name).is_file():
                errors.append('Missing export integration: ' + name)
    return errors


def classify(path, mapped):
    relative = path.relative_to(ROOT).as_posix()
    name = path.name
    if relative.startswith(('outputs/', 'releases/')) or '-bundle.' in name:
        return 'generated'
    if name.startswith(('check_', 'test_', 'benchmark_')):
        return 'verification'
    if any(token in relative.lower() for token in ('backup', '-before', 'before-', 'doc-v1-')):
        return 'historical'
    if relative in mapped:
        return 'mapped-source'
    if path.suffix not in SOURCE_SUFFIXES:
        return 'asset'
    return 'unmapped-source'


def inventory(data):
    mapped = {p for group in data['groups'].values() for role in ('sources', 'install', 'checks') for p in group[role]}
    files = []
    # Exclude installed runtimes, caches and hidden coordination metadata. Include
    # every ordinary project artifact, even if it has no feature owner yet.
    for folder, directories, names in os.walk(ROOT):
        # Prune before descending: filtering rglob's output still scans .git/venv
        # and node_modules. Do not follow linked dependency trees either.
        directories[:] = sorted(name for name in directories
                                if not name.startswith('.')
                                and name not in {'__pycache__', 'node_modules'}
                                and not (Path(folder) / name).is_symlink())
        for name in sorted(names):
            path = Path(folder) / name
            if name.startswith('.') or path.is_symlink():
                continue
            relative = path.relative_to(ROOT)
            if path.is_file():
                files.append({'path': relative.as_posix(), 'kind': classify(path, mapped), 'bytes': path.stat().st_size})
    return files


def symbols(path, limit=14):
    """Approximate navigation hints, not an AST/call graph or a code-quality claim."""
    if path.suffix not in {'.js', '.py', '.cjs'}:
        return []
    text = path.read_text()
    pattern = r'(?m)^\s*(?:async\s+)?(?:function\s+|def\s+|class\s+)([A-Za-z_$][\w$]*)'
    return [{'name': m[1], 'line': text.count('\n', 0, m.start()) + 1}
            for m in list(re.finditer(pattern, text))[:limit]]


def context(name, data):
    group = data['groups'][name]
    result = [f'# {name}', 'Read root AGENTS.md first. These are routes, not duplicate editable sources.']
    for role, paths in group.items():
        if role == 'core_symbols':
            source = Path(data['canonical']).read_text()
            result.append('\nCore in canonical fragment:')
            for symbol in paths:
                match = re.search(r'function\s+' + re.escape(symbol) + r'\s*\(', source)
                if match:
                    line = source.count('\n', 0, match.start()) + 1
                    result.append(f'- {data["canonical"]}:{line} — {symbol}')
            continue
        result.append('\n' + role + ':')
        for relative in paths:
            hints = ', '.join(f"{item['name']}:{item['line']}" for item in symbols(ROOT / relative))
            result.append('- ' + relative + (f' — {hints}' if hints else ''))
            route = data.get('routes', {}).get(relative) if role == 'sources' else None
            if route:
                result.append('  Target: ' + route['target'])
                commands = [route[key] for key in ('compile', 'install') if route[key]]
                if commands:
                    result.append('  Route (inspect legacy caveats): ' + ' → '.join(commands))
    result.append('\nValidate: python3 work/check_project.py --group ' + name)
    return '\n'.join(result)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['inventory', 'context', 'validate'])
    parser.add_argument('feature', nargs='?')
    parser.add_argument('--json', action='store_true')
    args = parser.parse_args()
    data = load_map()
    errors = validate_map(data)
    if errors:
        parser.exit(1, '\n'.join(errors) + '\n')
    if args.command == 'context':
        if args.feature not in data['groups']:
            parser.error('Choose a feature: ' + ', '.join(data['groups']))
        print(context(args.feature, data))
    elif args.command == 'inventory':
        files = inventory(data)
        result = {'counts': dict(collections.Counter(p['kind'] for p in files)), 'files': files}
        print(json.dumps(result, indent=2) if args.json else json.dumps(result['counts'], indent=2))
    else:
        print('PASS: feature/source/check routes exist; export integration order resolves.')


if __name__ == '__main__':
    main()
