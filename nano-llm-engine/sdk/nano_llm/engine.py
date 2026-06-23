import os
from typing import Generator

from .config import InferenceConfig, KVCacheConfig, QuantizationType
from .errors import DeviceNotFoundError, GenerationError


class NanoLLMEngine:
    """Mock LLM runtime for documentation and CI sample validation."""

    def __init__(
        self,
        model_path: str,
        quantization: QuantizationType = "FP16",
        kv_cache_config: KVCacheConfig | None = None,
    ) -> None:
        self.model_path = model_path
        self.quantization = quantization
        self.kv_cache_config = kv_cache_config or KVCacheConfig()
        self.is_loaded = False

    def load_to_device(self, device_id: int = 0) -> bool:
        if not os.environ.get("MOCK_RNGD_HARDWARE"):
            raise DeviceNotFoundError("Set MOCK_RNGD_HARDWARE=true for mock execution")
        self.is_loaded = True
        _ = device_id
        return True

    def generate(self, prompt: str, config: InferenceConfig | None = None) -> str:
        if not self.is_loaded:
            raise GenerationError("Engine is not loaded")
        cfg = config or InferenceConfig()
        return f"[mock:{self.quantization}:tokens={cfg.max_tokens}] {prompt}"

    def generate_streaming(
        self,
        prompt: str,
        config: InferenceConfig | None = None,
    ) -> Generator[str, None, None]:
        output = self.generate(prompt, config)
        for token in output.split():
            yield token

    def unload(self) -> bool:
        self.is_loaded = False
        return True

    def get_device_memory(self) -> dict[str, int]:
        return {"total_mb": 32768, "used_mb": 1024 if self.is_loaded else 0}
