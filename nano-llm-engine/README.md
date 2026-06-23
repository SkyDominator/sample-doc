# nano-llm-engine

A docs-as-code portfolio project for a mock LLM inference SDK.

## What this repo demonstrates

- MDX-based static docs site
- Automated API reference generation
- Automated snippet execution validation in CI
- Automated Korean to English doc generation via Google Translation API
- Versioned docs snapshot workflow

## Current status

Phase 1 scaffold initialized.

## Quick structure

- `sdk/`: Python mock SDK
- `sdk-rs/`: Rust component with Python binding
- `docs/`: Fumadocs/Next.js documentation site
- `scripts/`: docs automation scripts
- `.github/workflows/`: CI/CD workflows
