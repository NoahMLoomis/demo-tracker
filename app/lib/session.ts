import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionPayload } from "./types";

const SECRET = new TextEncoder().encode(
	process.env.SESSION_SECRET || "dev-secret-change-me",
);
const COOKIE_NAME = "pct_session";

export async function createSession(userId: string): Promise<string> {
	return new SignJWT({ userId } as unknown as Record<string, unknown>)
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime("30d")
		.sign(SECRET);
}

export async function getSession(): Promise<SessionPayload | null> {
	const cookieStore = await cookies();
	const token = cookieStore.get(COOKIE_NAME)?.value;
	if (!token) return null;
	try {
		const { payload } = await jwtVerify(token, SECRET);
		return payload as unknown as SessionPayload;
	} catch {
		return null;
	}
}

export function sessionCookieOptions(token: string) {
	return {
		name: COOKIE_NAME,
		value: token,
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax" as const,
		path: "/",
		maxAge: 30 * 24 * 60 * 60,
	};
}
