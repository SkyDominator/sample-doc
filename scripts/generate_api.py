#!/usr/bin/env python3
"""Generate API reference MDX files from the SDK source codebase."""

from __future__ import annotations

from argparse import ArgumentParser, Namespace
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
import re
import sys
from typing import Any, Literal, get_args

from griffe import load


SCRIPT_ROOT = Path(__file__).resolve().parent.parent

BUILTIN_TYPE_NAMES = {
    "Any",
    "AsyncGenerator",
    "AsyncIterable",
    "Awaitable",
    "Callable",
    "Generator",
    "Iterable",
    "Iterator",
    "Literal",
    "None",
    "Optional",
    "Path",
    "Sequence",
    "TypedDict",
    "Union",
    "bool",
    "bytes",
    "dict",
    "float",
    "int",
    "list",
    "set",
    "str",
    "tuple",
}

STRINGS = {
    "ko": {
        "title_prefix": "API Reference",
        "description_template": "{name} API",
        "quickstart": "빠른 시작",
        "constructor": "생성자",
        "signature": "시그니처",
        "workflow": "사용 순서",
        "methods": "메서드",
        "functions": "함수",
        "definition": "정의",
        "parameters": "매개변수",
        "returns": "반환값",
        "yields": "생성값",
        "raises": "예외",
        "related_types": "관련 타입",
        "errors": "예외 타입",
        "see_also": "함께 보기",
        "example": "예제",
        "no_parameters": "매개변수 없음.",
        "field_header": "필드",
        "value_header": "값",
        "description_header": "설명",
        "raised_by": "발생 메서드",
        "default_header": "기본값",
        "type_header": "타입",
        "parameter_header": "매개변수",
        "when_header": "조건",
        "constructor_step": "`{name}(...)`로 인스턴스를 생성합니다.",
        "callable_step": "`{name}()` - {summary}",
        "literal_summary": "지원하는 리터럴 값입니다.",
        "attribute_summary": "공개 타입 별칭 또는 상수입니다.",
    },
    "en": {
        "title_prefix": "API Reference",
        "description_template": "{name} API",
        "quickstart": "Quickstart",
        "constructor": "Constructor",
        "signature": "Signature",
        "workflow": "Typical workflow",
        "methods": "Methods",
        "functions": "Functions",
        "definition": "Definition",
        "parameters": "Parameters",
        "returns": "Returns",
        "yields": "Yields",
        "raises": "Raises",
        "related_types": "Related types",
        "errors": "Errors",
        "see_also": "See also",
        "example": "Example",
        "no_parameters": "No parameters.",
        "field_header": "Field",
        "value_header": "Value",
        "description_header": "Description",
        "raised_by": "Raised by",
        "default_header": "Default",
        "type_header": "Type",
        "parameter_header": "Parameter",
        "when_header": "When",
        "constructor_step": "Create the instance with `{name}(...)`.",
        "callable_step": "`{name}()` - {summary}",
        "literal_summary": "Supported literal values.",
        "attribute_summary": "Public type alias or exported constant.",
    },
}


@dataclass(slots=True)
class GeneratorConfig:
    package_name: str
    sdk_root: Path
    docs_root: Path
    api_root: Path
    languages: tuple[str, ...]
    explicit_targets: tuple[str, ...]


@dataclass(slots=True)
class FrontmatterInfo:
    title: str | None = None
    description: str | None = None
    api_target: str | None = None


@dataclass(slots=True)
class ApiTarget:
    module_name: str
    symbol_name: str | None
    slug: str
    output_paths: dict[str, Path]
    frontmatter: dict[str, FrontmatterInfo]


@dataclass(slots=True)
class ResolvedSymbol:
    module_name: str
    name: str
    member: Any


@dataclass(slots=True)
class PackageContext:
    config: GeneratorConfig
    modules: dict[str, Any]
    symbol_index: dict[str, list[ResolvedSymbol]]


@dataclass(slots=True)
class ApiSubject:
    module_name: str
    name: str
    kind: Literal["class", "function", "attribute"]
    member: Any


@dataclass(slots=True)
class ParameterDoc:
    name: str
    annotation: str
    default: str | None
    description: str


@dataclass(slots=True)
class ValueDoc:
    annotation: str
    description: str


@dataclass(slots=True)
class RaiseDoc:
    name: str
    description: str


@dataclass(slots=True)
class ExampleDoc:
    heading: str | None
    source_title: str
    source_url: str
    code: str


@dataclass(slots=True)
class CallableDoc:
    name: str
    signature: str
    summary: str
    result_annotation: str
    parameters: list[ParameterDoc]
    returns: ValueDoc | None
    yields: ValueDoc | None
    raises: list[RaiseDoc]
    example: ExampleDoc | None


@dataclass(slots=True)
class TypeDoc:
    name: str
    summary: str
    fields: list[ParameterDoc] | None = None
    values: list[str] | None = None


