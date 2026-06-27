# nano-llm-engine

Docs-as-code portfolio project for a mock LLM inference SDK.

## Why this project exists

This repository demonstrates a technical-writer-led documentation platform where docs are treated as versioned, testable artifacts.
The workflow mirrors fast-moving SDK teams by validating examples in CI, auto-generating API references from source, and snapshotting versioned docs on release tags.

## Pipeline architecture

1. Python SDK source changes in `sdk/nano_llm`.
2. `scripts/generate_api.py` regenerates `docs/content/docs/api/*.mdx` by parsing SDK modules, public API signatures, docstrings, exported types, raised exceptions, and reusable python snippets from the docs corpus.
3. Apply the change of `docs/content/docs/api/*.mdx` in the other docs (guides, migration, trouble shooting, etc.) `docs/content/docs/**/*.mdx` using LLM agent.
4. `scripts/translate_docs.py` generates `*.en.mdx` from Korean source docs using Google Translation API.
    1. For testing, you can run `TRANSLATE_MOCK_MODE=true python scripts/translate_docs.py` to copy Korean source docs into English outputs without external API calls.
5. `scripts/validate_snippets.py` executes python snippets in MDX against the mock SDK.
6. Next.js/Fumadocs build verifies that all docs render correctly.
7. Lychee checks broken links in built HTML.
8. Tag-based workflow freezes docs into `docs/content/docs/[vX.Y.Z]/`.

## Local setup

### Prerequisites

- Python 3.10+
- Node.js 20+
- pnpm 9+
- Rust toolchain (for optional `nano_llm_rs` extension)

### Install Python packages for the pipeline

From the repository root, install the SDK in editable mode with its dev extras:

```bash
python -m pip install --upgrade pip
python -m pip install -e './sdk[dev]'
```

That single install covers the local Python workflow:

- `pydantic` and `typing-extensions` for the `nano_llm` package itself
- `pytest` and `pytest-cov` for `sdk/tests/`
- `griffe` for `scripts/generate_api.py`
- `ruff` and `mypy` for the same lint and type-check steps used in CI

`scripts/translate_docs.py` uses the Python standard library plus `.env.local`, and `scripts/validate_snippets.py` only needs the editable SDK install. You do not need extra local packages such as `requests` or `pyyaml` for the current checked-in pipeline scripts.

### Test the SDK

```bash
pytest sdk/tests/ -v
```

### Run docs automation scripts

#### Generate API reference docs

Run the generator from the repository root.

```bash
python scripts/generate_api.py
```

The output format is:

```text
generate_api.py: ko:engine=False en:engine=False
```

- `True`: the generator rewrote that output file.
- `False`: the generated output already matched the current file, so nothing changed.

#### How target discovery works

By default, the generator resolves targets in this order:

1. Explicit `--target` arguments.
2. Existing files under `docs/content/docs/api/*.mdx`.
3. Automatic discovery of public APIs under `sdk/<package>`.

If an API page already exists, the script treats it as the generation target. When no explicit target metadata is present, it infers the Python module from the file slug.

#### Common commands

Generate all discovered API pages:

```bash
python scripts/generate_api.py
```

Generate only English output:

```bash
python scripts/generate_api.py --languages en
```

Generate an explicit module target:

```bash
python scripts/generate_api.py --target nano_llm.engine=engine
```

Generate an explicit symbol target inside a module:

```bash
python scripts/generate_api.py --target nano_llm.engine:NanoLLMEngine=engine
```

Point the generator at another package root:

```bash
python scripts/generate_api.py \
    --package nano_llm \
    --sdk-root sdk \
    --docs-root docs/content/docs
```

#### Disambiguation for edge cases

Real-world SDK modules often expose more than one plausible public API surface. When the generator cannot safely infer which class, function, or attribute a page should document, add an `api-target` field to the API page frontmatter.

```md
---
title: "API Reference: NanoLLMEngine"
description: "Auto-generated API reference for NanoLLMEngine"
api-target: nano_llm.engine:NanoLLMEngine
---
```

Use `api-target` when:

