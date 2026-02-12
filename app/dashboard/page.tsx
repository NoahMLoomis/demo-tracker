import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export const metadata = {
  title: "Dashboard - PCT Tracker",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = createServiceClient();

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.userId)
    .single();

  if (!user) redirect("/login");

  const { data: syncState } = await supabase
    .from("sync_state")
    .select("*")
    .eq("user_id", session.userId)
    .single();

  return (
    <main className="wrap" style={{ paddingTop: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 20 }}>Dashboard</h1>
      <DashboardClient user={user} syncState={syncState} />
    </main>
  );
}
