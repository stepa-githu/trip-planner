import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getAdminCookieName,
  verifyAdminSessionValue
} from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const promptUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  version: z.string().trim().min(1).max(30),
  description: z.string().trim().max(500).optional().default(""),
  promptType: z.string().trim().min(1).max(80),
  provider: z.string().trim().max(50).optional().default(""),
  model: z.string().trim().max(100).optional().default(""),
  systemPrompt: z.string().min(10),
  userPromptTemplate: z.string().min(10),
  temperature: z.number().min(0).max(2),
  maxOutputTokens: z.number().int().min(500).max(65536),
  isActive: z.boolean()
});

async function isAuthorized() {
  const cookieStore = await cookies();
  const session = cookieStore.get(getAdminCookieName());

  return verifyAdminSessionValue(session?.value);
}

export async function PUT(request: Request) {
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

    const body = await request.json();
    const parsed = promptUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Dati prompt non validi.",
          issues: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    const input = parsed.data;

    if (input.isActive) {
      const { error: disableError } = await supabaseAdmin
        .from("prompt_templates")
        .update({ is_active: false })
        .eq("prompt_type", input.promptType)
        .neq("id", input.id);

      if (disableError) {
        throw new Error(disableError.message);
      }
    }

    const { data, error } = await supabaseAdmin
      .from("prompt_templates")
      .update({
        name: input.name,
        version: input.version,
        description: input.description || null,
        prompt_type: input.promptType,
        provider: input.provider || null,
        model: input.model || null,
        system_prompt: input.systemPrompt,
        user_prompt_template: input.userPromptTemplate,
        temperature: input.temperature,
        max_output_tokens: input.maxOutputTokens,
        is_active: input.isActive
      })
      .eq("id", input.id)
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Prompt non aggiornato.");
    }

    return NextResponse.json({
      success: true,
      prompt: data
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Errore aggiornamento prompt."
      },
      { status: 500 }
    );
  }
}