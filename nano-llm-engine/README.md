# nano-llm-engine

Docs-as-code portfolio project for a mock LLM inference SDK.

## Why this project exists

This repository demonstrates a technical-writer-led documentation platform where docs are treated as versioned, testable artifacts.
The workflow mirrors fast-moving SDK teams by validating examples in CI, auto-generating API references from source, and snapshotting versioned docs on release tags.

## Pipeline architecture

1. Python SDK source changes in `sdk/nano_llm`.
2. `scripts/generate_api.py` regenerates `docs/content/docs/api/*.mdx` from source docstrings.
3. `scripts/translate_docs.py` generates `*.en.mdx` from Korean source docs using Google Translation API.
4. `scripts/validate_snippets.py` executes python snippets in MDX against the mock SDK.
5. Next.js/Fumadocs build verifies that all docs render correctly.
6. Lychee checks broken links in built HTML.
7. Tag-based workflow freezes docs into `docs/content/docs/[vX.Y.Z]/`.

## Local setup

### Prerequisites

- Python 3.10+
- Node.js 20+
- pnpm 9+
- Rust toolchain (for optional `nano_llm_rs` extension)

### Install and test SDK

```bash
pip install -e ./sdk
pytest sdk/tests/ -v
```

### Run docs automation scripts

```bash
python scripts/generate_api.py
python scripts/validate_snippets.py
GOOGLE_TRANSLATE_API_KEY=... \
GOOGLE_TRANSLATE_PROJECT_ID=... \
python scripts/translate_docs.py
```

### Build docs site

```bash
pnpm --prefix docs install
pnpm --prefix docs build
```

## Project structure

- `sdk/`: Python mock inference SDK
- `sdk-rs/`: Rust PyO3 module for device-memory helper
- `docs/`: Next.js + Fumadocs documentation site
- `scripts/`: API generation, translation, and snippet validation
- `.github/workflows/`: CI and release workflows

## CI/CD workflows

- `docs-ci.yml`: lint, test, API generation, translation, snippet execution, docs build, link check
- `docs-release.yml`: release-tag trigger and docs snapshot freeze
