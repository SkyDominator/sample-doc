# Contributing

## Docs contribution policy

1. Author Korean source docs under `docs/content/docs/**.mdx`.
2. Do not manually edit paired `*.en.mdx` files when translation pipeline is enabled.
3. Keep code samples runnable; every python fenced block can be executed in CI.

## Local validation checklist

Run these commands from repository root before opening a PR.

```bash
python scripts/generate_api.py
MOCK_RNGD_HARDWARE=true python scripts/validate_snippets.py
GOOGLE_TRANSLATE_API_KEY=... GOOGLE_TRANSLATE_PROJECT_ID=... python scripts/translate_docs.py
pnpm --prefix docs install
pnpm --prefix docs build
```

## Translation rules

- Preserve frontmatter keys and MDX structure.
- Keep technical terms stable with `GOOGLE_TRANSLATE_GLOSSARY`.
- Translation must be idempotent: rerun without source change should produce no diff.

## Release process

1. Merge validated docs into `main`.
2. Create tag `vX.Y.Z`.
3. `docs-release.yml` snapshots docs into versioned folder.
4. Build output and verify links.

## CI expectations

- Broken snippets fail CI.
- Broken links fail CI.
- MDX parse issues fail CI.
- Type/lint/test checks must pass before merge.
