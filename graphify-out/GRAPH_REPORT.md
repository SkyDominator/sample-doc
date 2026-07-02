# Graph Report - /Users/raykim/Documents/sample-doc  (2026-07-02)

## Corpus Check
- 85 files · ~30,974 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 864 nodes · 1428 edges · 61 communities (53 shown, 8 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 53 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Docs site app|Docs site app]]
- [[_COMMUNITY_API generation script|API generation script]]
- [[_COMMUNITY_RayKim SDK core|RayKim SDK core]]
- [[_COMMUNITY_Project concept map|Project concept map]]
- [[_COMMUNITY_Nano SDK core|Nano SDK core]]
- [[_COMMUNITY_Playground runtime UI|Playground runtime UI]]
- [[_COMMUNITY_Docs UI architecture|Docs UI architecture]]
- [[_COMMUNITY_Docs package dependencies|Docs package dependencies]]
- [[_COMMUNITY_API and changes docs|API and changes docs]]
- [[_COMMUNITY_Docs pipeline planning|Docs pipeline planning]]
- [[_COMMUNITY_TypeScript docs config|TypeScript docs config]]
- [[_COMMUNITY_Scenario schema cases|Scenario schema cases]]
- [[_COMMUNITY_Scenario schema fields|Scenario schema fields]]
- [[_COMMUNITY_Nano SDK features|Nano SDK features]]
- [[_COMMUNITY_Docs translation script|Docs translation script]]
- [[_COMMUNITY_Troubleshooting guides|Troubleshooting guides]]
- [[_COMMUNITY_Inference tutorial docs|Inference tutorial docs]]
- [[_COMMUNITY_Sync playground scenario|Sync playground scenario]]
- [[_COMMUNITY_Migration guide docs|Migration guide docs]]
- [[_COMMUNITY_Scenario validity schema|Scenario validity schema]]
- [[_COMMUNITY_Docs workflow concepts|Docs workflow concepts]]
- [[_COMMUNITY_Docs automation stack|Docs automation stack]]
- [[_COMMUNITY_Playground validation script|Playground validation script]]
- [[_COMMUNITY_Output expectation schema|Output expectation schema]]
- [[_COMMUNITY_Rust Python bindings|Rust Python bindings]]
- [[_COMMUNITY_Rust memory wrapper|Rust memory wrapper]]
- [[_COMMUNITY_Scenario metadata schema|Scenario metadata schema]]
- [[_COMMUNITY_Snippet validation flow|Snippet validation flow]]
- [[_COMMUNITY_Exception schema defs|Exception schema defs]]
- [[_COMMUNITY_Locked output schema|Locked output schema]]
- [[_COMMUNITY_MDX docs stack|MDX docs stack]]
- [[_COMMUNITY_Scenario schema root|Scenario schema root]]
- [[_COMMUNITY_Exception message schema|Exception message schema]]
- [[_COMMUNITY_SDK README docs|SDK README docs]]
- [[_COMMUNITY_Scenario explanations schema|Scenario explanations schema]]
- [[_COMMUNITY_Scenario cases schema|Scenario cases schema]]
- [[_COMMUNITY_Scenario control schema|Scenario control schema]]
- [[_COMMUNITY_Snippet extraction script|Snippet extraction script]]
- [[_COMMUNITY_Release notes docs|Release notes docs]]
- [[_COMMUNITY_Next.js MDX config|Next.js MDX config]]
- [[_COMMUNITY_Scenario id schema|Scenario id schema]]
- [[_COMMUNITY_Length limit schema|Length limit schema]]
- [[_COMMUNITY_Allowed values schema|Allowed values schema]]
- [[_COMMUNITY_Scenario page schema|Scenario page schema]]
- [[_COMMUNITY_Scenario runtime schema|Scenario runtime schema]]
- [[_COMMUNITY_Scenario template schema|Scenario template schema]]
- [[_COMMUNITY_Scenario title schema|Scenario title schema]]
- [[_COMMUNITY_Migration section docs|Migration section docs]]
- [[_COMMUNITY_Troubleshooting section docs|Troubleshooting section docs]]
- [[_COMMUNITY_Generic typing node|Generic typing node]]
- [[_COMMUNITY_Device memory abstraction|Device memory abstraction]]
- [[_COMMUNITY_MDX component hook|MDX component hook]]
- [[_COMMUNITY_Locale home page|Locale home page]]
- [[_COMMUNITY_Python package metadata|Python package metadata]]
- [[_COMMUNITY_Shadcn UI library|Shadcn UI library]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 30 edges
2. `RayKimLLMEngine` - 20 edges
3. `compilerOptions` - 17 edges
4. `isValidDocLocale()` - 15 edges
5. `_build_page_doc()` - 14 edges
6. `NanoLLMEngine` - 13 edges
7. `_build_callable_doc()` - 12 edges
8. `_select_subject()` - 11 edges
9. `_related_types()` - 11 edges
10. `getDocsHref()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Mock LLM SDK docs portfolio` --semantically_similar_to--> `Mock Python SDK plus docs automation overview`  [INFERRED] [semantically similar]
  .agent/plan/portfolio_plan.md → README.md
- `Tag-driven version snapshot release process` --conceptually_related_to--> `Docs Release workflow`  [AMBIGUOUS]
  .agent/plan/portfolio_plan.md → .github/workflows/docs-release.yml
- `Rust-backed Device Memory Helper` --semantically_similar_to--> `Mock Device Memory Helper`  [INFERRED] [semantically similar]
  sdk/README_SDK.md → sdk-rs/README.md
- `pnpm build allowlist for esbuild and sharp` --conceptually_related_to--> `Docs CI workflow`  [INFERRED]
  docs/pnpm-workspace.yaml → .github/workflows/docs-ci.yml
- `pnpm build allowlist for esbuild and sharp` --conceptually_related_to--> `Docs Release workflow`  [INFERRED]
  docs/pnpm-workspace.yaml → .github/workflows/docs-release.yml

## Import Cycles
- 1-file cycle: `docs/lib/source.js -> docs/lib/source.js`
- 1-file cycle: `docs/components/mdx.js -> docs/components/mdx.js`

## Hyperedges (group relationships)
- **Docs-as-Code Portfolio System** — _agent_plan_portfolio_plan_document, _github_workflows_docs_ci_workflow, _github_workflows_docs_release_workflow, contributing_document, readme_document [INFERRED 0.85]
- **Bilingual Documentation Corpus** — docs_content_docs_api_engine_en_document, docs_content_docs_api_engine_document, docs_content_docs_changes_code_block_refresh_en_document, docs_content_docs_changes_code_block_refresh_document, docs_content_docs_changes_locale_entrypoints_en_document, docs_content_docs_changes_locale_entrypoints_document, docs_content_docs_changes_sidebar_and_shell_en_document, docs_content_docs_changes_sidebar_and_shell_document, docs_content_docs_guides_concepts_en_document, docs_content_docs_guides_concepts_document, docs_content_docs_guides_quickstart_en_document, docs_content_docs_guides_quickstart_document, docs_content_docs_index_en_document, docs_content_docs_index_document [INFERRED 0.95]
- **Runtime Control Surface** — docs_content_docs_api_engine_en_raykimllmengine, docs_content_docs_guides_quickstart_en_mock_rngd_hardware, docs_content_docs_guides_concepts_en_quantization, docs_content_docs_guides_concepts_en_kv_cache, docs_content_docs_guides_concepts_en_batched_inference, docs_content_docs_guides_concepts_en_device_memory, docs_content_docs_changes_code_block_refresh_en_output_contract, docs_content_docs_changes_locale_entrypoints_en_configuration_split, docs_content_docs_changes_sidebar_and_shell_en_session_memory_telemetry [INFERRED 0.85]
- **v2 Configuration Flow** — docs_content_docs_migration_v1_to_v2_en_configuration_separation_pattern, docs_content_docs_migration_v1_to_v2_en_raykimllmengine, docs_content_docs_migration_v1_to_v2_en_kvcacheconfig, docs_content_docs_migration_v1_to_v2_en_inferenceconfig, docs_content_docs_migration_v1_to_v2_en_sync_stream_config_reuse [EXTRACTED 1.00]
- **Troubleshooting Symptom Clusters** — docs_content_docs_troubleshooting_common_issues_en_devicenotfounderror, docs_content_docs_troubleshooting_common_issues_en_generationerror, docs_content_docs_troubleshooting_common_issues_en_devicememory, docs_content_docs_troubleshooting_common_issues_en_get_device_memory, docs_content_docs_troubleshooting_common_issues_en_output_prefix_contract, docs_content_docs_troubleshooting_common_issues_en_whitespace_streaming_contract [EXTRACTED 1.00]
- **Inference Request Lifecycle** — docs_content_docs_tutorials_inference_pipeline_en_guided_runtime_session, docs_content_docs_tutorials_inference_pipeline_en_generate, docs_content_docs_tutorials_inference_pipeline_en_generate_streaming, docs_content_docs_tutorials_inference_pipeline_en_get_device_memory, docs_content_docs_tutorials_inference_pipeline_en_unload_sequence [EXTRACTED 1.00]

## Communities (61 total, 8 thin omitted)

### Community 0 - "Docs site app"
Cohesion: 0.05
Nodes (66): DocsLayout(), DEFAULT_METADATA, DocsPage(), findNeighbors(), generateMetadata(), LocaleLayout(), LocaleHomePage(), metadata (+58 more)

### Community 1 - "API generation script"
Cohesion: 0.08
Nodes (77): Namespace, _annotation_tokens(), ApiSubject, ApiTarget, _auto_discover_targets(), _best_callable_example(), _build_callable_doc(), _build_package_context() (+69 more)

### Community 2 - "RayKim SDK core"
Cohesion: 0.05
Nodes (34): { docs, meta }, docs, QuantizationType, InferenceConfig, KVCacheConfig, 엔진에 부착되는 KV cache 설정 객체입니다.      Args:         max_seq_len: cache 할당이 감당한다고 가정하는, mock 생성 요청마다 전달하는 설정 객체입니다.      Args:         batch_size: 한 번의 mock 요청에서 함께 처리할, DeviceMemory (+26 more)

### Community 3 - "Project concept map"
Cohesion: 0.06
Nodes (49): API Documentation Generation, API Reference, Batched Inference, GitHub Actions CI/CD, Configuration Object Split, Configuration Split (Process/Engine/Request), Contributing Guidelines, Core Concepts (+41 more)

### Community 4 - "Nano SDK core"
Cohesion: 0.07
Nodes (24): InferenceConfig, KVCacheConfig, mock 생성 요청마다 전달하는 설정 객체입니다.      Args:         batch_size: 한 번의 mock 요청에서 함께 처리할, 엔진에 부착되는 KV cache 설정 객체입니다.      Args:         max_seq_len: cache 할당이 감당한다고 가정하는, DeviceMemory, _PythonDeviceMemory, Rust 구현이 있으면 이를 사용하고, 없으면 Python 구현으로 폴백하는 장치 메모리 래퍼입니다., 독립적인 메모리 풀을 가정하는 장치 메모리 추상화입니다.      Args:         total_bytes: 래퍼가 노출할 전체 장치 메모 (+16 more)

### Community 5 - "Playground runtime UI"
Cohesion: 0.06
Nodes (28): collapseBooleanBranches(), ControlInput(), highlightPython(), Playground(), PLAYGROUND_UI, PYTHON_TOKEN_CLASS, resolveLocale(), resolveTemplate() (+20 more)

### Community 6 - "Docs UI architecture"
Cohesion: 0.08
Nodes (37): Engine API Reference, API Reference Section, Badge UI Component, Button UI Component, Callout UI Component, Card UI Component, Command/Dialog UI Component, Docs Command Menu (Search) (+29 more)

### Community 7 - "Docs package dependencies"
Cohesion: 0.05
Nodes (36): dependencies, class-variance-authority, clsx, cmdk, fumadocs-core, fumadocs-mdx, fumadocs-ui, lucide-react (+28 more)

### Community 8 - "API and changes docs"
Cohesion: 0.23
Nodes (23): API 레퍼런스: RayKimLLMEngine (KO), API Reference: RayKimLLMEngine (EN), RayKimLLMEngine, 생성 출력 메타데이터 추가 (KO), Generation output metadata added (EN), Shared output contract for synchronous and streaming generation, 명시적 설정 객체 분리 (KO), Configuration responsibilities are separated across environment, engine, and request layers (+15 more)

### Community 9 - "Docs pipeline planning"
Cohesion: 0.17
Nodes (22): Documentation treated as a continuously validated artifact, Portfolio Project Plan: RayKimLLM Docs-as-Code Pipeline, Mock LLM SDK docs portfolio, Bilingual Korean-to-English documentation pipeline, Tag-driven version snapshot release process, Initial portfolio strategy prompt, Fumadocs-based MDX documentation site, Mock LLM acceleration SDK and hardware simulation pipeline (+14 more)

### Community 10 - "TypeScript docs config"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 11 - "Scenario schema cases"
Cohesion: 0.11
Nodes (20): additionalProperties, description, minItems, type, validCase, $ref, properties, description (+12 more)

### Community 12 - "Scenario schema fields"
Cohesion: 0.11
Nodes (18): properties, description, description, type, description, type, description, type (+10 more)

### Community 13 - "Nano SDK features"
Cohesion: 0.15
Nodes (17): Batch Processing Feature, Configuration Management, Device Memory Statistics Feature, generate() Method, generate_streaming() Method, GenerationError Exception, get_device_memory() Method, InferenceConfig Dataclass (+9 more)

### Community 14 - "Docs translation script"
Cohesion: 0.24
Nodes (16): Exception, _extract_frontmatter(), _google_translate_api_call_factory(), _is_in_frozen_version(), _is_mock_mode(), _load_dotenv(), main(), OutputValidationError (+8 more)

### Community 15 - "Troubleshooting guides"
Cohesion: 0.17
Nodes (16): 공통 문제 해결, DeviceMemory, DeviceNotFoundError, Common Issues, DeviceMemory, DeviceNotFoundError, GenerationError, get_device_memory (+8 more)

### Community 16 - "Inference tutorial docs"
Cohesion: 0.18
Nodes (16): DeviceMemory, DeviceNotFoundError, DeviceMemory, DeviceNotFoundError, generate, generate_streaming, get_device_memory, Guided Runtime Session (+8 more)

### Community 17 - "Sync playground scenario"
Cohesion: 0.12
Nodes (15): cases, invalid, valid, controls, explanations, DeviceNotFoundError, ValueError, id (+7 more)

### Community 18 - "Migration guide docs"
Cohesion: 0.26
Nodes (14): 엔진/요청 설정 분리 패턴, DeviceNotFoundError, Configuration Separation Pattern, DeviceNotFoundError, InferenceConfig, KVCacheConfig, RayKimLLMEngine, Shared Request Configuration (+6 more)

### Community 19 - "Scenario validity schema"
Cohesion: 0.17
Nodes (13): properties, items, description, items, minItems, type, $ref, invalid (+5 more)

### Community 20 - "Docs workflow concepts"
Cohesion: 0.22
Nodes (13): docs-release.yml GitHub Actions Workflow, YAML Frontmatter Metadata, Google Cloud Translation API, Guides Documentation, Portfolio Initialization Prompt, MDX Format, Migration Guide Documentation, nano-llm-engine Portfolio Project (+5 more)

### Community 21 - "Docs automation stack"
Cohesion: 0.18
Nodes (12): API Reference Documentation, Automated API Reference Generation, docs-ci.yml GitHub Actions Workflow, generate_api.py Script, Google-style Docstring Convention, griffe Docstring Parser, Hardware-in-the-Loop Validation, Internationalization (i18n) System (+4 more)

### Community 22 - "Playground validation script"
Cohesion: 0.38
Nodes (11): _add_sdk_to_path(), _check_invalid_case(), _check_valid_case(), _is_within_limits(), _isolated_mock_hardware(), main(), Any, Exception (+3 more)

### Community 23 - "Output expectation schema"
Cohesion: 0.18
Nodes (11): outputExpectation, const, description, additionalProperties, properties, required, type, kind (+3 more)

### Community 24 - "Rust Python bindings"
Cohesion: 0.22
Nodes (6): PyModule, PyResult, Python, DeviceMemory, raykim_llm_rs(), Self

### Community 25 - "Rust memory wrapper"
Cohesion: 0.22
Nodes (9): allocate() Method, Cargo.toml Configuration, DeviceMemory Wrapper, free() Method, PyO3 Python-Rust Binding, DeviceMemory Rust Class, Rust PyO3 Extension, setuptools-rust Build Tool (+1 more)

### Community 26 - "Scenario metadata schema"
Cohesion: 0.20
Nodes (10): description, type, properties, note, $schema, summary, description, type (+2 more)

### Community 27 - "Snippet validation flow"
Cohesion: 0.22
Nodes (9): Code Snippet Execution Validation, DeviceNotFoundError Exception, Error Handling System, errors Module, load_to_device() Method, MOCK_RNGD_HARDWARE Environment Variable, NanoLLMError Exception, Process-level Configuration (+1 more)

### Community 28 - "Exception schema defs"
Cohesion: 0.22
Nodes (9): $defs, exceptionExpectation, invalidCase, additionalProperties, required, type, additionalProperties, required (+1 more)

### Community 29 - "Locked output schema"
Cohesion: 0.22
Nodes (9): type, description, items, type, locked, stdout_contains, description, items (+1 more)

### Community 30 - "MDX docs stack"
Cohesion: 0.25
Nodes (9): Fumadocs Documentation Framework, fumadocs.config.ts Configuration, MDX Code Block Component, MDX Rendering Engine, MDX Compilation to HTML, Next.js Framework, package.json Configuration, source.config.ts Configuration (+1 more)

### Community 31 - "Scenario schema root"
Cohesion: 0.25
Nodes (7): additionalProperties, description, $id, required, $schema, title, type

### Community 32 - "Exception message schema"
Cohesion: 0.25
Nodes (8): properties, description, type, message_contains, type, description, enum, type

### Community 33 - "SDK README docs"
Cohesion: 0.32
Nodes (8): Generation APIs, Mock Hardware Lifecycle, RayKimLLM SDK, RayKimLLM SDK README, Rust-backed Device Memory Helper, Mock Device Memory Helper, raykim_llm_rs, raykim_llm_rs README

### Community 34 - "Scenario explanations schema"
Cohesion: 0.40
Nodes (5): type, additionalProperties, description, type, explanations

### Community 35 - "Scenario cases schema"
Cohesion: 0.40
Nodes (5): additionalProperties, description, required, type, cases

### Community 36 - "Scenario control schema"
Cohesion: 0.40
Nodes (5): additionalProperties, allOf, required, type, control

### Community 37 - "Snippet extraction script"
Cohesion: 0.70
Nodes (4): _exec_snippet(), _extract_python_snippets(), main(), Path

### Community 38 - "Release notes docs"
Cohesion: 0.50
Nodes (4): Code Block Refresh Release Note, Locale Entrypoints Release Note, Changes/Release Notes Section, Sidebar and Shell Release Note

### Community 39 - "Next.js MDX config"
Cohesion: 0.50
Nodes (3): { createMDX }, nextConfig, withMDX

### Community 40 - "Scenario id schema"
Cohesion: 0.50
Nodes (4): description, pattern, type, id

### Community 41 - "Length limit schema"
Cohesion: 0.50
Nodes (4): description, minimum, type, max_length

### Community 42 - "Allowed values schema"
Cohesion: 0.50
Nodes (4): values, description, minItems, type

### Community 43 - "Scenario page schema"
Cohesion: 0.67
Nodes (3): description, type, page

### Community 44 - "Scenario runtime schema"
Cohesion: 0.67
Nodes (3): runtime, const, description

### Community 45 - "Scenario template schema"
Cohesion: 0.67
Nodes (3): template, description, type

### Community 46 - "Scenario title schema"
Cohesion: 0.67
Nodes (3): title, description, type

## Ambiguous Edges - Review These
- `Tag-driven version snapshot release process` → `Docs Release workflow`  [AMBIGUOUS]
  .agent/plan/portfolio_plan.md · relation: conceptually_related_to

## Knowledge Gaps
- **194 isolated node(s):** `DEFAULT_METADATA`, `metadata`, `LANDING_COPY`, `PLAYGROUND_UI`, `PYTHON_TOKEN_CLASS` (+189 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Tag-driven version snapshot release process` and `Docs Release workflow`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `RayKimLLMError` connect `RayKim SDK core` to `Docs translation script`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `RayKimLLMEngine` (e.g. with `InferenceConfig` and `KVCacheConfig`) actually correct?**
  _`RayKimLLMEngine` has 11 INFERRED edges - model-reasoned connections that need verification._
- **What connects `엔진에 부착되는 KV cache 설정 객체입니다.      Args:         max_seq_len: cache 할당이 감당한다고 가정하는`, `mock 생성 요청마다 전달하는 설정 객체입니다.      Args:         batch_size: 한 번의 mock 요청에서 함께 처리할`, `Rust 구현이 있으면 이를 사용하고, 없으면 Python 구현으로 폴백하는 장치 메모리 래퍼입니다.` to the rest of the system?**
  _226 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Docs site app` be split into smaller, more focused modules?**
  _Cohesion score 0.050917336631622345 - nodes in this community are weakly interconnected._
- **Should `API generation script` be split into smaller, more focused modules?**
  _Cohesion score 0.08291708291708291 - nodes in this community are weakly interconnected._
- **Should `RayKim SDK core` be split into smaller, more focused modules?**
  _Cohesion score 0.054354178842782 - nodes in this community are weakly interconnected._