@dataclass(slots=True)
class ErrorDoc:
    name: str
    description: str
    raised_by: list[str]


@dataclass(slots=True)
class PageDoc:
    subject: ApiSubject
    summary: str
    constructor_signature: str | None
    constructor_parameters: list[ParameterDoc]
    callables: list[CallableDoc]
    quickstart: ExampleDoc | None
    related_types: list[TypeDoc]
    errors: list[ErrorDoc]
    related_pages: list[tuple[str, str]]


def _parse_args() -> Namespace:
    parser = ArgumentParser(description="Generate API reference MDX files from SDK source.")
    parser.add_argument("--package", default="nano_llm", help="Top-level Python package name under sdk/.")
    parser.add_argument("--sdk-root", default="sdk", help="Path to the SDK root directory.")
    parser.add_argument("--docs-root", default="docs/content/docs", help="Path to the docs content root.")
    parser.add_argument(
        "--target",
        action="append",
        default=[],
        help="Explicit target in the form module[:symbol]=slug or module[:symbol]. Repeatable.",
    )
    parser.add_argument(
        "--languages",
        nargs="+",
        choices=["ko"],
        default=["ko"],
        help="Languages to generate. Only Korean API pages are generated.",
    )
    return parser.parse_args()


def _resolve_path(path_value: str) -> Path:
    path = Path(path_value)
    if path.is_absolute():
        return path
    return (SCRIPT_ROOT / path).resolve()


def _load_config(args: Namespace) -> GeneratorConfig:
    docs_root = _resolve_path(args.docs_root)
    return GeneratorConfig(
        package_name=args.package,
        sdk_root=_resolve_path(args.sdk_root),
        docs_root=docs_root,
        api_root=docs_root / "api",
        languages=tuple(args.languages),
        explicit_targets=tuple(args.target),
    )


def _iter_module_names(config: GeneratorConfig) -> list[str]:
    package_path = config.sdk_root / config.package_name.replace(".", "/")
    modules: list[str] = []
    for path in sorted(package_path.rglob("*.py")):
        relative = path.relative_to(config.sdk_root).with_suffix("")
        parts = [part.replace("-", "_") for part in relative.parts]
        if parts[-1] == "__init__":
            parts = parts[:-1]
        module_name = ".".join(parts)
        if module_name:
            modules.append(module_name)
    return modules


def _load_module(module_name: str, config: GeneratorConfig) -> Any:
    return load(
        module_name,
        search_paths=[str(config.sdk_root)],
        docstring_parser="google",
    )


def _dereference_member(member: Any) -> Any:
    current = member
    visited: set[int] = set()
    while getattr(current.kind, "value", None) == "alias":
        identity = id(current)
        if identity in visited:
            break
        visited.add(identity)
        try:
            target = getattr(current, "final_target", None) or getattr(current, "target", None)
        except Exception:
            break
        if target is None:
            break
        current = target
    return current


def _build_package_context(config: GeneratorConfig) -> PackageContext:
    if str(config.sdk_root) not in sys.path:
        sys.path.insert(0, str(config.sdk_root))

    modules: dict[str, Any] = {}
    symbol_index: dict[str, list[ResolvedSymbol]] = defaultdict(list)

    for module_name in _iter_module_names(config):
        module = _load_module(module_name, config)
        modules[module_name] = module

        if module_name == config.package_name:
            continue

        for name, member in module.members.items():
            if name.startswith("_"):
                continue
            resolved = _dereference_member(member)
            if resolved.kind.value not in {"class", "function", "attribute"}:
                continue
            symbol_index[name].append(ResolvedSymbol(module_name=module_name, name=name, member=resolved))

    return PackageContext(config=config, modules=modules, symbol_index=dict(symbol_index))


def _strip_quoted(value: str) -> str:
    if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
        return value[1:-1]
    return value


def _parse_frontmatter(path: Path) -> FrontmatterInfo:
    if not path.exists():
        return FrontmatterInfo()

    lines = path.read_text(encoding="utf-8").splitlines()
    if not lines or lines[0].strip() != "---":
        return FrontmatterInfo()

    metadata: dict[str, str] = {}
    for line in lines[1:]:
        if line.strip() == "---":
            break
        match = re.match(r"^([A-Za-z0-9_-]+)\s*:\s*(.*)$", line)
        if not match:
            continue
        metadata[match.group(1)] = _strip_quoted(match.group(2).strip())

    return FrontmatterInfo(
        title=metadata.get("title"),
        description=metadata.get("description"),
        api_target=metadata.get("api-target"),
    )


def _module_name_from_slug(package_name: str, slug: str) -> str:
    parts = [package_name, *[part.replace("-", "_") for part in Path(slug).parts]]
    return ".".join(parts)


