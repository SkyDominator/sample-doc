import React from "react";

import { DocsNavigation } from "@/components/docs-navigation";
import {
  buildNavigationGroups,
  flattenNavigationGroups,
  isValidDocLocale,
} from "@/lib/docs";
import { source } from "@/lib/source";

export default async function DocsLayout({ children, params }) {
  const resolved = await params;
  const locale = isValidDocLocale(resolved.lang) ? resolved.lang : "ko";
  const pages = source.getPages(locale);
  const groups = buildNavigationGroups(pages);
  const searchItems = flattenNavigationGroups(groups);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.08),transparent_24%),linear-gradient(180deg,#f8fbfd_0%,#f3f7fb_45%,#f8fafc_100%)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <DocsNavigation currentLocale={locale} groups={groups} searchItems={searchItems} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
