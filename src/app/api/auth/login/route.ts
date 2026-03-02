import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildAuthUrl } from "@/lib/auth";

export async function GET() {
  const state = crypto.randomUUID();

  const cookieStore = await cookies();
  cookieStore.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return NextResponse.redirect(buildAuthUrl(state));
}
