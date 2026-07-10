import { GoogleGenAI } from "@google/genai";

import {
  tripAIResultJsonSchema,
  tripAIResultSchema
} from "@/lib/ai/schemas/trip-result";
import type {
  AIGeneration,
  AIProvider,
  PromptConfiguration
} from "@/lib/ai/types";
import type { TripRequest } from "@/lib/trip/request-schema";

export class GeminiTripProvider implements AIProvider {
  async generateTrip(
    input: TripRequest,
    prompt: PromptConfiguration
  ): Promise<AIGeneration> {
    const apiKey = process.env.GEMINI_API_KEY;

    const model =
      prompt.model ||
      process.env.GEMINI_MODEL;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY mancante nel file .env.local.");
    }

    if (!model) {
      throw new Error(
        "Modello Gemini non configurato né nel prompt admin né in .env.local."
      );
    }

    const client = new GoogleGenAI({
      apiKey
    });

    const response = await client.models.generateContent({
      model,
      contents: prompt.userPrompt,
      config: {
        systemInstruction: prompt.systemPrompt,
        responseMimeType: "application/json",
        responseJsonSchema: tripAIResultJsonSchema,
        temperature: prompt.temperature ?? 0.3,
        maxOutputTokens: prompt.maxOutputTokens ?? 8192
      }
    });

    const finishReason = response.candidates?.[0]?.finishReason;

    if (finishReason === "MAX_TOKENS") {
      throw new Error(
        "Gemini ha interrotto il JSON perché ha raggiunto il limite massimo di token."
      );
    }

    const rawOutput = response.text;

    if (!rawOutput) {
      throw new Error("Gemini non ha restituito alcun contenuto.");
    }

    let parsedJson: unknown;

    try {
      parsedJson = JSON.parse(rawOutput);
    } catch {
      console.error("Output Gemini non valido:", rawOutput);
      console.error("Finish reason Gemini:", finishReason);

      throw new Error(
        `Gemini ha restituito un JSON non valido. Motivo finale: ${
          finishReason ?? "sconosciuto"
        }.`
      );
    }

    const result = tripAIResultSchema.parse(parsedJson);

    return {
      provider: "gemini",
      model,
      result,

      promptId: prompt.promptId,
      promptVersion: prompt.promptVersion,

      usage: {
        inputTokens:
          response.usageMetadata?.promptTokenCount ?? null,
        outputTokens:
          response.usageMetadata?.candidatesTokenCount ?? null
      }
    };
  }
}