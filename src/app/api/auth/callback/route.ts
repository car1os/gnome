import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCode } from "@/lib/auth";
import { setSession } from "@/lib/session";
import { WhooopperClient } from "whoopper";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/login?error=missing_params", request.url));
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("oauth_state")?.value;
  cookieStore.delete("oauth_state");

  if (state !== savedState) {
    return NextResponse.redirect(new URL("/login?error=invalid_state", request.url));
  }

  try {
    const tokens = await exchangeCode(code);

    const client = WhooopperClient.withTokens({
      official: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
      },
    });

    const profile = await client.user.getProfile();

    await setSession({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      firstName: profile.first_name,
    });

    return NextResponse.redirect(new URL("/", request.url));
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  }
}
