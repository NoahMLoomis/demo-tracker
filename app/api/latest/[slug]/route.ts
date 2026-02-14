import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params;
	const supabase = createServiceClient();

	const { data: user } = await supabase
		.from("users")
		.select("id, direction")
		.eq("slug", slug)
		.single();

	if (!user) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	const { data: pos } = await supabase
		.from("latest_position")
		.select("lat, lon, activity_date")
		.eq("user_id", user.id)
		.single();

	if (!pos) {
		return NextResponse.json({
			lat: 0,
			lon: 0,
			ts: "",
			direction: user.direction || "NOBO",
		});
	}

	return NextResponse.json(
		{
			lat: pos.lat,
			lon: pos.lon,
			ts: pos.activity_date || "",
			direction: user.direction || "NOBO",
		},
		{
			headers: {
				"Cache-Control": "s-maxage=300, stale-while-revalidate=60",
			},
		},
	);
}
