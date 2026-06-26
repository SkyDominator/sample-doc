"""Python wrapper for optional Rust-backed device memory helper."""

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
    from nano_llm_rs import DeviceMemory as _RustDeviceMemory  # type: ignore
except Exception:
    _RustDeviceMemory = None


class DeviceMemory:
    """Device memory abstraction backed by Rust when available.

    Args:
        total_bytes: Total device memory capacity exposed by the wrapper.
    """

    def __init__(self, total_bytes: int) -> None:
        impl = _RustDeviceMemory if _RustDeviceMemory is not None else _PythonDeviceMemory
        self._impl = impl(total_bytes)

    def allocate(self, bytes_size: int) -> bool:
        """Reserve bytes from the device memory pool.

        Args:
            bytes_size: Number of bytes to reserve.

        Returns:
            True when the allocation succeeds, otherwise False.
        """
        return self._impl.allocate(bytes_size)

    def free(self, bytes_size: int) -> None:
        """Release previously reserved bytes.

        Args:
            bytes_size: Number of bytes to release.

        Raises:
            RuntimeError: If the requested free size exceeds the allocated size.
        """
        self._impl.free(bytes_size)

    def utilization(self) -> float:
        """Return the current memory utilization ratio.

        Returns:
            Fraction of used memory in the range 0.0 to 1.0.
        """
        return float(self._impl.utilization())
