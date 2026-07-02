// Korean scenario JSON files remain the single contract source of truth.
// Other locales only override reader-facing text.

export const PLAYGROUND_TRANSLATIONS = {
  en: {
    "quickstart-sync-generate": {
      title: "Synchronous generation playground",
      summary:
        "Adjust the MOCK_RNGD_HARDWARE guard, quantization label, and token budget to see how they appear in one generate() result.",
      note:
        "You can change only the values above. The rest of the flow stays fixed: load the model, produce one result, and clean up the device session.",
      explanations: {
        DeviceNotFoundError:
          "The device connection is off, so the runtime reports a missing execution environment before the session starts. This signals that the guard is working as intended, not that the engine is broken.",
        ValueError:
          "The request configuration is outside the allowed range. Invalid values are blocked before generation starts, so the failure stays predictable.",
      },
      controls: {
        quantization: {
          description:
            "Choose the precision label for the model weights. The selected value is echoed directly in the output prefix.",
        },
        max_tokens: {
          description:
            "Maximum number of tokens to generate in one request. Values outside the allowed range raise an error.",
        },
        mock_hardware: {
          description:
            "Turn the device connection on or off. When it is off, the run fails because no device session can be opened.",
        },
        prompt: {
          description:
            "Input text sent to the model. The same text appears at the end of the generated output.",
        },
      },
    },
    "quickstart-streaming-generate": {
      title: "Streaming generation playground",
      summary:
        "Inspect the same mock output as a token stream returned by generate_streaming(). Joining the tokens back together yields the same string as the synchronous path.",
      note:
        "You can change only the values above. The streaming path splits the synchronous result on whitespace and emits one token at a time.",
      explanations: {
        DeviceNotFoundError:
          "The device connection is off, so the runtime reports a missing execution environment before the session starts. This signals that the guard is working as intended, not that the engine is broken.",
        ValueError:
          "The request configuration is outside the allowed range. Invalid values are blocked before generation starts, so the failure stays predictable.",
      },
      controls: {
        quantization: {
          description:
            "Choose the precision label for the model weights. The selected value is echoed directly at the front of the token stream.",
        },
        max_tokens: {
          description:
            "Maximum number of tokens to generate in one request. Values outside the allowed range raise an error.",
        },
        mock_hardware: {
          description:
            "Turn the device connection on or off. When it is off, the run fails because no device session can be opened.",
        },
        prompt: {
          description:
            "Input text sent to the model. If you join the streamed tokens back together, the same prompt text is still present.",
        },
      },
    },
  },
};