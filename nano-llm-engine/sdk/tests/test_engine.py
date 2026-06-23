import os

from nano_llm import InferenceConfig, NanoLLMEngine


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
