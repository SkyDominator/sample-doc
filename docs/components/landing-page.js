import Link from "next/link";
import { ArrowRight, Braces, FlaskConical, Globe, PlayCircle, Sparkles } from "lucide-react";

import { HtmlLang } from "@/components/html-lang";
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
import { buildNavigationGroups, getDocsHref } from "@/lib/docs";
import { source } from "@/lib/source";

const LANDING_COPY = {
  ko: {
    platformLabel: "API 플랫폼",
    quickstartButton: "개발자 빠른 시작",
    heroBadge: "Ray Kim이 설계한 문서 경험",
    heroTitle: "RNGD 하드웨어 흐름을 빠르게 이해하는 문서 허브",
    heroDescription:
      "MDX 컴포넌트, 실행 가능한 예제, 자동 생성 API 레퍼런스를 한곳에 모아 RayKimLLM mock SDK의 전체 흐름을 빠르게 파악할 수 있도록 구성한 문서 사이트입니다.",
    readDocs: "문서 읽기",
    inspectApi: "API 레퍼런스 보기",
    aboutBadge: "About Ray Kim",
    aboutTitle: "문서와 지식 설계를 함께 끌어올리세요",
    aboutDescription:
      "Ray Kim과 함께 문서 구조, 지식 탐색, 개발자 경험을 한 단계 더 정교하게 다듬을 수 있습니다.",
    aboutPoints: [
      "20개 이상의 기술 문서화용 에이전트 워크플로를 설계하고 유지해 왔습니다.",
      "정보 구조와 지식 서비스 엔지니어링 관점에서 문서 경험을 설계합니다.",
    ],
    startBadge: "Ray Kim과 함께 시작하기",
    startDescription: "빠른 시작, 튜토리얼, 마이그레이션 가이드, 변경 노트, API 레퍼런스를 바로 탐색하세요.",
    openSection: "섹션 열기",
    changesBadge: "최근 변경 사항",
    changesTitle: "문서 최신 업데이트",
    changesDescription: "`changes` 문서 폴더에 정리된 릴리스 노트 형식의 변경 사항을 빠르게 훑어볼 수 있습니다.",
    tutorialCardTitle: "튜토리얼 경로 바로 열기",
    tutorialCardDescription: "실행 가능한 추론 파이프라인부터 시작해 전체 SDK 흐름을 따라가 보세요.",
    tutorialCardButton: "튜토리얼 시작하기",
    entries: {
      guides: {
        eyebrow: "가이드",
        title: "핵심 개념",
        description: "양자화, KV cache, 배치 처리, 스트리밍의 기본 개념을 정리합니다.",
      },
      tutorials: {
        eyebrow: "튜토리얼",
        title: "처음부터 끝까지 따라가는 실행 흐름",
        description: "추론 파이프라인 튜토리얼은 구성, 로드, 생성, 점검, 복구까지 실제 SDK 도입 흐름을 닮은 경로를 제공합니다.",
      },
      api: {
        eyebrow: "API",
        title: "자동 생성 API 레퍼런스",
        description: "소스 코드에서 추출한 계약 정보를 설명형 문서와 함께 보여 줍니다.",
      },
    },
  },
  en: {
    platformLabel: "API Platform",
    quickstartButton: "Developer quickstart",
    heroBadge: "Brought by Ray Kim",
    heroTitle: "Light-speed Inference with RNGD Hardware",
    heroDescription:
      "This is a mockup documentation site with mdx components, runnable snippets, and generated API reference. It is built with Next.js 14, Radix UI, Tailwind CSS, and shadcn/ui, and Vibe Coding.",
    readDocs: "Read the docs",
    inspectApi: "Inspect API reference",
    aboutBadge: "About Ray Kim",
    aboutTitle: "Let us start our prosperous journey!",
    aboutDescription:
      "Hire Ray Kim and get your documentation site benefitted from the world-class knowledge engineering service!",
    aboutPoints: [
      "Maintained More than 20 Agent Workflows for Technical Writing",
      "Professional in Information Architecture and Knowledge Service Engineering",
    ],
    startBadge: "Start building with Ray Kim",
    startDescription: "Quick-start, Tutorial, Migration Guide, Release Notes, and API Reference",
    openSection: "Open section",
    changesBadge: "Surface changes",
    changesTitle: "Recent documentation changes",
    changesDescription: "Release-note style updates rendered from the `changes` docs folder.",
    tutorialCardTitle: "Open the tutorial path",
    tutorialCardDescription: "Start from the runnable inference pipeline with executable snippets!",
    tutorialCardButton: "Run through the tutorial",
    entries: {
      guides: {
        eyebrow: "Guides",
        title: "Concepts",
        description: "Quantization, KV cache, batching, and streaming",
      },
      tutorials: {
        eyebrow: "Tutorials",
        title: "Runnable end-to-end walkthrough",
        description:
          "The inference pipeline tutorial mirrors a real SDK adoption path: configure, load, generate, inspect, and recover.",
      },
      api: {
        eyebrow: "API",
        title: "Auto-generated API Reference",
        description: "Reference pages are derived from source via griffe and rendered alongside narrative docs.",
      },
    },
  },
};

