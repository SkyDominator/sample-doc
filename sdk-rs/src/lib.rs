use pyo3::exceptions::PyRuntimeError;
use pyo3::prelude::*;

#[pyclass]
struct DeviceMemory {
    total_bytes: usize,
    used_bytes: usize,
}

#[pymethods]
impl DeviceMemory {
    #[new]
    fn new(total_bytes: usize) -> Self {
        Self {
            total_bytes,
            used_bytes: 0,
        }
    }

    fn allocate(&mut self, bytes: usize) -> PyResult<bool> {
        if self.used_bytes + bytes > self.total_bytes {
            return Ok(false);
        }
        self.used_bytes += bytes;
        Ok(true)
    }

    fn free(&mut self, bytes: usize) -> PyResult<()> {
        if bytes > self.used_bytes {
            return Err(PyRuntimeError::new_err("free size exceeds used memory"));
        }
        self.used_bytes -= bytes;
        Ok(())
    }

    fn utilization(&self) -> f32 {
        if self.total_bytes == 0 {
            return 0.0;
        }
        self.used_bytes as f32 / self.total_bytes as f32
    }
}

#[pymodule]
fn nano_llm_rs(_py: Python<'_>, m: &PyModule) -> PyResult<()> {
    m.add_class::<DeviceMemory>()?;
    Ok(())
}