- one module exposes multiple public classes or functions
- the docs slug does not match the source symbol name
- you want one file to lock to one exact symbol regardless of future module changes

#### Edge case handling built into the generator

The generator already handles:

- class, function, and public attribute/type-alias pages with different render paths
- ambiguous modules by failing fast and asking for `api-target`
- imported aliases that do not resolve cleanly outside the package
- cross-module related type resolution
- exception extraction from docstrings
- example extraction from existing non-API docs
- locale-specific output files (`*.mdx`, `*.en.mdx`)

Store translation secrets in a gitignored local file before running the translation step.

```bash
cat > .env.local <<'EOF'
GOOGLE_TRANSLATE_API_KEY=your_api_key_here
GOOGLE_TRANSLATE_PROJECT_ID=your_project_id_here
GOOGLE_TRANSLATE_LOCATION=global
GOOGLE_TRANSLATE_GLOSSARY=KV cache,quantization,batching,token
EOF
chmod 600 .env.local
```

The translation script automatically loads `.env.local` if it exists.

If you do not have translation credentials yet, you can run a temporary mock mode that copies Korean source docs into English outputs.

```bash
python scripts/generate_api.py
python scripts/validate_snippets.py
python scripts/translate_docs.py

# temporary demo mode without Google API credentials
TRANSLATE_MOCK_MODE=true python scripts/translate_docs.py
```

### Local showcase: end-to-end flow

Run the local showcase from the repository root. This flow is intended to demonstrate the full docs-as-code cycle without doing a production build.

The docs project includes `docs/pnpm-workspace.yaml` with `allowBuilds` entries for `esbuild` and `sharp`, so `pnpm --prefix docs install` should work without an interactive `pnpm approve-builds` step on pnpm v11.

1. Create and activate a local Python environment.

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e './sdk[dev]'
pnpm --prefix docs install
```

1. Make a source or docs change.

    - Example source change: `sdk/nano_llm/engine.py`
    - Example docs change: `docs/content/docs/guides/*.mdx`

1. Regenerate API reference docs from source.

```bash
python scripts/generate_api.py
```

1. Propagate API changes to the other docs pages.

- Update guides, tutorials, migration notes, and troubleshooting pages under `docs/content/docs/**`.
- This can be done manually or with an LLM-assisted authoring workflow.

1. Generate English docs.

```bash
# real translation when credentials are configured
python scripts/translate_docs.py

# portfolio/demo fallback without external API calls
TRANSLATE_MOCK_MODE=true python scripts/translate_docs.py
```

1. Execute and validate runnable Python snippets.

```bash
MOCK_RNGD_HARDWARE=true python scripts/validate_snippets.py
pytest sdk/tests/ -v
```

1. Start localhost preview for the docs site.

```bash
pnpm --prefix docs dev
```

For the local showcase, use the preview server instead of a production build. The CI workflow remains responsible for `pnpm --prefix docs build`.

1. Open the preview in your browser.

- Default URL: `http://localhost:3000`
- Review the changed guides, API reference pages, and translated English outputs.

1. Repeat the regeneration, validation, and preview cycle until the docs and source stay in sync.

## Project structure

- `sdk/`: Python mock inference SDK
- `sdk-rs/`: Rust PyO3 module for device-memory helper
- `docs/`: Next.js + Fumadocs documentation site
- `scripts/`: API generation, translation, and snippet validation
- `.github/workflows/`: CI and release workflows

## CI/CD workflows

- `docs-ci.yml`: lint, test, API generation, translation, snippet execution, docs build, link check
- `docs-release.yml`: release-tag trigger and docs snapshot freeze

When GitHub translation secrets are unavailable, `docs-ci.yml` falls back to `TRANSLATE_MOCK_MODE=true` so the full docs pipeline can still be demonstrated end to end. This fallback is intended for portfolio rehearsal, offline demos, and CI smoke checks rather than production translation quality.

## Local secret handling

- Use `.env.local` for local-only credentials.
- `.env.local` is ignored by git.
- Prefer `chmod 600 .env.local` on shared machines.
- Do not store API keys in committed files or screenshots.
