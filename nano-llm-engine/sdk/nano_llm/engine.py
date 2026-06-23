import os
from typing import Generator

from .config import InferenceConfig, KVCacheConfig, QuantizationType
from .errors import DeviceNotFoundError, GenerationError


class NanoLLMEngine:
    """Mock LLM runtime for documentation and CI sample validation.

    Args:
        model_path: Path to the compiled model artifact.
        quantization: Quantization mode used for mock inference.
        kv_cache_config: Optional KV cache configuration.
    """

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
        """Load the model into a mock device session.

        Args:
            device_id: Mock hardware device index.

        Returns:
            True when the model is loaded.

        Raises:
            DeviceNotFoundError: If `MOCK_RNGD_HARDWARE` is not set.
        """
        if not os.environ.get("MOCK_RNGD_HARDWARE"):
            raise DeviceNotFoundError("Set MOCK_RNGD_HARDWARE=true for mock execution")
        self.is_loaded = True
        _ = device_id
        return True

    def generate(self, prompt: str, config: InferenceConfig | None = None) -> str:
        """Run synchronous mock generation.

        Args:
            prompt: Input prompt text.
            config: Optional inference parameters.

        Returns:
            Mock model output text.

        Raises:
            GenerationError: If the engine was not loaded first.
        """
        if not self.is_loaded:
            raise GenerationError("Engine is not loaded")
        cfg = config or InferenceConfig()
        return f"[mock:{self.quantization}:tokens={cfg.max_tokens}] {prompt}"

    def generate_streaming(
        self,
        prompt: str,
        config: InferenceConfig | None = None,
    ) -> Generator[str, None, None]:
        """Run mock generation and stream output token by token.

        Args:
            prompt: Input prompt text.
            config: Optional inference parameters.

        Yields:
            Whitespace-split tokens from the mock generation output.
        """
        output = self.generate(prompt, config)
        for token in output.split():
            yield token

    def unload(self) -> bool:
        """Release the mock device session.

        Returns:
            True when the session state is cleared.
        """
        self.is_loaded = False
        return True

    def get_device_memory(self) -> dict[str, int]:
        """Return mock memory telemetry for the active device.

        Returns:
            Dictionary with total and used memory in MB.
        """
        return {"total_mb": 32768, "used_mb": 1024 if self.is_loaded else 0}
