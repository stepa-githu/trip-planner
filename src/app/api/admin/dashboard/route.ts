import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  getAdminCookieName,
  verifyAdminSessionValue
} from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

async function isAuthorized() {
  const cookieStore = await cookies();
  const session = cookieStore.get(getAdminCookieName());

  return verifyAdminSessionValue(session?.value);
}

export async function GET() {
  try {
    if (!(await isAuthorized())) {
      return NextResponse.json(
        {
          success: false,
          error: "Non autorizzato."
        },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      throw new Error("Supabase non configurato.");
    }

    const [
      requestsResult,
      generationsResult,
      resultsResult,
      feedbackResult,
      recentRequestsResult,
      recentErrorsResult,
      promptsResult
    ] = await Promise.all([
      supabaseAdmin
        .from("trip_requests")
        .select("*", { count: "exact", head: true }),

      supabaseAdmin
        .from("trip_generations")
        .select("*", { count: "exact", head: true }),

      supabaseAdmin
        .from("trip_results")
        .select("*", { count: "exact", head: true }),

      supabaseAdmin
        .from("trip_feedback")
        .select("*", { count: "exact", head: true }),

      supabaseAdmin
        .from("trip_requests")
        .select(
          "id, created_at, destination_mode, destination, duration, moods, transport"
        )
        .order("created_at", { ascending: false })
        .limit(10),

      supabaseAdmin
        .from("trip_generations")
        .select(
          "id, created_at, provider, model, status, error_message, input_tokens, output_tokens"
        )
        .eq("status", "failed")
        .order("created_at", { ascending: false })
        .limit(10),

      supabaseAdmin
        .from("prompt_templates")
        .select("*")
        .order("created_at", { ascending: false })
    ]);

    const errors = [
      requestsResult.error,
      generationsResult.error,
      resultsResult.error,
      feedbackResult.error,
      recentRequestsResult.error,
      recentErrorsResult.error,
      promptsResult.error
    ].filter(Boolean);

    if (errors.length > 0) {
      throw new Error(errors[0]?.message || "Errore lettura dashboard.");
    }

    return NextResponse.json({
      success: true,
      stats: {
        requests: requestsResult.count || 0,
        generations: generationsResult.count || 0,
        results: resultsResult.count || 0,
        feedback: feedbackResult.count || 0
      },
      recentRequests: recentRequestsResult.data || [],
      recentErrors: recentErrorsResult.data || [],
      prompts: promptsResult.data || [],
      configuration: {
        provider: process.env.AI_PROVIDER || "mock",
        openaiModel: process.env.OPENAI_MODEL || "",
        geminiModel: process.env.GEMINI_MODEL || ""
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Errore caricamento dashboard."
      },
      { status: 500 }
    );
  }
}