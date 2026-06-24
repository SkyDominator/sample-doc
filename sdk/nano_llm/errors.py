class NanoLLMError(Exception):
    """Base exception for nano_llm package."""


class DeviceNotFoundError(NanoLLMError):
    """Raised when mock hardware is unavailable."""


class ModelLoadError(NanoLLMError):
    """Raised when model loading fails."""


class GenerationError(NanoLLMError):
    """Raised when generation fails."""
