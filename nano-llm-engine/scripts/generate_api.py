#!/usr/bin/env python3
"""Generate API reference MDX files from SDK source using griffe."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import sys
from typing import Any

from griffe import load


@dataclass(slots=True)
class MethodSpec:
    name: str
    signature: str
    docstring: str


def _format_signature(member: Any) -> str:
    parts: list[str] = []
    for parameter in member.parameters:
        if parameter.name == "self":
            continue
        if parameter.default is not None:
            parts.append(f"{parameter.name}={parameter.default}")
        else:
            parts.append(parameter.name)
    return f"({', '.join(parts)})"


def _extract_engine_methods() -> tuple[str, list[MethodSpec]]:
    sdk_root = Path("nano-llm-engine/sdk").resolve()
    if str(sdk_root) not in sys.path:
        sys.path.insert(0, str(sdk_root))

    module = load("nano_llm.engine", search_paths=[str(sdk_root)])
    cls = module.classes["NanoLLMEngine"]

    class_doc = cls.docstring.value.strip() if cls.docstring else ""
    methods: list[MethodSpec] = []

    for name, member in cls.members.items():
        if name.startswith("_") or member.kind.value != "function":
            continue
        signature = _format_signature(member)
        doc = member.docstring.value.strip() if member.docstring else "No description available."
        methods.append(MethodSpec(name=name, signature=signature, docstring=doc))

    methods.sort(key=lambda item: item.name)
    return class_doc, methods


def _render_document(language: str) -> str:
    class_doc, methods = _extract_engine_methods()

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
        method_label = "Method"
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
        method_label = "메서드"

    chunks: list[str] = []
    for method in methods:
        chunks.append(
            (
                f"### {method_label}: `{method.name}{method.signature}`\n\n"
                "```python\n"
                f"# Signature: NanoLLMEngine.{method.name}{method.signature}\n"
                "# See method description below for behavior and constraints.\n"
                "```\n\n"
                f"{method.docstring}\n"
            )
        )

    return frontmatter + "\n\n".join(chunks) + "\n"


def _write_if_changed(path: Path, content: str) -> bool:
    if path.exists() and path.read_text(encoding="utf-8") == content:
        return False
    path.write_text(content, encoding="utf-8", newline="")
    return True


def main() -> int:
    target_ko = Path("docs/content/docs/api/engine.mdx")
    target_en = Path("docs/content/docs/api/engine.en.mdx")
    target_ko.parent.mkdir(parents=True, exist_ok=True)

    updated_ko = _write_if_changed(target_ko, _render_document(language="ko"))
    updated_en = _write_if_changed(target_en, _render_document(language="en"))

    print(f"generate_api.py: updated_ko={updated_ko} updated_en={updated_en}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
