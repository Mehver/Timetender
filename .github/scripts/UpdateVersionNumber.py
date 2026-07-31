# SPDX-FileCopyrightText: 2026 Mehver (https://github.com/Mehver)
# SPDX-License-Identifier: BSD-3-Clause
#
# NOTE: This script is called by CI — .github/workflows/docker-image.yml

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
VERSION_PATTERN = re.compile(
    r"^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$"
)


def replace_once(path: Path, pattern: str, replacement: str) -> None:
    content = path.read_text(encoding="utf-8")
    updated_content, occurrences = re.subn(pattern, replacement, content)
    if occurrences != 1:
        raise ValueError(
            f"Expected exactly one matching version field in {path.relative_to(ROOT)}, found {occurrences}"
        )
    path.write_text(updated_content, encoding="utf-8")


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("Usage: UpdateVersionNumber.py OLD_VERSION NEW_VERSION")

    old_release_version, new_release_version = sys.argv[1:]
    if not VERSION_PATTERN.fullmatch(new_release_version):
        raise SystemExit("Release tag must use the vMAJOR.MINOR.PATCH format")

    readme_pattern = (
        r"(<h1>Timetender <code>)"
        + re.escape(old_release_version)
        + r"(</code></h1>)"
    )
    replace_once(ROOT / "README.md", readme_pattern, rf"\g<1>{new_release_version}\g<2>")
    replace_once(ROOT / "docs/README-cn.md", readme_pattern, rf"\g<1>{new_release_version}\g<2>")


if __name__ == "__main__":
    main()
