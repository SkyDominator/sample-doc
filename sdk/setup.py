from pathlib import Path

from setuptools import setup
from setuptools_rust import Binding, RustExtension

ROOT = Path(__file__).resolve().parent
RUST_MANIFEST = ROOT.parent / "sdk-rs" / "Cargo.toml"

setup(
    rust_extensions=[
        RustExtension(
            "raykim_llm_rs",
            path=str(RUST_MANIFEST),
            binding=Binding.PyO3,
            optional=True,
        )
    ],
    zip_safe=False,
)
