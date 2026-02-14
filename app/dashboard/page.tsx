import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export const metadata = {
  title: "Dashboard - PCT Tracker",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/api/auth/strava");

  const supabase = createServiceClient();

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.userId)
    .single();

  if (!user) redirect("/api/auth/strava");

  const { data: syncState } = await supabase
    .from("sync_state")
    .select("*")
    .eq("user_id", session.userId)
    .single();

  const { data: updates } = await supabase
    .from("trail_updates")
    .select("id, user_id, title, body, lat, lon, created_at")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  // Normalize dates to ISO strings so server/client rendering matches
  const normalizedUpdates = (updates || []).map((u) => ({
    ...u,
    created_at: new Date(u.created_at).toISOString(),
  }));

  // Pre-format the last sync time so it's a stable string
  const formattedSyncState = syncState
    ? {
        ...syncState,
        last_sync_at: syncState.last_sync_at
          ? new Date(syncState.last_sync_at).toISOString().replace("T", " ").slice(0, 19) + " UTC"
          : null,
      }
    : null;

  return (
    <main className="wrap" style={{ paddingTop: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 20 }}>Dashboard</h1>
      <DashboardClient user={user} syncState={formattedSyncState} initialUpdates={normalizedUpdates} />
    </main>
  );
}
