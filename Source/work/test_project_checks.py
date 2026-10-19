"""Validate orchestration with stubbed child commands; never launch browsers here."""
import contextlib
import io
import subprocess
import sys
import unittest
from unittest.mock import patch
import check_project
from project_index import load_map


class RunnerChecks(unittest.TestCase):
    def run_cli(self, args, failed=None):
        def run(command, **kwargs):
            return subprocess.CompletedProcess(command, int(command[-1] == failed), 'fixture output')
        with patch.object(sys, 'argv', ['check_project.py', *args]), patch.object(check_project.subprocess, 'run', side_effect=run) as child, contextlib.redirect_stdout(io.StringIO()):
            check_project.main()
        return child.call_args_list

    def test_all_includes_every_declared_current_check(self):
        data = load_map()
        calls = self.run_cli([])
        actual = {call.args[0][-1] for call in calls}
        expected = set(data['current_checks']) | {p for group in data['groups'].values() for p in group['checks']}
        self.assertEqual(actual, expected)
        self.assertTrue(actual.isdisjoint(data['historical_checks']))
        self.assertTrue(actual.isdisjoint(data['known_failures']))

    def test_browser_timeout_accepts_complete_onboarding(self):
        calls = self.run_cli(['--group', 'graphics', '--browser', 'onboarding'])
        timeout = {call.args[0][-1]: call.kwargs['timeout'] for call in calls}
        self.assertEqual(timeout['work/test_onboarding_e2e.py'], 1800)
        self.assertEqual(timeout['work/check_lab_axes.cjs'], 180)

    def test_current_failure_exits_nonzero(self):
        with self.assertRaises(SystemExit) as caught:
            self.run_cli(['--group', 'graphics'], failed='work/check_lab_axes.cjs')
        self.assertEqual(caught.exception.code, 1)


if __name__ == '__main__':
    unittest.main()
