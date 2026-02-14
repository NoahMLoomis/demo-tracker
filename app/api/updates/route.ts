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
	const userId = session.userId;

	if (body.action === "create") {
		if (!body.title?.trim() || !body.body?.trim()) {
			return NextResponse.json(
				{ error: "Title and body are required" },
				{ status: 400 },
			);
		}
		if (body.body.trim().length > 500) {
			return NextResponse.json(
				{ error: "Body must be 500 characters or less" },
				{ status: 400 },
			);
		}

		const { data, error } = await supabase
			.from("trail_updates")
			.insert({
				user_id: userId,
				title: body.title.trim(),
				body: body.body.trim(),
				lat: body.lat ?? null,
				lon: body.lon ?? null,
			})
			.select()
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json(data);
	}

	if (body.action === "update") {
		if (!body.id) {
			return NextResponse.json(
				{ error: "Update ID is required" },
				{ status: 400 },
			);
		}
		if (!body.title?.trim() || !body.body?.trim()) {
			return NextResponse.json(
				{ error: "Title and body are required" },
				{ status: 400 },
			);
		}
		if (body.body.trim().length > 300) {
			return NextResponse.json(
				{ error: "Body must be 300 characters or less" },
				{ status: 400 },
			);
		}

		const { error } = await supabase
			.from("trail_updates")
			.update({
				title: body.title.trim(),
				body: body.body.trim(),
				lat: body.lat ?? null,
				lon: body.lon ?? null,
			})
			.eq("id", body.id)
			.eq("user_id", userId);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ ok: true });
	}

	if (body.action === "delete") {
		if (!body.id) {
			return NextResponse.json(
				{ error: "Update ID is required" },
				{ status: 400 },
			);
		}

		const { error } = await supabase
			.from("trail_updates")
			.delete()
			.eq("id", body.id)
			.eq("user_id", userId);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ ok: true });
	}

	return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
