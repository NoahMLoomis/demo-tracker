"use client";

import type { GeoJSONFeatureCollection } from "@/lib/types";

const MI_PER_M = 0.000621371;
const KM_PER_M = 0.001;
const PCT_TOTAL_MI = 2650;
const PCT_TOTAL_KM = PCT_TOTAL_MI * 1.609344;

function fmtNumber(n: number, digits = 1) {
  if (!Number.isFinite(n)) return "\u2014";
  return n.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });
}
function fmtInt(n: number) {
  if (!Number.isFinite(n)) return "\u2014";
  return Math.round(n).toLocaleString();
}
function fmtDuration(sec: number) {
  if (!Number.isFinite(sec) || sec <= 0) return "\u2014";
  const s = Math.floor(sec);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const parts: string[] = [];
  if (d) parts.push(`${d} Day${d === 1 ? "" : "s"}`);
  if (h) parts.push(`${h} h`);
  parts.push(`${m} min`);
  return parts.join(" ");
}
function fmtDateShort(ts: string) {
  try {
    return new Date(ts).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  } catch { return "\u2014"; }
}

interface DayItem { distM: number; timeS: number | null; dateLabel: string }

function computeInsights(track: GeoJSONFeatureCollection) {
  const feats = track.features || [];
  let distM = 0, timeS = 0;
  const days = new Set<string>();
  let firstTs: number | null = null, lastTs: number | null = null;
  let longest: DayItem | null = null, shortest: DayItem | null = null;

  for (const f of feats) {
    const p = f.properties;
    const d = p.distance_m;
    const t = p.moving_time_s;
    const sd = p.start_date || "";

    if (Number.isFinite(d)) distM += d;
    if (Number.isFinite(t)) timeS += t;

    if (sd) {
      days.add(sd.slice(0, 10));
      const ts = Date.parse(sd);
      if (Number.isFinite(ts)) {
        if (firstTs === null || ts < firstTs) firstTs = ts;
        if (lastTs === null || ts > lastTs) lastTs = ts;
      }
    }

    if (Number.isFinite(d) && d > 0) {
      const item: DayItem = { distM: d, timeS: Number.isFinite(t) ? t : null, dateLabel: sd ? fmtDateShort(sd) : "\u2014" };
      if (!longest || d > longest.distM) longest = item;
      if (!shortest || d < shortest.distM) shortest = item;
    }
  }

  const activeDays = days.size;
  let restDays: number | null = null;
  if (firstTs !== null && lastTs !== null) {
    const span = Math.floor((lastTs - firstTs) / 86400000) + 1;
    restDays = Math.max(0, span - activeDays);
  }

  const totalKm = distM * KM_PER_M;
  const totalMi = distM * MI_PER_M;
  const pctCompleted = (totalMi / PCT_TOTAL_MI) * 100;
  const remainingMi = Math.max(0, PCT_TOTAL_MI - totalMi);
  const remainingKm = remainingMi * 1.609344;

  return { totalKm, totalMi, pctCompleted, remainingKm, remainingMi, firstTs, lastTs, activeDays, restDays, longest, shortest, timeS };
}

function DayChip({ label, item }: { label: string; item: DayItem | null }) {
  if (!item) {
    return (
      <div className="pct-chip">
        <div className="label">{label}</div>
        <div className="pct-day-km">{"\u2014"}</div>
      </div>
    );
  }
  const km = item.distM * KM_PER_M;
  const mi = item.distM * MI_PER_M;
  return (
    <div className="pct-chip">
      <div className="label">{label}</div>
      <div className="pct-day-km">{fmtNumber(km, 1)} km</div>
      <div className="pct-day-meta">{fmtNumber(mi, 1)} mi &middot; {item.timeS != null ? fmtDuration(item.timeS) : "\u2014"}</div>
      <div className="pct-day-date">{item.dateLabel}</div>
    </div>
  );
}

interface InsightsPanelProps {
  track: GeoJSONFeatureCollection | null;
}

export default function InsightsPanel({ track }: InsightsPanelProps) {
  if (!track) return null;
  const s = computeInsights(track);

  const pctTxt = Number.isFinite(s.pctCompleted) ? `${fmtNumber(s.pctCompleted, 1)}%` : "\u2014%";
  const pctWidth = Math.max(0, Math.min(100, Number.isFinite(s.pctCompleted) ? s.pctCompleted : 0));

  return (
    <div className="card">
      <div className="card-title">Insights</div>
      <div className="pct-sections">
        <div className="pct-section">
          <div className="pct-section-title">Progress</div>
          <div className="pct-rows">
            <div className="pct-row">
              <span>PCT completed</span>
              <b>{pctTxt} &middot; {fmtNumber(s.totalKm, 1)} km of {fmtInt(PCT_TOTAL_KM)} km &middot; {fmtNumber(s.totalMi, 1)} mi of {fmtInt(PCT_TOTAL_MI)} mi</b>
            </div>
            <div className="pct-progressbar" aria-label="PCT progress">
              <div className="pct-progressfill" style={{ width: `${pctWidth}%` }} />
            </div>
            <div className="pct-row" style={{ marginTop: 6 }}>
              <span>Remaining</span>
              <b>{fmtNumber(s.remainingKm, 1)} km / {fmtNumber(s.remainingMi, 1)} mi</b>
            </div>
          </div>

          <div className="pct-section" style={{ marginTop: 10 }}>
            <div className="pct-section-title">Timeline</div>
            <div className="pct-rows">
              <div className="pct-row"><span>First activity</span><b>{s.firstTs != null ? new Date(s.firstTs).toLocaleDateString() : "\u2014"}</b></div>
              <div className="pct-row"><span>Last activity</span><b>{s.lastTs != null ? new Date(s.lastTs).toLocaleDateString() : "\u2014"}</b></div>
              <div className="pct-row">
                <span>Days</span>
                <b>{s.activeDays || 0} active days{s.restDays != null ? ` \u00B7 ${s.restDays} rest days` : ""}</b>
              </div>
            </div>
          </div>

          <div className="pct-daychips">
            <DayChip label="Longest Day" item={s.longest} />
            <DayChip label="Shortest Day" item={s.shortest} />
          </div>
        </div>
      </div>
    </div>
  );
}
