import { createServiceClient } from "./supabase/server";
import { refreshAccessToken, fetchActivities, fetchStreams } from "./strava";
import { isNearPct } from "./pct-filter";
import { haversineM, downsampleSeries } from "./geo";

const PROFILE_MAX_POINTS = 220;

export async function syncUser(userId: string): Promise<{ added: number; skipped: number }> {
  const supabase = createServiceClient();

  // Mark as syncing
  await supabase
    .from("sync_state")
    .upsert({ user_id: userId, status: "syncing", last_sync_at: new Date().toISOString() });

  try {
    const accessToken = await refreshAccessToken(userId);
    const activities = await fetchActivities(accessToken);
    activities.sort((a, b) => a.start_date.localeCompare(b.start_date));

    // Get existing strava_ids to skip
    const { data: existing } = await supabase
      .from("activities")
      .select("strava_id")
      .eq("user_id", userId);

    const existingIds = new Set((existing || []).map((e) => e.strava_id));

    let added = 0;
    let skipped = 0;

    for (const act of activities) {
      if (existingIds.has(act.id)) {
        skipped++;
        continue;
      }

      // PCT proximity check
      if (act.start_latlng && act.start_latlng.length === 2) {
        if (!isNearPct(act.start_latlng[0], act.start_latlng[1])) {
          skipped++;
          continue;
        }
      }

      let streams;
      try {
        streams = await fetchStreams(accessToken, act.id);
      } catch {
        continue;
      }

      const latlng = streams.latlng?.data;
      if (!latlng || latlng.length < 2) continue;

      const altitude = streams.altitude?.data;
      const hasAlt = !!altitude && altitude.length === latlng.length;

      // GeoJSON coords [lon, lat]
      const coords: [number, number][] = latlng.map(([lat, lon]) => [lon, lat]);

      let distM: number[] = [0];
      let elevM: number[] = hasAlt ? [altitude![0]] : [];
      let totalUp = 0;

      if (hasAlt) {
        let prevLat = latlng[0][0];
        let prevLon = latlng[0][1];
        let prevE = altitude![0];
        let cum = 0;

        for (let i = 1; i < latlng.length; i++) {
          const [lat, lon] = latlng[i];
          const d = haversineM(prevLat, prevLon, lat, lon);
          cum += d;
          distM.push(cum);

          const e = altitude![i];
          elevM.push(e);

          if (e - prevE > 0) totalUp += e - prevE;

          prevLat = lat;
          prevLon = lon;
          prevE = e;
        }

        [distM, elevM] = downsampleSeries(distM, elevM, PROFILE_MAX_POINTS);
      } else {
        distM = [];
        elevM = [];
        totalUp = act.total_elevation_gain || 0;
      }

      await supabase.from("activities").upsert(
        {
          user_id: userId,
          strava_id: act.id,
          name: act.name,
          start_date: act.start_date,
          distance_m: act.distance || 0,
          moving_time_s: act.moving_time || 0,
          activity_type: act.type,
          elevation_gain_m: totalUp,
          profile_dist_m: distM,
          profile_elev_m: elevM,
          coordinates: coords,
        },
        { onConflict: "user_id,strava_id" }
      );

      added++;
    }

    await supabase
      .from("sync_state")
      .upsert({ user_id: userId, status: "idle", last_sync_at: new Date().toISOString() });

    return { added, skipped };
  } catch (err) {
    await supabase
      .from("sync_state")
      .upsert({ user_id: userId, status: "error", last_sync_at: new Date().toISOString() });
    throw err;
  }
}
