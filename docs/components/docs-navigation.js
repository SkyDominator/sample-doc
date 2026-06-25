"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ChevronDown,
  Menu,
} from "lucide-react";

import { DocsCommandMenu } from "@/components/docs-command-menu";
import { LocaleSelect } from "@/components/locale-select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getDocsHref } from "@/lib/docs";

function SidebarPanel({
  currentLocale,
  groups,
  openGroups,
  pathname,
  searchItems,
  setOpenGroups,
  onNavigate,
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 border-b border-slate-200 pb-5">
        <Link className="block" href={getDocsHref(currentLocale)} onClick={onNavigate}>
          <p className="text-sm font-semibold text-slate-950">nano-llm-engine</p>
          <p className="mt-1 text-sm text-slate-500">Docs</p>
        </Link>

        <DocsCommandMenu className="mt-4" items={searchItems} />

        <LocaleSelect className="mt-4" currentLocale={currentLocale} pathname={pathname} />
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto pb-10" aria-label="Documentation">
        {groups.map((group) => {
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
                    "group flex w-full items-center justify-between py-1 text-left transition-colors",
                    isActiveGroup
                      ? "text-slate-950"
                      : "text-slate-600 hover:text-slate-950"
                  )}
                  type="button"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold uppercase tracking-[0.22em] text-slate-400 group-hover:text-slate-500">
                      {group.label}
                    </span>
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </button>
              </Collapsible.Trigger>

              <Collapsible.Content className="pt-2">
                <div className="space-y-1 border-l border-slate-200 pl-3">
                  {group.items.map((item) => {
                    const active = pathname === item.url || pathname.startsWith(`${item.url}/`);

                    return (
                      <Link
                        className={cn(
                          "block py-1.5 text-sm transition-colors",
                          active
                            ? "font-medium text-slate-950"
                            : "text-slate-600 hover:text-slate-950"
                        )}
                        href={item.url}
                        key={item.url}
                        onClick={onNavigate}
                      >
                        <span className="block">{item.title}</span>
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
        <div className="sticky top-0 h-screen border-r border-slate-200 bg-white">
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