def _parse_target_spec(spec: str, package_name: str) -> tuple[str, str | None, str | None]:
    if "=" in spec:
        module_spec, slug = spec.split("=", 1)
    else:
        module_spec, slug = spec, None

    if ":" in module_spec:
        module_name, symbol_name = module_spec.split(":", 1)
    else:
        module_name, symbol_name = module_spec, None

    module_name = module_name.replace("/", ".")
    if "." not in module_name:
        module_name = f"{package_name}.{module_name}"

    return module_name, symbol_name, slug


def _default_slug_for_target(module_name: str, symbol_name: str | None, package_name: str) -> str:
    module_tail = module_name.removeprefix(f"{package_name}.") if module_name.startswith(f"{package_name}.") else module_name
    return module_tail.replace(".", "/").replace("_", "-")


def _explicit_targets(config: GeneratorConfig) -> list[ApiTarget]:
    targets: list[ApiTarget] = []
    for spec in config.explicit_targets:
        module_name, symbol_name, slug = _parse_target_spec(spec, config.package_name)
        relative_slug = slug or _default_slug_for_target(module_name, symbol_name, config.package_name)
        ko_path = config.api_root / f"{relative_slug}.mdx"
        targets.append(
            ApiTarget(
                module_name=module_name,
                symbol_name=symbol_name,
                slug=relative_slug,
                output_paths={"ko": ko_path},
                frontmatter={"ko": _parse_frontmatter(ko_path)},
            )
        )
    return targets


def _targets_from_existing_docs(config: GeneratorConfig) -> list[ApiTarget]:
    targets: list[ApiTarget] = []
    if not config.api_root.exists():
        return targets

    for ko_path in sorted(config.api_root.rglob("*.mdx")):
        if ko_path.name.endswith(".en.mdx"):
            continue

        relative_slug = ko_path.relative_to(config.api_root).as_posix().removesuffix(".mdx")
        frontmatter = {"ko": _parse_frontmatter(ko_path)}
        target_spec = frontmatter["ko"].api_target

        if target_spec:
            module_name, symbol_name, _ = _parse_target_spec(target_spec, config.package_name)
        else:
            module_name = _module_name_from_slug(config.package_name, relative_slug)
            symbol_name = None

        targets.append(
            ApiTarget(
                module_name=module_name,
                symbol_name=symbol_name,
                slug=relative_slug,
                output_paths={"ko": ko_path},
                frontmatter=frontmatter,
            )
        )

    return targets


def _is_exception_like(member: Any) -> bool:
    if member.kind.value != "class":
        return False
    if member.name.endswith("Error"):
        return True
    return any(str(base).endswith("Exception") or str(base).endswith("Error") for base in getattr(member, "bases", []))


def _public_method_count(member: Any) -> int:
    if member.kind.value != "class":
        return 0
    return len(
        [
            submember
            for name, submember in member.members.items()
            if not name.startswith("_") and name != "__init__" and submember.kind.value == "function"
        ]
    )


def _public_api_candidates(module: Any) -> list[Any]:
    candidates: list[Any] = []
    for name, member in module.members.items():
        if name.startswith("_"):
            continue
        resolved = _dereference_member(member)
        if resolved.kind.value == "class" and not _is_exception_like(resolved):
            candidates.append(resolved)
        elif resolved.kind.value == "function":
            candidates.append(resolved)
    return candidates


def _public_attribute_candidates(module: Any) -> list[Any]:
    return [
        _dereference_member(member)
        for name, member in module.members.items()
        if not name.startswith("_") and _dereference_member(member).kind.value == "attribute"
    ]


def _select_subject(target: ApiTarget, context: PackageContext) -> ApiSubject:
    module = context.modules.get(target.module_name)
    if module is None:
        raise ValueError(f"Cannot load module '{target.module_name}' for slug '{target.slug}'.")

    if target.symbol_name:
        member = module.members.get(target.symbol_name)
        if member is None:
            raise ValueError(
                f"Symbol '{target.symbol_name}' was not found in module '{target.module_name}' for slug '{target.slug}'."
            )
        resolved = _dereference_member(member)
        return ApiSubject(module_name=target.module_name, name=target.symbol_name, kind=resolved.kind.value, member=resolved)

    candidates = _public_api_candidates(module)
    if len(candidates) == 1:
        member = candidates[0]
        return ApiSubject(module_name=target.module_name, name=member.name, kind=member.kind.value, member=member)

    if len(candidates) > 1:
        stem = Path(target.slug).name.replace("-", "_").lower()
        name_matches = [member for member in candidates if member.name.lower() == stem or stem in member.name.lower()]
        if len(name_matches) == 1:
            member = name_matches[0]
            return ApiSubject(module_name=target.module_name, name=member.name, kind=member.kind.value, member=member)

        ranked = sorted(
            candidates,
            key=lambda member: (_public_method_count(member), 1 if member.docstring else 0, -(member.lineno or 0)),
            reverse=True,
        )
        if len(ranked) >= 2:
            first_key = (_public_method_count(ranked[0]), 1 if ranked[0].docstring else 0)
            second_key = (_public_method_count(ranked[1]), 1 if ranked[1].docstring else 0)
            if first_key != second_key:
                member = ranked[0]
                return ApiSubject(module_name=target.module_name, name=member.name, kind=member.kind.value, member=member)

        raise ValueError(
            "Ambiguous API target for module "
            f"'{target.module_name}'. Add an 'api-target: module:SymbolName' frontmatter field to "
            f"'{target.output_paths['ko']}'."
        )

    attributes = _public_attribute_candidates(module)
    if len(attributes) == 1:
        member = attributes[0]
        return ApiSubject(module_name=target.module_name, name=member.name, kind=member.kind.value, member=member)

    raise ValueError(
        f"No public API subject could be inferred for module '{target.module_name}'. Add an explicit api-target frontmatter entry."
    )


