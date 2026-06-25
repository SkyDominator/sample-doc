import Link from "next/link";
import { ArrowRight, Braces, FlaskConical, Globe, PlayCircle, Sparkles } from "lucide-react";

import { LocaleSelect } from "@/components/locale-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Cards,
} from "@/components/ui/card";
import { DEFAULT_DOC_LOCALE, buildNavigationGroups, getDocsHref } from "@/lib/docs";
import { source } from "@/lib/source";

const entries = [
  {
    eyebrow: "Guides",
    title: "Concept-first documentation",
    description:
      "Quantization, KV cache, batching, and streaming are structured as build paths rather than buried as isolated notes.",
    href: getDocsHref(DEFAULT_DOC_LOCALE, ["guides", "concepts"]),
    icon: Globe,
  },
  {
    eyebrow: "Tutorials",
    title: "Runnable end-to-end walkthrough",
    description:
      "The inference pipeline tutorial mirrors a real SDK adoption path: configure, load, generate, inspect, and recover.",
    href: getDocsHref(DEFAULT_DOC_LOCALE, ["tutorials", "inference-pipeline"]),
    icon: PlayCircle,
  },
  {
    eyebrow: "API",
    title: "Generated API reference",
    description:
      "Reference pages are derived from source and rendered alongside narrative docs in the same documentation surface.",
    href: getDocsHref(DEFAULT_DOC_LOCALE, ["api", "engine"]),
    icon: Braces,
  },
];

export default function HomePage() {
  const changePages = buildNavigationGroups(source.getPages(DEFAULT_DOC_LOCALE)).find(
    (group) => group.key === "changes"
  )?.items ?? [];

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.12),transparent_26%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.08),transparent_24%),linear-gradient(180deg,#f8fbfd_0%,#f3f7fb_48%,#f8fafc_100%)]">
      <div className="absolute inset-0 bg-hero-grid bg-[size:40px_40px] opacity-40" />
      <div className="relative mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="rounded-[2rem] border border-white/70 bg-white/75 px-6 py-5 shadow-soft backdrop-blur sm:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.35rem] bg-slate-950 text-white shadow-lg shadow-slate-950/10">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">API Platform</p>
                <h1 className="mt-1 text-lg font-semibold text-slate-950">nano-llm-engine docs</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <LocaleSelect currentLocale={DEFAULT_DOC_LOCALE} mode="landing" />
              <Button asChild>
                <Link href={getDocsHref(DEFAULT_DOC_LOCALE, ["guides", "quickstart"])}>
                  Developer quickstart
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <section className="grid gap-6 pb-8 pt-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)] lg:items-stretch lg:pb-12 lg:pt-12">
          <div className="rounded-[2.25rem] border border-white/80 bg-white/82 p-7 shadow-panel backdrop-blur sm:p-10">
            <Badge>Docs-as-code portfolio</Badge>
            <h2 className="mt-6 max-w-4xl text-balance text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              A runnable API guide surface for a mock inference SDK.
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              The site follows the shape of a modern API platform: grouped docs navigation, locale-aware paths, quick command search, generated reference pages, and MDX components for cards, tabs, and callouts.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={getDocsHref(DEFAULT_DOC_LOCALE, ["guides", "quickstart"])}>
                  Read the docs
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={getDocsHref(DEFAULT_DOC_LOCALE, ["api", "engine"])}>Inspect API reference</Link>
              </Button>
            </div>
          </div>

          <Card className="h-full bg-slate-950 text-white shadow-panel">
            <CardHeader>
              <Badge className="w-fit border-white/10 bg-white/10 text-white" variant="secondary">
                Build paths
              </Badge>
              <CardTitle className="text-2xl text-white">What this docs pipeline proves</CardTitle>
              <CardDescription className="text-slate-300">
                Writer-owned automation and generated reference can live in the same product-grade docs shell.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-sm leading-7 text-slate-300">
                <li>Source changes regenerate API reference pages.</li>
                <li>Runnable snippets are executed, not just linted.</li>
                <li>Locale switching preserves the active docs surface.</li>
                <li>Navigation is grouped by docs intent: Guides, API, Tutorials, and more.</li>
                <li>MDX components make callouts, tabs, and cards consistent across pages.</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="pb-10">
          <div className="mb-6 flex items-center gap-3">
            <Badge variant="outline">Start building</Badge>
            <p className="text-sm text-slate-500">Key paths into the documentation surface</p>
          </div>

          <Cards className="xl:grid-cols-3">
            {entries.map((entry) => {
              const Icon = entry.icon;

              return (
                <Link href={entry.href} key={entry.href}>
                  <Card className="h-full transition-transform duration-200 hover:-translate-y-1 hover:bg-white">
                    <CardHeader>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                        {entry.eyebrow}
                      </p>
                      <CardTitle>{entry.title}</CardTitle>
                      <CardDescription>{entry.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
                        Open section
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </Cards>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card>
            <CardHeader>
              <Badge variant="outline">Surface changes</Badge>
              <CardTitle>Recent documentation changes</CardTitle>
              <CardDescription>
                Release-note style updates rendered from the `changes` docs folder.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {changePages.map((item) => (
                <Link href={item.url} key={item.url}>
                  <div className="rounded-[1.5rem] bg-slate-50 p-5 transition-colors hover:bg-slate-100">
                    <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-primary/10">
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <FlaskConical className="h-5 w-5" />
              </div>
              <CardTitle>Open the tutorial path</CardTitle>
              <CardDescription>
                Start from the runnable inference pipeline to see the full docs-as-code loop with executable snippets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={getDocsHref(DEFAULT_DOC_LOCALE, ["tutorials", "inference-pipeline"])}>
                  Go to tutorial
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
