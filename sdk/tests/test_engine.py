import os
import pytest

from nano_llm import DeviceMemory, InferenceConfig, NanoLLMEngine
from nano_llm.errors import DeviceNotFoundError, GenerationError


def test_load_and_generate() -> None:
    os.environ["MOCK_RNGD_HARDWARE"] = "true"
    engine = NanoLLMEngine(model_path="models/mock.bin")

    assert engine.load_to_device(0)
    out = engine.generate("hello", InferenceConfig(max_tokens=8))
    assert "hello" in out


def test_unload() -> None:
    engine = NanoLLMEngine(model_path="models/mock.bin")
    assert engine.unload()
    assert engine.is_loaded is False


def test_load_requires_mock_env() -> None:
    os.environ.pop("MOCK_RNGD_HARDWARE", None)
    engine = NanoLLMEngine(model_path="models/mock.bin")
    with pytest.raises(DeviceNotFoundError):
        engine.load_to_device(0)


def test_generate_requires_loaded_engine() -> None:
    engine = NanoLLMEngine(model_path="models/mock.bin")
    with pytest.raises(GenerationError):
        engine.generate("hello")


def test_streaming_generation() -> None:
    os.environ["MOCK_RNGD_HARDWARE"] = "true"
    engine = NanoLLMEngine(model_path="models/mock.bin")
    engine.load_to_device(0)
    tokens = list(engine.generate_streaming("stream test", InferenceConfig(max_tokens=6)))
    assert len(tokens) > 0


def test_device_memory_stats() -> None:
    os.environ["MOCK_RNGD_HARDWARE"] = "true"
    engine = NanoLLMEngine(model_path="models/mock.bin")
    before = engine.get_device_memory()
    assert before["used_mb"] == 0
    engine.load_to_device(0)
    after = engine.get_device_memory()
    assert after["used_mb"] > 0


def test_device_memory_wrapper() -> None:
    device = DeviceMemory(total_bytes=1024)
    assert device.allocate(256) is True
    assert device.utilization() > 0
    device.free(128)
    assert 0.0 <= device.utilization() <= 1.0
