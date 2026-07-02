#!/usr/bin/env python3
"""Generate the browser SDK source bundle consumed by the docs playground worker.

The playground runs the real ``raykim_llm`` package inside Pyodide. Because the package
is pure Python (standard library only), its sources can be shipped to the browser as a
JSON map of ``module path -> source`` and written into the Pyodide filesystem at runtime.
Regenerate this bundle whenever the SDK changes so the playground stays in sync.
"""

from __future__ import annotations

import json
from pathlib import Path


def main() -> int:
    script_root = Path(__file__).resolve().parent.parent
    package_dir = script_root / "sdk" / "raykim_llm"
    if not package_dir.exists():
        print("bundle_sdk_for_playground.py: sdk package not found")
        return 2

    sources = {
        f"raykim_llm/{module.name}": module.read_text(encoding="utf-8")
        for module in sorted(package_dir.glob("*.py"))
    }

    output = script_root / "docs" / "playground" / "sdk-sources.json"
    output.write_text(json.dumps(sources, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(
        f"bundle_sdk_for_playground.py: wrote {len(sources)} modules -> "
        f"{output.relative_to(script_root)}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
