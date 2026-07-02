# RayKimLLM

`RayKimLLM` is a small docs-as-code portfolio project.
It includes:

- a mock Python SDK for an LLM inference engine
- a docs site built with Next.js and Fumadocs
- automation for API generation, translation, snippet validation, and CI/CD

This is a **mock example project**, not a real inference runtime.
Its goal is to show how source code, documentation, and validation can stay in sync.

## What is inside this repo?

- `sdk/`: the Python package for the mock inference SDK
- `docs/`: the documentation website
- `scripts/`: helper scripts for API docs, translation, and snippet validation
- `.github/workflows/`: GitHub Actions workflows for validation and deployment

## What can you learn from this project?

- how to document a small Python SDK
- how to write guides, tutorials, troubleshooting pages, and API references in MDX
- how to validate runnable code snippets in CI
- how to deploy a docs site automatically with GitHub Actions

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

Run the docs snippet validator:

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

- Korean docs: `http://localhost:3000/ko/docs`
- English docs: `http://localhost:3000/en/docs`

## Common commands

### Generate API reference pages

```bash
python scripts/generate_api.py
```

This updates the API MDX pages under `docs/content/docs/api/`.

### Generate English docs

With translation credentials:

```bash
python scripts/translate_docs.py
```

Without external credentials, use mock mode:

```bash
TRANSLATE_MOCK_MODE=true python scripts/translate_docs.py
```

### Build the docs site

```bash
pnpm --prefix docs build
```

### Validate runnable Python snippets

```bash
MOCK_RNGD_HARDWARE=true python scripts/validate_snippets.py
```

### Validate playground scenarios

```bash
MOCK_RNGD_HARDWARE=true python scripts/validate_playgrounds.py
```

## Recommended local workflow

When you change code or docs, use this order:

1. Edit the SDK or the docs.
2. Regenerate API docs if the SDK changed.
3. Regenerate English docs if the Korean source docs changed.
4. Run snippet validation.
5. Run playground validation.
6. Run SDK tests.
7. Preview the docs site locally.

Example:

```bash
python scripts/generate_api.py
TRANSLATE_MOCK_MODE=true python scripts/translate_docs.py
MOCK_RNGD_HARDWARE=true python scripts/validate_snippets.py
MOCK_RNGD_HARDWARE=true python scripts/validate_playgrounds.py
python -m pytest sdk/tests/ -v
pnpm --prefix docs dev
```

## How the mock SDK works

The SDK is intentionally simple.

- `RayKimLLMEngine` simulates loading a model, generating text, streaming tokens, reading device memory, and unloading.
- `MOCK_RNGD_HARDWARE=true` is required before `load_to_device()` succeeds.
- `quantization`, `KVCacheConfig`, and `InferenceConfig` give the SDK a realistic LLM-inference shape.
- `generate_streaming()` splits the generated string by whitespace. It does not perform real tokenization.

## CI/CD overview

This repository uses two GitHub Actions workflows.

### validate-doc

`docs-ci.yml` runs only on pull requests targeting `main`. The source branch can be any branch. It does the following:

1. installs Python dependencies
2. runs lint and type checks
3. runs SDK tests
4. regenerates API docs
5. generates English docs
6. validates Python snippets in MDX
7. validates playground contracts against the mock SDK
8. bundles the browser SDK sources used by the playground
9. fails if generated docs artifacts were not committed
10. builds the docs site
11. checks built HTML for broken links

### Docs Release

`docs-release.yml` runs on pushes to `main` and builds a static export of the committed docs site for GitHub Pages deployment.
This assumes `main` is protected so only pull requests with a successful `validate-doc` check can be merged.

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

This repository is designed to show a beginner-friendly but realistic documentation workflow:

- source code and docs live together
- examples are executable
- broken links are checked automatically
- docs are deployed through CI/CD

If you are new to docs-as-code, start with the local preview and the guides under `docs/content/docs/guides/`.
