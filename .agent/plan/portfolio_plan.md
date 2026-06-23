# Portfolio Project Plan: `nano-llm-engine` Docs-as-Code Pipeline

**Goal:** Create a runnable, production-grade docs-as-code portfolio that demonstrates all JD requirements without full DevOps engagement.

**Scope:** Python SDK + Rust component + Fumadocs + Automated CI/CD validation (API generation, snippet execution, link checking).

**Timeline:** Phase-based implementation (iterate and validate at each checkpoint).

---

## 🎯 Project Thesis

Build a complete, realistic **developer-facing documentation pipeline** for a mock LLM inference SDK that:
- Generates API reference from source code automatically
- Validates code samples by executing them against a mock SDK in CI
- Manages multiple versions with snapshot-based release process
- Generates and maintains bilingual (Korean + English) documentation via Google Translation API
- Demonstrates your ability to operate docs-as-code at production scale

---

## 📦 Deliverables Checklist

| Component | Status | Owner | Notes |
|-----------|--------|-------|-------|
| Project structure & git repo | Not started | You | Phase 1 |
| Python SDK with mock inference engine | Not started | You | Phase 2 |
| Rust component with Python binding | Not started | You | Phase 2 |
| Fumadocs setup + configuration | Not started | You | Phase 2 |
| Documentation structure + content (KO + EN) | Not started | You | Phase 3 |
| GitHub Actions CI/CD pipelines | Not started | You | Phase 4 |
| Automated API reference generation script | Not started | You | Phase 4 |
| Snippet execution validation | Not started | You | Phase 4 |
| Link validation in CI | Not started | You | Phase 4 |
| Multi-version release workflow | Not started | You | Phase 4 |

---

## 🏗️ Phase 1: Project Initialization

**Goal:** Create git repo structure and set up foundational folders.

### Tasks

- [ ] Create GitHub repo: `nano-llm-engine`
- [ ] Initialize folder structure:
  ```
  nano-llm-engine/
  ├── .github/workflows/
  │   ├── docs-ci.yml              # Daily validation & checks
  │   └── docs-release.yml         # Version freeze on Git tag
  ├── sdk/                         # Python SDK
  │   ├── nano_llm/
  │   │   ├── __init__.py
  │   │   ├── config.py            # Config classes (quantization, KV cache)
  │   │   ├── engine.py            # Mock inference engine (main logic)
  │   │   └── errors.py            # Custom exceptions
  │   ├── pyproject.toml           # Package metadata
  │   └── tests/
  │       ├── __init__.py
  │       └── test_engine.py       # Unit tests for SDK
  ├── sdk-rs/                      # Rust component
  │   ├── src/
  │   │   └── lib.rs              # PyO3 bindings for Python
  │   ├── Cargo.toml
  │   └── README.md
  ├── docs/                        # Fumadocs (Next.js) site
  │   ├── content/
  │   │   └── docs/
  │   │       ├── index.mdx
  │   │       ├── guides/          # Conceptual & quickstart
  │   │       ├── api/             # Auto-generated API reference
  │   │       ├── tutorials/       # Step-by-step guides
  │   │       ├── migration/       # Version migration guides
  │   │       ├── troubleshooting/
  │   │       └── [v1.0.0]/        # Version snapshot (created on release)
  │   ├── package.json
  │   ├── fumadocs.config.ts
  │   ├── tsconfig.json
  │   └── next.config.js
  ├── scripts/                     # Automation scripts
  │   ├── generate_api.py          # Docstring → MDX converter
  │   └── validate_snippets.py     # Execute code samples in CI
  ├── .gitignore
  ├── README.md                    # Project overview
  ├── CONTRIBUTING.md              # Docs contribution guide
  └── plan.md                      # This file
  ```
- [ ] Initialize Python project with `pyproject.toml`
- [ ] Initialize Rust project with `Cargo.toml`
- [ ] Initialize Node.js docs project with `package.json`
- [ ] Create `.gitignore` (Python, Node, Rust patterns)
- [ ] Create initial `README.md` explaining the portfolio

### Acceptance Criteria

