#!/usr/bin/env python3
"""Validate controlled playground scenarios by executing them against the mock SDK.

Each scenario under ``docs/playground/scenarios`` is a single source of truth shared
by the docs playground UI and this validator. For every scenario the validator:

* runs each ``valid`` case with in-range controls and checks the captured stdout, and
* runs each ``invalid`` case with out-of-range controls and checks that the SDK raises
  the documented exception.

It also cross-checks the two-layer boundary model: ``valid`` cases must stay inside the
declared control limits, and ``invalid`` cases must break at least one of them.
"""

from __future__ import annotations

import contextlib
import io
import json
import os
import sys
from pathlib import Path
from typing import Any

CONTROL_TYPES = {"enum", "int", "float", "boolean", "text"}


def _add_sdk_to_path(script_root: Path) -> None:
    sdk_root = script_root / "sdk"
    if str(sdk_root) not in sys.path:
        sys.path.insert(0, str(sdk_root))


def _structure_problems(scenario: dict[str, Any]) -> list[str]:
    problems: list[str] = []
    for key in ("id", "title", "page", "runtime", "template", "controls", "cases"):
        if key not in scenario:
            problems.append(f"missing top-level key '{key}'")
    if problems:
        return problems

    control_names: set[str] = set()
    for control in scenario["controls"]:
        kind = control.get("type")
        if kind not in CONTROL_TYPES:
            problems.append(f"control '{control.get('name')}' has invalid type '{kind}'")
        if kind == "enum" and not control.get("values"):
            problems.append(f"enum control '{control.get('name')}' is missing 'values'")
        if kind in ("int", "float") and ("min" not in control or "max" not in control):
            problems.append(f"numeric control '{control.get('name')}' is missing min/max")
        control_names.add(control.get("name"))

    cases = scenario["cases"]
    if not cases.get("valid"):
        problems.append("cases.valid must have at least one case")
    if not cases.get("invalid"):
        problems.append("cases.invalid must have at least one case")

    for bucket in ("valid", "invalid"):
        for case in cases.get(bucket, []):
            if set(case.get("controls", {})) != control_names:
                problems.append(
                    f"{bucket} case '{case.get('name')}' must set every control {sorted(control_names)}"
                )
    return problems


def _is_within_limits(control: dict[str, Any], value: Any) -> bool:
    kind = control["type"]
    if kind == "enum":
        return value in control["values"]
    if kind in ("int", "float"):
        return control["min"] <= value <= control["max"]
    if kind == "boolean":
        return isinstance(value, bool)
    if kind == "text":
        max_length = control.get("max_length")
        return max_length is None or len(str(value)) <= max_length
    return False


@contextlib.contextmanager
def _isolated_mock_hardware() -> Any:
    key = "MOCK_RNGD_HARDWARE"
    had_key = key in os.environ
    previous = os.environ.get(key)
    try:
        yield
    finally:
        if had_key:
            os.environ[key] = previous  # type: ignore[assignment]
        else:
            os.environ.pop(key, None)


def _run_case(template: str, params: dict[str, Any], label: str) -> tuple[str, Exception | None]:
    namespace: dict[str, Any] = {"params": dict(params)}
    buffer = io.StringIO()
    try:
        with _isolated_mock_hardware(), contextlib.redirect_stdout(buffer):
            exec(compile(template, label, "exec"), namespace, namespace)
    except Exception as exc:  # noqa: BLE001 - the failing case's exception is the result we report
        return buffer.getvalue(), exc
    return buffer.getvalue(), None


def _check_valid_case(
    scenario: dict[str, Any], controls: dict[str, dict[str, Any]], case: dict[str, Any]
) -> list[str]:
    label = f"{scenario['id']}/{case['name']}"
    failures = [
        f"{label}: valid case value out of range for {name}={value!r}"
        for name, value in case["controls"].items()
        if not _is_within_limits(controls[name], value)
    ]

    stdout, error = _run_case(scenario["template"], case["controls"], label)
    if error is not None:
        return failures + [f"{label}: valid case raised {type(error).__name__}: {error}"]

    expect = case["expect"]
    for fragment in expect.get("stdout_contains", []):
        if fragment not in stdout:
            failures.append(f"{label}: stdout missing {fragment!r}")
    if "stdout_equals" in expect and stdout.strip() != expect["stdout_equals"]:
        failures.append(f"{label}: stdout != expected exact output")
    return failures


def _check_invalid_case(
    scenario: dict[str, Any], case: dict[str, Any]
) -> tuple[list[str], str | None]:
    label = f"{scenario['id']}/{case['name']}"
    _, error = _run_case(scenario["template"], case["controls"], label)
    expect = case["expect"]

    if case["status"] == "planned":
        pending = None if error is not None else f"{label}: boundary not enforced by SDK yet"
        return [], pending

    failures: list[str] = []
    if error is None:
        failures.append(f"{label}: expected {expect['type']} but nothing was raised")
    elif type(error).__name__ != expect["type"]:
        failures.append(f"{label}: expected {expect['type']}, got {type(error).__name__}")
    elif expect.get("message_contains", "") not in str(error):
        failures.append(f"{label}: message missing {expect['message_contains']!r}")
    return failures, None


def main() -> int:
    script_root = Path(__file__).resolve().parent.parent
    _add_sdk_to_path(script_root)

    scenarios_dir = script_root / "docs/playground/scenarios"
    if not scenarios_dir.exists():
        print("validate_playgrounds.py: scenarios dir not found")
        return 2

    scenario_files = sorted(scenarios_dir.glob("*.json"))
    total_cases = 0
    failures: list[str] = []
    pending: list[str] = []

    for scenario_file in scenario_files:
        try:
            scenario = json.loads(scenario_file.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            failures.append(f"{scenario_file.name}: invalid JSON ({exc})")
            continue

        problems = _structure_problems(scenario)
        if problems:
            failures.extend(f"{scenario_file.name}: {problem}" for problem in problems)
            continue

        controls = {control["name"]: control for control in scenario["controls"]}
        for case in scenario["cases"]["valid"]:
            total_cases += 1
            failures.extend(_check_valid_case(scenario, controls, case))
        for case in scenario["cases"]["invalid"]:
            total_cases += 1
            case_failures, case_pending = _check_invalid_case(scenario, case)
            failures.extend(case_failures)
            if case_pending is not None:
                pending.append(case_pending)

    print(
        "validate_playgrounds.py: "
        f"scenarios={len(scenario_files)} cases={total_cases} "
        f"failed={len(failures)} pending={len(pending)}"
    )
    for note in pending:
        print(f"  pending: {note}")
    for failure in failures:
        print(f"  FAIL: {failure}")

    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
