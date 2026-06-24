import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { source } from "../../../lib/source";
import { getMDXComponents } from "../../../components/mdx";

export default async function DocsPage({ params }) {
  const resolved = await params;
  if (!resolved.slug || resolved.slug.length === 0) {
    redirect("/docs/guides/quickstart");
  }

  const page = source.getPage(resolved.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const toc = page.data.toc ?? [];

  return React.createElement(
    "div",
    { className: "docs-page-grid" },
    React.createElement(
      "article",
      { className: "docs-article" },
      React.createElement("p", { className: "docs-kicker" }, "Documentation"),
      React.createElement("h1", { className: "docs-title" }, page.data.title),
      page.data.description
        ? React.createElement("p", { className: "docs-description" }, page.data.description)
        : null,
      React.createElement(MDX, { components: getMDXComponents() })
    ),
    React.createElement(
      "aside",
      { className: "docs-toc" },
      React.createElement("p", { className: "docs-toc-title" }, "On this page"),
      toc.length > 0
        ? React.createElement(
            "ul",
            null,
            toc.map((item) =>
              React.createElement(
                "li",
                { key: item.url },
                React.createElement(Link, { href: item.url }, item.title)
              )
            )
          )
        : React.createElement("p", { className: "docs-toc-empty" }, "This page does not expose a generated table of contents yet.")
    )
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}
