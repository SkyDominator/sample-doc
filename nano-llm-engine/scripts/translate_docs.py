#!/usr/bin/env python3
"""Translate Korean MDX docs into English MDX using Google Translation API."""

from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, as_completed
import json
import os
from pathlib import Path
import re
import time
from typing import Dict
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


REQUIRED_ENV = ("GOOGLE_TRANSLATE_API_KEY", "GOOGLE_TRANSLATE_PROJECT_ID")
TOKEN_RE = re.compile(r"__PH_\d{6}__")
TEXT_KEYS = {"title", "description", "sidebarTitle"}


def _load_dotenv(dotenv_path: Path) -> None:
    if not dotenv_path.exists():
        return

    for raw_line in dotenv_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


class TranslateAPIError(Exception):
    pass


class OutputValidationError(Exception):
    pass


def _extract_frontmatter(text: str) -> tuple[str, str]:
    if not text.startswith("---\n"):
        return "", text
    end_idx = text.find("\n---\n", 4)
    if end_idx == -1:
        raise OutputValidationError("unclosed frontmatter")
    frontmatter = text[: end_idx + 5]
    body = text[end_idx + 5 :]
    return frontmatter, body


def _translate_value_if_needed(line: str, api_call) -> str:
    m = re.match(r"^([A-Za-z0-9_]+):(\s*)(.*)$", line)
    if not m:
        return line
    key, ws, value = m.group(1), m.group(2), m.group(3)
    if key not in TEXT_KEYS or not value:
        return line

    quote = ""
    raw = value.strip()
    if (raw.startswith('"') and raw.endswith('"')) or (raw.startswith("'") and raw.endswith("'")):
        quote = raw[0]
        raw = raw[1:-1]

    translated = api_call(raw)
    escaped = translated.replace(quote, f"\\{quote}") if quote else translated
    wrapped = f"{quote}{escaped}{quote}" if quote else escaped
    return f"{key}:{ws}{wrapped}"


def _protect_segments(text: str, glossary_terms: list[str]) -> tuple[str, Dict[str, str]]:
    placeholders: Dict[str, str] = {}
    counter = 0

    def protect(pattern: re.Pattern[str], src: str) -> str:
        nonlocal counter

        def repl(match: re.Match[str]) -> str:
            nonlocal counter
            counter += 1
            token = f"__PH_{counter:06d}__"
            placeholders[token] = match.group(0)
            return token

        return pattern.sub(repl, src)

    text = protect(re.compile(r"```[\s\S]*?```", re.MULTILINE), text)
    text = protect(re.compile(r"`[^`\n]+`"), text)
    text = protect(re.compile(r"(?m)^(?:import|export)\s.+$"), text)
    text = protect(re.compile(r"(?m)^\s*<[^>]+>\s*$"), text)
    text = protect(re.compile(r"(?m)^\s*</[^>]+>\s*$"), text)

    for term in glossary_terms:
        escaped = re.escape(term)
        text = protect(re.compile(escaped), text)

    return text, placeholders


def _restore_segments(text: str, placeholders: Dict[str, str]) -> str:
    for token, raw in placeholders.items():
        text = text.replace(token, raw)
    return text


def _sanity_check_output(text: str) -> None:
    if TOKEN_RE.search(text):
        raise OutputValidationError("placeholder token not restored")
    if text.count("```") % 2 != 0:
        raise OutputValidationError("unbalanced fenced code blocks")
    if text.startswith("---\n") and "\n---\n" not in text[4:]:
        raise OutputValidationError("frontmatter closing marker missing")


def _is_in_frozen_version(path: Path) -> bool:
    for part in path.parts:
        if re.match(r"\[v[^\]]+\]", part):
            return True
    return False


def _google_translate_api_call_factory(api_key: str, project_id: str, location: str):
    endpoint = (
        f"https://translation.googleapis.com/v3/projects/{project_id}"
        f"/locations/{location}:translateText?key={api_key}"
    )

    def call(text: str) -> str:
        if not text.strip():
            return text

        payload = {
            "contents": [text],
            "sourceLanguageCode": "ko",
            "targetLanguageCode": "en",
            "mimeType": "text/plain",
        }
        data = json.dumps(payload).encode("utf-8")

        last_error: Exception | None = None
        for _attempt in range(3):
            try:
                req = Request(
                    endpoint,
                    data=data,
                    headers={"Content-Type": "application/json"},
                    method="POST",
                )
                with urlopen(req, timeout=30) as response:
                    body = json.loads(response.read().decode("utf-8"))
                translated = body["translations"][0]["translatedText"]
                return translated
            except (HTTPError, URLError, KeyError, TimeoutError, ValueError) as err:
                last_error = err
                time.sleep(1)

        raise TranslateAPIError(f"translation API failed: {last_error}")

    return call


