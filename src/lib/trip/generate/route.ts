import { NextResponse } from "next/server";

import { getAIProvider } from "@/lib/ai";
import { getActiveTripPrompt } from "@/lib/ai/prompts/get-active-prompt";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { tripRequestSchema } from "@/lib/trip/request-schema";
import { createTripSlug } from "@/lib/trip/slug";

export const runtime = "nodejs";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Errore sconosciuto.";
}

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      {
        success: false,
        error: "Supabase non configurato.",
        detail:
          "Controlla NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nel file .env.local."
      },
      { status: 500 }
    );
  }

  let tripRequestId: string | null = null;

  let selectedProvider =
    process.env.AI_PROVIDER || "unknown";

  let selectedModel =
    process.env.GEMINI_MODEL ||
    process.env.OPENAI_MODEL ||
    "unknown";

  let selectedPromptVersion: string | null = null;

  try {
    /*
     * 1. Legge il corpo della richiesta.
     */
    const body = await request.json();

    /*
     * 2. Valida i dati ricevuti dalla maschera.
     */
    const parsed = tripRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Dati del viaggio non validi.",
          issues: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    const input = parsed.data;

    /*
     * 3. Salva la richiesta utente in Supabase.
     */
    const {
      data: requestRow,
      error: requestError
    } = await supabaseAdmin
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
        accommodation_preference:
          input.accommodationPreference,

        language: input.language,
        raw_input: input,

        user_agent:
          request.headers.get("user-agent") || null
      })
      .select("id")
      .single();

    if (requestError || !requestRow) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Impossibile salvare la richiesta viaggio.",
          detail:
            requestError?.message ||
            "Supabase non ha restituito il record creato."
        },
        { status: 500 }
      );
    }

    tripRequestId = requestRow.id;

    /*
     * 4. Recupera dall'area admin il prompt attivo.
     */
    const activePrompt =
      await getActiveTripPrompt(input);

    selectedProvider =
      activePrompt.provider ||
      process.env.AI_PROVIDER ||
      "mock";

    selectedModel =
      activePrompt.model ||
      (selectedProvider === "gemini"
        ? process.env.GEMINI_MODEL
        : selectedProvider === "openai"
          ? process.env.OPENAI_MODEL
          : "mock-v0") ||
      "unknown";

    selectedPromptVersion =
      activePrompt.promptVersion || null;

    /*
     * 5. Carica il provider AI selezionato.
     */
    const provider =
      getAIProvider(selectedProvider);

    /*
     * 6. Genera l'itinerario usando il prompt attivo.
     */
    const aiGeneration =
      await provider.generateTrip(
        input,
        activePrompt
      );

    /*
     * 7. Salva il log della generazione AI.
     */
    const {
      data: generationRow,
      error: generationError
    } = await supabaseAdmin
      .from("trip_generations")
      .insert({
        trip_request_id: tripRequestId,
        provider: aiGeneration.provider,
        model: aiGeneration.model,

        prompt_version:
          aiGeneration.promptVersion ||
          activePrompt.promptVersion ||
          null,

        input_tokens:
          aiGeneration.usage.inputTokens,

        output_tokens:
          aiGeneration.usage.outputTokens,

        status: "completed",
        error_message: null
      })
      .select("id")
      .single();

    if (generationError || !generationRow) {
      throw new Error(
        generationError?.message ||
          "Impossibile salvare il log della generazione AI."
      );
    }

    /*
     * 8. Crea lo slug pubblico del viaggio.
     */
    const publicSlug = createTripSlug(
      aiGeneration.result.title
    );

    /*
     * 9. Salva il risultato completo.
     */
    const {
      data: resultRow,
      error: resultError
    } = await supabaseAdmin
      .from("trip_results")
      .insert({
        trip_request_id: tripRequestId,
        trip_generation_id:
          generationRow.id,

        title:
          aiGeneration.result.title,

        summary:
          aiGeneration.result.overview,

        result_json:
          aiGeneration.result,

        public_slug:
          publicSlug,

        is_shareable:
          true,

        is_indexable:
          false
      })
      .select("id, public_slug")
      .single();

    if (resultError || !resultRow) {
      throw new Error(
        resultError?.message ||
          "Impossibile salvare il risultato del viaggio."
      );
    }

    /*
     * 10. Restituisce l'URL della pagina risultato.
     */
    return NextResponse.json({
      success: true,
      tripResultId:
        resultRow.id,
      publicSlug:
        resultRow.public_slug,
      redirectUrl:
        `/trip/${resultRow.public_slug}`
    });
  } catch (error) {
    const message =
      getErrorMessage(error);

    console.error(
      "Errore /api/trip/generate:",
      error
    );

    /*
     * Registra l'errore solo se la richiesta viaggio
     * era già stata salvata.
     */
    if (tripRequestId && supabaseAdmin) {
      const {
        error: logError
      } = await supabaseAdmin
        .from("trip_generations")
        .insert({
          trip_request_id:
            tripRequestId,

          provider:
            selectedProvider,

          model:
            selectedModel,

          prompt_version:
            selectedPromptVersion,

          input_tokens:
            null,

          output_tokens:
            null,

          status:
            "failed",

          error_message:
            message
        });

      if (logError) {
        console.error(
          "Impossibile registrare l'errore in trip_generations:",
          logError
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Errore interno durante la generazione del viaggio.",
        detail:
          message
      },
      { status: 500 }
    );
  }
}