export function LandingPage({ currentLocale }) {
  const copy = LANDING_COPY[currentLocale] ?? LANDING_COPY.en;
  const entries = [
    {
      eyebrow: copy.entries.guides.eyebrow,
      title: copy.entries.guides.title,
      description: copy.entries.guides.description,
      href: getDocsHref(currentLocale, ["guides", "concepts"]),
      icon: Globe,
    },
    {
      eyebrow: copy.entries.tutorials.eyebrow,
      title: copy.entries.tutorials.title,
      description: copy.entries.tutorials.description,
      href: getDocsHref(currentLocale, ["tutorials", "inference-pipeline"]),
      icon: PlayCircle,
    },
    {
      eyebrow: copy.entries.api.eyebrow,
      title: copy.entries.api.title,
      description: copy.entries.api.description,
      href: getDocsHref(currentLocale, ["api", "engine"]),
      icon: Braces,
    },
  ];

  const changePages = buildNavigationGroups(source.getPages(currentLocale)).find(
    (group) => group.key === "changes"
  )?.items ?? [];

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.12),transparent_26%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.08),transparent_24%),linear-gradient(180deg,#f8fbfd_0%,#f3f7fb_48%,#f8fafc_100%)]">
      <HtmlLang lang={currentLocale} />
      <div className="absolute inset-0 bg-hero-grid bg-[size:40px_40px] opacity-40" />
      <div className="relative mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="rounded-[2rem] border border-white/70 bg-white/75 px-6 py-5 shadow-soft backdrop-blur sm:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.35rem] bg-slate-950 text-white shadow-lg shadow-slate-950/10">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{copy.platformLabel}</p>
                <h1 className="mt-1 text-lg font-semibold text-slate-950">RayKimLLM</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <LocaleSelect currentLocale={currentLocale} mode="landing" />
              <Button asChild>
                <Link href={getDocsHref(currentLocale, ["guides", "quickstart"])}>
                  {copy.quickstartButton}
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <section className="grid gap-6 pb-8 pt-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)] lg:items-stretch lg:pb-12 lg:pt-12">
          <div className="rounded-[2.25rem] border border-white/80 bg-white/82 p-7 shadow-panel backdrop-blur sm:p-10">
            <Badge>{copy.heroBadge}</Badge>
            <h2 className="mt-6 max-w-4xl text-balance text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              {copy.heroTitle}
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              {copy.heroDescription}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={getDocsHref(currentLocale, ["guides", "quickstart"])}>
                  {copy.readDocs}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={getDocsHref(currentLocale, ["api", "engine"])}>{copy.inspectApi}</Link>
              </Button>
            </div>
          </div>

          <Card className="h-full bg-slate-950 text-white shadow-panel">
            <CardHeader>
              <Badge className="w-fit border-white/10 bg-white/10 text-white" variant="secondary">
                {copy.aboutBadge}
              </Badge>
              <CardTitle className="text-2xl text-white">{copy.aboutTitle}</CardTitle>
              <CardDescription className="text-slate-300">
                {copy.aboutDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-sm leading-7 text-slate-300">
                {copy.aboutPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="pb-10">
          <div className="mb-6 flex items-center gap-3">
            <Badge variant="outline">{copy.startBadge}</Badge>
            <p className="text-sm text-slate-500">{copy.startDescription}</p>
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
                        {copy.openSection}
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
              <Badge variant="outline">{copy.changesBadge}</Badge>
              <CardTitle>{copy.changesTitle}</CardTitle>
              <CardDescription>
                {copy.changesDescription}
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
              <CardTitle>{copy.tutorialCardTitle}</CardTitle>
              <CardDescription>
                {copy.tutorialCardDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={getDocsHref(currentLocale, ["tutorials", "inference-pipeline"])}>
                  {copy.tutorialCardButton}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}