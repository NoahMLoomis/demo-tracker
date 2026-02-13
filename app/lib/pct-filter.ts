import { haversineM } from "./geo";

const PCT_PROXIMITY_M = 15000; // 15 km

// Simplified PCT centerline: ~40 waypoints from Campo, CA to Manning Park, BC
const PCT_WAYPOINTS: [number, number][] = [
  [32.59, -116.47], // Campo (southern terminus)
  [32.87, -116.51], // Mount Laguna
  [33.28, -116.64], // Warner Springs
  [33.74, -116.69], // Idyllwild
  [33.93, -116.83], // San Jacinto
  [34.24, -116.87], // Big Bear
  [34.32, -117.44], // Cajon Pass
  [34.36, -117.63], // Wrightwood
  [34.37, -117.99], // Mt Baden-Powell
  [34.49, -118.32], // Agua Dulce
  [34.82, -118.72], // Lake Hughes
  [35.13, -118.45], // Tehachapi
  [35.67, -118.23], // Kennedy Meadows South
  [36.07, -118.11], // Kennedy Meadows
  [36.58, -118.29], // Mt Whitney / Crabtree
  [36.77, -118.42], // Forester Pass
  [37.08, -118.66], // Muir Pass
  [37.38, -118.80], // Evolution Valley
  [37.65, -119.04], // Mammoth Lakes
  [37.87, -119.34], // Tuolumne Meadows
  [38.33, -119.64], // Sonora Pass
  [38.72, -119.93], // Carson Pass
  [38.94, -120.04], // South Lake Tahoe
  [39.32, -120.33], // Donner Pass
  [39.57, -120.64], // Sierra City
  [39.96, -121.25], // Belden
  [40.49, -121.51], // Lassen area
  [41.01, -121.65], // Burney Falls
  [41.17, -122.32], // Castle Crags
  [41.31, -122.31], // Mt Shasta area
  [41.46, -122.89], // Etna
  [41.84, -123.23], // Seiad Valley
  [42.19, -122.71], // Ashland, OR
  [42.87, -122.17], // Crater Lake
  [43.35, -122.04], // Shelter Cove
  [43.83, -121.76], // Bend area
  [44.42, -121.87], // Santiam Pass
  [45.33, -121.71], // Timberline Lodge
  [45.67, -121.90], // Cascade Locks
  [46.65, -121.39], // White Pass, WA
  [47.39, -121.41], // Snoqualmie Pass
  [47.75, -121.09], // Stevens Pass
  [48.33, -120.69], // Stehekin
  [48.52, -120.74], // Rainy Pass
  [49.06, -121.05], // Manning Park (northern terminus)
];

function pointToSegmentM(
  lat: number, lon: number,
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const midLat = ((lat1 + lat2) / 2) * (Math.PI / 180);
  const cosLat = Math.cos(midLat);

  const dx = (lon2 - lon1) * cosLat;
  const dy = lat2 - lat1;
  const segLenSq = dx * dx + dy * dy;

  if (segLenSq === 0) return haversineM(lat, lon, lat1, lon1);

  const px = (lon - lon1) * cosLat;
  const py = lat - lat1;
  const t = Math.max(0, Math.min(1, (px * dx + py * dy) / segLenSq));

  const clat = lat1 + t * (lat2 - lat1);
  const clon = lon1 + t * (lon2 - lon1);
  return haversineM(lat, lon, clat, clon);
}

export function isNearPct(lat: number, lon: number): boolean {
  for (let i = 0; i < PCT_WAYPOINTS.length - 1; i++) {
    const [lat1, lon1] = PCT_WAYPOINTS[i];
    const [lat2, lon2] = PCT_WAYPOINTS[i + 1];
    if (pointToSegmentM(lat, lon, lat1, lon1, lat2, lon2) <= PCT_PROXIMITY_M) {
      return true;
    }
  }
  return false;
}
