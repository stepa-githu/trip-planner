import OpenAI from "openai";

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

export class OpenAITripProvider implements AIProvider {
  async generateTrip(
    input: TripRequest,
    prompt: PromptConfiguration
  ): Promise<AIGeneration> {
    const apiKey = process.env.OPENAI_API_KEY;

    const model =
      prompt.model ||
      process.env.OPENAI_MODEL;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY mancante.");
    }

    if (!model) {
      throw new Error(
        "Modello OpenAI non configurato né nel prompt admin né in .env.local."
      );
    }

    const client = new OpenAI({
      apiKey
    });

    const response = await client.responses.create({
      model,

      max_output_tokens:
        prompt.maxOutputTokens ?? 8192,

      input: [
        {
          role: "system",
          content: prompt.systemPrompt
        },
        {
          role: "user",
          content: prompt.userPrompt
        }
      ],

      text: {
        format: {
          type: "json_schema",
          name: "trip_ai_result",
          strict: true,
          schema: tripAIResultJsonSchema
        }
      }
    });

    const rawOutput = response.output_text;

    if (!rawOutput) {
      throw new Error(
        "OpenAI non ha restituito alcun contenuto."
      );
    }

    let parsedJson: unknown;

    try {
      parsedJson = JSON.parse(rawOutput);
    } catch {
      throw new Error(
        `OpenAI ha restituito un JSON non valido: ${rawOutput.slice(
          0,
          300
        )}`
      );
    }

    const result = tripAIResultSchema.parse(parsedJson);

    return {
      provider: "openai",
      model,
      result,

      promptId: prompt.promptId,
      promptVersion: prompt.promptVersion,

      usage: {
        inputTokens:
          response.usage?.input_tokens ?? null,
        outputTokens:
          response.usage?.output_tokens ?? null
      }
    };
  }
}