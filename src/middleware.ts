import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData } from "@/lib/session";

const sessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    "complex_password_at_least_32_characters_long_for_dev",
  cookieName: "gnome-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
  },
};

const REFRESH_BUFFER_MS = 5 * 60 * 1000;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Don't protect login page or auth API routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(
    request,
    response,
    sessionOptions
  );

  if (!session.accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Proactively refresh tokens if expiring within 5 minutes
  if (session.expiresAt && Date.now() > session.expiresAt - REFRESH_BUFFER_MS) {
    try {
      const tokenUrl = "https://api.prod.whoop.com/oauth/oauth2/token";
      const res = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: session.refreshToken,
          client_id: process.env.WHOOP_CLIENT_ID || "",
          client_secret: process.env.WHOOP_CLIENT_SECRET || "",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        session.accessToken = data.access_token;
        session.refreshToken = data.refresh_token;
        session.expiresAt = Date.now() + data.expires_in * 1000;
        await session.save();
      }
    } catch (err) {
      console.error("Middleware token refresh failed:", err);
    }
  }

  return response;
}

export const config = {
  matcher: ["/", "/api/whoop/:path*"],
};