def _summary_from_docstring(owner: Any) -> str:
    if not owner.docstring or not owner.docstring.parsed:
        return "No description available."
    for section in owner.docstring.parsed:
        if section.kind.value == "text":
            return section.value.strip()
    return "No description available."


def _parameter_descriptions(owner: Any) -> dict[str, str]:
    descriptions: dict[str, str] = {}
    if not owner.docstring or not owner.docstring.parsed:
        return descriptions
    for section in owner.docstring.parsed:
        if section.kind.value != "parameters":
            continue
        for item in section.value:
            descriptions[item.name] = item.description.strip()
    return descriptions


def _stringify_annotation(annotation: Any) -> str:
    if annotation is None:
        return "-"
    return str(annotation)


def _stringify_default(default: Any) -> str | None:
    if default is None:
        return None
    return str(default)


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


def _parameter_docs(owner: Any, parameters: Any) -> list[ParameterDoc]:
    descriptions = _parameter_descriptions(owner)
    rows: list[ParameterDoc] = []
    for parameter in parameters:
        if parameter.name == "self":
            continue
        rows.append(
            ParameterDoc(
                name=parameter.name,
                annotation=_stringify_annotation(parameter.annotation),
                default=_stringify_default(parameter.default),
                description=descriptions.get(parameter.name, "No description available."),
            )
        )
    return rows


def _field_docs(cls: Any) -> list[ParameterDoc]:
    descriptions = _parameter_descriptions(cls)
    rows: list[ParameterDoc] = []
    for attribute in sorted(
        (member for member in cls.members.values() if member.kind.value == "attribute"),
        key=lambda member: member.lineno or 0,
    ):
        rows.append(
            ParameterDoc(
                name=attribute.name,
                annotation=_stringify_annotation(attribute.annotation),
                default=_stringify_default(attribute.value),
                description=descriptions.get(attribute.name, "No description available."),
            )
        )
    return rows


def _value_doc(owner: Any, section_name: str, fallback_annotation: Any) -> ValueDoc | None:
    if owner.docstring and owner.docstring.parsed:
        for section in owner.docstring.parsed:
            if section.kind.value == section_name and section.value:
                item = section.value[0]
                annotation = getattr(item, "annotation", None) or fallback_annotation
                return ValueDoc(annotation=_stringify_annotation(annotation), description=item.description.strip())
    if fallback_annotation is None:
        return None
    return ValueDoc(annotation=_stringify_annotation(fallback_annotation), description="")


def _raise_docs(owner: Any) -> list[RaiseDoc]:
    rows: list[RaiseDoc] = []
    if not owner.docstring or not owner.docstring.parsed:
        return rows
    for section in owner.docstring.parsed:
        if section.kind.value != "raises":
            continue
        for item in section.value:
            rows.append(RaiseDoc(name=_stringify_annotation(getattr(item, "annotation", None)), description=item.description.strip()))
    return rows


def _python_snippets(context: PackageContext, language: str) -> list[ExampleDoc]:
    snippets: list[ExampleDoc] = []
    for path in sorted(context.config.docs_root.rglob("*.mdx")):
        relative = path.relative_to(context.config.docs_root)
        if relative.parts[0] == "api":
            continue
        if language == "en" and not path.name.endswith(".en.mdx"):
            continue
        if language == "ko" and path.name.endswith(".en.mdx"):
            continue

        content = path.read_text(encoding="utf-8")
        source_title = _parse_frontmatter(path).title or path.stem
        source_url = _mdx_path_to_url(path, language, context.config.docs_root)
        current_heading: str | None = None
        in_frontmatter = False
        in_code_block = False
        code_language = ""
        code_lines: list[str] = []

        for line in content.splitlines():
            if line.strip() == "---" and not in_code_block:
                in_frontmatter = not in_frontmatter
                continue
            if in_frontmatter:
                continue

            heading_match = re.match(r"^(#{1,6})\s+(.*)$", line)
            if heading_match and not in_code_block:
                current_heading = heading_match.group(2).strip()
                continue

            if line.startswith("```"):
                if not in_code_block:
                    in_code_block = True
                    code_language = line[3:].strip()
                    code_lines = []
                    continue
                if code_language == "python":
                    snippets.append(ExampleDoc(heading=current_heading, source_title=source_title, source_url=source_url, code="\n".join(code_lines).strip()))
                in_code_block = False
                code_language = ""
                code_lines = []
                continue

            if in_code_block:
                code_lines.append(line)

    return snippets


