// ─── GEOGRAPHIC ───────────────────────────────────────────────────────────────

export function isPointInPolygon(lat: number, lng: number, polygon: [number, number][]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1], yi = polygon[i][0];
    const xj = polygon[j][1], yj = polygon[j][0];
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
}

export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getPolygonPerimeter(coords: [number, number][]) {
  let p = 0;
  for (let i = 0; i < coords.length; i++) {
    const next = coords[(i + 1) % coords.length];
    p += getDistance(coords[i][0], coords[i][1], next[0], next[1]);
  }
  return p;
}

export function getPolygonArea(coords: [number, number][]) {
  if (coords.length < 3) return 0;
  const [latRef, lngRef] = [coords[0][0], coords[0][1]];
  const pts = coords.map((c) => ({
    x: (c[1] - lngRef) * 111320 * Math.cos((latRef * Math.PI) / 180),
    y: (c[0] - latRef) * 111320,
  }));
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return Math.abs(area / 2);
}

export function getPolygonCentroid(coords: [number, number][]): [number, number] {
  return [
    coords.reduce((s, c) => s + c[0], 0) / coords.length,
    coords.reduce((s, c) => s + c[1], 0) / coords.length,
  ];
}

export function interpolatePoints(points: [number, number][], steps: number): [number, number][] {
  const result: [number, number][] = [];
  for (let i = 0; i < points.length; i++) {
    const cur = points[i], nxt = points[(i + 1) % points.length];
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      result.push([cur[0] + (nxt[0] - cur[0]) * t, cur[1] + (nxt[1] - cur[1]) * t]);
    }
  }
  return result;
}

export function getAngle(p1: [number, number], p2: [number, number]) {
  return 90 - (Math.atan2(p2[0] - p1[0], p2[1] - p1[1]) * 180) / Math.PI;
}

/** Patrol path that exits a geofence and returns. dirIdx 0-3 controls exit direction. */
export function generateDevicePath(center: [number, number], dirIdx: number): [number, number][] {
  const dirs: [number, number][] = [
    [0.0006, 0.0006], [-0.0006, -0.0007],
    [0.0006, -0.0005], [-0.0005, 0.0007],
  ];
  const [dLat, dLng] = dirs[dirIdx % dirs.length];
  const [lat, lng] = center;
  const raw: [number, number][] = [
    [lat, lng],
    [lat + dLat * 0.4, lng + dLng * 0.4],
    [lat + dLat * 0.8, lng + dLng * 0.8],
    [lat + dLat * 1.2, lng + dLng * 1.2],
    [lat + dLat * 1.7, lng + dLng * 1.7],
    [lat + dLat * 2.0, lng + dLng * 2.0],
    [lat + dLat * 1.7, lng + dLng * 1.7],
    [lat + dLat * 1.2, lng + dLng * 1.2],
    [lat + dLat * 0.8, lng + dLng * 0.8],
    [lat + dLat * 0.4, lng + dLng * 0.4],
    [lat, lng],
    [lat - dLat * 0.3, lng - dLng * 0.3],
    [lat, lng],
  ];
  return interpolatePoints(raw, 12);
}

// ─── TIME / DISPLAY ────────────────────────────────────────────────────────────

export function timeAgo(date: Date | null): string {
  if (!date) return 'Chưa cập nhật';
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return `${s}s trước`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} phút trước`;
  return `${Math.floor(m / 60)} giờ trước`;
}

export function getBatteryColor(level: number) {
  if (level > 50) return '#22c55e';
  if (level > 20) return '#f59e0b';
  return '#ef4444';
}

export function fmtArea(area: number) {
  return area >= 10000 ? `${(area / 10000).toFixed(3)} ha` : `${Math.round(area)} m²`;
}

export function fmtPerimeter(p: number) {
  return p >= 1000 ? `${(p / 1000).toFixed(3)} km` : `${Math.round(p)} m`;
}

export function toIsoDate(dateStr: string, endOfDay = false) {
  return `${dateStr}T${endOfDay ? '23:59:59' : '00:00:00'}Z`;
}
