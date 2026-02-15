import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const supabase = createServiceClient();

	const updates: Record<string, unknown> = {
		updated_at: new Date().toISOString(),
	};

	if (
		typeof body.hike_start_date !== "string" ||
		!body.hike_start_date.trim()
	) {
		return NextResponse.json(
			{ error: "Hike start date is required" },
			{ status: 400 },
		);
	}
	updates.hike_start_date = body.hike_start_date;

	if (body.hike_end_date !== undefined) {
		updates.hike_end_date = body.hike_end_date;
	}
	if (body.direction === "NOBO" || body.direction === "SOBO") {
		updates.direction = body.direction;
	}
	if (body.lighterpack_url !== undefined) {
		updates.lighterpack_url = body.lighterpack_url;
	}
	await supabase.from("users").update(updates).eq("id", session.userId);

	return NextResponse.json({ ok: true });
}