- [ ] Repo structure matches above
- [ ] Each language environment has a working `hello world` setup
- [ ] All 3 folders can be developed independently (no hard dependencies yet)

---

## 🐍 Phase 2: SDK & Runtime Implementation

### 2A. Python SDK Core

**Goal:** Create realistic mock LLM inference SDK with proper structure and docstrings.

#### Tasks

- [ ] **`sdk/nano_llm/config.py`**: Define configuration classes
  - `QuantizationType` (INT4, INT8, FP16, FP32)
  - `KVCacheConfig` (max_seq_len, cache_dtype)
  - `InferenceConfig` (batch_size, max_tokens, temperature)
  - Use Python 3.10+ dataclasses with type hints

- [ ] **`sdk/nano_llm/engine.py`**: Implement mock inference engine
  - Class `NanoLLMEngine` with methods:
    - `__init__(model_path, quantization, kv_cache_config)` — Initialize engine
    - `load_to_device(device_id)` → bool — Load model to mock hardware
    - `generate(prompt, config)` → str — Synchronous generation (mock output)
    - `generate_streaming(prompt, config)` → Generator[str] — Streaming generation
    - `unload()` → bool — Free hardware resources
    - `get_device_memory()` → dict — Mock device stats
  - Use **Google-style docstrings** (format that tools like `griffe` can parse)
  - Include type hints throughout
  - Mock hardware communication via environment variable `MOCK_RNGD_HARDWARE`

- [ ] **`sdk/nano_llm/errors.py`**: Define custom exceptions
  - `NanoLLMError` (base)
  - `DeviceNotFoundError`
  - `ModelLoadError`
  - `GenerationError`

- [ ] **`sdk/nano_llm/__init__.py`**: Export public API
  - `NanoLLMEngine`, `QuantizationType`, `KVCacheConfig`, `InferenceConfig`

- [ ] **`sdk/pyproject.toml`**: Package metadata
  - Package name: `nano-llm-engine`
  - Version: `1.0.0`
  - Python: `>=3.10`
  - Dependencies: `pydantic`, `typing-extensions` (minimal)
  - Dev dependencies: `pytest`, `pytest-cov`, `griffe`

- [ ] **`sdk/tests/test_engine.py`**: Unit tests
  - Test successful load/unload
  - Test generation (sync and streaming)
  - Test error handling (missing device, invalid model)
  - Test device memory stats
  - **All tests must pass** (used in CI)

#### Acceptance Criteria

- [ ] SDK is installable: `pip install ./sdk`
- [ ] All tests pass: `pytest sdk/tests/`
- [ ] Can import and use: `from nano_llm import NanoLLMEngine`
- [ ] Docstrings are parseable by `griffe`

---

### 2B. Rust Component with Python Binding

**Goal:** Add a small Rust module to show polyglot capability.

#### Tasks

- [ ] **`sdk-rs/Cargo.toml`**: Configure Rust project
  - Add `pyo3` for Python bindings
  - Version: `0.20.0` or latest stable

- [ ] **`sdk-rs/src/lib.rs`**: Implement mock hardware abstraction layer
  ```rust
  // Simple example: Device memory allocator for NPU cache
  #[pyclass]
  pub struct DeviceMemory {
      total_bytes: usize,
      used_bytes: usize,
  }
  
  #[pymethods]
  impl DeviceMemory {
      #[new]
      pub fn new(total_bytes: usize) -> Self { ... }
      
      pub fn allocate(&mut self, bytes: usize) -> PyResult<bool> { ... }
      pub fn free(&mut self, bytes: usize) -> PyResult<()> { ... }
      pub fn utilization(&self) -> f32 { ... }
  }
  ```

- [ ] **Create Python wrapper**: `sdk/nano_llm/device.py`
  - Import Rust binding via `nano_llm_rs` (or similar)
  - Wrap Rust functions in a Pythonic interface
  - Document how to use the Rust component

- [ ] **Update `sdk/pyproject.toml`**: Add Rust build
  - Use `maturin` or `setuptools-rust`
  - Build Rust extension during `pip install`

