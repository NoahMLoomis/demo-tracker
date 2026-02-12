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

  const { data: latest } = await supabase
    .from("activities")
    .select("start_date, coordinates")
    .eq("user_id", user.id)
    .order("start_date", { ascending: false })
    .limit(1)
    .single();

  if (!latest || !latest.coordinates?.length) {
    return NextResponse.json({ lat: 0, lon: 0, ts: "" });
  }

  const lastCoord = latest.coordinates[latest.coordinates.length - 1];

  return NextResponse.json(
    {
      lat: lastCoord[1],
      lon: lastCoord[0],
      ts: latest.start_date,
    },
    {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
      },
    }
  );
}
