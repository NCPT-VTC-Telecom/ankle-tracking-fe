import type { Device, DeviceStatus } from './types';
import type { ApiDevice } from 'api/gosafe.tracking.api';

// ─── GEOGRAPHIC ───────────────────────────────────────────────────────────────

export function isPointInPolygon(lat: number, lng: number, polygon: [number, number][]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1],
      yi = polygon[i][0];
    const xj = polygon[j][1],
      yj = polygon[j][0];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
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
    y: (c[0] - latRef) * 111320
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
    coords.reduce((s, c) => s + c[1], 0) / coords.length
  ];
}

export function interpolatePoints(points: [number, number][], steps: number): [number, number][] {
  const result: [number, number][] = [];
  for (let i = 0; i < points.length; i++) {
    const cur = points[i],
      nxt = points[(i + 1) % points.length];
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
    [0.0006, 0.0006],
    [-0.0006, -0.0007],
    [0.0006, -0.0005],
    [-0.0005, 0.0007]
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
    [lat, lng]
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

// ─── ENUM DICTIONARIES (khớp api-docs offender_management) ──────────────────────

/** subjectType — phân loại đối tượng (CreateOffenderDto.subjectType). */
export const OFFENDER_SUBJECT_TYPE_VI: Record<string, string> = {
  DRUG_ADDICT: 'Nghiện ma túy',
  POST_REHAB: 'Sau cai nghiện',
  COMMUNITY_SENTENCE: 'Án phạt cộng đồng'
};

/** sentenceType — hình thức án (CreateOffenderDto.sentenceType). */
export const SENTENCE_TYPE_VI: Record<string, string> = {
  suspended: 'Án treo',
  conditional: 'Án có điều kiện',
  community_service: 'Lao động công ích'
};

/** status — trạng thái đối tượng (UpdateOffenderDto.status). */
export const OFFENDER_STATUS_VI: Record<string, string> = {
  MONITORING: 'Đang giám sát',
  VIOLATING: 'Vi phạm',
  SUSPENDED: 'Tạm đình chỉ',
  COMPLETED: 'Hoàn thành'
};

/** Danh sách key gợi ý cho ô chọn (Autocomplete) — nhãn hiển thị dùng translate*. */
export const SUBJECT_TYPE_OPTIONS = Object.keys(OFFENDER_SUBJECT_TYPE_VI);
export const SENTENCE_TYPE_OPTIONS = Object.keys(SENTENCE_TYPE_VI);

/** Key dạng enum (SNAKE_CASE / snake_case) → chữ thường có dấu cách, viết hoa đầu. */
function prettifyEnum(key: string): string {
  const s = key.replace(/_/g, ' ').trim().toLowerCase();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : key;
}

/** Tội danh: dịch subjectType nếu khớp; còn lại là chuỗi tự do → giữ nguyên. */
export function translateCrime(value?: string | null): string {
  if (!value) return '—';
  return OFFENDER_SUBJECT_TYPE_VI[value] ?? value;
}

/** Hình phạt: có thể là "community_service" hoặc "community_service · 36 tháng". */
export function translateSentence(value?: string | null): string {
  if (!value) return '—';
  return value
    .split(' · ')
    .map((seg) => {
      const k = seg.trim();
      return SENTENCE_TYPE_VI[k] ?? (/^[a-z][a-z_]+$/.test(k) ? prettifyEnum(k) : k);
    })
    .join(' · ');
}

/** Trạng thái đối tượng: dịch enum status; fallback prettify. */
export function translateOffenderStatus(value?: string | null): string {
  if (!value) return '—';
  return OFFENDER_STATUS_VI[value] ?? prettifyEnum(value);
}

/** ISO/Date string → dd/mm/yyyy. Không phải ngày hợp lệ → trả nguyên; rỗng → '—'. */
export function formatDateVN(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
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

// Helper to generate consistent mock biometric stats for a given device ID (bringing in the human surveillance element)
export const getMockBiometrics = (devId: string) => {
  let hash = 0;
  for (let i = 0; i < devId.length; i++) {
    hash = devId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const heartRate = 72 + Math.abs(hash % 16); // 72 - 88 bpm
  const temp = (36.4 + Math.abs(hash % 8) / 10).toFixed(1); // 36.4 - 37.2 °C
  const steps = 3000 + Math.abs(hash % 6200); // 3000 - 9200 steps
  // Lock/Bracelet status: 1 out of 5 tampered for demo!
  const isTampered = Math.abs(hash % 5) === 0;
  return { heartRate, temp, steps, isTampered };
};

// ─── CRITICAL EVENT DETECTION ───────────────────────────────────────────────────

export function isSOS(name: string): boolean {
  return /\bsos\b/i.test(name);
}
export function isFiberCut(name: string): boolean {
  return /fiber[\s_]*(optical[\s_]*)?cut/i.test(name);
}
/** Thiết bị test cứng từ backend (IMEI 'TEST...') — ẩn khỏi danh sách & cảnh báo */
export function isTestDevice(imei: string | null | undefined): boolean {
  return /^test/i.test((imei ?? '').trim());
}

/**
 * Validate thời hạn án theo BLHS 2015 (Thông tư 65/2019 dẫn chiếu).
 * Trả về message lỗi (chặn lưu) hoặc null nếu hợp lệ.
 *  - suspended (Án treo): 1–5 năm (Điều 65)
 *  - conditional (Cải tạo không giam giữ): 6 tháng–3 năm (Điều 36)
 *  - community_service (Lao động phục vụ cộng đồng): 6 tháng–3 năm (Điều 36 k.4)
 */
const SENTENCE_RULES: Record<string, { minYears: number; maxYears: number; label: string; cite: string }> = {
  suspended: { minYears: 1, maxYears: 5, label: 'Án treo: thời gian thử thách', cite: 'BLHS Điều 65' },
  conditional: { minYears: 0.5, maxYears: 3, label: 'Cải tạo không giam giữ: thời hạn', cite: 'BLHS Điều 36' },
  community_service: { minYears: 0.5, maxYears: 3, label: 'Lao động phục vụ cộng đồng: thời hạn', cite: 'BLHS Điều 36' }
};

export function validateSentence(
  sentenceType: string | null | undefined,
  start: string | null | undefined,
  end: string | null | undefined
): string | null {
  if (start && end && new Date(start).getTime() >= new Date(end).getTime()) {
    return 'Ngày mãn hạn phải sau ngày bắt đầu thi hành án.';
  }
  const rule = sentenceType ? SENTENCE_RULES[sentenceType] : undefined;
  if (!rule) return null; // loại án không ràng buộc thời hạn
  if (!start || !end) return 'Vui lòng nhập ngày bắt đầu và mãn hạn để kiểm tra theo luật.';
  const years = (new Date(end).getTime() - new Date(start).getTime()) / (365.25 * 86400000);
  if (years < rule.minYears || years > rule.maxYears) {
    const fmt = (y: number) => (y < 1 ? `${Math.round(y * 12)} tháng` : `${y} năm`);
    return `${rule.label} phải từ ${fmt(rule.minYears)} đến ${fmt(rule.maxYears)} (${rule.cite}).`;
  }
  return null;
}

// ─── SESSION STORAGE ──────────────────────────────────────────────────────────

export const SS = {
  DEVICES: 'gosafe:devices',
  GEOFENCES: 'gosafe:geofences',
  LOGS: 'gosafe:logs',
  SOUND: 'gosafe:soundEnabled',
  FOLLOW: 'gosafe:followDevice',
  SELECTED: 'gosafe:selectedDeviceId',
  INTERVAL: 'gosafe:syncInterval'
};

export function ssGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function ssSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/** Thiết bị có nguồn từ API (id 'api-<serverId>') — để phân biệt với thiết bị thủ công. */
export const isApiDevice = (d: { id: string }) => d.id.startsWith('api-');

/**
 * Trạng thái telemetry trung tính (placeholder) — dùng khi hydrate từ cache để KHÔNG
 * hiển thị số liệu cũ như thể đang hiện hành. Giữ lại deviceModel để có nhãn thiết bị.
 */
export function placeholderStatus(deviceModel = ''): DeviceStatus {
  return {
    battery: 0,
    batteryVoltage: null,
    externalVoltage: null,
    signalStrength: 0,
    connectionStatus: 'offline',
    lastGpsUpdate: null,
    lastServerSync: null,
    gpsAccuracy: 0,
    gpsFix: false,
    satelliteCount: 0,
    speed: 0,
    altitude: 0,
    eventId: 0,
    eventName: 'Normal',
    deviceModel,
    firmwareVersion: ''
  };
}

/** Serialize Device → JSON-safe (Date fields → ISO strings) */
export function deviceToSS(d: Device) {
  return {
    ...d,
    status: {
      ...d.status,
      lastGpsUpdate: d.status.lastGpsUpdate?.toISOString() ?? null,
      lastServerSync: d.status.lastServerSync?.toISOString() ?? null
    }
  };
}

/**
 * Deserialize từ cache: chỉ khôi phục ĐỊNH DANH/CONFIG + toạ độ + gán geofence.
 * Telemetry biến động (pin/sự kiện/kết nối/sync…) KHÔNG khôi phục — dùng placeholder
 * để tránh hiển thị dữ liệu cũ; chờ snapshot/SSE đầu tiên cập nhật giá trị thật.
 */
export function deviceFromSS(raw: ReturnType<typeof deviceToSS>): Device {
  const toNum = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  return {
    ...raw,
    coords: [toNum(raw.coords?.[0]), toNum(raw.coords?.[1])] as [number, number],
    pathHistory: [],
    angle: 0,
    status: placeholderStatus(raw.status?.deviceModel ?? '')
  };
}

// ─── BATTERY (voltage → %) ──────────────────────────────────────────────────────

/**
 * Bảng OCV→SoC cho pin Li-ion/LiPo 1 cell (điện áp nghỉ, nhiệt độ phòng).
 * Đường xả Li-ion phi tuyến nên dùng tra bảng + nội suy chính xác hơn tuyến tính.
 */
const LIION_OCV_SOC: ReadonlyArray<[number, number]> = [
  [4.2, 100],
  [4.15, 95],
  [4.11, 90],
  [4.08, 85],
  [4.02, 80],
  [3.98, 75],
  [3.95, 70],
  [3.91, 65],
  [3.87, 60],
  [3.85, 55],
  [3.84, 50],
  [3.82, 45],
  [3.8, 40],
  [3.79, 35],
  [3.77, 30],
  [3.75, 25],
  [3.73, 20],
  [3.71, 15],
  [3.69, 10],
  [3.61, 5],
  [3.5, 0]
];

/** Điện áp Li-ion → % pin (tra bảng OCV→SoC + nội suy). ≥4.2V→100%, ≤3.5V→0%. */
export function voltageToPercent(v: number | null, fallback = 50): number {
  if (v == null || v <= 0) return fallback;
  if (v >= LIION_OCV_SOC[0][0]) return 100;
  const last = LIION_OCV_SOC[LIION_OCV_SOC.length - 1];
  if (v <= last[0]) return 0;
  for (let i = 0; i < LIION_OCV_SOC.length - 1; i++) {
    const [vHi, sHi] = LIION_OCV_SOC[i];
    const [vLo, sLo] = LIION_OCV_SOC[i + 1];
    if (v <= vHi && v >= vLo) {
      const pct = sLo + ((v - vLo) / (vHi - vLo)) * (sHi - sLo);
      return Math.max(0, Math.min(100, Math.round(pct)));
    }
  }
  return fallback;
}

// ─── API DEVICE MAPPING ─────────────────────────────────────────────────────────

/** Ép kiểu số an toàn (API có thể trả string) */
export function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** Map 1 thiết bị từ API GPS (snake_case hoặc camelCase) → domain Device. */
export function mapApiDeviceToDevice(
  api: ApiDevice,
  existing: Device | undefined,
  fallbackColor: string
): Device {
  const a = api as any;
  const pick = (...keys: string[]) => {
    for (const k of keys) if (a[k] !== undefined && a[k] !== null && a[k] !== '') return a[k];
    return undefined;
  };

  const lastSeen = new Date(pick('last_seen', 'lastSeen', 'last_seen_at', 'updatedAt') ?? NaN);
  const lastDeviceTime = new Date(
    pick('last_device_time', 'lastDeviceTime', 'device_time', 'deviceTime') ?? NaN
  );
  const lastSeenMs = lastSeen.getTime();
  const minutesSinceSync = Number.isFinite(lastSeenMs)
    ? (Date.now() - lastSeenMs) / 60000
    : Infinity;

  const rawBatV = pick('battery_voltage', 'batteryVoltage');
  const rawExtV = pick('external_voltage', 'externalVoltage');
  const batteryVoltage = rawBatV != null ? num(rawBatV) : null;
  const externalVoltage = rawExtV != null ? num(rawExtV) : null;
  const voltage = batteryVoltage ?? externalVoltage;
  // API có field % pin riêng (battery_percent) → ưu tiên dùng trực tiếp;
  // chỉ ước tính từ điện áp khi BE không trả % pin.
  const rawBatPct = pick('battery_percent', 'batteryPercent');
  const battery =
    rawBatPct != null
      ? Math.max(0, Math.min(100, Math.round(num(rawBatPct))))
      : voltageToPercent(voltage, existing?.status.battery ?? 50);

  const lat = num(pick('latitude', 'lat'), existing?.coords[0] ?? 0);
  const lng = num(pick('longitude', 'lng', 'lon'), existing?.coords[1] ?? 0);
  const next: [number, number] = [lat, lng];
  const prev = existing?.coords;
  const moved = !prev || prev[0] !== lat || prev[1] !== lng;

  const imei = String(pick('device_imei', 'deviceImei', 'imei') ?? '').trim();
  const deviceModel = String(pick('device_model', 'deviceModel', 'model') ?? '');
  const id = pick('id', '_id', 'deviceId') ?? imei;

  return {
    id: existing?.id ?? `api-${id}`,
    name: existing?.name || imei || `Thiết bị ${id}`,
    type: existing?.type ?? 'Person',
    deviceType: deviceModel,
    uniqueId: existing?.uniqueId || imei,
    phoneNumber: existing?.phoneNumber ?? '',
    color: existing?.color ?? fallbackColor,
    subject: existing?.subject ?? null,
    status: {
      battery,
      batteryVoltage,
      externalVoltage,
      signalStrength: Math.min(4, Math.max(0, num(pick('gsm_signal', 'gsmSignal')) - 1)),
      connectionStatus:
        minutesSinceSync > 10 ? 'offline' : minutesSinceSync > 2 ? 'unstable' : 'online',
      lastGpsUpdate: Number.isFinite(lastDeviceTime.getTime()) ? lastDeviceTime : null,
      lastServerSync: Number.isFinite(lastSeenMs) ? lastSeen : null,
      gpsAccuracy: 5,
      gpsFix: Boolean(pick('gps_fixed', 'gpsFixed', 'gpsFix')),
      satelliteCount: num(pick('satellite_count', 'satelliteCount')),
      speed: num(pick('speed')),
      altitude: num(pick('altitude')),
      eventId: num(pick('event_id', 'eventId')),
      eventName: String(pick('event_name', 'eventName') ?? 'Normal'),
      deviceModel,
      firmwareVersion: String(pick('firmware_version', 'firmwareVersion') ?? '')
    },
    coords: next,
    angle: moved && prev ? getAngle(prev, next) : existing?.angle ?? 0,
    pathHistory: moved
      ? [...(existing?.pathHistory ?? []), next].slice(-50)
      : existing?.pathHistory ?? [],
    assignedGeofenceId: existing?.assignedGeofenceId ?? null
  };
}
