import { NextResponse } from "next/server";

import { getAIProvider } from "@/lib/ai";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { tripRequestSchema } from "@/lib/trip/request-schema";
import { createTripSlug } from "@/lib/trip/slug";
import { getActiveTripPrompt } from "@/lib/ai/prompts/get-active-prompt";

export const runtime = "nodejs";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Errore sconosciuto.";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = tripRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Dati non validi.",
          issues: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    const input = parsed.data;

    const { data: requestRow, error: requestError } = await supabaseAdmin
      .from("trip_requests")
      .insert({
        destination_mode: input.destinationMode,
        destination: input.destination || null,
        departure_place: input.departurePlace || null,
        period_type: input.periodType,
        start_date: input.startDate || null,
        end_date: input.endDate || null,
        flexible_period: input.flexiblePeriod || null,
        duration: input.duration,
        custom_days: input.customDays ?? null,
        travelers: input.travelers,
        moods: input.moods,
        rhythm: input.rhythm,
        activity_level: input.activityLevel,
        transport: input.transport,
        accommodation_preference: input.accommodationPreference,
        language: input.language,
        raw_input: input,
        user_agent: request.headers.get("user-agent")
      })
      .select("id")
      .single();

    if (requestError || !requestRow) {
      return NextResponse.json(
        {
          success: false,
          error: "Impossibile salvare la richiesta viaggio.",
          detail: requestError?.message || "Nessun record creato."
        },
        { status: 500 }
      );
    }

    const activePrompt = await getActiveTripPrompt(input);

const selectedProvider =
  activePrompt.provider ||
  process.env.AI_PROVIDER ||
  "mock";

const provider = getAIProvider(selectedProvider);

const aiGeneration = await provider.generateTrip(
  input,
  activePrompt
);

    const { data: generationRow, error: generationError } = await supabaseAdmin
      .from("trip_generations")
      .insert({
        trip_request_id: requestRow.id,
        provider: aiGeneration.provider,
        model: aiGeneration.model,
        prompt_version:
          aiGeneration.promptVersion ||
          activePrompt.promptVersion ||
          null,
        input_tokens: aiGeneration.usage.inputTokens,
        output_tokens: aiGeneration.usage.outputTokens,
        status: "completed"
      })
      .select("id")
      .single();

    if (generationError || !generationRow) {
      throw new Error(generationError?.message || "Impossibile salvare il log AI.");
    }

    const publicSlug = createTripSlug(aiGeneration.result.title);

    const { data: resultRow, error: resultError } = await supabaseAdmin
      .from("trip_results")
      .insert({
        trip_request_id: requestRow.id,
        trip_generation_id: generationRow.id,
        title: aiGeneration.result.title,
        summary: aiGeneration.result.overview,
        result_json: aiGeneration.result,
        public_slug: publicSlug,
        is_shareable: true,
        is_indexable: false
      })
      .select("id, public_slug")
      .single();

    if (resultError || !resultRow) {
      throw new Error(resultError?.message || "Impossibile salvare il risultato viaggio.");
    }

    return NextResponse.json({
      success: true,
      tripResultId: resultRow.id,
      publicSlug: resultRow.public_slug,
      redirectUrl: `/trip/${resultRow.public_slug}`
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Errore interno durante la generazione del viaggio.",
        detail: getErrorMessage(error)
      },
      { status: 500 }
    );
  }
}