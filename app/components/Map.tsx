"use client";

import { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { GeoJSONFeatureCollection } from "@/lib/types";

const COLOR_EXPR: maplibregl.ExpressionSpecification = [
  "case",
  ["==", ["%", ["to-number", ["get", "i"]], 2], 0],
  "#46f3ff",
  "#ff4bd8",
];

function geojsonBbox(geojson: GeoJSONFeatureCollection): [number, number, number, number] | null {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const f of geojson.features) {
    for (const c of f.geometry.coordinates) {
      if (c[0] < minX) minX = c[0];
      if (c[1] < minY) minY = c[1];
      if (c[0] > maxX) maxX = c[0];
      if (c[1] > maxY) maxY = c[1];
    }
  }
  if (minX === Infinity) return null;
  return [minX, minY, maxX, maxY];
}

function createBlinkMarkerEl(): HTMLDivElement {
  const el = document.createElement("div");
  el.style.width = "16px";
  el.style.height = "16px";
  el.style.borderRadius = "999px";
  el.style.border = "2px solid rgba(232,238,245,.95)";
  el.style.boxShadow = "0 10px 26px rgba(0,0,0,.45)";
  el.style.background = "#2bff88";
  el.style.position = "relative";

  const ring = document.createElement("div");
  ring.style.position = "absolute";
  ring.style.left = "-10px";
  ring.style.top = "-10px";
  ring.style.width = "36px";
  ring.style.height = "36px";
  ring.style.borderRadius = "999px";
  ring.style.border = "2px solid rgba(43,255,136,.55)";
  ring.style.boxShadow = "0 0 22px rgba(43,255,136,.40)";
  ring.style.animation = "pctPulse 1.6s ease-out infinite";
  el.appendChild(ring);

  return el;
}

function findLastCoord(track: GeoJSONFeatureCollection): [number, number] | null {
  let bestFeat = null;
  let bestTs = -Infinity;
  for (const f of track.features) {
    const ts = f.properties?.start_date ? Date.parse(f.properties.start_date) : NaN;
    if (Number.isFinite(ts) && ts > bestTs) {
      bestTs = ts;
      bestFeat = f;
    }
  }
  if (!bestFeat?.geometry?.coordinates?.length) return null;
  const coords = bestFeat.geometry.coordinates;
  return coords[coords.length - 1];
}

interface MapProps {
  geojsonUrl: string;
  onTrackLoaded?: (track: GeoJSONFeatureCollection) => void;
}

