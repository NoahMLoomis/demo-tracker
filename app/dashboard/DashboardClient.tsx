"use client";

import { useState } from "react";
import type { User, SyncState } from "@/lib/types";

interface DashboardClientProps {
  user: User;
  syncState: SyncState | null;
}

export default function DashboardClient({ user, syncState }: DashboardClientProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [hikeStartDate, setHikeStartDate] = useState(user.hike_start_date || new Date().toISOString().slice(0, 10));
  const [hikeEndDate, setHikeEndDate] = useState(user.hike_end_date || "");
  const [lighterpackUrl, setLighterpackUrl] = useState(user.lighterpack_url || "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncResult(`Synced! ${data.added} new activities added.`);
      } else {
        setSyncResult(`Error: ${data.error}`);
      }
    } catch {
      setSyncResult("Sync failed. Please try again.");
    }
    setSyncing(false);
  };

  const handleSave = async () => {
    setSaveError(null);
    if (hikeStartDate.length <= 0) {
      setSaveError("hike start date required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hike_start_date: hikeStartDate, hike_end_date: hikeEndDate || null, lighterpack_url: lighterpackUrl || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSaveError(data.error || "Save failed.");
      }
    } catch {
      setSaveError("Save failed. Please try again.");
    }
    setSaving(false);
  };

  return (
    <div style={{ display: "grid", gap: 14, maxWidth: 600 }}>
      <div className="card">
        <div className="card-title">Profile</div>
        <p style={{ marginTop: 8 }}>
          <strong>{user.display_name}</strong>
        </p>
        <p className="muted small" style={{ marginTop: 4 }}>
          Strava Athlete ID: {user.strava_athlete_id}
        </p>
        <p style={{ marginTop: 12 }}>
          Public tracker:{" "}
          <a href={`/tracker/${user.slug}`} className="accent">
            /tracker/{user.slug}
          </a>
        </p>
      </div>

      <div className="card">
        <div className="card-title">Settings</div>
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <label>
            <span className="muted small">Hike Start Date *</span>
            <input
              type="date"
              value={hikeStartDate}
              required
              onChange={(e) => setHikeStartDate(e.target.value)}
              style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--card)", color: "var(--text)" }}
            />
            <p className="muted small" style={{ marginTop: 6, lineHeight: 1.5 }}>
              Activities will be synced from this date until the end date (or 6 months after if no end date is set).
            </p>
          </label>
          <label>
            <span className="muted small">Hike End Date</span>
            <input
              type="date"
              value={hikeEndDate}
              onChange={(e) => setHikeEndDate(e.target.value)}
              style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--card)", color: "var(--text)" }}
            />
            <p className="muted small" style={{ marginTop: 6, lineHeight: 1.5 }}>
              Optional. Leave blank to default to 6 months after the start date.
            </p>
          </label>
          <div>
            <label>
              <span className="muted small">Lighterpack code</span>
              <input
                type="text"
                value={lighterpackUrl}
                onChange={(e) => setLighterpackUrl(e.target.value)}
                placeholder="e52c1t"
                style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--card)", color: "var(--text)" }}
              />
            </label>
            <p className="muted small" style={{ marginTop: 6, lineHeight: 1.5 }}>
              To get your shareable link, open your list on lighterpack.com, hover over
              the <strong style={{ color: "var(--text)" }}>Share</strong> button in the
              top-right, and copy the code after the <code>"id="</code><br/>
              Ex: <code>"...div id="e52c1t"</code>, e52c1t would be the code
            </p>
          </div>
          <button onClick={handleSave} disabled={saving || hikeStartDate.length <= 0} className="button" style={{ justifySelf: "start" }}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
          {saveError && <p style={{ fontSize: 14, color: "#ff6b6b" }}>{saveError}</p>}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Sync</div>
        <p className="muted small" style={{ marginTop: 4 }}>
          Last sync: {syncState?.last_sync_at ? new Date(syncState.last_sync_at).toISOString().replace("T", " ").slice(0, 19) + " UTC" : "Never"}
          {syncState?.status && syncState.status !== "idle" ? ` (${syncState.status})` : ""}
        </p>
        <button onClick={handleSync} disabled={syncing} className="button" style={{ marginTop: 12 }}>
          {syncing ? "Syncing... this could take a minute or two" : "Sync Now"}
        </button>
        {syncResult && <p style={{ marginTop: 8, fontSize: 14 }}>{syncResult}</p>}
      </div>
    </div>
  );
}
