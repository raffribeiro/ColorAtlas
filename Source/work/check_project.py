"""Explicit validation entry point; no install, build, packaging or publication.

Default runs current checks. Historical/incompatible checks are listed separately,
not silently treated as passing. Browser suites are opt-in and run sequentially.
"""
import argparse
import ast
import json
import os
from pathlib import Path
import subprocess
import sys
import time
from project_index import ROOT, load_map, validate_map


def command_for(path):
    return ['node', path] if path.endswith(('.js', '.cjs')) else [sys.executable, path]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--group', default='all')
    parser.add_argument('--browser', action='append', default=[])
    parser.add_argument('--audit-known', action='store_true', help='Run known failures/historical checks too; any failure exits nonzero')
    parser.add_argument('--list', action='store_true')
    parser.add_argument('--browser-timeout', type=int, default=1800, help='Seconds per complete browser suite (default 1800)')
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    data = load_map()
    errors = validate_map(data)
    if errors:
        parser.exit(1, '\n'.join(errors) + '\n')
    if args.group == 'all':
        checks = list(data['current_checks']) + [p for g in data['groups'].values() for p in g['checks']]
    elif args.group in data['groups']:
        checks = list(data['groups'][args.group]['checks'])
    else:
        parser.error('Unknown group: ' + args.group)
    if args.audit_known:
        checks += list(data['known_failures']) + list(data['historical_checks'])
    for name in args.browser:
        if name not in data['browser_suites']:
            parser.error('Unknown browser suite: ' + name)
        checks.append(data['browser_suites'][name])
    checks = list(dict.fromkeys(checks))
    if args.list:
        print('\n'.join(checks))
        return
    results = []
    if args.group == 'all':
        # Parse every first-level Python script without importing it. Many legacy
        # installers still perform writes on import and must never be imported here.
        started = time.monotonic()
        try:
            files = sorted((ROOT / 'work').glob('*.py'))
            for path in files:
                ast.parse(path.read_text(), filename=str(path))
            print(f'PASS Python syntax ({len(files)} files)', flush=True)
            results.append({'check': 'python-syntax', 'status': 'pass', 'files': len(files), 'seconds': round(time.monotonic()-started, 3)})
        except (SyntaxError, UnicodeError) as error:
            print(str(error), file=sys.stderr)
            results.append({'check': 'python-syntax', 'status': 'fail', 'output': str(error)})
    for path in checks:
        started = time.monotonic()
        try:
            run = subprocess.run(command_for(path), cwd=ROOT, text=True, stdout=subprocess.PIPE,
                                 stderr=subprocess.STDOUT, timeout=args.browser_timeout if path in data['browser_suites'].values() else 180)
            status = 'pass' if run.returncode == 0 else 'fail'
            output = run.stdout
        except (OSError, subprocess.TimeoutExpired) as error:
            status, output = 'fail', str(error)
        elapsed = round(time.monotonic() - started, 3)
        results.append({'check': path, 'status': status, 'seconds': elapsed, 'output': output[-12000:]})
        print(f'{status.upper()} {path} ({elapsed:.2f}s)', flush=True)
        if status == 'fail':
            print(output[-3000:], flush=True)
    summary = {'passed': sum(r['status'] == 'pass' for r in results),
               'failed': sum(r['status'] == 'fail' for r in results), 'results': results,
               'not_run_historical': data['historical_checks'] if not args.audit_known else {},
               'not_run_known_failures': data['known_failures'] if not args.audit_known else {}}
    if args.report:
        report = args.report if args.report.is_absolute() else ROOT / args.report
        report.parent.mkdir(parents=True, exist_ok=True)
        report.write_text(json.dumps(summary, indent=2) + '\n')
    print(f"\n{summary['passed']} passed, {summary['failed']} failed; known/historical checks are explicitly separated.")
    if summary['failed']:
        sys.exit(1)


if __name__ == '__main__':
    main()