def _mdx_path_to_url(path: Path, language: str, docs_root: Path) -> str:
    relative = path.relative_to(docs_root)
    slug = "/".join(relative.parts)
    if language == "en":
        slug = slug.removesuffix(".en.mdx")
    else:
        slug = slug.removesuffix(".mdx")
    return f"/{language}/docs/{slug}"


def _find_example(snippets: list[ExampleDoc], *needles: str) -> ExampleDoc | None:
    lowered_needles = tuple(needle.lower() for needle in needles)
    for snippet in snippets:
        haystack = snippet.code.lower()
        if all(needle in haystack for needle in lowered_needles):
            return snippet
    return None


def _slug_title_from_url(url: str) -> str:
    slug = url.rstrip("/").split("/")[-1]
    return slug.replace("-", " ").replace("_", " ").title()


def _display_title(title: str, url: str, language: str) -> str:
    if language == "en" and re.search(r"[가-힣]", title):
        return _slug_title_from_url(url)
    return title


def _match_score(snippet: ExampleDoc, target_tokens: list[str], competing_tokens: list[str]) -> tuple[int, int, int]:
    code = snippet.code.lower()
    target_hits = sum(code.count(token) for token in target_tokens)
    competing_hits = sum(code.count(token) for token in competing_tokens)
    line_count = len([line for line in snippet.code.splitlines() if line.strip()])
    return (target_hits, -competing_hits, -line_count)


def _best_callable_example(name: str, all_names: list[str], snippets: list[ExampleDoc], is_method: bool) -> ExampleDoc | None:
    target_tokens = [f".{name}(" if is_method else f"{name}("]
    candidates = [snippet for snippet in snippets if any(token in snippet.code.lower() for token in target_tokens)]
    if not candidates:
        return None
    competing_tokens = [f".{other}(" for other in all_names if other != name]
    return max(candidates, key=lambda snippet: _match_score(snippet, target_tokens, competing_tokens))


def _best_quickstart(subject: ApiSubject, callables: list[CallableDoc], snippets: list[ExampleDoc]) -> ExampleDoc | None:
    subject_token = f"{subject.name.lower()}("
    candidates = [snippet for snippet in snippets if subject_token in snippet.code.lower()]
    if not candidates:
        return None
    target_tokens = [subject_token, *[f".{callable_doc.name}(" for callable_doc in callables]]
    return max(candidates, key=lambda snippet: _match_score(snippet, target_tokens, []))


def _annotation_tokens(text: str) -> set[str]:
    return set(re.findall(r"\b[A-Za-z_][A-Za-z0-9_]*\b", text))


def _resolve_symbol(context: PackageContext, name: str, preferred_module: str) -> ResolvedSymbol | None:
    candidates = context.symbol_index.get(name, [])
    if not candidates:
        return None
    same_module = [candidate for candidate in candidates if candidate.module_name == preferred_module]
    if len(same_module) == 1:
        return same_module[0]
    if len(candidates) == 1:
        return candidates[0]
    non_root = [candidate for candidate in candidates if candidate.module_name != context.config.package_name]
    if len(non_root) == 1:
        return non_root[0]
    return None


def _literal_values(value: str) -> list[str]:
    return [match.group(1) for match in re.finditer(r"['\"]([^'\"]+)['\"]", value)]


def _type_doc_from_symbol(resolved: ResolvedSymbol, language: str) -> TypeDoc | None:
    strings = STRINGS[language]
    member = resolved.member
    if member.kind.value == "class":
        fields = _field_docs(member)
        constructor = member.members.get("__init__")
        if not fields and constructor is not None:
            fields = _parameter_docs(member, constructor.parameters)
        return TypeDoc(name=resolved.name, summary=_summary_from_docstring(member), fields=fields or None)
    if member.kind.value == "attribute":
        values = _literal_values(str(member.value)) if member.value is not None else None
        summary = _summary_from_docstring(member)
        if summary == "No description available." and values:
            summary = strings["literal_summary"]
        elif summary == "No description available.":
            summary = strings["attribute_summary"]
        return TypeDoc(name=resolved.name, summary=summary, values=values)
    return None


