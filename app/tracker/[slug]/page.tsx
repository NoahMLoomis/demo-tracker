"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import StatsPanel from "@/components/StatsPanel";
import InsightsPanel from "@/components/InsightsPanel";
import type { GeoJSONFeatureCollection } from "@/lib/types";

const MapView = dynamic(() => import("@/components/Map"), { ssr: false });

export default function TrackerPage() {
  const { slug } = useParams<{ slug: string }>();
  const [track, setTrack] = useState<GeoJSONFeatureCollection | null>(null);

  const onTrackLoaded = useCallback((data: GeoJSONFeatureCollection) => {
    setTrack(data);
  }, []);

  return (
    <>
      <MapView
        geojsonUrl={`/api/tracks/${slug}`}
        latestUrl={`/api/latest/${slug}`}
        onTrackLoaded={onTrackLoaded}
      />
      <div className="grid">
        <StatsPanel track={track} />
        <InsightsPanel track={track} />
      </div>
    </>
  );
}
