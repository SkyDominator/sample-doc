# Contributing

## Documentation workflow

1. Author Korean source docs under `docs/content/docs/` using `.mdx`.
2. Do not manually edit paired `.en.mdx` when auto-translation is enabled.
3. Run local checks before PR:
   - `python scripts/generate_api.py`
   - `python scripts/translate_docs.py`
   - `python scripts/validate_snippets.py`
   - `pnpm --prefix docs build`

## CI expectations

- Broken snippets fail CI.
- Broken links fail CI.
- Translation output must keep MDX structure valid.
