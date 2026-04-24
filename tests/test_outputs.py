"""Pytest module for tooling that expects tests/test_outputs.py in the tests directory.

Primary verification runs in tests/test.sh (npm ci, Vitest, Playwright). These checks
only assert that pinned JavaScript verifier dependencies are present.
"""

from pathlib import Path


def test_verifier_has_pinned_npm_manifests():
    """Ensure package.json and package-lock.json exist so npm ci uses pinned versions."""
    tests_dir = Path(__file__).resolve().parent
    assert (tests_dir / "package.json").is_file()
    assert (tests_dir / "package-lock.json").is_file()


def test_shell_verifier_invokes_vitest_and_playwright():
    """Ensure tests/test.sh runs Vitest unit tests and Playwright E2E tests, not only grep preflight."""
    tests_dir = Path(__file__).resolve().parent
    script = (tests_dir / "test.sh").read_text(encoding="utf-8")
    assert "npm run test:unit" in script
    assert "npm run test:e2e" in script
