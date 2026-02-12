"use client";

import type { GeoJSONFeatureCollection } from "@/lib/types";

const MI_PER_M = 0.000621371;
const KM_PER_M = 0.001;
const FT_PER_M = 3.28084;

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
  if (d > 0) parts.push(`${d} Day${d === 1 ? "" : "s"}`);
  if (h > 0) parts.push(`${h} h`);
  parts.push(`${m} min`);
  return parts.join(" ");
}

function computeStats(track: GeoJSONFeatureCollection) {
  const feats = track.features || [];
  let distM = 0, timeS = 0, elevM = 0, elevCount = 0;

  for (const f of feats) {
    const p = f.properties;
    if (Number.isFinite(p.distance_m)) distM += p.distance_m;
    if (Number.isFinite(p.moving_time_s)) timeS += p.moving_time_s;
    const e = p.elevation_gain_m;
    if (Number.isFinite(e) && e >= 0) { elevM += e; elevCount++; }
  }

  const totalKm = distM * KM_PER_M;
  const totalMi = distM * MI_PER_M;
  const hours = timeS / 3600;

  return {
    featsCount: feats.length,
    totalKm, totalMi,
    elevM, elevCount,
    timeS,
    avgDistPerActKm: feats.length ? totalKm / feats.length : null,
    avgDistPerActMi: feats.length ? totalMi / feats.length : null,
    avgKmh: hours > 0 ? totalKm / hours : null,
    avgMph: hours > 0 ? totalMi / hours : null,
  };
}

interface StatsPanelProps {
  track: GeoJSONFeatureCollection | null;
}

export default function StatsPanel({ track }: StatsPanelProps) {
  if (!track) return null;
  const s = computeStats(track);

  const elevMain = s.elevCount ? `${fmtInt(s.elevM)} m` : "\u2014";
  const elevSub = s.elevCount ? `${fmtInt(s.elevM * FT_PER_M)} ft` : "";

  return (
    <div className="card">
      <div className="card-title">Stats</div>
      <div className="pct-stats-wrap">
        <div className="pct-stat-hero">
          <div className="label">Total Distance</div>
          <div className="big">
            <div className="primary">{fmtNumber(s.totalKm, 1)} km</div>
            <div className="secondary">{fmtNumber(s.totalMi, 1)} mi</div>
          </div>
        </div>

        <div className="pct-chip-grid">
          <div className="pct-chip">
            <div className="label">Total Elevation</div>
            <div className="value">{elevMain}</div>
            <div className="sub">{elevSub}</div>
          </div>

          <div className="pct-chip">
            <div className="label">Total Time</div>
            <div className="value">{fmtDuration(s.timeS)}</div>
            <div className="sub">{s.featsCount ? `${s.featsCount} activities` : ""}</div>
          </div>

          <div className="pct-chip">
            <div className="label">Avg Distance / Activity</div>
            <div className="value">{s.avgDistPerActKm != null ? `${fmtNumber(s.avgDistPerActKm, 1)} km` : "\u2014"}</div>
            <div className="sub">{s.avgDistPerActMi != null ? `${fmtNumber(s.avgDistPerActMi, 1)} mi` : ""}</div>
          </div>

          <div className="pct-chip">
            <div className="label">Avg Speed</div>
            <div className="value">{s.avgKmh != null ? `${fmtNumber(s.avgKmh, 1)} km/h` : "\u2014"}</div>
            <div className="sub">{s.avgMph != null ? `${fmtNumber(s.avgMph, 1)} mi/h` : ""}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
