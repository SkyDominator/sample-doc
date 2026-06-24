from dataclasses import dataclass
from typing import Literal

QuantizationType = Literal["INT4", "INT8", "FP16", "FP32"]


@dataclass(slots=True)
class KVCacheConfig:
    max_seq_len: int = 4096
    cache_dtype: str = "fp16"


@dataclass(slots=True)
class InferenceConfig:
    batch_size: int = 1
    max_tokens: int = 128
    temperature: float = 0.7