#### Acceptance Criteria

- [ ] Rust code compiles: `cargo build --release`
- [ ] Python binding works: `from nano_llm.device import DeviceMemory`
- [ ] Documented in SDK README

---

## 📚 Phase 3: Documentation Structure & Content

### 3A. Fumadocs Setup

**Goal:** Initialize Fumadocs site with proper configuration.

#### Tasks

- [ ] **`docs/package.json`**: Initialize Node project
  - Add Fumadocs: `fumadocs-core`, `fumadocs-mdx`
  - Add Next.js and dependencies
  - Add dev tools: `typescript`, `eslint`

- [ ] **`docs/fumadocs.config.ts`**: Configure Fumadocs
  - Set up docs root path: `./content/docs`
  - Enable multi-language: `locales: ['ko', 'en']`
  - Set default locale: `defaultLanguage: 'ko'`
  - Configure search

- [ ] **`docs/next.config.js`**: Next.js configuration
  - Enable MDX support
  - Configure static exports (optional, for simple deployment)

- [ ] **Create folder structure** under `docs/content/docs/`:
  ```
  docs/content/docs/
  ├── index.mdx
  ├── guides/
  │   ├── quickstart.mdx          # Korean original
  │   ├── quickstart.en.mdx       # English generated translation
  │   ├── concepts.mdx
  │   └── concepts.en.mdx
  ├── api/                        # Auto-generated during CI
  │   ├── engine.mdx
  │   └── engine.en.mdx
  ├── tutorials/
  │   ├── inference-pipeline.mdx
  │   └── inference-pipeline.en.mdx
  ├── migration/
  │   ├── v1-to-v2.mdx
  │   └── v1-to-v2.en.mdx
  ├── troubleshooting/
  │   ├── common-issues.mdx
  │   └── common-issues.en.mdx
  └── [v1.0.0]/                  # Created on release tag
      ├── guides/
      ├── api/
      └── tutorials/
  ```

#### Acceptance Criteria

- [ ] Fumadocs builds locally: `pnpm --prefix docs install && pnpm --prefix docs build`
- [ ] Local dev server works: `pnpm --prefix docs dev`
- [ ] Both languages accessible in navigation

---

### 3B. Documentation Content (Korean Authoring + EN Auto Translation)

**Goal:** Write high-quality Korean source docs and generate English docs via Google Translation API.

#### Tasks

**Guides (`guides/`):**
- [ ] **`quickstart.mdx` (Korean)** — Get a model running in 5 minutes
  - Import SDK
  - Create config
  - Load model
  - Run inference
  - Interpret output
  - ~500 words, include code blocks

- [ ] **`quickstart.en.mdx` (English)** — Generated in pipeline via Google Translation API

- [ ] **`concepts.mdx` (Korean)** — Explain LLM concepts
  - Quantization (INT4, INT8, FP16) and trade-offs
  - KV Cache memory management
  - Batch inference
  - Token prediction
  - ~1000 words, diagrams recommended

- [ ] **`concepts.en.mdx` (English)** — Generated in pipeline via Google Translation API

**Tutorials (`tutorials/`):**
- [ ] **`inference-pipeline.mdx` (Korean)** — Build complete inference pipeline
  - Load model with specific quantization
  - Configure KV cache
  - Run streaming inference
  - Handle errors gracefully
  - Measure latency
  - ~800 words, multiple code blocks (all will be tested)

- [ ] **`inference-pipeline.en.mdx` (English)** — Generated in pipeline via Google Translation API

**Migration (`migration/`):**
- [ ] **`v1-to-v2.mdx` (Korean)** — Migration guide (example: v1.0 → v2.0 API changes)
  - What changed (quantization config, method names)
  - Step-by-step migration
  - Troubleshooting
  - ~600 words

- [ ] **`v1-to-v2.en.mdx` (English)** — Generated in pipeline via Google Translation API

**Troubleshooting (`troubleshooting/`):**
- [ ] **`common-issues.mdx` (Korean)** — FAQ + debugging
  - Device not found error → solution
  - Out of memory → solution
  - Slow inference → solution
  - ~400 words

