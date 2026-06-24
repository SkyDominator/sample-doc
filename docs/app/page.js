import React from "react";
import Link from "next/link";

function Card({ eyebrow, title, children, href }) {
  return React.createElement(
    Link,
    { href, className: "home-card" },
    React.createElement("p", { className: "home-card-eyebrow" }, eyebrow),
    React.createElement("h3", { className: "home-card-title" }, title),
    React.createElement("p", { className: "home-card-copy" }, children)
  );
}

export default function HomePage() {
  return React.createElement(
    "main",
    { className: "home-shell" },
    React.createElement(
      "section",
      { className: "home-hero" },
      React.createElement(
        "div",
        { className: "home-hero-copy" },
        React.createElement("p", { className: "home-kicker" }, "Docs-as-code portfolio"),
        React.createElement(
          "h1",
          { className: "home-title" },
          "A runnable documentation pipeline for a mock LLM inference SDK."
        ),
        React.createElement(
          "p",
          { className: "home-summary" },
          "This site is not a generic template. It demonstrates a writer-owned workflow where API docs are generated from source, runnable snippets are executed in CI, and Korean source docs can be mirrored into English outputs for preview and rehearsal."
        ),
        React.createElement(
          "div",
          { className: "home-actions" },
          React.createElement(Link, { href: "/docs/guides/quickstart", className: "button-primary" }, "Read the docs"),
          React.createElement(Link, { href: "/docs/api/engine", className: "button-secondary" }, "Inspect API reference")
        )
      ),
      React.createElement(
        "div",
        { className: "home-proof" },
        React.createElement("p", { className: "home-proof-label" }, "What the pipeline proves"),
        React.createElement(
          "ul",
          { className: "home-proof-list" },
          React.createElement("li", null, "Source changes regenerate API reference pages."),
          React.createElement("li", null, "Runnable snippets are executed, not just linted."),
          React.createElement("li", null, "Local preview works without production deployment."),
          React.createElement("li", null, "CI can fall back to mock translation for rehearsal."),
          React.createElement("li", null, "Release tags snapshot versioned docs folders.")
        )
      )
    ),
    React.createElement(
      "section",
      { className: "home-grid" },
      React.createElement(Card, {
        eyebrow: "Guides",
        title: "Concept-first documentation",
        href: "/docs/guides/concepts",
        children: "Quantization, KV cache, batching, and streaming are explained in task-oriented language rather than buried in reference pages.",
      }),
      React.createElement(Card, {
        eyebrow: "Tutorial",
        title: "Runnable end-to-end walkthrough",
        href: "/docs/tutorials/inference-pipeline",
        children: "The inference pipeline tutorial follows the same shape a real SDK team would document: configure, load, generate, observe, and recover.",
      }),
      React.createElement(Card, {
        eyebrow: "Automation",
        title: "Generated API reference",
        href: "/docs/api/engine",
        children: "API pages are regenerated from source docstrings, then validated alongside the narrative docs during the same pipeline run.",
      })
    )
  );
}
