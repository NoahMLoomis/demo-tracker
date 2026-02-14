import { NextResponse } from "next/server";

export async function GET() {
	const params = new URLSearchParams({
		client_id: process.env.STRAVA_CLIENT_ID!,
		response_type: "code",
		redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
		scope: "activity:read_all",
		approval_prompt: "auto",
	});

	return NextResponse.redirect(
		`https://www.strava.com/oauth/authorize?${params.toString()}`,
	);
}
