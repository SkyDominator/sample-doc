#!/usr/bin/env python3
"""Validate Python snippets embedded in MDX docs by executing them."""

from __future__ import annotations

import os
from pathlib import Path
import re
import sys
import traceback


FENCE_RE = re.compile(r"```python[^\n]*\n([\s\S]*?)\n```", re.MULTILINE)


def _extract_python_snippets(content: str) -> list[tuple[int, str]]:
    snippets: list[tuple[int, str]] = []
    for match in FENCE_RE.finditer(content):
        code = match.group(1)
        start_line = content.count("\n", 0, match.start()) + 1
        snippets.append((start_line, code))
    return snippets


def _exec_snippet(
    file_path: Path,
    start_line: int,
    code: str,
    namespace: dict[str, object],
) -> tuple[bool, str]:
    try:
        compiled = compile(code, f"{file_path}:{start_line}", "exec")
        exec(compiled, namespace, namespace)
        return True, ""
    except Exception:
        error = traceback.format_exc(limit=4)
        return False, error


def main() -> int:
    script_root = Path(__file__).resolve().parent.parent
    root = script_root / "docs/content/docs"
    if not root.exists():
        print("validate_snippets.py: docs root not found")
        return 2

    sdk_root = script_root / "sdk"
    if str(sdk_root) not in sys.path:
        sys.path.insert(0, str(sdk_root))

    files = sorted(root.rglob("*.mdx"))
    hw = bool(os.getenv("MOCK_RNGD_HARDWARE", ""))

    total_snippets = 0
    failed = 0

    for file_path in files:
        content = file_path.read_text(encoding="utf-8")
        snippets = _extract_python_snippets(content)
        if not snippets:
            continue

        shared_namespace: dict[str, object] = {"__name__": "__snippet__"}
        for start_line, snippet in snippets:
            total_snippets += 1
            ok, error = _exec_snippet(file_path, start_line, snippet, shared_namespace)
            if not ok:
                failed += 1
                print(
                    "validate_snippets.py: failed "
                    f"file={file_path} line={start_line}\n{error}"
                )

    print(
        "validate_snippets.py: "
        f"files={len(files)} snippets={total_snippets} "
        f"failed={failed} mock_hw={hw}"
    )

    if failed > 0:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
