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

function pythonLiteral(value) {
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "number") return Number.isNaN(value) ? "None" : String(value);
  return JSON.stringify(String(value));
}

function isBlankLine(line) {
  return line.trim() === "";
}

function isDeeper(line, indent) {
  return line.startsWith(indent) && line.length > indent.length && /\s/.test(line[indent.length]);
}

function collapseBooleanBranches(code, values) {
  const lines = code.split("\n");
  const ifPattern = /^(\s*)if params\[(?:"([^"]+)"|'([^']+)')\]:$/;
  const result = [];
  let i = 0;

  const collectBody = (indent) => {
    const body = [];
    while (i < lines.length && (isBlankLine(lines[i]) || isDeeper(lines[i], indent))) {
      body.push(lines[i]);
      i += 1;
    }
    while (body.length && isBlankLine(body[body.length - 1])) {
      body.pop();
      i -= 1;
    }
    return body;
  };

  const dedent = (body) => {
    const firstCode = body.find((line) => !isBlankLine(line));
    if (!firstCode) return body;
    const pad = firstCode.match(/^\s*/)[0];
    return body.map((line) => (line.startsWith(pad) ? line.slice(pad.length) : line));
  };

  while (i < lines.length) {
    const match = lines[i].match(ifPattern);
    if (!match) {
      result.push(lines[i]);
      i += 1;
      continue;
    }
    const indent = match[1];
    const key = match[2] ?? match[3];
    i += 1;
    const ifBody = collectBody(indent);
    let elseBody = [];
    if (i < lines.length && lines[i] === `${indent}else:`) {
      i += 1;
      elseBody = collectBody(indent);
    }
    result.push(...dedent(values[key] ? ifBody : elseBody));
  }

  return result.join("\n");
}

function resolveTemplate(template, values) {
  const collapsed = collapseBooleanBranches(template, values);
  return collapsed.replace(/params\[(?:"([^"]+)"|'([^']+)')\]/g, (match, doubleKey, singleKey) => {
    const key = doubleKey ?? singleKey;
    return key in values ? pythonLiteral(values[key]) : match;
  });
}

const PYTHON_TOKEN =
  /(#[^\n]*)|("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|\b(import|from|as|if|elif|else|for|while|try|except|finally|with|def|class|return|yield|pass|break|continue|in|not|and|or|is|None|True|False|lambda|raise|global|nonlocal|assert|del|async|await)\b|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_]\w*)(?=\s*\()/g;

const PYTHON_TOKEN_CLASS = {
  comment: "italic text-slate-500",
  string: "text-emerald-300",
  keyword: "text-sky-300",
  number: "text-amber-300",
  call: "text-violet-300",
};

function highlightPython(code) {
  const nodes = [];
  let lastIndex = 0;
  let key = 0;
  PYTHON_TOKEN.lastIndex = 0;
  let match = PYTHON_TOKEN.exec(code);
  while (match !== null) {
    if (match.index > lastIndex) {
      nodes.push(code.slice(lastIndex, match.index));
    }
    const [full, comment, string, keyword, number, call] = match;
    const className = comment
      ? PYTHON_TOKEN_CLASS.comment
      : string
        ? PYTHON_TOKEN_CLASS.string
        : keyword
          ? PYTHON_TOKEN_CLASS.keyword
          : number
            ? PYTHON_TOKEN_CLASS.number
            : call
              ? PYTHON_TOKEN_CLASS.call
              : null;
    nodes.push(
      className ? (
        <span key={key} className={className}>
          {full}
        </span>
      ) : (
        full
      )
    );
    key += 1;
    lastIndex = match.index + full.length;
    match = PYTHON_TOKEN.exec(code);
  }
  if (lastIndex < code.length) {
    nodes.push(code.slice(lastIndex));
  }
  return nodes;
}

export function Playground({ scenario: scenarioId }) {
  const scenario = PLAYGROUND_SCENARIOS[scenarioId];
  const controls = scenario?.controls ?? [];

  const [values, setValues] = useState(() => initialValues(controls));
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [booted, setBooted] = useState(false);
  const [ranParams, setRanParams] = useState(null);

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
    setRanParams({ ...values });

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

  const displayedCode = ranParams ? resolveTemplate(scenario.template, ranParams) : scenario.template;

  return (
    <section className="not-prose my-6 space-y-5">
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

      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>

      <div>
        <p className="m-0 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {ranParams ? "방금 실행한 코드" : "예제 코드"}
        </p>
        <pre className="m-0 overflow-x-auto rounded-xl bg-slate-950 p-4 font-mono text-[12px] leading-5 text-slate-100">
          <code>{highlightPython(displayedCode)}</code>
        </pre>
        {scenario.note ? (
          <p className="m-0 mt-2 text-[11px] leading-4 text-slate-400">{scenario.note}</p>
        ) : null}
      </div>

      <div>
        <div className="flex items-center gap-3">
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