def _related_types(context: PackageContext, subject: ApiSubject, constructor_parameters: list[ParameterDoc], callables: list[CallableDoc], language: str) -> list[TypeDoc]:
    seen_names: set[str] = set()
    related: list[TypeDoc] = []
    tokens: set[str] = set()
    for parameter in constructor_parameters:
        tokens.update(_annotation_tokens(parameter.annotation))
    for callable_doc in callables:
        tokens.update(_annotation_tokens(callable_doc.result_annotation))
        for parameter in callable_doc.parameters:
            tokens.update(_annotation_tokens(parameter.annotation))

    for token in sorted(tokens):
        if token in BUILTIN_TYPE_NAMES or token == subject.name:
            continue
        resolved = _resolve_symbol(context, token, subject.module_name)
        if resolved is None or resolved.name in seen_names:
            continue
        if resolved.member.kind.value == "class" and _is_exception_like(resolved.member):
            continue
        type_doc = _type_doc_from_symbol(resolved, language)
        if type_doc is None:
            continue
        seen_names.add(resolved.name)
        related.append(type_doc)
    return related


def _error_docs(context: PackageContext, subject: ApiSubject, callables: list[CallableDoc]) -> list[ErrorDoc]:
    raised_by: dict[str, list[str]] = defaultdict(list)
    for callable_doc in callables:
        for error in callable_doc.raises:
            raised_by[error.name].append(callable_doc.name)

    rows: list[ErrorDoc] = []
    for error_name, method_names in sorted(raised_by.items()):
        resolved = _resolve_symbol(context, error_name, subject.module_name)
        description = _summary_from_docstring(resolved.member) if resolved else "No description available."
        rows.append(ErrorDoc(name=error_name, description=description, raised_by=method_names))
    return rows


def _build_callable_doc(member: Any, snippets: list[ExampleDoc], all_names: list[str], is_method: bool) -> CallableDoc:
    return CallableDoc(
        name=member.name,
        signature=_format_signature(member),
        summary=_summary_from_docstring(member),
        result_annotation=_stringify_annotation(member.returns),
        parameters=_parameter_docs(member, member.parameters),
        returns=_value_doc(member, "returns", None),
        yields=_value_doc(member, "yields", None),
        raises=_raise_docs(member),
        example=_best_callable_example(member.name, all_names, snippets, is_method),
    )


def _build_page_doc(context: PackageContext, subject: ApiSubject, language: str) -> PageDoc:
    snippets = _python_snippets(context, language)

    if subject.kind == "class":
        constructor = subject.member.members.get("__init__")
        constructor_parameters = _parameter_docs(subject.member, constructor.parameters if constructor else [])
        public_methods = sorted(
            (
                member
                for name, member in subject.member.members.items()
                if not name.startswith("_") and name != "__init__" and member.kind.value == "function"
            ),
            key=lambda member: member.lineno or 0,
        )
        method_names = [member.name for member in public_methods]
        callables = [_build_callable_doc(member, snippets, method_names, True) for member in public_methods]
        quickstart = _best_quickstart(subject, callables, snippets)
    elif subject.kind == "function":
        constructor_parameters = []
        callables = [_build_callable_doc(subject.member, snippets, [subject.name], False)]
        quickstart = callables[0].example
    else:
        constructor_parameters = []
        callables = []
        quickstart = _find_example(snippets, subject.name.lower())

    related_pages: dict[str, str] = {}
    for example in [quickstart, *[callable_doc.example for callable_doc in callables if callable_doc.example]]:
        if example is None:
            continue
        related_pages[example.source_url] = _display_title(example.source_title, example.source_url, language)

    related_types = _related_types(context, subject, constructor_parameters, callables, language)
    if subject.kind == "attribute":
        own_type = _type_doc_from_symbol(ResolvedSymbol(module_name=subject.module_name, name=subject.name, member=subject.member), language)
        related_types = [own_type] if own_type is not None else []

    return PageDoc(
        subject=subject,
        summary=_summary_from_docstring(subject.member),
        constructor_signature=_format_signature(subject.member.members["__init__"]) if subject.kind == "class" and "__init__" in subject.member.members else None,
        constructor_parameters=constructor_parameters,
        callables=callables,
        quickstart=quickstart,
        related_types=related_types,
        errors=_error_docs(context, subject, callables),
        related_pages=sorted(related_pages.items(), key=lambda item: item[1]),
    )


def _default_title(language: str, name: str) -> str:
    return f"{STRINGS[language]['title_prefix']}: {name}"


def _default_description(language: str, name: str) -> str:
    return STRINGS[language]["description_template"].format(name=name)


def _frontmatter(target: ApiTarget, language: str, display_name: str) -> str:
    info = target.frontmatter.get(language, FrontmatterInfo())
    title = info.title or _default_title(language, display_name)
    description = info.description or _default_description(language, display_name)
    return "\n".join(["---", f'title: "{title}"', f'description: "{description}"', "---"])


