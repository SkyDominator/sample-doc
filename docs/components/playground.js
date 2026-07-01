"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PLAYGROUND_SCENARIOS, PLAYGROUND_SDK_SOURCES } from "@/playground";

const RUN_TIMEOUT_MS = 20000;

function initialValues(controls) {
  return Object.fromEntries(controls.map((control) => [control.name, control.default]));
}

function limitLabel(control) {
  if (control.type === "enum") return control.values.join(" | ");
  if (control.type === "int" || control.type === "float") return `${control.min} – ${control.max}`;
  if (control.type === "text") return control.max_length ? `≤ ${control.max_length} chars` : "text";
  if (control.type === "boolean") return "true | false";
  return "";
}

function isWithinLimits(control, value) {
  if (control.type === "enum") return control.values.includes(value);
  if (control.type === "int" || control.type === "float") {
    return typeof value === "number" && !Number.isNaN(value) && value >= control.min && value <= control.max;
  }
  if (control.type === "text") return !control.max_length || String(value).length <= control.max_length;
  if (control.type === "boolean") return typeof value === "boolean";
  return true;
}

export function Playground({ scenario: scenarioId }) {
  const scenario = PLAYGROUND_SCENARIOS[scenarioId];
  const controls = scenario?.controls ?? [];

  const [values, setValues] = useState(() => initialValues(controls));
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [booted, setBooted] = useState(false);

  const workerRef = useRef(null);
  const timeoutRef = useRef(null);
  const runIdRef = useRef(0);

  const terminateWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => terminateWorker, [terminateWorker]);

  const setValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const hasBlockingInput = controls.some((control) => {
    const value = values[control.name];
    return (
      (control.type === "int" || control.type === "float") &&
      (value === "" || value === null || Number.isNaN(value))
    );
  });

  const run = useCallback(() => {
    if (!scenario) return;

    if (!workerRef.current) {
      workerRef.current = new Worker(new URL("./playground.worker.js", import.meta.url));
      workerRef.current.onmessage = (event) => {
        const message = event.data;
        if (message.type !== "result" || message.id !== runIdRef.current) return;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setResult({
          stdout: message.stdout ?? "",
          errorType: message.error_type ?? null,
          errorMessage: message.error_message ?? null,
        });
        setStatus("idle");
      };
    }

    const id = runIdRef.current + 1;
    runIdRef.current = id;
    setStatus("running");
    setResult(null);
    setBooted(true);

    timeoutRef.current = setTimeout(() => {
      terminateWorker();
      setResult({
        stdout: "",
        errorType: "TimeoutError",
        errorMessage: `Execution exceeded ${RUN_TIMEOUT_MS / 1000}s and was stopped.`,
      });
      setStatus("idle");
    }, RUN_TIMEOUT_MS);

    workerRef.current.postMessage({
      type: "run",
      id,
      template: scenario.template,
      params: values,
      sdkSources: PLAYGROUND_SDK_SOURCES,
    });
  }, [scenario, values, terminateWorker]);

  if (!scenario) {
    return (
      <div className="not-prose my-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Unknown playground scenario: <code>{scenarioId}</code>
      </div>
    );
  }

  return (
    <section className="not-prose my-8 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-soft">
      <header className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="m-0 text-sm font-semibold text-slate-900">{scenario.title}</h3>
            {scenario.summary ? (
              <p className="m-0 mt-1 text-xs leading-5 text-slate-500">{scenario.summary}</p>
            ) : null}
          </div>
          <span className="shrink-0 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            Live Python
          </span>
        </div>
      </header>

      <div className="grid gap-0 md:grid-cols-2">
        <div className="space-y-4 border-b border-slate-100 p-5 md:border-b-0 md:border-r">
          {controls.map((control) => {
            const value = values[control.name];
            const within = isWithinLimits(control, value);
            return (
              <div key={control.name} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <label className="text-xs font-semibold text-slate-700">{control.label}</label>
                  <span className={cn("text-[10px] font-medium", within ? "text-slate-400" : "text-red-500")}>
                    {limitLabel(control)}
                  </span>
                </div>
                <ControlInput
                  control={control}
                  value={value}
                  within={within}
                  onChange={(next) => setValue(control.name, next)}
                />
                {control.description ? (
                  <p className="m-0 text-[11px] leading-4 text-slate-400">{control.description}</p>
                ) : null}
              </div>
            );
          })}

          {scenario.locked?.length ? (
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="m-0 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Locked</p>
              <ul className="m-0 mt-1 list-disc pl-4 text-[11px] leading-5 text-slate-500">
                {scenario.locked.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col p-5">
          <pre className="m-0 max-h-56 flex-1 overflow-auto rounded-xl bg-slate-950 p-4 font-mono text-[12px] leading-5 text-slate-100">
            {scenario.template}
          </pre>

          <div className="mt-3 flex items-center gap-3">
            <Button size="sm" onClick={run} disabled={status === "running" || hasBlockingInput}>
              {status === "running" ? "Running…" : "Run"}
            </Button>
            <span className="text-[11px] text-slate-400">
              {booted
                ? "Runs real Python in a sandboxed worker."
                : "First run downloads the Python runtime (~a few MB)."}
            </span>
          </div>

          {result ? (
            <div
              className={cn(
                "mt-3 rounded-xl border p-3 font-mono text-[12px] leading-5",
                result.errorType
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              )}
            >
              {result.errorType ? (
                <span>
                  <strong>{result.errorType}</strong>: {result.errorMessage}
                </span>
              ) : (
                <pre className="m-0 whitespace-pre-wrap break-words">{result.stdout || "(no output)"}</pre>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ControlInput({ control, value, within, onChange }) {
  if (control.type === "enum") {
    return (
      <select
        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 focus:border-slate-400 focus:outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {control.values.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (control.type === "boolean") {
    return (
      <button
        type="button"
        aria-pressed={value}
        onClick={() => onChange(!value)}
        className={cn(
          "inline-flex h-7 w-14 items-center rounded-full border px-0.5 transition-colors",
          value ? "border-emerald-300 bg-emerald-100" : "border-slate-300 bg-slate-100"
        )}
      >
        <span
          className={cn(
            "h-6 w-6 rounded-full bg-white shadow transition-transform",
            value ? "translate-x-7" : "translate-x-0"
          )}
        />
      </button>
    );
  }

  if (control.type === "int" || control.type === "float") {
    return (
      <input
        type="number"
        value={value}
        onChange={(event) => {
          const raw = event.target.value;
          onChange(raw === "" ? "" : Number(raw));
        }}
        className={cn(
          "w-full rounded-lg border bg-white px-2.5 py-1.5 text-sm text-slate-800 focus:outline-none",
          within ? "border-slate-200 focus:border-slate-400" : "border-red-300 focus:border-red-400"
        )}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      maxLength={control.max_length}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 focus:border-slate-400 focus:outline-none"
    />
  );
}
