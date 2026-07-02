import os
import pytest

from raykim_llm import DeviceMemory, InferenceConfig, KVCacheConfig, RayKimLLMEngine
from raykim_llm.errors import DeviceNotFoundError, GenerationError


def test_load_and_generate() -> None:
    os.environ["MOCK_RNGD_HARDWARE"] = "true"
    engine = RayKimLLMEngine(model_path="models/mock.bin")

    assert engine.load_to_device(0)
    out = engine.generate("hello", InferenceConfig(max_tokens=8))
    assert out == "[mock:FP16:tokens=8] hello"


def test_unload() -> None:
    engine = RayKimLLMEngine(model_path="models/mock.bin")
    assert engine.unload()
    assert engine.is_loaded is False


def test_load_requires_mock_env() -> None:
    os.environ.pop("MOCK_RNGD_HARDWARE", None)
    engine = RayKimLLMEngine(model_path="models/mock.bin")
    with pytest.raises(DeviceNotFoundError, match="mock hardware not found"):
        engine.load_to_device(0)


def test_generate_requires_loaded_engine() -> None:
    engine = RayKimLLMEngine(model_path="models/mock.bin")
    with pytest.raises(GenerationError, match="engine is not loaded"):
        engine.generate("hello")


def test_streaming_generation() -> None:
    os.environ["MOCK_RNGD_HARDWARE"] = "true"
    engine = RayKimLLMEngine(model_path="models/mock.bin")
    engine.load_to_device(0)
    config = InferenceConfig(max_tokens=6)
    output = engine.generate("stream test", config)
    tokens = list(engine.generate_streaming("stream test", config))
    assert tokens == output.split()


def test_device_memory_stats() -> None:
    os.environ["MOCK_RNGD_HARDWARE"] = "true"
    engine = RayKimLLMEngine(model_path="models/mock.bin")
    before = engine.get_device_memory()
    assert before == {"total_mb": 32768, "used_mb": 0}
    engine.load_to_device(0)
    after = engine.get_device_memory()
    assert after == {"total_mb": 32768, "used_mb": 1024}


def test_engine_preserves_engine_level_config() -> None:
    cache_config = KVCacheConfig(max_seq_len=8192, cache_dtype="fp16")
    engine = RayKimLLMEngine(
        model_path="models/mock.bin",
        quantization="INT8",
        kv_cache_config=cache_config,
    )

    assert engine.quantization == "INT8"
    assert engine.kv_cache_config is cache_config


def test_device_memory_wrapper() -> None:
    device = DeviceMemory(total_bytes=1024)
    assert device.allocate(256) is True
    assert device.utilization() > 0
    device.free(128)
    assert 0.0 <= device.utilization() <= 1.0
