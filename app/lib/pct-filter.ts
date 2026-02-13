const R = 6_371_000;
const PCT_PROXIMITY_M = 15_000; // 15 km

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dphi = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dphi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// ~44 waypoints along the PCT centerline
const W: [number, number][] = [
  [32.59, -116.47], [32.87, -116.51], [33.28, -116.64], [33.74, -116.69],
  [33.93, -116.83], [34.24, -116.87], [34.32, -117.44], [34.36, -117.63],
  [34.37, -117.99], [34.49, -118.32], [34.82, -118.72], [35.13, -118.45],
  [35.67, -118.23], [36.07, -118.11], [36.58, -118.29], [36.77, -118.42],
  [37.08, -118.66], [37.38, -118.80], [37.65, -119.04], [37.87, -119.34],
  [38.33, -119.64], [38.72, -119.93], [38.94, -120.04], [39.32, -120.33],
  [39.57, -120.64], [39.96, -121.25], [40.49, -121.51], [41.01, -121.65],
  [41.17, -122.32], [41.31, -122.31], [41.46, -122.89], [41.84, -123.23],
  [42.19, -122.71], [42.87, -122.17], [43.35, -122.04], [43.83, -121.76],
  [44.42, -121.87], [45.33, -121.71], [45.67, -121.90], [46.65, -121.39],
  [47.39, -121.41], [47.75, -121.09], [48.33, -120.69], [48.52, -120.74],
  [49.06, -121.05],
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
  return haversineM(lat, lon, lat1 + t * (lat2 - lat1), lon1 + t * (lon2 - lon1));
}

export function isNearPct(lat: number, lon: number): boolean {
  for (let i = 0; i < W.length - 1; i++) {
    if (pointToSegmentM(lat, lon, W[i][0], W[i][1], W[i + 1][0], W[i + 1][1]) <= PCT_PROXIMITY_M) {
      return true;
    }
  }
  return false;
}
