import { notFound } from "next/navigation";

import { HtmlLang } from "@/components/html-lang";
import { isValidDocLocale } from "@/lib/docs";

export default async function LocaleLayout({ children, params }) {
  const resolved = await params;

  if (!isValidDocLocale(resolved.lang)) {
    notFound();
  }

  return (
    <>
      <HtmlLang lang={resolved.lang} />
      {children}
    </>
  );
}

export function generateStaticParams() {
  return [{ lang: "ko" }, { lang: "en" }];
}