def validate_env() -> tuple[bool, str]:
    missing = [key for key in REQUIRED_ENV if not os.getenv(key)]
    if missing:
        return False, f"missing env: {', '.join(missing)}"
    return True, "ok"


def _translate_file(
    source: Path,
    call_translate,
    glossary_terms: list[str],
) -> tuple[str, Path]:
    original = source.read_text(encoding="utf-8")
    frontmatter, body = _extract_frontmatter(original)

    translated_frontmatter = frontmatter
    if frontmatter:
        fm_lines = frontmatter.splitlines()
        translated_lines = [_translate_value_if_needed(line, call_translate) for line in fm_lines]
        translated_frontmatter = "\n".join(translated_lines)
        if frontmatter.endswith("\n"):
            translated_frontmatter += "\n"

    protected_body, placeholders = _protect_segments(body, glossary_terms)
    translated_body = call_translate(protected_body)
    restored_body = _restore_segments(translated_body, placeholders)

    output = translated_frontmatter + restored_body
    _sanity_check_output(output)

    target = source.with_name(source.stem + ".en.mdx")
    if target.exists() and target.read_text(encoding="utf-8") == output:
        return "unchanged", target

    target.write_text(output, encoding="utf-8")
    return "updated", target


def main() -> int:
    script_root = Path(__file__).resolve().parent.parent
    _load_dotenv(script_root / ".env.local")
    _load_dotenv(Path.cwd() / ".env.local")

    ok, message = validate_env()
    if not ok:
        print(f"translate_docs.py: {message}")
        return 2

    root = script_root / "docs/content/docs"
    if not root.exists():
        print("translate_docs.py: docs root not found")
        return 2

    api_key = os.environ["GOOGLE_TRANSLATE_API_KEY"]
    project_id = os.environ["GOOGLE_TRANSLATE_PROJECT_ID"]
    location = os.environ.get("GOOGLE_TRANSLATE_LOCATION", "global")
    glossary_raw = os.environ.get("GOOGLE_TRANSLATE_GLOSSARY", "")
    glossary_terms = [t.strip() for t in glossary_raw.split(",") if t.strip()]
    max_workers = max(1, min(int(os.environ.get("TRANSLATE_MAX_WORKERS", "4")), 8))

    call_translate = _google_translate_api_call_factory(api_key, project_id, location)

    sources = [
        p
        for p in root.rglob("*.mdx")
        if not p.name.endswith(".en.mdx") and not _is_in_frozen_version(p)
    ]

    scanned = len(sources)
    updated = 0
    unchanged = 0
    failed = 0
    api_failed = False
    validation_failed = False

    start = time.time()
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(_translate_file, src, call_translate, glossary_terms): src for src in sources
        }
        for future in as_completed(futures):
            src = futures[future]
            try:
                result, target = future.result()
                if result == "updated":
                    updated += 1
                else:
                    unchanged += 1
                print(f"translate_docs.py: {src} -> {target} ({result})")
            except TranslateAPIError as err:
                api_failed = True
                failed += 1
                print(f"translate_docs.py: API failure in {src}: {err}")
            except OutputValidationError as err:
                validation_failed = True
                failed += 1
                print(f"translate_docs.py: validation failure in {src}: {err}")
            except Exception as err:  # defensive fallback
                failed += 1
                validation_failed = True
                print(f"translate_docs.py: unexpected failure in {src}: {err}")

    duration = round(time.time() - start, 2)
    print(
        "translate_docs.py: "
        f"scanned={scanned} translated={updated + unchanged} "
        f"updated={updated} unchanged={unchanged} failed={failed} "
        f"duration_sec={duration}"
    )

    if api_failed:
        return 3
    if validation_failed:
        return 4
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
