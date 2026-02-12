const R = 6371000.0;

export function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dphi = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dphi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function downsampleSeries(
  xs: number[],
  ys: number[],
  maxPoints: number
): [number[], number[]] {
  const n = Math.min(xs.length, ys.length);
  if (n <= maxPoints) return [xs.slice(0, n), ys.slice(0, n)];
  const step = (n - 1) / (maxPoints - 1);
  const outX: number[] = [];
  const outY: number[] = [];
  for (let i = 0; i < maxPoints; i++) {
    const idx = Math.max(0, Math.min(n - 1, Math.round(i * step)));
    outX.push(xs[idx]);
    outY.push(ys[idx]);
  }
  return [outX, outY];
}
