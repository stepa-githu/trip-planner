import { NextResponse } from "next/server";

import {
  createAdminSessionValue,
  getAdminCookieName,
  verifyAdminPassword
} from "@/lib/admin/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = String(body.password || "");

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        {
          success: false,
          error: "Password non corretta."
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true
    });

    response.cookies.set({
      name: getAdminCookieName(),
      value: createAdminSessionValue(),
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Errore login."
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true
  });

  response.cookies.set({
    name: getAdminCookieName(),
    value: "",
    path: "/",
    maxAge: 0
  });

  return response;
}