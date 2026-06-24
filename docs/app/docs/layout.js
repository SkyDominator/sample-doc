import React from "react";
import Link from "next/link";
import { source } from "../../lib/source";

function collectPages(items, bucket = []) {
  for (const item of items ?? []) {
    if (item.type === "page") {
      bucket.push({ name: item.name, url: item.url });
    }
    if (item.children) {
      collectPages(item.children, bucket);
    }
  }
  return bucket;
}

export default function DocsLayout({ children }) {
  const tree = source.getPageTree();
  const pages = collectPages(tree.children);

  return React.createElement(
    "div",
    { className: "docs-shell" },
    React.createElement(
      "aside",
      { className: "docs-sidebar" },
      React.createElement(Link, { href: "/", className: "docs-brand" }, "nano-llm-engine"),
      React.createElement("p", { className: "docs-sidebar-copy" }, "Runnable docs-as-code portfolio for a mock LLM SDK."),
      React.createElement(
        "nav",
        { className: "docs-nav", "aria-label": "Documentation" },
        pages.map((page) =>
          React.createElement(
            Link,
            { key: page.url, href: page.url, className: "docs-nav-link" },
            page.name
          )
        )
      )
    ),
    React.createElement(
      "main",
      { className: "docs-main" },
      children
    )
  );
}
