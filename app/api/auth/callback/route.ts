import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createSession, sessionCookieOptions } from "@/lib/session";

function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

export async function GET(request: NextRequest) {
	const code = request.nextUrl.searchParams.get("code");
	if (!code) {
		return NextResponse.redirect(new URL("/", request.nextUrl.origin));
	}

	// Exchange code for tokens
	const tokenRes = await fetch("https://www.strava.com/oauth/token", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			client_id: process.env.STRAVA_CLIENT_ID!,
			client_secret: process.env.STRAVA_CLIENT_SECRET!,
			code,
			grant_type: "authorization_code",
		}),
	});

	if (!tokenRes.ok) {
		return NextResponse.json(
			{ error: "Token exchange failed" },
			{ status: 500 },
		);
	}

	const tok = await tokenRes.json();
	const athlete = tok.athlete;

	const supabase = createServiceClient();

	const displayName =
		`${athlete.firstname || ""} ${athlete.lastname || ""}`.trim() || "Hiker";
	const baseSlug = slugify(displayName);

	// Check if user already exists
	const { data: existingUser } = await supabase
		.from("users")
		.select("id, slug")
		.eq("strava_athlete_id", athlete.id)
		.single();

	let userId: string;

	if (existingUser) {
		// Update tokens
		await supabase
			.from("users")
			.update({
				strava_access_token: tok.access_token,
				strava_refresh_token: tok.refresh_token,
				strava_token_expires_at: new Date(tok.expires_at * 1000).toISOString(),
				display_name: displayName,
				updated_at: new Date().toISOString(),
			})
			.eq("id", existingUser.id);

		userId = existingUser.id;
	} else {
		// Generate unique slug
		let slug = baseSlug;
		let attempt = 0;
		while (true) {
			const { data: conflict } = await supabase
				.from("users")
				.select("id")
				.eq("slug", slug)
				.single();

			if (!conflict) break;
			attempt++;
			slug = `${baseSlug}-${attempt}`;
		}

		const { data: newUser, error } = await supabase
			.from("users")
			.insert({
				strava_athlete_id: athlete.id,
				display_name: displayName,
				slug,
				hike_start_date: new Date().toISOString().slice(0, 10),
				strava_access_token: tok.access_token,
				strava_refresh_token: tok.refresh_token,
				strava_token_expires_at: new Date(tok.expires_at * 1000).toISOString(),
			})
			.select("id")
			.single();

		if (error || !newUser) {
			console.log(error);
			return NextResponse.json(
				{ error: "Failed to create user" },
				{ status: 500 },
			);
		}

		userId = newUser.id;

		// Initialize sync state
		await supabase.from("sync_state").insert({ user_id: userId });
	}

	const token = await createSession(userId);
	const response = NextResponse.redirect(
		new URL("/dashboard", request.nextUrl.origin),
	);
	response.cookies.set(sessionCookieOptions(token));

	return response;
}
