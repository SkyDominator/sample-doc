# nano-llm-engine

Docs-as-code portfolio project for a mock LLM inference SDK.

## Why this project exists

This repository demonstrates a technical-writer-led documentation platform where docs are treated as versioned, testable artifacts.
The workflow mirrors fast-moving SDK teams by validating examples in CI, auto-generating API references from source, and snapshotting versioned docs on release tags.

## Pipeline architecture

1. Python SDK source changes in `sdk/nano_llm`.
2. `scripts/generate_api.py` regenerates `docs/content/docs/api/*.mdx` from source docstrings.
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

### Install and test SDK

```bash
pip install -e ./sdk
pytest sdk/tests/ -v
```

### Run docs automation scripts

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

When GitHub translation secrets are unavailable, `docs-ci.yml` falls back to `TRANSLATE_MOCK_MODE=true` so the full docs pipeline can still be demonstrated end to end. This fallback is intended for portfolio rehearsal, offline demos, and CI smoke checks rather than production translation quality.

## Local secret handling

- Use `.env.local` for local-only credentials.
- `.env.local` is ignored by git.
- Prefer `chmod 600 .env.local` on shared machines.
- Do not store API keys in committed files or screenshots.
