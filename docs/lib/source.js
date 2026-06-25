import { loader } from "fumadocs-core/source";
import { docs } from "../.source";

export const source = loader({
  baseUrl: "/docs",
  i18n: {
    languages: ["ko", "en"],
    defaultLanguage: "ko",
    hideLocale: "never",
  },
  source: docs.toFumadocsSource(),
});
