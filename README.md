# RayKimLLM

`RayKimLLM` is a docs-as-code portfolio project built around a mock LLM inference SDK and a bilingual documentation site.

It demonstrates how to keep source code, generated API references, localized docs, controlled playground scenarios, and CI validation in sync.

This is a mock example project, not a real inference runtime.

## Current highlights

- The old `nano_llm` identity was renamed across the repo to `RayKimLLM` / `raykim_llm`.
- The docs site now has explicit Korean and English routes under `/ko` and `/en`.
- The quickstart experience uses controlled playground scenarios for synchronous and streaming generation.
- Playground behavior is validated in CI with the same scenario contracts used by the browser UI.
- API pages combine hand-written narrative sections with marker-delimited generated reference sections.
- The `main` branch is intended to be protected by the PR-only `validate-doc` workflow before release.

## Repo layout

- `sdk/`: Python SDK package, tests, and packaging metadata
- `sdk-rs/`: optional Rust helper crate for extension points around device-memory behavior
- `docs/`: Next.js + Fumadocs site, MDX content, locale-aware routing, and UI components
- `docs/playground/`: playground schema, scenario contracts, English overlay text, and browser SDK bundle
- `scripts/`: API generation, translation, snippet validation, playground validation, and bundle generation
- `.github/workflows/`: pull-request validation and GitHub Pages release workflows

## What you can learn from this project

- how to document a small Python SDK with guides, tutorials, troubleshooting docs, and generated API references
- how to maintain bilingual MDX docs with Korean as the primary authored source
- how to validate both runnable Python snippets and controlled interactive playground contracts in CI
- how to gate production docs updates through pull request validation and GitHub Pages deployment

## Quick start

### 1. Prerequisites

You need:

- Python 3.10 or newer
- Node.js 20 or newer
- pnpm 9 or newer

Rust is optional. The project can run without the Rust extension.

### 2. Install Python dependencies

From the repository root:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e './sdk[dev]'
```

This installs the SDK and the tools used by the docs pipeline.

### 3. Install docs dependencies

```bash
pnpm --prefix docs install --frozen-lockfile
```

### 4. Run local checks

Run the SDK tests:

```bash
python -m pytest sdk/tests/ -v
```

Run the static snippet validator:

```bash
MOCK_RNGD_HARDWARE=true python scripts/validate_snippets.py
```

Run the playground contract validator:

```bash
MOCK_RNGD_HARDWARE=true python scripts/validate_playgrounds.py
```

### 5. Start the docs site

```bash
pnpm --prefix docs dev
```

Open the site in your browser:

- Korean landing: `http://localhost:3000/ko`
- English landing: `http://localhost:3000/en`
- Korean docs: `http://localhost:3000/ko/docs`
- English docs: `http://localhost:3000/en/docs`

## Documentation model

- Korean MDX pages under `docs/content/docs/**/*.mdx` are the primary authored docs.
- English docs live in sibling `.en.mdx` files and are refreshed by `scripts/translate_docs.py`.
- Only the quickstart flows use the interactive playground. Other examples stay as static Python fences and are executed by `scripts/validate_snippets.py`.
- Playground contracts live in `docs/playground/scenarios/*.json`.
- Korean playground scenario JSON is the executable source of truth. English reader-facing text comes from `docs/playground/translations.js`.
- API pages under `docs/content/docs/api/` keep quickstart and explanatory sections hand-written, while `scripts/generate_api.py` updates only marker-delimited generated blocks.

## Common commands

### Generate API reference pages

```bash
python scripts/generate_api.py
```

This updates the generated API blocks under `docs/content/docs/api/`.

### Generate English docs

With translation credentials:

```bash
python scripts/translate_docs.py
```

Without external credentials, use mock mode:

```bash
TRANSLATE_MOCK_MODE=true python scripts/translate_docs.py
```

In mock mode, the script leaves existing English outputs unchanged.

### Refresh the playground SDK bundle

```bash
python scripts/bundle_sdk_for_playground.py
```

Run this when `sdk/raykim_llm/*.py` changes and the browser playground must stay in sync with the SDK.

### Validate runnable Python snippets

```bash
MOCK_RNGD_HARDWARE=true python scripts/validate_snippets.py
```

### Validate playground scenarios

```bash
MOCK_RNGD_HARDWARE=true python scripts/validate_playgrounds.py
```

