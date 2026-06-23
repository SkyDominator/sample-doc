#!/usr/bin/env python3
"""Generate API reference MDX files from SDK source symbols and docstrings."""

from __future__ import annotations

import importlib
import inspect
from pathlib import Path
import sys


def _load_engine_class():
    sdk_root = Path("sdk").resolve()
    if str(sdk_root) not in sys.path:
        sys.path.insert(0, str(sdk_root))
    module = importlib.import_module("nano_llm.engine")
    return module.NanoLLMEngine


def _render_method(name: str, fn, language: str) -> str:
    signature = str(inspect.signature(fn))
    doc = inspect.getdoc(fn) or "No description available."
    title = "Method" if language == "en" else "메서드"
    return (
        f"### {title}: `{name}{signature}`\n\n"
        f"```python\n"
        f"NanoLLMEngine.{name}{signature}\n"
        f"```\n\n"
        f"{doc}\n"
    )


def _render_document(language: str) -> str:
    cls = _load_engine_class()
    class_doc = inspect.getdoc(cls) or ""
    methods = [
        (name, fn)
        for name, fn in inspect.getmembers(cls, predicate=inspect.isfunction)
        if not name.startswith("_")
    ]

    if language == "en":
        frontmatter = (
            "---\n"
            "title: API Reference: NanoLLMEngine\n"
            "description: Auto-generated API reference for NanoLLMEngine\n"
            "---\n\n"
            "# NanoLLMEngine\n\n"
            f"{class_doc}\n\n"
            "## Methods\n\n"
        )
    else:
        frontmatter = (
            "---\n"
            "title: API 레퍼런스: NanoLLMEngine\n"
            "description: NanoLLMEngine 자동 생성 API 문서\n"
            "---\n\n"
            "# NanoLLMEngine\n\n"
            f"{class_doc}\n\n"
            "## 메서드\n\n"
        )

    body = "\n\n".join(_render_method(name, fn, language) for name, fn in methods)
    return frontmatter + body + "\n"


def _write_if_changed(path: Path, content: str) -> bool:
    if path.exists() and path.read_text(encoding="utf-8") == content:
        return False
    path.write_text(content, encoding="utf-8", newline="")
    return True


def main() -> int:
    target_ko = Path("docs/content/docs/api/engine.mdx")
    target_en = Path("docs/content/docs/api/engine.en.mdx")
    target_ko.parent.mkdir(parents=True, exist_ok=True)

    content_ko = _render_document(language="ko")
    content_en = _render_document(language="en")

    updated_ko = _write_if_changed(target_ko, content_ko)
    updated_en = _write_if_changed(target_en, content_en)

    print(
        "generate_api.py: "
        f"updated_ko={updated_ko} updated_en={updated_en}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
