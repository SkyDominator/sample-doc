import quickstartSyncGenerate from "./scenarios/quickstart-sync-generate.json";
import quickstartStreamingGenerate from "./scenarios/quickstart-streaming-generate.json";
import sdkSources from "./sdk-sources.json";

export const PLAYGROUND_SCENARIOS = {
  [quickstartSyncGenerate.id]: quickstartSyncGenerate,
  [quickstartStreamingGenerate.id]: quickstartStreamingGenerate,
};

export const PLAYGROUND_SDK_SOURCES = sdkSources;
