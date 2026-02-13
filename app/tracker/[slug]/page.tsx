"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import StatsPanel from "@/components/StatsPanel";
import InsightsPanel from "@/components/InsightsPanel";
import type { TrailStats } from "@/lib/types";

const MapView = dynamic(() => import("@/components/Map"), { ssr: false });

export default function TrackerPage() {
  const { slug } = useParams<{ slug: string }>();
  const [stats, setStats] = useState<TrailStats | null>(null);

  useEffect(() => {
    fetch(`/api/stats/${slug}`)
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, [slug]);

  return (
    <>
      <MapView slug={slug} />
      <div className="grid">
        <StatsPanel stats={stats} />
        <InsightsPanel stats={stats} />
      </div>
    </>
  );
}
