import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  firstName: string;
}

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

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function setSession(data: SessionData): Promise<void> {
  const session = await getSession();
  session.accessToken = data.accessToken;
  session.refreshToken = data.refreshToken;
  session.expiresAt = data.expiresAt;
  session.firstName = data.firstName;
  await session.save();
}

export async function clearSession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}
