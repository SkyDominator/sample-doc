from dataclasses import dataclass
from typing import Literal

QuantizationType = Literal["INT4", "INT8", "FP16", "FP32"]

MAX_TOKENS_MIN = 1
MAX_TOKENS_MAX = 512


@dataclass(slots=True)
class KVCacheConfig:
    """엔진에 부착되는 KV cache 설정 객체입니다.

    Args:
        max_seq_len: cache 할당이 감당한다고 가정하는 최대 시퀀스 길이입니다.
        cache_dtype: KV cache 저장 정밀도 라벨입니다.
    """

    max_seq_len: int = 4096
    cache_dtype: str = "fp16"


@dataclass(slots=True)
class InferenceConfig:
    """mock 생성 요청마다 전달하는 설정 객체입니다.

    Args:
        batch_size: 한 번의 mock 요청에서 함께 처리할 프롬프트 수입니다.
        max_tokens: 출력 접두사에 반영되는 최대 토큰 예산입니다.
        temperature: 샘플링 다양성을 나타내는 자리표시 값입니다.

    Raises:
        ValueError: max_tokens가 허용 범위(MAX_TOKENS_MIN~MAX_TOKENS_MAX)를 벗어나면 발생합니다.
    """

    batch_size: int = 1
    max_tokens: int = 128
    temperature: float = 0.7

    def __post_init__(self) -> None:
        if not MAX_TOKENS_MIN <= self.max_tokens <= MAX_TOKENS_MAX:
            raise ValueError(
                f"max_tokens must be between {MAX_TOKENS_MIN} and {MAX_TOKENS_MAX}, "
                f"got {self.max_tokens}"
            )
