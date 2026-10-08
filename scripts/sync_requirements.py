#!/usr/bin/env python3
"""Sync scripts/requirements.txt with imports used by Python scripts."""

from __future__ import annotations

import argparse
import ast
import re
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = PROJECT_ROOT / "scripts"
REQUIREMENTS_PATH = SOURCE_ROOT / "requirements.txt"
IGNORED_DIRECTORIES = {
    ".git",
    ".mypy_cache",
    ".pytest_cache",
    ".tox",
    ".venv",
    "__pycache__",
    "build",
    "dist",
    "node_modules",
    "venv",
}
IMPORT_TO_DISTRIBUTION = {
    "bs4": "beautifulsoup4",
    "challonge": "pychallonge",
    "dateutil": "python-dateutil",
    "google.auth": "google-auth",
    "google.oauth2": "google-auth",
    "google_auth_oauthlib": "google-auth-oauthlib",
    "googleapiclient": "google-api-python-client",
    "httplib2": "httplib2",
    "PIL": "Pillow",
    "pymysql": "PyMySQL",
    "websocket": "websocket-client",
}

def normalize_distribution(name: str) -> str:
    """Return the normalized form used to compare distribution names."""
    return re.sub(r"[-_.]+", "-", name).lower()

def requirement_name(requirement: str) -> str:
    """Extract a distribution name from a requirements.txt entry."""
    match = re.match(r"\s*([A-Za-z0-9_.-]+)", requirement)
    if not match:
        raise ValueError(f"Unsupported requirement: {requirement!r}")
    return normalize_distribution(match.group(1))

def declared_requirements() -> dict[str, str]:
    """Read requirements.txt, keyed by normalized distribution name."""
    if not REQUIREMENTS_PATH.exists():
        return {}
    requirements = {}
    for line in REQUIREMENTS_PATH.read_text(encoding="utf-8").splitlines():
        entry = line.split("#", 1)[0].strip()
        if not entry:
            continue
        name = requirement_name(entry)
        if name in requirements:
            raise ValueError(f"Duplicate requirement for {name!r}")
        requirements[name] = entry
    return requirements

def ignored_path(path: Path, root: Path) -> bool:
    """Return whether a path belongs to generated or environment content."""
    return any(
        part in IGNORED_DIRECTORIES
        or part.endswith(".egg-info")
        or part.endswith(".venv")
        for part in path.relative_to(root).parts
    )

def python_sources() -> list[Path]:
    """Return Python files under scripts/, excluding generated content."""
    return sorted(
        path
        for path in SOURCE_ROOT.rglob("*.py")
        if not ignored_path(path, SOURCE_ROOT)
    )

def local_module_names() -> set[str]:
    """Return import roots provided by Python files anywhere in this repository."""
    sources = [
        path
        for path in PROJECT_ROOT.rglob("*.py")
        if not ignored_path(path, PROJECT_ROOT)
    ]
    modules = {path.stem for path in sources if path.name != "__init__.py"}
    modules.update(
        part
        for path in sources
        for part in path.relative_to(PROJECT_ROOT).parts[:-1]
    )
    modules.update(
        path.parent.name
        for path in sources
        if path.name == "__init__.py" and path.parent != PROJECT_ROOT
    )
    return modules

def imported_modules(sources: list[Path]) -> set[str]:
    """Collect absolute imports from the scripts sources."""
    imports: set[str] = set()
    for path in sources:
        tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                imports.update(alias.name for alias in node.names)
            elif isinstance(node, ast.ImportFrom) and node.level == 0 and node.module:
                imports.add(node.module)
    return imports

def imported_distributions(sources: list[Path]) -> dict[str, str]:
    """Map imported third-party modules to normalized distribution names."""
    local_modules = local_module_names()
    standard_library = set(sys.stdlib_module_names) | {"__future__"}
    distributions = {}
    mappings = sorted(
        IMPORT_TO_DISTRIBUTION.items(), key=lambda item: len(item[0]), reverse=True
    )
    for imported in imported_modules(sources):
        root = imported.partition(".")[0]
        if root in local_modules or root in standard_library:
            continue
        distribution = next(
            (
                value
                for module, value in mappings
                if imported == module or imported.startswith(module + ".")
            ),
            root.replace("_", "-"),
        )
        normalized = normalize_distribution(distribution)
        distributions[normalized] = distribution
    return distributions

def rendered_requirements(
    imports: dict[str, str], declared: dict[str, str]
) -> str:
    """Keep existing version pins and add imported dependencies without pins."""
    entries = [declared.get(name, distribution) for name, distribution in imports.items()]
    entries.sort(key=lambda entry: requirement_name(entry))
    return "".join(f"{entry}\n" for entry in entries)

def parse_args() -> argparse.Namespace:
    """Parse command-line options."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="fail instead of updating an out-of-date requirements.txt",
    )
    return parser.parse_args()

def main() -> int:
    """Update or check scripts/requirements.txt against source imports."""
    args = parse_args()
    declared = declared_requirements()
    imports = imported_distributions(python_sources())
    removed = sorted(set(declared) - set(imports))
    added = sorted(set(imports) - set(declared))
    expected = rendered_requirements(imports, declared)
    actual = (
        REQUIREMENTS_PATH.read_text(encoding="utf-8")
        if REQUIREMENTS_PATH.exists()
        else ""
    )
    if actual == expected:
        print("scripts/requirements.txt matches imports in scripts/.")
        return 0
    if args.check:
        print(
            "scripts/requirements.txt is out of date; run scripts/sync_requirements.py",
            file=sys.stderr,
        )
        if added:
            print("Missing dependencies: " + ", ".join(added), file=sys.stderr)
        if removed:
            print("Unused dependencies: " + ", ".join(removed), file=sys.stderr)
        return 1

    REQUIREMENTS_PATH.write_text(expected, encoding="utf-8")
    print(
        f"Updated scripts/requirements.txt ({len(added)} added, "
        f"{len(removed)} unused dependencies removed)."
    )
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
