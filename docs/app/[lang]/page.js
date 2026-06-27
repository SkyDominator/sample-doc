import { notFound } from "next/navigation";

import { LandingPage } from "@/components/landing-page";
import { isValidDocLocale } from "@/lib/docs";

export default async function LocaleHomePage({ params }) {
  const resolved = await params;
  if (!isValidDocLocale(resolved.lang)) notFound();

  return <LandingPage currentLocale={resolved.lang} />;
}

export function generateStaticParams() {
  return [{ lang: "ko" }, { lang: "en" }];
}