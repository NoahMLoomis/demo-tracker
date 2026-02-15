"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import StatsPanel from "@/components/StatsPanel";
import InsightsPanel from "@/components/InsightsPanel";
import type { TrailStats, TrailUpdate } from "@/lib/types";

const MapView = dynamic(() => import("@/components/Map"), { ssr: false });

export default function TrackerPage() {
	const { slug } = useParams<{ slug: string }>();
	const [stats, setStats] = useState<TrailStats | null>(null);
	const [updates, setUpdates] = useState<TrailUpdate[]>([]);

	useEffect(() => {
		fetch(`/api/stats/${slug}`)
			.then((r) => r.json())
			.then((data) => setStats(data))
			.catch(() => {});

		fetch(`/api/updates/${slug}`)
			.then((r) => r.json())
			.then((data) => setUpdates(data))
			.catch(() => {});
	}, [slug]);

	return (
		<>
			<MapView slug={slug} updates={updates} />
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
				<StatsPanel stats={stats} />
				<InsightsPanel stats={stats} />
			</div>
		</>
	);
}