def _parameter_table(parameters: list[ParameterDoc], language: str, label: str | None = None) -> str:
    strings = STRINGS[language]
    if not parameters:
        return strings["no_parameters"]

    header_label = label or strings["parameter_header"]
    lines = [
        f"| {header_label} | {strings['type_header']} | {strings['default_header']} | {strings['description_header']} |",
        "| :-- | :-- | :-- | :-- |",
    ]
    for parameter in parameters:
        default = f"`{parameter.default}`" if parameter.default is not None else "-"
        lines.append(f"| `{parameter.name}` | `{parameter.annotation}` | {default} | {parameter.description} |")
    return "\n".join(lines)


def _signature_block(name: str, signature: str, annotation: str) -> str:
    return "\n".join(["```text", f"{name}{signature} -> {annotation}", "```"])


def _render_example(example: ExampleDoc | None, language: str) -> str:
    if example is None:
        return ""
    return "\n".join([f"#### {STRINGS[language]['example']}", "", "```python", example.code, "```"])


def _render_value_section(value: ValueDoc | None, heading: str) -> list[str]:
    if value is None:
        return []
    body = value.description or f"`{value.annotation}`"
    return ["", f"#### {heading}", "", body]


def _render_callable(callable_doc: CallableDoc, owner_name: str | None, language: str) -> str:
    strings = STRINGS[language]
    qualified_name = f"{owner_name}.{callable_doc.name}" if owner_name else callable_doc.name
    blocks = [
        f"### `{callable_doc.name}{callable_doc.signature}`",
        "",
        callable_doc.summary,
        "",
        _signature_block(qualified_name, callable_doc.signature, callable_doc.result_annotation),
        "",
        f"#### {strings['parameters']}",
        "",
        _parameter_table(callable_doc.parameters, language),
    ]
    blocks.extend(_render_value_section(callable_doc.returns, strings["returns"]))
    blocks.extend(_render_value_section(callable_doc.yields, strings["yields"]))
    if callable_doc.raises:
        blocks.extend(["", f"#### {strings['raises']}", "", f"| Error | {strings['when_header']} |", "| :-- | :-- |"])
        for item in callable_doc.raises:
            blocks.append(f"| `{item.name}` | {item.description} |")
    example_block = _render_example(callable_doc.example, language)
    if example_block:
        blocks.extend(["", example_block])
    return "\n".join(blocks)


def _render_type_doc(type_doc: TypeDoc, language: str) -> str:
    strings = STRINGS[language]
    blocks = [f"### `{type_doc.name}`", "", type_doc.summary]
    if type_doc.fields:
        blocks.extend(["", _parameter_table(type_doc.fields, language, label=strings["field_header"])])
    if type_doc.values:
        blocks.extend(["", f"| {strings['value_header']} |", "| :-- |"])
        for value in type_doc.values:
            blocks.append(f"| `{value}` |")
    return "\n".join(blocks)


def _render_errors(errors: list[ErrorDoc], language: str) -> str:
    if not errors:
        return ""
    strings = STRINGS[language]
    lines = [f"| Error | {strings['raised_by']} | {strings['description_header']} |", "| :-- | :-- | :-- |"]
    for error in errors:
        raised_by = ", ".join(f"`{name}()`" for name in error.raised_by)
        lines.append(f"| `{error.name}` | {raised_by} | {error.description} |")
    return "\n".join(lines)


def _render_class_page(target: ApiTarget, page: PageDoc, language: str) -> str:
    strings = STRINGS[language]
    sections = [_frontmatter(target, language, page.subject.name), "", f"# {page.subject.name}", "", page.summary]
    quickstart = _render_example(page.quickstart, language)
    if quickstart:
        sections.extend(["", f"## {strings['quickstart']}", "", quickstart])

    if page.constructor_signature is not None:
        sections.extend([
            "",
            f"## {strings['constructor']}",
            "",
            "```text",
            f"{page.subject.name}{page.constructor_signature}",
            "```",
            "",
            f"### {strings['parameters']}",
            "",
            _parameter_table(page.constructor_parameters, language),
        ])

    if page.callables:
        workflow_lines = [
            f"1. {strings['constructor_step'].format(name=page.subject.name)}",
            *[
                f"{idx}. {strings['callable_step'].format(name=callable_doc.name, summary=callable_doc.summary)}"
                for idx, callable_doc in enumerate(page.callables, start=2)
            ],
        ]
        sections.extend(["", f"## {strings['workflow']}", "", *workflow_lines])
        sections.extend(["", f"## {strings['methods']}"])
        for callable_doc in page.callables:
            sections.extend(["", _render_callable(callable_doc, page.subject.name, language)])

    if page.related_types:
        sections.extend(["", f"## {strings['related_types']}"])
        for type_doc in page.related_types:
            sections.extend(["", _render_type_doc(type_doc, language)])

    error_block = _render_errors(page.errors, language)
    if error_block:
        sections.extend(["", f"## {strings['errors']}", "", error_block])

    if page.related_pages:
        sections.extend(["", f"## {strings['see_also']}", ""])
        for url, title in page.related_pages:
            sections.append(f"- [{title}]({url})")
    return "\n".join(sections).strip() + "\n"


