export const DOC_LOCALES = ["ko", "en"];
export const DEFAULT_DOC_LOCALE = "ko";
export const DOCS_HOME_SLUGS = ["guides", "quickstart"];

const LOCALE_META = {
  ko: { label: "KO", name: "Korean" },
  en: { label: "EN", name: "English" },
};

const SECTION_META = {
  guides: {
    label: "Guides",
    description: "Concepts, quickstarts, and core workflows.",
  },
  api: {
    label: "API",
    description: "Generated reference and SDK surfaces.",
  },
  tutorials: {
    label: "Tutorials",
    description: "Hands-on build paths and runnable flows.",
  },
  changes: {
    label: "Changes",
    description: "Release-style notes for docs surface updates.",
  },
  migration: {
    label: "Migration",
    description: "Version upgrades, diffs, and rollout notes.",
  },
  troubleshooting: {
    label: "Troubleshooting",
    description: "Diagnostics, failures, and recovery steps.",
  },
  overview: {
    label: "Overview",
    description: "High-level entry points and landing pages.",
  },
};

const SECTION_ORDER = [
  "guides",
  "api",
  "tutorials",
  "changes",
  "migration",
  "troubleshooting",
  "overview",
];

export function isValidDocLocale(locale) {
  return DOC_LOCALES.includes(locale);
}

export function getLocaleMeta(locale) {
  return LOCALE_META[locale] ?? LOCALE_META[DEFAULT_DOC_LOCALE];
}

export function getDocsHref(locale, slugs = []) {
  const normalizedLocale = isValidDocLocale(locale) ? locale : DEFAULT_DOC_LOCALE;
  const segments = Array.isArray(slugs)
    ? slugs.filter(Boolean)
    : String(slugs)
        .split("/")
        .filter(Boolean);

  return segments.length > 0
    ? `/${normalizedLocale}/docs/${segments.join("/")}`
    : `/${normalizedLocale}/docs`;
}

export function getSectionMeta(section) {
  return SECTION_META[section] ?? SECTION_META.overview;
}

export function buildNavigationGroups(pages) {
  const grouped = new Map();

  for (const page of pages ?? []) {
    const [section] = page.slugs ?? [];
    if (!section) continue;

    const key = SECTION_META[section] ? section : "overview";
    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        ...SECTION_META[key],
        items: [],
      });
    }

    grouped.get(key).items.push({
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      slugs: page.slugs,
    });
  }

  const ordered = [];
  for (const key of SECTION_ORDER) {
    const group = grouped.get(key);
    if (group && group.items.length > 0) {
      ordered.push(group);
      grouped.delete(key);
    }
  }

  for (const group of grouped.values()) {
    if (group.items.length > 0) ordered.push(group);
  }

  return ordered;
}

export function flattenNavigationGroups(groups) {
  return (groups ?? []).flatMap((group) =>
    group.items.map((item) => ({
      ...item,
      groupKey: group.key,
      groupLabel: group.label,
    }))
  );
}

export function swapLocaleInPathname(pathname, locale) {
  if (!isValidDocLocale(locale)) return pathname;
  if (!pathname) return getDocsHref(locale, DOCS_HOME_SLUGS);

  const matched = pathname.match(/^\/(ko|en)(\/docs(?:\/.*)?)$/);
  if (matched) {
    return `/${locale}${matched[2]}`;
  }

  return getDocsHref(locale, DOCS_HOME_SLUGS);
}
