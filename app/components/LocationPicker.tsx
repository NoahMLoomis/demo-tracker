"use client";

import { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface LocationPickerProps {
  lat?: number | null;
  lon?: number | null;
  onChange: (lat: number, lon: number) => void;
}

export default function LocationPicker({ lat, lon, onChange }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          sat: {
            type: "raster",
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
          },
        },
        layers: [
          { id: "sat-layer", type: "raster", source: "sat" },
        ],
      },
      center: [lon ?? -119.5, lat ?? 37.5],
      zoom: lat != null ? 8 : 4,
    });

    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    // Place initial marker if editing
    if (lat != null && lon != null) {
      markerRef.current = new maplibregl.Marker({ color: "#7ee787" })
        .setLngLat([lon, lat])
        .addTo(map);
    }

    map.on("click", (e) => {
      const { lng, lat: clickLat } = e.lngLat;
      if (!markerRef.current) {
        markerRef.current = new maplibregl.Marker({ color: "#7ee787" })
          .setLngLat([lng, clickLat])
          .addTo(map);
      } else {
        markerRef.current.setLngLat([lng, clickLat]);
      }
      onChange(clickLat, lng);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: 250,
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid var(--line)",
        marginTop: 8,
      }}
    />
  );
}
