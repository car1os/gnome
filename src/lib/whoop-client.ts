import { WhooopperClient } from "whoopper";
import { SessionData } from "./session";
import { refreshTokens } from "./auth";

const REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

export async function getClient(session: SessionData): Promise<{
  client: WhooopperClient;
  updatedTokens: { accessToken: string; refreshToken: string; expiresAt: number } | null;
}> {
  let updatedTokens = null;
  let { accessToken, refreshToken, expiresAt } = session;

  if (Date.now() > expiresAt - REFRESH_BUFFER_MS) {
    const refreshed = await refreshTokens(refreshToken);
    accessToken = refreshed.accessToken;
    refreshToken = refreshed.refreshToken;
    expiresAt = refreshed.expiresAt;
    updatedTokens = refreshed;
  }

  const client = WhooopperClient.withTokens({
    official: { accessToken, refreshToken, expiresAt },
  });

  return { client, updatedTokens };
}
