import React from "react";

export const metadata = {
  title: "nano-llm-engine",
  description: "Docs-as-code portfolio for a mock LLM inference SDK.",
};

export default function RootLayout({ children }) {
  return React.createElement(
    "html",
    { lang: "en" },
    React.createElement(
      "body",
      null,
      React.createElement("link", {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      }),
      React.createElement("link", {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "",
      }),
      React.createElement("link", {
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap",
        rel: "stylesheet",
      }),
      React.createElement("link", { rel: "stylesheet", href: "/globals.css" }),
      children
    )
  );
}
