import quickstartSyncGenerate from "./scenarios/quickstart-sync-generate.json";
import quickstartStreamingGenerate from "./scenarios/quickstart-streaming-generate.json";
import sdkSources from "./sdk-sources.json";
import { PLAYGROUND_TRANSLATIONS } from "./translations";

export const PLAYGROUND_SCENARIOS = {
  [quickstartSyncGenerate.id]: quickstartSyncGenerate,
  [quickstartStreamingGenerate.id]: quickstartStreamingGenerate,
};

function localizeScenario(baseScenario, locale) {
  const translation = PLAYGROUND_TRANSLATIONS[locale]?.[baseScenario.id];
  if (!translation) {
    return baseScenario;
  }

  return {
    ...baseScenario,
    title: translation.title ?? baseScenario.title,
    summary: translation.summary ?? baseScenario.summary,
    note: translation.note ?? baseScenario.note,
    explanations: {
      ...baseScenario.explanations,
      ...translation.explanations,
    },
    controls: baseScenario.controls.map((control) => ({
      ...control,
      ...(translation.controls?.[control.name] ?? {}),
    })),
  };
}

export function getPlaygroundScenario(scenarioId, locale = "ko") {
  const baseScenario = PLAYGROUND_SCENARIOS[scenarioId];
  if (!baseScenario) {
    return null;
  }
  return localizeScenario(baseScenario, locale);
}

export const PLAYGROUND_SDK_SOURCES = sdkSources;
