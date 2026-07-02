"""Rust 구현이 있으면 이를 사용하고, 없으면 Python 구현으로 폴백하는 장치 메모리 래퍼입니다."""

from __future__ import annotations


class _PythonDeviceMemory:
    def __init__(self, total_bytes: int) -> None:
        self.total_bytes = total_bytes
        self.used_bytes = 0

    def allocate(self, bytes_size: int) -> bool:
        if self.used_bytes + bytes_size > self.total_bytes:
            return False
        self.used_bytes += bytes_size
        return True

    def free(self, bytes_size: int) -> None:
        if bytes_size > self.used_bytes:
            raise RuntimeError("free size exceeds used memory")
        self.used_bytes -= bytes_size

    def utilization(self) -> float:
        if self.total_bytes == 0:
            return 0.0
        return self.used_bytes / self.total_bytes


try:
    from raykim_llm_rs import DeviceMemory as _RustDeviceMemory  # type: ignore
except Exception:
    _RustDeviceMemory = None


class DeviceMemory:
    """독립적인 메모리 풀을 가정하는 장치 메모리 추상화입니다.

    Args:
        total_bytes: 래퍼가 노출할 전체 장치 메모리 용량입니다.
    """

    def __init__(self, total_bytes: int) -> None:
        impl = _RustDeviceMemory if _RustDeviceMemory is not None else _PythonDeviceMemory
        self._impl = impl(total_bytes)

    def allocate(self, bytes_size: int) -> bool:
        """장치 메모리 풀에서 바이트를 예약합니다.

        Args:
            bytes_size: 예약할 바이트 수입니다.

        Returns:
            예약에 성공하면 `True`, 용량이 부족하면 `False`를 반환합니다.
        """
        return self._impl.allocate(bytes_size)

    def free(self, bytes_size: int) -> None:
        """이전에 예약한 바이트를 해제합니다.

        Args:
            bytes_size: 해제할 바이트 수입니다.

        Raises:
            RuntimeError: 현재 예약량보다 더 큰 바이트 수를 해제하려고 하면 발생합니다.
        """
        self._impl.free(bytes_size)

    def utilization(self) -> float:
        """현재 메모리 사용률을 반환합니다.

        Returns:
            `0.0`~`1.0` 범위의 사용률을 반환합니다.
        """
        return float(self._impl.utilization())
