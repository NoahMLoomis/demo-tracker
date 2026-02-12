import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { GeoJSONFeature, GeoJSONFeatureCollection } from "@/lib/types";

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
    .from("activities")
    .select("*")
    .eq("user_id", user.id)
    .order("start_date", { ascending: true });

  const features: GeoJSONFeature[] = (activities || []).map((act, i) => ({
    type: "Feature",
    properties: {
      i,
      strava_id: act.strava_id,
      name: act.name || "",
      start_date: act.start_date,
      distance_m: act.distance_m,
      moving_time_s: act.moving_time_s,
      type: act.activity_type || "",
      elevation_gain_m: act.elevation_gain_m,
      profile_dist_m: act.profile_dist_m || [],
      profile_elev_m: act.profile_elev_m || [],
    },
    geometry: {
      type: "LineString",
      coordinates: act.coordinates,
    },
  }));

  const collection: GeoJSONFeatureCollection = {
    type: "FeatureCollection",
    features,
  };

  return NextResponse.json(collection, {
    headers: {
      "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
    },
  });
}
