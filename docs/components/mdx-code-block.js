"use client";

import { Children, cloneElement, isValidElement, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

function extractText(node) {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map((item) => extractText(item)).join("");
  }

  if (isValidElement(node)) {
    return extractText(node.props.children);
  }

  return "";
}

function inferLanguageFromText(text) {
  const normalized = text.trim();

  if (/^(pip|python|export|echo|curl|pnpm|npm|yarn)\b/m.test(normalized) || normalized.includes("./sdk")) {
    return "bash";
  }

  if (
    /^(from\s+\w+\s+import|import\s+\w+|def\s+\w+\(|class\s+\w+\(|try:|except\s+|for\s+\w+\s+in\s+.+:)/m.test(
      normalized
    )
  ) {
    return "python";
  }

  if (/^\s*\{[\s\S]*\}\s*$/m.test(normalized)) {
    return "json";
  }

  return "text";
}

function detectLanguage(node, fallback, text) {
  if (fallback) return fallback;
  if (!isValidElement(node)) return inferLanguageFromText(text);

  const className = node.props.className ?? "";
  const matched = className.match(/language-([\w-]+)/);
  if (matched?.[1]) return matched[1];

  return inferLanguageFromText(text);
}

function formatLanguage(language) {
  const normalized = (language ?? "text").toLowerCase();

  if (normalized === "py") return "Python";
  if (normalized === "js") return "JavaScript";
  if (normalized === "ts") return "TypeScript";
  if (normalized === "sh" || normalized === "bash" || normalized === "shell") return "Bash";

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function applyShikiTokenColors(node) {
  if (!isValidElement(node)) {
    return node;
  }

  const nextChildren = Children.map(node.props.children, applyShikiTokenColors);
  const nextProps = { children: nextChildren };

  if (node.props.style) {
    const nextStyle = { ...node.props.style };

    if (nextStyle["--shiki-dark"] || nextStyle["--shiki-light"]) {
      nextStyle.color = "var(--shiki-dark)";
    }

    nextProps.style = nextStyle;
  }

  return cloneElement(node, nextProps);
}

function normalizeCodeChildren(children) {
  return Children.toArray(children).filter((child) => {
    if (child == null || typeof child === "boolean") {
      return false;
    }

    return !(typeof child === "string" && child.trim() === "");
  });
}

export function DocsCodeBlock({ children, className, ...props }) {
  const [copied, setCopied] = useState(false);
  const text = useMemo(() => extractText(children).replace(/\n$/, ""), [children]);
  const language = useMemo(
    () => formatLanguage(detectLanguage(children, props["data-language"], text)),
    [children, props, text]
  );

  const renderedChildren = useMemo(() => {
    const normalizedChildren = normalizeCodeChildren(children);
    const child = normalizedChildren.length === 1 ? normalizedChildren[0] : normalizedChildren;

    if (isValidElement(child)) {
      return cloneElement(applyShikiTokenColors(child), {
        className: cn(
          "block min-w-full whitespace-normal bg-transparent p-0 font-mono text-[13px] leading-6 text-slate-100",
          child.props.className
        ),
      });
    }

    return (
      <code className="block min-w-full whitespace-normal bg-transparent p-0 font-mono text-[13px] leading-6 text-slate-100">
        {Array.isArray(child) ? child.map((item) => applyShikiTokenColors(item)) : child}
      </code>
    );
  }, [children]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <figure
      className={cn(
        "not-prose my-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-soft",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/90 px-4 py-3">
        <figcaption className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          {language}
        </figcaption>
        <button
          className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          onClick={handleCopy}
          type="button"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        {...props}
        className="m-0 overflow-x-auto bg-transparent px-4 py-4 text-slate-100 focus-visible:outline-none"
      >
        {renderedChildren}
      </pre>
    </figure>
  );
}