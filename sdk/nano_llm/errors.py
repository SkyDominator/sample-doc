class NanoLLMError(Exception):
    """nano_llm 패키지의 기본 예외입니다."""


class DeviceNotFoundError(NanoLLMError):
    """모의 하드웨어 환경 변수가 없을 때 발생합니다."""


class GenerationError(NanoLLMError):
    """로드되지 않은 엔진에서 생성 호출이 실행될 때 발생합니다."""
