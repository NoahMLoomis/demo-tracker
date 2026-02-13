import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: activities } = await supabase
    .from("activity_stats")
    .select("start_date, distance_m, moving_time_s, elevation_gain_m")
    .eq("user_id", user.id)
    .order("start_date", { ascending: true });

  const rows = activities || [];

  let totalDistanceM = 0;
  let totalMovingTimeS = 0;
  let totalElevationGainM = 0;
  let firstDate: string | null = null;
  let lastDate: string | null = null;

  for (const r of rows) {
    totalDistanceM += r.distance_m || 0;
    totalMovingTimeS += r.moving_time_s || 0;
    totalElevationGainM += r.elevation_gain_m || 0;
    if (!firstDate) firstDate = r.start_date;
    lastDate = r.start_date;
  }

  return NextResponse.json(
    {
      totalDistanceM,
      totalMovingTimeS,
      totalElevationGainM,
      activityCount: rows.length,
      firstDate,
      lastDate,
      activities: rows,
    },
    {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
      },
    }
  );
}
