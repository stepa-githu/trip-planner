import type { TripAIResult } from "@/lib/ai/schemas/trip-result";
import type { TripRequest } from "@/lib/trip/request-schema";

export type AIProviderName =
  | "mock"
  | "openai"
  | "anthropic"
  | "gemini";

export type PromptConfiguration = {
  promptId?: string;
  promptVersion?: string;

  systemPrompt: string;
  userPrompt: string;

  provider?: string | null;
  model?: string | null;

  temperature?: number;
  maxOutputTokens?: number;
};

export type AIGeneration = {
  provider: AIProviderName;
  model: string;
  result: TripAIResult;

  promptId?: string;
  promptVersion?: string;

  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
  };
};

export interface AIProvider {
  generateTrip(
    input: TripRequest,
    prompt: PromptConfiguration
  ): Promise<AIGeneration>;
}