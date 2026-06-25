import "./globals.css";
import { unstable_rootParams } from "next/server";

import { DEFAULT_DOC_LOCALE, isValidDocLocale } from "@/lib/docs";

export const metadata = {
  title: "nano-llm-engine",
  description: "Docs-as-code portfolio for a mock LLM inference SDK.",
};

export default async function RootLayout({ children, params }) {
  const resolvedParams = await params;
  const rootParams = await unstable_rootParams();
  const candidateLang = resolvedParams?.lang ?? rootParams?.lang;
  const lang = isValidDocLocale(candidateLang) ? candidateLang : DEFAULT_DOC_LOCALE;

  return (
    <html lang={lang}>
      <body>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {children}
      </body>
    </html>
  );
}
