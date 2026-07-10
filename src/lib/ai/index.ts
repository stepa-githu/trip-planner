import { GeminiTripProvider } from "@/lib/ai/providers/gemini";
import { MockTripProvider } from "@/lib/ai/providers/mock";
import { OpenAITripProvider } from "@/lib/ai/providers/openai";
import type { AIProvider, AIProviderName } from "@/lib/ai/types";

export function getAIProvider(providerName?: string): AIProvider {
  const provider = (providerName || "mock") as AIProviderName;

  switch (provider) {
    case "mock":
      return new MockTripProvider();

    case "openai":
      return new OpenAITripProvider();

    case "gemini":
      return new GeminiTripProvider();

    case "anthropic":
      throw new Error("Provider Anthropic non ancora implementato.");

    default:
      throw new Error(`Provider AI non supportato: ${provider}`);
  }
}