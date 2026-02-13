"use client";

import { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

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

interface MapProps {
  slug: string;
}

export default function MapView({ slug }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

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

    const updateMarker = async () => {
      try {
        const res = await fetch(`/api/latest/${slug}`, { cache: "no-store" });
        if (!res.ok) return;
        const pos = await res.json();
        if (!pos.lat && !pos.lon) return;

        const lngLat: [number, number] = [pos.lon, pos.lat];
        if (!markerRef.current) {
          markerRef.current = new maplibregl.Marker({ element: createBlinkMarkerEl() })
            .setLngLat(lngLat)
            .addTo(map);
        } else {
          markerRef.current.setLngLat(lngLat);
        }
      } catch {
        // silently ignore fetch errors
      }
    };

    map.on("load", () => {
      map.addControl(new BasemapToggle(), "top-right");

      // Add static PCT trail
      map.addSource("pct-trail", {
        type: "geojson",
        data: "/pct-trail.geojson",
      });

      map.addLayer({
        id: "pct-glow",
        type: "line",
        source: "pct-trail",
        paint: {
          "line-color": "#7ee787",
          "line-width": 12,
          "line-opacity": 0.25,
          "line-blur": 6,
        },
      });

      map.addLayer({
        id: "pct-main",
        type: "line",
        source: "pct-trail",
        paint: {
          "line-color": "#7ee787",
          "line-width": 3,
          "line-opacity": 0.85,
        },
      });

      // Fetch marker position
      updateMarker();
      const interval = setInterval(updateMarker, 60_000);
      map.on("remove", () => clearInterval(interval));
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [slug]);

  return <div ref={containerRef} className="map" />;
}
