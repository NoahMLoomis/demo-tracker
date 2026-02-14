"use client";

import type { TrailStats } from "@/lib/types";

const MI_PER_M = 0.000621371;
const KM_PER_M = 0.001;
const FT_PER_M = 3.28084;

function fmtNumber(n: number, digits = 1) {
	if (!Number.isFinite(n)) return "\u2014";
	return n.toLocaleString(undefined, {
		maximumFractionDigits: digits,
		minimumFractionDigits: digits,
	});
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

interface StatsPanelProps {
	stats: TrailStats | null;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
	if (!stats) return null;

	const totalKm = stats.totalDistanceM * KM_PER_M;
	const totalMi = stats.totalDistanceM * MI_PER_M;
	const hours = stats.totalMovingTimeS / 3600;

	const avgDistPerActKm = stats.activityCount
		? totalKm / stats.activityCount
		: null;
	const avgDistPerActMi = stats.activityCount
		? totalMi / stats.activityCount
		: null;
	const avgKmh = hours > 0 ? totalKm / hours : null;
	const avgMph = hours > 0 ? totalMi / hours : null;

	const elevMain =
		stats.totalElevationGainM > 0
			? `${fmtInt(stats.totalElevationGainM)} m`
			: "\u2014";
	const elevSub =
		stats.totalElevationGainM > 0
			? `${fmtInt(stats.totalElevationGainM * FT_PER_M)} ft`
			: "";

	return (
		<div className="card">
			<div className="card-title">Stats</div>
			<div className="pct-stats-wrap">
				<div className="pct-stat-hero">
					<div className="label">Total Distance</div>
					<div className="big">
						<div className="primary">{fmtNumber(totalKm, 1)} km</div>
						<div className="secondary">{fmtNumber(totalMi, 1)} mi</div>
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
						<div className="value">{fmtDuration(stats.totalMovingTimeS)}</div>
						<div className="sub">
							{stats.activityCount ? `${stats.activityCount} activities` : ""}
						</div>
					</div>

					<div className="pct-chip">
						<div className="label">Avg Distance / Activity</div>
						<div className="value">
							{avgDistPerActKm != null
								? `${fmtNumber(avgDistPerActKm, 1)} km`
								: "\u2014"}
						</div>
						<div className="sub">
							{avgDistPerActMi != null
								? `${fmtNumber(avgDistPerActMi, 1)} mi`
								: ""}
						</div>
					</div>

					<div className="pct-chip">
						<div className="label">Avg Speed</div>
						<div className="value">
							{avgKmh != null ? `${fmtNumber(avgKmh, 1)} km/h` : "\u2014"}
						</div>
						<div className="sub">
							{avgMph != null ? `${fmtNumber(avgMph, 1)} mi/h` : ""}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
