import { supabaseAdmin } from "@/lib/supabase/admin";
import type { PromptConfiguration } from "@/lib/ai/types";
import type { TripRequest } from "@/lib/trip/request-schema";

export async function getActiveTripPrompt(
  input: TripRequest
): Promise<PromptConfiguration> {
  if (!supabaseAdmin) {
    throw new Error("Supabase non configurato.");
  }

  const { data, error } = await supabaseAdmin
    .from("prompt_templates")
    .select(
      `
        id,
        version,
        provider,
        model,
        system_prompt,
        user_prompt_template,
        temperature,
        max_output_tokens
      `
    )
    .eq("prompt_type", "trip_generation")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Errore lettura prompt attivo: ${error.message}`);
  }

  if (!data) {
    throw new Error(
      "Nessun prompt attivo trovato. Vai in /admin e attiva un prompt."
    );
  }

  const tripRequestJson = JSON.stringify(input, null, 2);

  const userPrompt = data.user_prompt_template.includes(
    "{{trip_request_json}}"
  )
    ? data.user_prompt_template.replaceAll(
        "{{trip_request_json}}",
        tripRequestJson
      )
    : `${data.user_prompt_template}

Dati del viaggio:
${tripRequestJson}`;

  return {
    promptId: data.id,
    promptVersion: data.version,

    systemPrompt: data.system_prompt,
    userPrompt,

    provider: data.provider,
    model: data.model,

    temperature: Number(data.temperature ?? 0.3),
    maxOutputTokens: Number(data.max_output_tokens ?? 8192)
  };
}