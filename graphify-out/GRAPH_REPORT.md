# Graph Report - /Users/raykim/Documents/sample-doc  (2026-06-29)

## Corpus Check
- Corpus is ~25,588 words - fits in a single context window. You may not need a graph.

## Summary
- 506 nodes · 947 edges · 30 communities (23 shown, 7 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 29|Community 29]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 27 edges
2. `NanoLLMEngine` - 20 edges
3. `compilerOptions` - 17 edges
4. `_build_page_doc()` - 17 edges
5. `isValidDocLocale()` - 15 edges
6. `_build_callable_doc()` - 12 edges
7. `ApiTarget` - 11 edges
8. `_select_subject()` - 11 edges
9. `_related_types()` - 11 edges
10. `_render_function_page()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `test_device_memory_stats()` --calls--> `NanoLLMEngine`  [INFERRED]
  sdk/tests/test_engine.py → sdk/nano_llm/engine.py
- `test_generate_requires_loaded_engine()` --calls--> `NanoLLMEngine`  [INFERRED]
  sdk/tests/test_engine.py → sdk/nano_llm/engine.py
- `test_load_requires_mock_env()` --calls--> `NanoLLMEngine`  [INFERRED]
  sdk/tests/test_engine.py → sdk/nano_llm/engine.py
- `test_unload()` --calls--> `NanoLLMEngine`  [INFERRED]
  sdk/tests/test_engine.py → sdk/nano_llm/engine.py
- `generateMetadata()` --calls--> `isValidDocLocale()`  [EXTRACTED]
  docs/app/[lang]/docs/[[...slug]]/page.js → docs/lib/docs.js

## Import Cycles
- 1-file cycle: `docs/lib/source.js -> docs/lib/source.js`
- 1-file cycle: `docs/components/mdx.js -> docs/components/mdx.js`

## Hyperedges (group relationships)
- **** —  [INFERRED]
- **** —  [INFERRED]
- **** —  [INFERRED]
- **** —  [INFERRED]
- **** —  [INFERRED]
- **** —  [INFERRED]
- **** —  [INFERRED]
- **** —  [INFERRED]
- **** —  [INFERRED]
- **** —  [INFERRED]
- **** —  [INFERRED]
- **** —  [INFERRED]
- **** —  [INFERRED]
- **** —  [INFERRED]
- **** —  [INFERRED]
- **** —  [INFERRED]

## Communities (30 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.00
Nodes (65): DocsLayout(), DEFAULT_METADATA, DocsPage(), findNeighbors(), generateMetadata(), LocaleLayout(), LocaleHomePage(), metadata (+57 more)

### Community 1 - "Community 1"
Cohesion: 0.00
Nodes (79): Any, Namespace, _annotation_tokens(), ApiSubject, ApiTarget, _auto_discover_targets(), _best_callable_example(), _best_quickstart() (+71 more)

### Community 2 - "Community 2"
Cohesion: 0.00
Nodes (49): API Documentation Generation, API Reference, Batched Inference, GitHub Actions CI/CD, Configuration Object Split, Configuration Split (Process/Engine/Request), Contributing Guidelines, Core Concepts (+41 more)

### Community 3 - "Community 3"
Cohesion: 0.00
Nodes (27): { docs, meta }, docs, QuantizationType, InferenceConfig, KVCacheConfig, mock 생성 요청마다 전달하는 설정 객체입니다.      Args:         batch_size: 한 번의 mock 요청에서 함께 처리할, 엔진에 부착되는 KV cache 설정 객체입니다.      Args:         max_seq_len: cache 할당이 감당한다고 가정하는, NanoLLMEngine (+19 more)

### Community 4 - "Community 4"
Cohesion: 0.00
Nodes (37): Engine API Reference, API Reference Section, Badge UI Component, Button UI Component, Callout UI Component, Card UI Component, Command/Dialog UI Component, Docs Command Menu (Search) (+29 more)

### Community 5 - "Community 5"
Cohesion: 0.00
Nodes (36): dependencies, class-variance-authority, clsx, cmdk, fumadocs-core, fumadocs-mdx, fumadocs-ui, lucide-react (+28 more)

### Community 6 - "Community 6"
Cohesion: 0.00
Nodes (20): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 7 - "Community 7"
Cohesion: 0.00
Nodes (17): Batch Processing Feature, Configuration Management, Device Memory Statistics Feature, generate() Method, generate_streaming() Method, GenerationError Exception, get_device_memory() Method, InferenceConfig Dataclass (+9 more)

### Community 8 - "Community 8"
Cohesion: 0.00
Nodes (16): Exception, _extract_frontmatter(), _google_translate_api_call_factory(), _is_in_frozen_version(), _is_mock_mode(), _load_dotenv(), main(), OutputValidationError (+8 more)

### Community 9 - "Community 9"
Cohesion: 0.00
Nodes (7): DeviceMemory, _PythonDeviceMemory, Rust 구현이 있으면 이를 사용하고, 없으면 Python 구현으로 폴백하는 장치 메모리 래퍼입니다., 독립적인 메모리 풀을 가정하는 장치 메모리 추상화입니다.      Args:         total_bytes: 래퍼가 노출할 전체 장치 메모, 장치 메모리 풀에서 바이트를 예약합니다.          Args:             bytes_size: 예약할 바이트 수입니다., 이전에 예약한 바이트를 해제합니다.          Args:             bytes_size: 해제할 바이트 수입니다., 현재 메모리 사용률을 반환합니다.          Returns:             `0.0`~`1.0` 범위의 사용률을 반환합니다.

### Community 10 - "Community 10"
Cohesion: 0.00
Nodes (13): docs-release.yml GitHub Actions Workflow, YAML Frontmatter Metadata, Google Cloud Translation API, Guides Documentation, Portfolio Initialization Prompt, MDX Format, Migration Guide Documentation, nano-llm-engine Portfolio Project (+5 more)

### Community 11 - "Community 11"
Cohesion: 0.00
Nodes (12): API Reference Documentation, Automated API Reference Generation, docs-ci.yml GitHub Actions Workflow, generate_api.py Script, Google-style Docstring Convention, griffe Docstring Parser, Hardware-in-the-Loop Validation, Internationalization (i18n) System (+4 more)

### Community 12 - "Community 12"
Cohesion: 0.00
Nodes (6): PyModule, PyResult, Python, DeviceMemory, nano_llm_rs(), Self

### Community 13 - "Community 13"
Cohesion: 0.00
Nodes (9): allocate() Method, Cargo.toml Configuration, DeviceMemory Wrapper, free() Method, PyO3 Python-Rust Binding, DeviceMemory Rust Class, Rust PyO3 Extension, setuptools-rust Build Tool (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.00
Nodes (9): Code Snippet Execution Validation, DeviceNotFoundError Exception, Error Handling System, errors Module, load_to_device() Method, MOCK_RNGD_HARDWARE Environment Variable, NanoLLMError Exception, Process-level Configuration (+1 more)

### Community 15 - "Community 15"
Cohesion: 0.00
Nodes (9): Fumadocs Documentation Framework, fumadocs.config.ts Configuration, MDX Code Block Component, MDX Rendering Engine, MDX Compilation to HTML, Next.js Framework, package.json Configuration, source.config.ts Configuration (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.00
Nodes (4): _exec_snippet(), _extract_python_snippets(), main(), Path

### Community 17 - "Community 17"
Cohesion: 0.00
Nodes (4): Code Block Refresh Release Note, Locale Entrypoints Release Note, Changes/Release Notes Section, Sidebar and Shell Release Note

### Community 18 - "Community 18"
Cohesion: 0.00
Nodes (3): { createMDX }, nextConfig, withMDX

## Knowledge Gaps
- **60 isolated node(s):** `DEFAULT_METADATA`, `metadata`, `buttonVariants`, `CALLOUT_STYLES`, `{ docs, meta }` (+55 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.