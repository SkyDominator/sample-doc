import React from "react";

export default function HomePage() {
  return React.createElement(
    "main",
    { style: { maxWidth: 860, margin: "40px auto", fontFamily: "ui-sans-serif, system-ui" } },
    React.createElement("h1", null, "nano-llm-engine docs"),
    React.createElement(
      "p",
      null,
      "This project demonstrates a docs-as-code pipeline with automated API reference generation, translation, snippet execution validation, and link checks."
    ),
    React.createElement(
      "ul",
      null,
      React.createElement("li", null, "Korean source docs: docs/content/docs/*.mdx"),
      React.createElement("li", null, "English generated docs: docs/content/docs/*.en.mdx"),
      React.createElement("li", null, "SDK package: sdk/nano_llm")
    )
  );
}
