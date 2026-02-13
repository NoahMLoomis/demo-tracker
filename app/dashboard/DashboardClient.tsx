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
  const [slug, setSlug] = useState(user.slug);
  const [lighterpackUrl, setLighterpackUrl] = useState(user.lighterpack_url || "");
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, lighterpack_url: lighterpackUrl || null }),
      });
    } catch { /* ignore */ }
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
            <span className="muted small">Slug (public URL)</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--card)", color: "var(--text)" }}
            />
          </label>
          <label>
            <span className="muted small">Lighterpack URL</span>
            <input
              type="text"
              value={lighterpackUrl}
              onChange={(e) => setLighterpackUrl(e.target.value)}
              placeholder="https://lighterpack.com/r/..."
              style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--card)", color: "var(--text)" }}
            />
          </label>
          <button onClick={handleSave} disabled={saving} className="button" style={{ justifySelf: "start" }}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Sync</div>
        <p className="muted small" style={{ marginTop: 4 }}>
          Last sync: {syncState?.last_sync_at ? new Date(syncState.last_sync_at).toLocaleString() : "Never"}
          {syncState?.status && syncState.status !== "idle" ? ` (${syncState.status})` : ""}
        </p>
        <button onClick={handleSync} disabled={syncing} className="button" style={{ marginTop: 12 }}>
          {syncing ? "Syncing..." : "Sync Now"}
        </button>
        {syncResult && <p style={{ marginTop: 8, fontSize: 14 }}>{syncResult}</p>}
      </div>
    </div>
  );
}
