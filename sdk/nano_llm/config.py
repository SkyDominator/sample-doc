from dataclasses import dataclass
from typing import Literal

QuantizationType = Literal["INT4", "INT8", "FP16", "FP32"]


@dataclass(slots=True)
class KVCacheConfig:
    """Configuration for KV cache behavior attached to the engine.

    Args:
        max_seq_len: Maximum sequence length assumed for cache allocation.
        cache_dtype: Precision label used for KV cache storage.
    """

    max_seq_len: int = 4096
    cache_dtype: str = "fp16"


@dataclass(slots=True)
class InferenceConfig:
    """Per-request inference settings for mock generation.

    Args:
        batch_size: Number of prompts processed in one mock request.
        max_tokens: Maximum token budget reflected in the mock output prefix.
        temperature: Sampling temperature placeholder preserved across examples and tests.
    """

    batch_size: int = 1
    max_tokens: int = 128
    temperature: float = 0.7
