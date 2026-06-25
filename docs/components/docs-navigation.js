"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as Dialog from "@radix-ui/react-dialog";
import {
  BookOpen,
  Braces,
  ChevronDown,
  FlaskConical,
  LifeBuoy,
  Menu,
  RefreshCw,
} from "lucide-react";

import { DocsCommandMenu } from "@/components/docs-command-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DOC_LOCALES, getDocsHref, getLocaleMeta, swapLocaleInPathname } from "@/lib/docs";

const GROUP_ICONS = {
  guides: BookOpen,
  api: Braces,
  tutorials: FlaskConical,
  migration: RefreshCw,
  troubleshooting: LifeBuoy,
};

function SidebarPanel({
  currentLocale,
  groups,
  openGroups,
  pathname,
  searchItems,
  setOpenGroups,
  onNavigate,
}) {
  const quickGroups = groups.filter(
    (group) => ["guides", "api", "tutorials"].includes(group.key) && group.items[0]
  );

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 space-y-4">
        <Link href={getDocsHref(currentLocale)} onClick={onNavigate}>
          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-5 shadow-soft backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/10">
                <span className="text-sm font-semibold tracking-[0.18em]">NL</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">nano-llm-engine</p>
                <p className="text-xs text-slate-500">API docs and runnable references</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              OpenAI-style API docs surface with grouped navigation, quick search, and locale-specific paths.
            </p>
          </div>
        </Link>

        <DocsCommandMenu items={searchItems} />

        <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-3 shadow-soft backdrop-blur">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Locale
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {DOC_LOCALES.map((locale) => {
              const localeMeta = getLocaleMeta(locale);

              return (
                <Button
                  asChild
                  className="h-auto justify-start rounded-2xl px-3 py-3"
                  key={locale}
                  size="sm"
                  variant={locale === currentLocale ? "default" : "ghost"}
                >
                  <Link href={swapLocaleInPathname(pathname, locale)} onClick={onNavigate}>
                    <span className="mr-2">{localeMeta.label}</span>
                    <span className="text-[11px] font-medium uppercase tracking-[0.18em] opacity-75">
                      {localeMeta.name}
                    </span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {quickGroups.map((group) => (
          <Link
            className="inline-flex"
            href={group.items[0].url}
            key={group.key}
            onClick={onNavigate}
          >
            <Badge variant="outline">{group.label}</Badge>
          </Link>
        ))}
      </div>

      <nav className="flex-1 space-y-3 overflow-y-auto pb-10" aria-label="Documentation">
        {groups.map((group) => {
          const Icon = GROUP_ICONS[group.key] ?? BookOpen;
          const isActiveGroup = group.items.some(
            (item) => pathname === item.url || pathname.startsWith(`${item.url}/`)
          );

          return (
            <Collapsible.Root
              key={group.key}
              onOpenChange={(open) =>
                setOpenGroups((current) => ({
                  ...current,
                  [group.key]: open,
                }))
              }
              open={Boolean(openGroups[group.key])}
            >
              <Collapsible.Trigger asChild>
                <button
                  className={cn(
                    "group flex w-full items-center justify-between rounded-[1.5rem] border px-4 py-3 text-left transition-colors",
                    isActiveGroup
                      ? "border-primary/20 bg-primary/10 text-slate-950"
                      : "border-slate-200/80 bg-white/80 text-slate-700 hover:bg-white"
                  )}
                  type="button"
                >
                  <span className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 group-data-[state=open]:bg-primary/15 group-data-[state=open]:text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{group.label}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                        {group.description}
                      </span>
                    </span>
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </button>
              </Collapsible.Trigger>

              <Collapsible.Content className="pt-2">
                <div className="space-y-1 pl-3">
                  {group.items.map((item) => {
                    const active = pathname === item.url || pathname.startsWith(`${item.url}/`);

                    return (
                      <Link
                        className={cn(
                          "block rounded-2xl px-4 py-3 text-sm transition-colors",
                          active
                            ? "bg-slate-950 text-white shadow-soft"
                            : "text-slate-600 hover:bg-white hover:text-slate-950"
                        )}
                        href={item.url}
                        key={item.url}
                        onClick={onNavigate}
                      >
                        <span className="block font-medium">{item.title}</span>
                        {item.description ? (
                          <span
                            className={cn(
                              "mt-1 block text-xs leading-5",
                              active ? "text-white/70" : "text-slate-400"
                            )}
                          >
                            {item.description}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </Collapsible.Content>
            </Collapsible.Root>
          );
        })}
      </nav>
    </div>
  );
}

export function DocsNavigation({ currentLocale, groups, searchItems }) {
  const pathname = usePathname() ?? getDocsHref(currentLocale);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState(() =>
    Object.fromEntries(
      (groups ?? []).map((group) => [
        group.key,
        ["guides", "api", "tutorials"].includes(group.key),
      ])
    )
  );

  useEffect(() => {
    setOpenGroups((current) => {
      const next = { ...current };

      for (const group of groups ?? []) {
        if (group.items.some((item) => pathname === item.url || pathname.startsWith(`${item.url}/`))) {
          next[group.key] = true;
        } else if (!(group.key in next)) {
          next[group.key] = ["guides", "api", "tutorials"].includes(group.key);
        }
      }

      return next;
    });
  }, [groups, pathname]);

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-slate-200/70 bg-background/80 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link className="flex items-center gap-3" href={getDocsHref(currentLocale)}>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/10">
              <span className="text-sm font-semibold tracking-[0.18em]">NL</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">nano-llm-engine</p>
              <p className="text-xs text-slate-500">Docs</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <DocsCommandMenu compact items={searchItems} />
            <Dialog.Root onOpenChange={setMobileOpen} open={mobileOpen}>
              <Dialog.Trigger asChild>
                <Button size="icon" variant="outline">
                  <Menu className="h-4 w-4" />
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm" />
                <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-[min(88vw,380px)] border-r border-slate-200 bg-background p-4 shadow-2xl">
                  <Dialog.Title className="sr-only">Documentation navigation</Dialog.Title>
                  <SidebarPanel
                    currentLocale={currentLocale}
                    groups={groups}
                    onNavigate={() => setMobileOpen(false)}
                    openGroups={openGroups}
                    pathname={pathname}
                    searchItems={searchItems}
                    setOpenGroups={setOpenGroups}
                  />
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>
      </div>

      <aside className="hidden lg:block lg:w-[320px] lg:shrink-0 xl:w-[340px]">
        <div className="sticky top-0 h-screen border-r border-slate-200/70 bg-white/55 backdrop-blur">
          <div className="h-full overflow-y-auto px-6 py-6">
            <SidebarPanel
              currentLocale={currentLocale}
              groups={groups}
              openGroups={openGroups}
              pathname={pathname}
              searchItems={searchItems}
              setOpenGroups={setOpenGroups}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
