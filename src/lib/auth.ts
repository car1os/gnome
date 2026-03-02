const AUTH_URL = "https://api.prod.whoop.com/oauth/oauth2/auth";
const TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token";

const SCOPES = [
  "read:recovery",
  "read:cycles",
  "read:sleep",
  "read:workout",
  "read:profile",
  "read:body_measurement",
];

function getClientId(): string {
  const id = process.env.WHOOP_CLIENT_ID;
  if (!id) throw new Error("WHOOP_CLIENT_ID is not set");
  return id;
}

function getClientSecret(): string {
  const secret = process.env.WHOOP_CLIENT_SECRET;
  if (!secret) throw new Error("WHOOP_CLIENT_SECRET is not set");
  return secret;
}

function getRedirectUri(): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return `${base}/api/auth/callback`;
}

export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: getClientId(),
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: SCOPES.join(" "),
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export async function exchangeCode(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: getClientId(),
      client_secret: getClientSecret(),
      redirect_uri: getRedirectUri(),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }

  const data: TokenResponse = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

export async function refreshTokens(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: getClientId(),
      client_secret: getClientSecret(),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed: ${res.status} ${text}`);
  }

  const data: TokenResponse = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}
