import { notFound } from "next/navigation";

import { isValidDocLocale } from "@/lib/docs";

export default async function LocaleLayout({ children, params }) {
  const resolved = await params;

  if (!isValidDocLocale(resolved.lang)) {
    notFound();
  }

  return children;
}

export function generateStaticParams() {
  return [{ lang: "ko" }, { lang: "en" }];
}