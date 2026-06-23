#!/usr/bin/env python3
"""Translate Korean MDX docs into English MDX using Google Translation API.

Phase 1 placeholder with contract-aligned env checks.
"""

import os
from pathlib import Path


REQUIRED_ENV = ("GOOGLE_TRANSLATE_API_KEY", "GOOGLE_TRANSLATE_PROJECT_ID")


def validate_env() -> tuple[bool, str]:
    missing = [key for key in REQUIRED_ENV if not os.getenv(key)]
    if missing:
        return False, f"missing env: {', '.join(missing)}"
    return True, "ok"


def main() -> int:
    ok, message = validate_env()
    if not ok:
        print(f"translate_docs.py: {message}")
        return 2

    root = Path("docs/content/docs")
    sources = [p for p in root.rglob("*.mdx") if not p.name.endswith(".en.mdx")]
    print(f"translate_docs.py: scanned={len(sources)} (placeholder)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
