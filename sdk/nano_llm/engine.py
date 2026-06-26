import os
from typing import Generator

from .config import InferenceConfig, KVCacheConfig, QuantizationType
from .errors import DeviceNotFoundError, GenerationError


class NanoLLMEngine:
    """Mock inference engine for documentation and CI validation workflows.

    Args:
        model_path: Path to the compiled mock model artifact.
        quantization: Quantization label attached to mock generation output.
        kv_cache_config: Optional KV cache configuration stored on the engine.
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
        """Open a mock device session and mark the engine as loaded.

        Args:
            device_id: Mock hardware device index.

        Returns:
            True when the mock device session is ready.

        Raises:
            DeviceNotFoundError: If ``MOCK_RNGD_HARDWARE`` is not set.
        """
        if not os.environ.get("MOCK_RNGD_HARDWARE"):
            raise DeviceNotFoundError("Set MOCK_RNGD_HARDWARE=true for mock execution")
        self.is_loaded = True
        _ = device_id
        return True

    def generate(self, prompt: str, config: InferenceConfig | None = None) -> str:
        """Run a synchronous mock generation request.

        Args:
            prompt: Input prompt text.
            config: Optional inference settings for token and sampling controls.

        Returns:
            Mock model output text prefixed with quantization and token metadata.

        Raises:
            GenerationError: If the engine has not been loaded yet.
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
        """Yield mock generation output through a streaming interface.

        Args:
            prompt: Input prompt text.
            config: Optional inference settings for token and sampling controls.

        Yields:
            Whitespace-split tokens from the generated mock output.

        Raises:
            GenerationError: If the underlying generation request runs before the engine is loaded.
        """
        output = self.generate(prompt, config)
        for token in output.split():
            yield token

    def get_device_memory(self) -> dict[str, int]:
        """Return mock memory telemetry for the current engine state.

        Returns:
            Dictionary with ``total_mb`` and ``used_mb`` values.
        """
        return {"total_mb": 32768, "used_mb": 1024 if self.is_loaded else 0}

    def unload(self) -> bool:
        """Close the mock device session and reset engine state.

        Returns:
            True when the loaded state has been cleared.
        """
        self.is_loaded = False
        return True
