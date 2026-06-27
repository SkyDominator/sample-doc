import Link from "next/link";
import defaultMdxComponents from "fumadocs-ui/mdx";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Cards,
} from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { DocsCodeBlock } from "@/components/mdx-code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function isExternalHref(href) {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href);
}

function resolveDocsHref(href, docPath) {
  if (!href || href.startsWith("#") || href.startsWith("/") || isExternalHref(href) || !docPath) {
    return href;
  }

  const resolved = new URL(href, `https://docs.local${docPath}`);
  return `${resolved.pathname}${resolved.search}${resolved.hash}`;
}

export function createDocsLinkComponent(docPath) {
  return function DocsLink({ href, children, ...props }) {
    const resolvedHref = resolveDocsHref(href, docPath);

    if (!resolvedHref || resolvedHref.startsWith("#") || isExternalHref(resolvedHref)) {
      return (
        <a href={resolvedHref} {...props}>
          {children}
        </a>
      );
    }

    return (
      <Link href={resolvedHref} {...props}>
        {children}
      </Link>
    );
  };
}

export function getMDXComponents(components = {}) {
  return {
    ...defaultMdxComponents,
    pre: DocsCodeBlock,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Cards,
    Callout,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    ...components,
  };
}

export const useMDXComponents = getMDXComponents;