export default function MapView({ geojsonUrl, onTrackLoaded }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const didFitRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const style: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        sat: {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics",
        },
        topo: {
          type: "raster",
          tiles: [
            "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
            "https://b.tile.opentopomap.org/{z}/{x}/{y}.png",
            "https://c.tile.opentopomap.org/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          attribution:
            "&copy; OpenTopoMap (CC-BY-SA) / &copy; OpenStreetMap contributors",
        },
      },
      layers: [
        { id: "sat-layer", type: "raster", source: "sat", layout: { visibility: "visible" } },
        { id: "topo-layer", type: "raster", source: "topo", layout: { visibility: "none" } },
      ],
    };

    const map = new maplibregl.Map({
      container: containerRef.current,
      style,
      center: [-119.5, 37.5],
      zoom: 4,
    });

    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

    // Basemap toggle
    class BasemapToggle implements maplibregl.IControl {
      _container?: HTMLDivElement;
      _map?: maplibregl.Map;

      onAdd(m: maplibregl.Map) {
        this._map = m;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pct-toggle-btn";
        btn.title = "Toggle basemap";
        btn.setAttribute("aria-label", "Toggle basemap");

        const setIcon = () => {
          const satVis = m.getLayoutProperty("sat-layer", "visibility") !== "none";
          btn.textContent = satVis ? "\u{1F5FA}\u{FE0F}" : "\u{1F6F0}\u{FE0F}";
        };

        btn.addEventListener("click", () => {
          const satVis = m.getLayoutProperty("sat-layer", "visibility") !== "none";
          m.setLayoutProperty("sat-layer", "visibility", satVis ? "none" : "visible");
          m.setLayoutProperty("topo-layer", "visibility", satVis ? "visible" : "none");
          setIcon();
        });

        const wrap = document.createElement("div");
        wrap.className = "maplibregl-ctrl maplibregl-ctrl-group";
        wrap.style.marginTop = "6px";
        wrap.style.overflow = "hidden";
        wrap.appendChild(btn);

        m.on("idle", setIcon);
        this._container = wrap;
        setIcon();
        return this._container;
      }

      onRemove() {
        this._container?.parentNode?.removeChild(this._container);
        this._map = undefined;
      }
    }

    let hoveredId: number | null = null;

    const setHover = (id: number | null) => {
      hoveredId = id;
      if (!map.getLayer("track-hover")) return;
      if (id == null) {
        map.setFilter("track-hover", ["==", ["get", "strava_id"], -1]);
        return;
      }
      map.setFilter("track-hover", ["==", ["to-number", ["get", "strava_id"]], id]);
    };

    const fmtNumber = (n: number, digits = 1) =>
      Number.isFinite(n)
        ? n.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits })
        : "\u2014";

    const fmtInt = (n: number) => (Number.isFinite(n) ? Math.round(n).toLocaleString() : "\u2014");

    const fmtDuration = (sec: number) => {
      if (!Number.isFinite(sec) || sec <= 0) return "\u2014";
      const s = Math.floor(sec);
      const d = Math.floor(s / 86400);
      const h = Math.floor((s % 86400) / 3600);
      const m = Math.floor((s % 3600) / 60);
      const parts: string[] = [];
      if (d) parts.push(`${d}d`);
      if (h) parts.push(`${h}h`);
      parts.push(`${m}m`);
      return parts.join(" ");
    };

    const buildPopupHTML = (p: Record<string, unknown>) => {
      const dist = Number(p.distance_m);
      const km = Number.isFinite(dist) ? dist * 0.001 : null;
      const mi = Number.isFinite(dist) ? dist * 0.000621371 : null;
      const t = Number(p.moving_time_s);
      const elev = Number(p.elevation_gain_m);
      return `<div class="pct-popup">
        <div class="pct-popup-title">${p.type || "Activity"}</div>
        <div class="pct-popup-grid">
          <div class="k">Date</div><div class="v">${p.start_date ? new Date(p.start_date as string).toLocaleString() : "\u2014"}</div>
          <div class="k">Distance</div><div class="v">${km != null ? `${fmtNumber(km)} km / ${fmtNumber(mi!)} mi` : "\u2014"}</div>
          <div class="k">Time</div><div class="v">${fmtDuration(t)}</div>
          <div class="k">Elevation</div><div class="v">${Number.isFinite(elev) ? `${fmtInt(elev)} m / ${fmtInt(elev * 3.28084)} ft` : "\u2014"}</div>
        </div>
      </div>`;
    };

    const refresh = async () => {
      try {
        const track = await fetch(geojsonUrl, { cache: "no-store" }).then((r) => r.json());

        onTrackLoaded?.(track);

        if (!map.getSource("track")) {
          map.addControl(new BasemapToggle(), "top-right");
          map.addSource("track", { type: "geojson", data: track });

          map.addLayer({
            id: "track-glow",
            type: "line",
            source: "track",
            paint: { "line-color": COLOR_EXPR, "line-width": 12, "line-opacity": 0.28, "line-blur": 6 },
          });
          map.addLayer({
            id: "track-main",
            type: "line",
            source: "track",
            paint: { "line-color": COLOR_EXPR, "line-width": 5, "line-opacity": 0.92 },
          });
          map.addLayer({
            id: "track-highlight",
            type: "line",
            source: "track",
            paint: { "line-color": "rgba(255,255,255,0.65)", "line-width": 1.6, "line-opacity": 0.55 },
          });
          map.addLayer({
            id: "track-hover",
            type: "line",
            source: "track",
            paint: { "line-color": "rgba(255,255,255,0.92)", "line-width": 7, "line-opacity": 0.75, "line-blur": 0.6 },
            filter: ["==", ["get", "strava_id"], -1],
          });

          map.on("mousemove", "track-main", (e) => {
            map.getCanvas().style.cursor = "pointer";
            const f = e.features?.[0];
            if (!f) return;
            const id = f.properties?.strava_id ? Number(f.properties.strava_id) : null;
            if (id !== hoveredId) setHover(id);
          });
          map.on("mouseleave", "track-main", () => {
            map.getCanvas().style.cursor = "";
            setHover(null);
          });
          map.on("click", "track-main", (e) => {
            const f = e.features?.[0];
            if (!f) return;
            popupRef.current?.remove();
            popupRef.current = new maplibregl.Popup({ closeButton: true, closeOnClick: true, maxWidth: "320px" })
              .setLngLat(e.lngLat)
              .setHTML(buildPopupHTML(f.properties || {}))
              .addTo(map);
          });
        } else {
          (map.getSource("track") as maplibregl.GeoJSONSource).setData(track);
        }

        // Place marker at the last coordinate of the most recent activity
        const lastCoord = findLastCoord(track);
        if (lastCoord) {
          const lngLat: [number, number] = [lastCoord[0], lastCoord[1]];
          if (!markerRef.current) {
            markerRef.current = new maplibregl.Marker({ element: createBlinkMarkerEl() })
              .setLngLat(lngLat)
              .addTo(map);
          } else {
            markerRef.current.setLngLat(lngLat);
          }
        }

        // Fit bounds on first load
        if (!didFitRef.current) {
          const bbox = geojsonBbox(track);
          if (bbox) {
            map.fitBounds(
              [[bbox[0], bbox[1]], [bbox[2], bbox[3]]],
              { padding: 40, duration: 800 }
            );
          }
          didFitRef.current = true;
        }
      } catch {
        // silently ignore fetch errors
      }
    };

    map.on("load", () => {
      refresh();
      const interval = setInterval(refresh, 60_000);
      map.on("remove", () => clearInterval(interval));
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [geojsonUrl, onTrackLoaded]);

  return <div ref={containerRef} className="map" />;
}
