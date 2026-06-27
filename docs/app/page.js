import { LandingPage } from "@/components/landing-page";
import { DEFAULT_DOC_LOCALE } from "@/lib/docs";

export default function HomePage() {
  return <LandingPage currentLocale={DEFAULT_DOC_LOCALE} />;
}