def _render_function_page(target: ApiTarget, page: PageDoc, language: str) -> str:
    strings = STRINGS[language]
    callable_doc = page.callables[0]
    sections = [
        _frontmatter(target, language, page.subject.name),
        "",
        f"# {page.subject.name}",
        "",
        page.summary,
        "",
        f"## {strings['signature']}",
        "",
        _signature_block(page.subject.name, callable_doc.signature, callable_doc.result_annotation),
        "",
        f"## {strings['parameters']}",
        "",
        _parameter_table(callable_doc.parameters, language),
    ]
    sections.extend(_render_value_section(callable_doc.returns, strings["returns"]))
    sections.extend(_render_value_section(callable_doc.yields, strings["yields"]))
    if callable_doc.raises:
        sections.extend(["", f"## {strings['raises']}", "", f"| Error | {strings['when_header']} |", "| :-- | :-- |"])
        for item in callable_doc.raises:
            sections.append(f"| `{item.name}` | {item.description} |")
    example_block = _render_example(callable_doc.example, language)
    if example_block:
        sections.extend(["", example_block])
    if page.related_types:
        sections.extend(["", f"## {strings['related_types']}"])
        for type_doc in page.related_types:
            sections.extend(["", _render_type_doc(type_doc, language)])
    error_block = _render_errors(page.errors, language)
    if error_block:
        sections.extend(["", f"## {strings['errors']}", "", error_block])
    if page.related_pages:
        sections.extend(["", f"## {strings['see_also']}", ""])
        for url, title in page.related_pages:
            sections.append(f"- [{title}]({url})")
    return "\n".join(sections).strip() + "\n"


def _render_attribute_page(target: ApiTarget, page: PageDoc, language: str) -> str:
    strings = STRINGS[language]
    type_doc = page.related_types[0] if page.related_types else TypeDoc(name=page.subject.name, summary=strings["attribute_summary"])
    sections = [_frontmatter(target, language, page.subject.name), "", f"# {page.subject.name}", "", page.summary, "", f"## {strings['definition']}", "", _render_type_doc(type_doc, language)]
    if page.related_pages:
        sections.extend(["", f"## {strings['see_also']}", ""])
        for url, title in page.related_pages:
            sections.append(f"- [{title}]({url})")
    return "\n".join(sections).strip() + "\n"


def _render_page(target: ApiTarget, page: PageDoc, language: str) -> str:
    if page.subject.kind == "class":
        return _render_class_page(target, page, language)
    if page.subject.kind == "function":
        return _render_function_page(target, page, language)
    return _render_attribute_page(target, page, language)


def _write_if_changed(path: Path, content: str) -> bool:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.read_text(encoding="utf-8") == content:
        return False
    path.write_text(content, encoding="utf-8")
    return True


def _auto_discover_targets(context: PackageContext) -> list[ApiTarget]:
    targets: list[ApiTarget] = []
    for module_name in sorted(context.modules):
        if module_name == context.config.package_name:
            continue
        slug = module_name.removeprefix(f"{context.config.package_name}.").replace(".", "/").replace("_", "-")
        target = ApiTarget(
            module_name=module_name,
            symbol_name=None,
            slug=slug,
            output_paths={"ko": context.config.api_root / f"{slug}.mdx"},
            frontmatter={"ko": FrontmatterInfo()},
        )
        try:
            _select_subject(target, context)
        except ValueError:
            continue
        targets.append(target)
    return targets


def _discover_targets(context: PackageContext) -> list[ApiTarget]:
    if context.config.explicit_targets:
        return _explicit_targets(context.config)
    targets = _targets_from_existing_docs(context.config)
    if targets:
        return targets
    return _auto_discover_targets(context)


def main() -> int:
    config = _load_config(_parse_args())
    context = _build_package_context(config)
    targets = _discover_targets(context)
    if not targets:
        raise SystemExit("No API targets were discovered. Add docs/content/docs/api/*.mdx files or pass --target.")

    updates: list[str] = []
    for target in targets:
        subject = _select_subject(target, context)
        for language in config.languages:
            page_doc = _build_page_doc(context, subject, language)
            content = _render_page(target, page_doc, language)
            updated = _write_if_changed(target.output_paths[language], content)
            updates.append(f"{language}:{target.slug}={updated}")

    print("generate_api.py:", " ".join(updates))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