- [ ] **`common-issues.en.mdx` (English)** — Generated in pipeline via Google Translation API

#### Acceptance Criteria

- [ ] All `.mdx` files are valid Markdown + MDX syntax
- [ ] All code blocks are syntactically correct Python
- [ ] Korean originals are semantically preserved in generated English docs
- [ ] Fumadocs renders all pages without errors
- [ ] Total docs: ~4000 words (substantial, professional)

---

## 🤖 Phase 4: CI/CD Pipelines & Automation

### 4A. Automation Scripts

**Goal:** Build scripts that enable automated validation.

#### Tasks

- [ ] **`scripts/generate_api.py`** — Extract docstrings → MDX
  - Use `griffe` to parse Python docstrings
  - Extract: function name, signature, docstring, return type, exceptions
  - Generate MDX files in `docs/content/docs/api/`
  - Create both `.mdx` (Korean) and `.en.mdx` (English) from same source
  - Include example usage from docstrings

- [ ] **`scripts/translate_docs.py`** — Korean MDX → English MDX via Google Translation API
  - Parse Korean source docs (`*.mdx`, excluding `*.en.mdx`)
  - Translate only prose blocks (preserve code blocks, frontmatter keys, and MDX syntax)
  - Write paired English files as `*.en.mdx`
  - Read API key from `GOOGLE_TRANSLATE_API_KEY`
  - Use Google Cloud Translation API v3 (`projects/*/locations/*:translateText`)
  - Read project/location from `GOOGLE_TRANSLATE_PROJECT_ID` and `GOOGLE_TRANSLATE_LOCATION` (default: `global`)
  - Support idempotent re-run: only overwrite English file when content actually changed
  - Preserve technical terms from glossary list (e.g., `KV cache`, `quantization`, `batching`, `token`)
  - Protect untranslatable segments with placeholders before translation:
    - YAML frontmatter keys
    - fenced code blocks
    - inline code
    - MDX tags/components/import-export blocks
  - Restore placeholders after translation and validate resulting MDX syntax
  - Emit translation summary (files scanned/translated/skipped/failed)
  - Exit non-zero on translation failures

- [ ] **`scripts/validate_snippets.py`** — Execute code samples in docs
  - Parse all `.mdx` files for `python` code blocks
  - Extract code blocks
  - Execute each snippet with mock SDK environment
  - Capture output and errors
  - Report failures with line numbers
  - Use `phmdoctest` or custom runner

#### Acceptance Criteria

- [ ] `python scripts/generate_api.py` generates valid MDX
- [ ] Generated API docs are readable and complete
- [ ] `python scripts/translate_docs.py` generates valid English MDX from Korean source docs
- [ ] Translation preserves MDX structure without broken frontmatter/code/MDX tags
- [ ] Re-running translation without Korean changes produces no diff
- [ ] `python scripts/validate_snippets.py` executes all samples successfully
- [ ] Scripts exit with code 0 on success, non-zero on failure (for CI)

---

### 4B. GitHub Actions Workflows

**Goal:** Set up automated validation on every commit and release.

#### Tasks

**`.github/workflows/docs-ci.yml`** — Daily validation pipeline
- [ ] Trigger: `push` to `main`, `pull_request` to `main`
- [ ] Jobs:
  1. **Lint & Type Check** (Python)
     - `ruff check sdk/`
     - `mypy sdk/` (optional but nice)
  2. **Run Unit Tests** (Python)
     - `pytest sdk/tests/ -v --cov`
  3. **Generate API Reference** (Python)
     - `python scripts/generate_api.py`
     - Verify `.mdx` files created
  4. **Generate English Docs** (Python)
     - Set `GOOGLE_TRANSLATE_API_KEY` from GitHub Secrets
     - Set `GOOGLE_TRANSLATE_PROJECT_ID` and optional `GOOGLE_TRANSLATE_LOCATION`
     - `python scripts/translate_docs.py`
     - Verify `*.en.mdx` files are generated/updated
     - Fail job if translated output breaks MDX parse check
  5. **Validate Code Snippets** (Python)
     - Set `MOCK_RNGD_HARDWARE=true`
     - `python scripts/validate_snippets.py`
     - All samples must execute without error
  6. **Build Fumadocs** (Node.js)
     - `pnpm --prefix docs install`
     - `pnpm --prefix docs build`
  7. **Link Checker**
     - Use `lycheeverse/lychee-action@v1.9.0`
     - Check all internal links in built HTML
     - Fail on broken links

