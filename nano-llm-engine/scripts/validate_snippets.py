#!/usr/bin/env python3
"""Validate Python snippets embedded in MDX docs.

Phase 1 placeholder.
"""

import os
from pathlib import Path



def main() -> int:
    root = Path("docs/content/docs")
    files = list(root.rglob("*.mdx"))
    hw = os.getenv("MOCK_RNGD_HARDWARE", "")
    print(f"validate_snippets.py: files={len(files)} mock_hw={bool(hw)} (placeholder)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
