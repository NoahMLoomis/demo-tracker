"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { User, SyncState, TrailUpdate } from "@/lib/types";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false });

const inputStyle = {
  display: "block" as const,
  width: "100%",
  marginTop: 4,
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid var(--line)",
  background: "var(--card)",
  color: "var(--text)",
};

interface DashboardClientProps {
  user: User;
  syncState: SyncState | null;
  initialUpdates: TrailUpdate[];
}

export default function DashboardClient({ user, syncState, initialUpdates }: DashboardClientProps) {
  const [direction, setDirection] = useState<"NOBO" | "SOBO">(user.direction || "NOBO");
  const [hikeStartDate, setHikeStartDate] = useState(user.hike_start_date || new Date().toISOString().slice(0, 10));
  const [hikeEndDate, setHikeEndDate] = useState(user.hike_end_date || "");
  const [lighterpackUrl, setLighterpackUrl] = useState(user.lighterpack_url || "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  // Track original dates to detect changes
  const [savedStartDate] = useState(user.hike_start_date || "");
  const [savedEndDate] = useState(user.hike_end_date || "");

  // Updates state
  const [updates, setUpdates] = useState<TrailUpdate[]>(initialUpdates);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [addLocation, setAddLocation] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [updSaving, setUpdSaving] = useState(false);
  const [updError, setUpdError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaveError(null);
    setSyncResult(null);
    if (hikeStartDate.length <= 0) {
      setSaveError("hike start date required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction, hike_start_date: hikeStartDate, hike_end_date: hikeEndDate || null, lighterpack_url: lighterpackUrl || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSaveError(data.error || "Save failed.");
        setSaving(false);
        return;
      }

      // Sync if dates changed
      const datesChanged = hikeStartDate !== savedStartDate || (hikeEndDate || "") !== savedEndDate;
      if (datesChanged) {
        setSyncResult("Syncing activities...");
        try {
          const syncRes = await fetch("/api/sync", { method: "POST" });
          const syncData = await syncRes.json();
          if (syncRes.ok) {
            setSyncResult(`Saved & synced! ${syncData.added} new activities added.`);
          } else {
            setSyncResult(`Saved, but sync failed: ${syncData.error}`);
          }
        } catch {
          setSyncResult("Saved, but sync failed. Try again later.");
        }
      }
    } catch {
      setSaveError("Save failed. Please try again.");
    }
    setSaving(false);
  };

  const resetUpdateForm = () => {
    setEditingId(null);
    setTitle("");
    setBody("");
    setAddLocation(false);
    setLat(null);
    setLon(null);
    setUpdError(null);
  };

  const handleEditClick = (u: TrailUpdate) => {
    setEditingId(u.id);
    setTitle(u.title);
    setBody(u.body);
    if (u.lat != null && u.lon != null) {
      setAddLocation(true);
      setLat(u.lat);
      setLon(u.lon);
    } else {
      setAddLocation(false);
      setLat(null);
      setLon(null);
    }
    setUpdError(null);
  };

  const handleUpdateSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      setUpdError("Title and body are required.");
      return;
    }
    setUpdSaving(true);
    setUpdError(null);
    try {
      const payload: Record<string, unknown> = {
        action: editingId ? "update" : "create",
        title: title.trim(),
        body: body.trim(),
        lat: addLocation ? lat : null,
        lon: addLocation ? lon : null,
      };
      if (editingId) payload.id = editingId;

      const res = await fetch("/api/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setUpdError(data.error || "Save failed.");
      } else {
        if (editingId) {
          setUpdates((prev) =>
            prev.map((u) =>
              u.id === editingId
                ? { ...u, title: title.trim(), body: body.trim(), lat: addLocation ? lat : null, lon: addLocation ? lon : null }
                : u
            )
          );
        } else {
          const created = await res.json();
          setUpdates((prev) => [created, ...prev]);
        }
        resetUpdateForm();
      }
    } catch {
      setUpdError("Save failed. Please try again.");
    }
    setUpdSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this update?")) return;
    try {
      const res = await fetch("/api/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      if (res.ok) {
        setUpdates((prev) => prev.filter((u) => u.id !== id));
        if (editingId === id) resetUpdateForm();
      }
    } catch {
      // silently fail
    }
  };

  return (
    <div style={{ display: "grid", gap: 14, maxWidth: 600 }}>
      <div className="card">
        <p style={{ marginTop: 8 }}>
          <strong>{user.display_name}</strong>
        </p>
        <p className="muted small" style={{ marginTop: 4 }}>
          Strava Athlete ID: {user.strava_athlete_id}
        </p>
        <p style={{ marginTop: 12 }}>
          Public tracker url:{" "}
          <a href={`/tracker/${user.slug}`} target="_blank" className="accent">
            {process.env.NEXT_PUBLIC_BASE_URL}/tracker/{user.slug}
          </a>
        </p>
      </div>

      <div className="card">
        <div className="card-title">Settings</div>
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <div>
            <span className="muted small">Direction *</span>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <button
                type="button"
                onClick={() => setDirection("NOBO")}
                className="button"
                style={{
                  background: direction === "NOBO" ? "var(--accent)" : "var(--card)",
                  color: direction === "NOBO" ? "#0d1117" : "var(--text)",
                  border: "1px solid var(--line)",
                  fontWeight: direction === "NOBO" ? 700 : 400,
                }}
              >
                NOBO
              </button>
              <button
                type="button"
                onClick={() => setDirection("SOBO")}
                className="button"
                style={{
                  background: direction === "SOBO" ? "var(--accent)" : "var(--card)",
                  color: direction === "SOBO" ? "#0d1117" : "var(--text)",
                  border: "1px solid var(--line)",
                  fontWeight: direction === "SOBO" ? 700 : 400,
                }}
              >
                SOBO
              </button>
            </div>
          </div>
          <label>
            <span className="muted small">Hike Start Date *</span>
            <input
              type="date"
              value={hikeStartDate}
              required
              onChange={(e) => setHikeStartDate(e.target.value)}
              style={inputStyle}
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
              style={inputStyle}
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
                style={inputStyle}
              />
            </label>
            <p className="muted small" style={{ marginTop: 6, lineHeight: 1.5 }}>
              To get your shareable link, open your list on lighterpack.com, hover over
              the <strong style={{ color: "var(--text)" }}>Share</strong> button in the
              top-right, and copy the code after the <code>&quot;id=&quot;</code><br/>
              Ex: <code>&quot;...div id=&quot;e52c1t&quot;</code>, e52c1t would be the code
            </p>
          </div>
          <button onClick={handleSave} disabled={saving || hikeStartDate.length <= 0} className="button" style={{ justifySelf: "start" }}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
          {saveError && <p style={{ fontSize: 14, color: "#ff6b6b" }}>{saveError}</p>}
          {syncResult && <p style={{ fontSize: 14 }}>{syncResult}</p>}
          <p className="muted small">
            Last sync: {syncState?.last_sync_at ? new Date(syncState.last_sync_at).toISOString().replace("T", " ").slice(0, 19) + " UTC" : "Never"}
            {syncState?.status && syncState.status !== "idle" ? ` (${syncState.status})` : ""}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-title">{editingId ? "Edit Update" : "New Trail Update"}</div>
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <label>
            <span className="muted small">Title *</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label>
            <span className="muted small">Body * <span style={{ color: body.length > 500 ? "#ff6b6b" : "inherit" }}>({body.length}/500)</span></span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              maxLength={500}
              style={{ ...inputStyle, resize: "vertical" as const }}
            />
          </label>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={addLocation}
                onChange={(e) => {
                  setAddLocation(e.target.checked);
                  if (!e.target.checked) { setLat(null); setLon(null); }
                }}
                style={{ accentColor: "var(--accent)" }}
              />
              <span className="muted small">Add location</span>
            </label>
            {addLocation && (
              <>
                <p className="muted small" style={{ marginTop: 6 }}>Click the map to drop a pin.</p>
                <LocationPicker lat={lat} lon={lon} onChange={(la, lo) => { setLat(la); setLon(lo); }} />
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleUpdateSubmit}
              disabled={updSaving || !title.trim() || !body.trim()}
              className="button"
            >
              {updSaving ? "Saving..." : editingId ? "Save Changes" : "Post Update"}
            </button>
            {editingId && (
              <button onClick={resetUpdateForm} className="button" style={{ background: "var(--card)", border: "1px solid var(--line)" }}>
                Cancel
              </button>
            )}
          </div>
          {updError && <p style={{ fontSize: 14, color: "#ff6b6b" }}>{updError}</p>}
        </div>

        {updates.length > 0 && (
          <div style={{ marginTop: 20, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
            <div className="muted small" style={{ marginBottom: 10 }}>Your Updates</div>
            <div style={{ display: "grid", gap: 10 }}>
              {updates.map((u) => (
                <div key={u.id} style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{u.title}</div>
                      <div className="muted small" style={{ marginTop: 2 }}>
                        {u.created_at.slice(0, 10)}
                        {u.lat != null && u.lon != null && " \u00B7 Has location"}
                      </div>
                      <div className="muted small" style={{ marginTop: 4 }}>
                        {u.body.length > 120 ? u.body.slice(0, 120) + "..." : u.body}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => handleEditClick(u)}
                        style={{ padding: "4px 10px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--card)", color: "var(--text)", cursor: "pointer", fontSize: 13 }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        style={{ padding: "4px 10px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--card)", color: "#ff6b6b", cursor: "pointer", fontSize: 13 }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