### Build the docs site

```bash
pnpm --prefix docs build
```

Do not run `pnpm --prefix docs build` while a `pnpm --prefix docs dev` process is using the same `docs/.next` directory. If the Next.js cache gets corrupted, stop the dev server, remove `docs/.next`, and build again.

### Build the static export used by release

```bash
DOCS_STATIC_EXPORT=true DOCS_BASE_PATH=/sample-doc pnpm --prefix docs build
```

### Check generated docs artifacts are committed

```bash
git diff --exit-code -- docs/content/docs docs/playground/sdk-sources.json
```

This matches the generated-artifact drift check enforced by `validate-doc`.

## Recommended local workflow

When you change code or docs, use this order:

1. Edit the SDK or the docs.
2. If SDK signatures changed, run `scripts/generate_api.py`.
3. If SDK code used by the playground changed, run `scripts/bundle_sdk_for_playground.py`.
4. If Korean docs changed, run `scripts/translate_docs.py` or its mock mode.
5. Run snippet validation.
6. Run playground validation.
7. Run SDK tests.
8. Check generated docs artifacts before opening a pull request.
9. Preview or build the docs site.

Example:

```bash
python scripts/generate_api.py
TRANSLATE_MOCK_MODE=true python scripts/translate_docs.py
MOCK_RNGD_HARDWARE=true python scripts/validate_snippets.py
MOCK_RNGD_HARDWARE=true python scripts/validate_playgrounds.py
python scripts/bundle_sdk_for_playground.py
python -m pytest sdk/tests/ -v
git diff --exit-code -- docs/content/docs docs/playground/sdk-sources.json
pnpm --prefix docs dev
```

## How the mock SDK works

The SDK is intentionally simple.

- `RayKimLLMEngine` simulates model load/unload, synchronous generation, streaming generation, device-memory inspection, and cleanup.
- `MOCK_RNGD_HARDWARE=true` is required before `load_to_device()` succeeds.
- `InferenceConfig`, `KVCacheConfig`, and `QuantizationType` give the SDK a realistic LLM-inference shape.
- `generate_streaming()` yields whitespace-split chunks rather than real tokenizer output.
- The optional `raykim_llm_rs` helper is not required for basic docs development or tests.

## CI/CD overview

This repository uses two GitHub Actions workflows.

### `validate-doc`

`docs-ci.yml` runs only on pull requests targeting `main`. The source branch can be any branch. It does the following:

1. installs Python dependencies
2. runs lint, type checks, and SDK tests
3. regenerates API docs and English docs
4. validates Python snippets in MDX
5. validates playground contracts against the mock SDK
6. refreshes the browser SDK sources used by the playground
7. fails if generated docs artifacts were not committed
8. builds the docs site
9. checks built HTML for broken links

Protect `main` and require the `validate-doc` status check so pull requests cannot be merged when validation fails.

### Docs Release

`docs-release.yml` runs on pushes to `main` that change `docs/**`. It:

1. installs docs dependencies
2. builds the static export with `DOCS_STATIC_EXPORT=true`
3. uploads the GitHub Pages artifact
4. deploys the docs site

The release workflow assumes the merged pull request already passed `validate-doc` and already committed any regenerated docs artifacts.

## Notes about translation

The translation script reads local credentials from `.env.local` if that file exists.

Example:

```bash
cat > .env.local <<'EOF'
GOOGLE_TRANSLATE_API_KEY=your_api_key_here
GOOGLE_TRANSLATE_PROJECT_ID=your_project_id_here
GOOGLE_TRANSLATE_LOCATION=global
GOOGLE_TRANSLATE_GLOSSARY=KV cache,quantization,batching,token
EOF
```

If you are only testing the pipeline, mock mode is enough:

```bash
TRANSLATE_MOCK_MODE=true python scripts/translate_docs.py
```

## Project goal

This repository is designed to show a beginner-friendly but realistic documentation workflow where:

- source code, generated API references, and authored docs live together
- quickstart playground behavior is contract-driven and validated
- bilingual docs stay aligned with a primary source locale
- broken links and runnable examples are checked automatically
- docs are promoted to production through pull request validation and GitHub Pages deployment

If you are new to docs-as-code, start with the local preview and the guides under `docs/content/docs/guides/`.