**`.github/workflows/docs-release.yml`** — Version freeze on release
- [ ] Trigger: `push` with tag matching `v*.*.*`
- [ ] Jobs:
  1. **Create Version Snapshot**
     - Extract version from tag (e.g., `v1.0.0`)
     - Create `docs/content/docs/[v1.0.0]/` directory
     - Copy current `guides/`, `api/`, `tutorials/` into it
     - Commit and push (or create release assets)
  2. **Build & Deploy**
     - `pnpm --prefix docs build`
     - (Optional: Deploy to GitHub Pages or Vercel, but not required per your scope)

#### Acceptance Criteria

- [ ] Both workflow files are syntactically valid YAML
- [ ] Workflows reference correct paths (relative to repo root)
- [ ] All environment variables are defined
- [ ] Workflows can be triggered manually (for testing)
- [ ] Workflows pass when code is valid
- [ ] Workflows fail (and report errors) when code is invalid

---

### 4C. `translate_docs.py` Contract (Implementation Spec)

**Purpose:** Deterministic Korean-to-English MDX generation for CI-safe docs builds.

#### Input Contract

- Source root: `docs/content/docs/`
- Include: `**/*.mdx`
- Exclude:
  - `**/*.en.mdx`
  - `docs/content/docs/[v*]/**` (frozen versions)
- Required env:
  - `GOOGLE_TRANSLATE_API_KEY`
  - `GOOGLE_TRANSLATE_PROJECT_ID`
- Optional env:
  - `GOOGLE_TRANSLATE_LOCATION` (default: `global`)
  - `GOOGLE_TRANSLATE_GLOSSARY` (comma-separated terms, optional)

#### Output Contract

- Output path rule:
  - `foo.mdx` -> `foo.en.mdx`
- Preserve original line endings and UTF-8 encoding
- Preserve these segments exactly (byte-for-byte):
  - fenced code blocks
  - inline code spans
  - frontmatter keys
  - MDX tags/components/import/export blocks
- Translate these segments only:
  - prose text in headings, paragraphs, list items, table cells, blockquotes
  - frontmatter values for `title`, `description`, `sidebarTitle`

#### Runtime Behavior

- Idempotent mode:
  - If translated output is identical to existing `*.en.mdx`, do not rewrite file
- Retry policy:
  - API call retry up to 3 times for transient HTTP/network errors
- Rate limiting:
  - Bounded concurrency (e.g., max 4 files in flight)
- Logging summary (stdout):
  - `scanned`, `translated`, `updated`, `unchanged`, `failed`, `duration_sec`

#### Exit Codes

- `0`: success (including unchanged)
- `2`: configuration error (missing env, invalid path)
- `3`: translation API failure
- `4`: post-processing validation failure (placeholder mismatch / broken MDX)

#### Validation Gates

- Placeholder integrity check must pass (all placeholders restored)
- Output MDX sanity check must pass (frontmatter balanced, fence pairs balanced)
- On failure, print file path + reason + nearest line hint

---

### 4D. `docs-ci.yml` Executable Skeleton

Use this as the initial workflow baseline:

