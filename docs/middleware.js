import { createI18nMiddleware } from "fumadocs-core/i18n";

export default createI18nMiddleware({
  defaultLanguage: "ko",
  hideLocale: "never",
  languages: ["ko", "en"],
});

export const config = {
  matcher: ["/docs/:path*", "/(ko|en)/docs/:path*"],
};