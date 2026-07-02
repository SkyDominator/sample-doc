import os
from typing import Generator

from .config import InferenceConfig, KVCacheConfig, QuantizationType
from .errors import DeviceNotFoundError, GenerationError


class RayKimLLMEngine:
    """`RayKimLLMEngine`는 RNGD 장치 수명주기를 흉내 내는 모의 추론 엔진입니다.
    인스턴스 생성, 장치 로드, 동기/스트리밍 생성, 메모리 조회, 세션 해제까지의 기본 흐름을 제공합니다.

    Args:
        model_path: 컴파일된 mock 모델 아티팩트 경로입니다.
        quantization: 생성 결과 접두사에 반영되는 양자화 라벨입니다.
        kv_cache_config: 엔진 인스턴스에 보관할 KV cache 설정 객체입니다.
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
        """모의 장치 세션을 열고 엔진을 로드 상태로 전환합니다.

        Args:
            device_id: 모의 하드웨어 장치 인덱스입니다.

        Returns:
            모의 장치 세션이 준비되면 `True`를 반환합니다.

        Raises:
            DeviceNotFoundError: `MOCK_RNGD_HARDWARE` 환경 변수가 없으면 발생합니다.
        """
        if not os.environ.get("MOCK_RNGD_HARDWARE"):
            raise DeviceNotFoundError("mock hardware not found")
        self.is_loaded = True
        _ = device_id
        return True

    def generate(self, prompt: str, config: InferenceConfig | None = None) -> str:
        """동기 mock 생성 요청을 실행합니다.

        Args:
            prompt: 입력 프롬프트 문자열입니다.
            config: 토큰 예산과 샘플링 제어를 담은 요청 설정입니다.

        Returns:
            양자화 라벨과 토큰 예산 메타데이터를 앞에 붙인 mock 출력 문자열을 반환합니다.

        Raises:
            GenerationError: 엔진이 아직 로드되지 않은 상태에서 호출하면 발생합니다.
        """
        if not self.is_loaded:
            raise GenerationError("engine is not loaded")
        cfg = config or InferenceConfig()
        return f"[mock:{self.quantization}:tokens={cfg.max_tokens}] {prompt}"

    def generate_streaming(
        self,
        prompt: str,
        config: InferenceConfig | None = None,
    ) -> Generator[str, None, None]:
        """mock 생성 결과를 스트리밍 인터페이스로 내보냅니다.

        Args:
            prompt: 입력 프롬프트 문자열입니다.
            config: 토큰 예산과 샘플링 제어를 담은 요청 설정입니다.

        Yields:
            동기 생성 결과를 공백 기준으로 분리한 토큰들을 순서대로 생성합니다.

        Raises:
            GenerationError: 엔진 로드 전에 내부 생성 요청이 실행되면 발생합니다.
        """
        output = self.generate(prompt, config)
        for token in output.split():
            yield token

    def get_device_memory(self) -> dict[str, int]:
        """현재 엔진 상태에 대한 mock 메모리 텔레메트리를 반환합니다.

        Returns:
            `total_mb`와 `used_mb` 키를 가진 사전을 반환합니다.
        """
        return {"total_mb": 32768, "used_mb": 1024 if self.is_loaded else 0}

    def unload(self) -> bool:
        """모의 장치 세션을 닫고 엔진 상태를 초기화합니다.

        Returns:
            로드 상태가 해제되면 `True`를 반환합니다.
        """
        self.is_loaded = False
        return True