```yaml
name: Docs CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  docs-validation:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Install Python dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -e ./sdk
          pip install pytest pytest-cov ruff mypy griffe requests pyyaml

      - name: Lint & type check
        run: |
          ruff check sdk/
          mypy sdk/ || true

      - name: Run unit tests
        run: pytest sdk/tests/ -v --cov

      - name: Generate API reference
        run: python scripts/generate_api.py

      - name: Generate English docs
        env:
          GOOGLE_TRANSLATE_API_KEY: ${{ secrets.GOOGLE_TRANSLATE_API_KEY }}
          GOOGLE_TRANSLATE_PROJECT_ID: ${{ secrets.GOOGLE_TRANSLATE_PROJECT_ID }}
          GOOGLE_TRANSLATE_LOCATION: ${{ vars.GOOGLE_TRANSLATE_LOCATION }}
        run: python scripts/translate_docs.py

      - name: Validate snippets against mock SDK
        env:
          MOCK_RNGD_HARDWARE: "true"
        run: python scripts/validate_snippets.py

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: pnpm
          cache-dependency-path: docs/pnpm-lock.yaml

      - name: Build docs site
        run: |
          pnpm --prefix docs install --frozen-lockfile
          pnpm --prefix docs build

      - name: Link check
        uses: lycheeverse/lychee-action@v2
        with:
          fail: true
          args: >-
            --no-progress
            --verbose
            docs/.next/**/*.html
```

---

## 📋 Implementation Checklist

### Phase 1 (Foundation)
- [ ] GitHub repo initialized
- [ ] Folder structure created
- [ ] `.gitignore` configured
- [ ] `README.md` written (project overview)
- [ ] `CONTRIBUTING.md` written (how to contribute docs)

### Phase 2 (SDK & Runtime)
- [ ] Python SDK core complete
  - [ ] `config.py` with dataclasses
  - [ ] `engine.py` with mock logic
  - [ ] `errors.py` with exceptions
  - [ ] `__init__.py` with exports
  - [ ] `pyproject.toml` with metadata
  - [ ] `tests/` with passing tests
- [ ] Rust component complete
  - [ ] `lib.rs` with PyO3 bindings
  - [ ] `Cargo.toml` configured
  - [ ] Python wrapper in `nano_llm/device.py`
  - [ ] Tests passing
- [ ] SDK installable and importable

### Phase 3 (Documentation)
- [ ] Fumadocs configured and running
- [ ] Korean source documentation authored
- [ ] English documentation auto-generated via Google Translation API
- [ ] All code blocks in docs are valid Python
- [ ] Fumadocs builds and renders without errors

### Phase 4 (Automation)
- [ ] `generate_api.py` working
- [ ] `translate_docs.py` working
- [ ] `validate_snippets.py` working
- [ ] `docs-ci.yml` workflow created and tested
- [ ] `docs-release.yml` workflow created and tested
- [ ] All workflows pass in CI

---

## 🎓 Key Documentation to Write

Beyond code, document these in `README.md` and `CONTRIBUTING.md`:

- **Pipeline Architecture**: How each piece connects
- **Local Development Setup**: How to run everything locally
- **Running CI Workflows Locally**: Using `act` or manual commands
- **How to Add Docs**: Bilingual content guidelines
- **How to Release**: Step-by-step version release process
- **Deployment Notes**: (minimal, since not in scope)

---

## 📌 Critical Success Factors

1. **Code samples in docs must all execute successfully** — This is your proof that docs stay in sync
2. **Korean source docs must be professionally written** — Clear, accurate source quality is mandatory for high-quality translation output
3. **API documentation must be auto-generated, not hand-written** — Proves automation works
4. **Version snapshot process must be atomic** — One Git tag = one immutable doc version
5. **CI pipeline must fail visibly** — Broken code blocks must fail the build

6. **Translation pipeline must preserve MDX structure** — Google Translation must not break frontmatter, code blocks, or MDX syntax

---

## 🚀 Next Steps

1. **Confirm this plan** — Any changes before we start?
2. **Choose implementation order** — Sequential phases or start multiple in parallel?
3. **Set up local development environment** — Python venv, Node.js, Rust
4. **Begin Phase 1** — Repository initialization

---

## 📝 Notes

- **Time estimate**: 40-60 hours total (depending on writing quality and iteration)
- **Focus on quality over quantity**: Better 3 well-written guides than 10 half-baked ones
- **Reviewability**: This portfolio will be read by engineers who know Furiosa's stack, so accuracy matters
- **Narrative**: Your portfolio repo's structure and README should tell the story of why each piece exists

