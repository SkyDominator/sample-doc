import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DocsToc } from "@/components/docs-toc";
import {
  buildNavigationGroups,
  flattenNavigationGroups,
  getDocsHref,
  getSectionMeta,
  isValidDocLocale,
} from "@/lib/docs";
import { source } from "@/lib/source";
import { getMDXComponents } from "@/components/mdx";

const DEFAULT_METADATA = {
  title: "nano-llm-engine",
  description: "Docs-as-code portfolio for a mock LLM inference SDK.",
};

function findNeighbors(items, currentUrl) {
  const index = items.findIndex((item) => item.url === currentUrl);
  if (index === -1) return { previous: null, next: null };

  return {
    previous: index > 0 ? items[index - 1] : null,
    next: index < items.length - 1 ? items[index + 1] : null,
  };
}

export default async function DocsPage({ params }) {
  const resolved = await params;
  const locale = isValidDocLocale(resolved.lang) ? resolved.lang : null;
  if (!locale) notFound();

  const slug = resolved.slug ?? [];
  const page = source.getPage(slug, locale);
  if (!page) notFound();

  const pages = source.getPages(locale);
  const groups = buildNavigationGroups(pages);
  const allItems = flattenNavigationGroups(groups);
  const { previous, next } = findNeighbors(allItems, page.url);
  const MDX = page.data.body;
  const toc = page.data.toc ?? [];
  const section = getSectionMeta(page.slugs?.[0]);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:px-12">
      <div className="mx-auto grid max-w-[1240px] gap-8 xl:grid-cols-[minmax(0,1fr)_280px] xl:gap-10">
        <article className="min-w-0">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-panel backdrop-blur sm:p-8 xl:p-10">
            <Badge>{section.label}</Badge>

            <h1 className="mt-5 max-w-4xl text-balance text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              {page.data.title}
            </h1>

            {page.data.description ? (
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
                {page.data.description}
              </p>
            ) : null}
          </div>

          <div className="mt-8 rounded-[2rem] border border-slate-200/80 bg-white/90 px-6 py-8 shadow-soft backdrop-blur sm:px-8 xl:px-10">
            <div className="prose prose-slate max-w-none prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:tracking-tight prose-h1:mb-5 prose-h1:text-4xl prose-h2:mt-12 prose-h2:text-2xl prose-h3:mt-8 prose-h3:text-xl prose-p:text-[15px] prose-p:leading-7 prose-li:text-[15px] prose-li:leading-7 prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary/80 prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0 prose-code:rounded prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-pre:prose-code:bg-transparent prose-pre:prose-code:p-0 prose-blockquote:rounded-r-2xl prose-blockquote:border-l-4 prose-blockquote:border-primary/40 prose-blockquote:bg-primary/5 prose-blockquote:px-5 prose-blockquote:py-1 prose-table:overflow-hidden prose-table:rounded-2xl prose-table:border prose-table:border-slate-200 prose-th:bg-slate-50 prose-th:px-4 prose-th:py-3 prose-td:px-4 prose-td:py-3">
              <MDX components={getMDXComponents()} />
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {previous ? (
              <Button asChild className="h-auto justify-start rounded-[1.5rem] px-5 py-4" variant="outline">
                <Link href={previous.url}>
                  <ArrowLeft className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="min-w-0 text-left">
                    <span className="block text-[11px] uppercase tracking-[0.22em] text-slate-400">
                      Previous
                    </span>
                    <span className="mt-1 block truncate text-sm text-slate-900">{previous.title}</span>
                  </span>
                </Link>
              </Button>
            ) : (
              <div />
            )}

            {next ? (
              <Button asChild className="h-auto justify-end rounded-[1.5rem] px-5 py-4 text-right" variant="outline">
                <Link href={next.url}>
                  <span className="min-w-0 text-right">
                    <span className="block text-[11px] uppercase tracking-[0.22em] text-slate-400">
                      Next
                    </span>
                    <span className="mt-1 block truncate text-sm text-slate-900">{next.title}</span>
                  </span>
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
                </Link>
              </Button>
            ) : null}
          </div>
        </article>

        <aside className="hidden xl:block">
          <div className="sticky top-8 space-y-4">
            <DocsToc items={toc} />

            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-5 shadow-soft backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Need next steps?
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Use the command palette to jump across guides, generated API reference, and runnable tutorials without losing your current locale.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const locale = isValidDocLocale(resolved.lang) ? resolved.lang : null;
  if (!locale) return DEFAULT_METADATA;

  const slug = resolved.slug ?? [];
  const page = source.getPage(slug, locale);
  if (!page) return DEFAULT_METADATA;

  return {
    title: `${page.data.title} | nano-llm-engine`,
    description: page.data.description ?? DEFAULT_METADATA.description,
  };
}

export async function generateStaticParams() {
  return source.generateParams("slug", "lang");
}
