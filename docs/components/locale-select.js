"use client";

import { useRouter } from "next/navigation";

import {
  DOCS_HOME_SLUGS,
  DOC_LOCALES,
  getDocsHref,
  getLocaleMeta,
  swapLocaleInPathname,
} from "@/lib/docs";
import { cn } from "@/lib/utils";

export function LocaleSelect({
  className,
  currentLocale,
  mode = "docs",
  pathname,
}) {
  const router = useRouter();

  return (
    <label className={cn("flex min-w-[160px] flex-col gap-2", className)}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        Locale
      </span>
      <select
        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-primary"
        onChange={(event) => {
          const nextLocale = event.target.value;
          const href =
            mode === "landing"
              ? getDocsHref(nextLocale, DOCS_HOME_SLUGS)
              : swapLocaleInPathname(pathname, nextLocale);

          router.push(href);
        }}
        value={currentLocale}
      >
        {DOC_LOCALES.map((locale) => {
          const meta = getLocaleMeta(locale);

          return (
            <option key={locale} value={locale}>
              {meta.name}
            </option>
          );
        })}
      </select>
    </label>
  );
}
