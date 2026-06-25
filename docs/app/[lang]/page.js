import { notFound, redirect } from "next/navigation";

import { DOCS_HOME_SLUGS, getDocsHref, isValidDocLocale } from "@/lib/docs";

export default async function LocaleHomePage({ params }) {
  const resolved = await params;
  if (!isValidDocLocale(resolved.lang)) notFound();

  redirect(getDocsHref(resolved.lang, DOCS_HOME_SLUGS));
}