import { AxiosPromise } from 'axios';
import axiosGosafe from 'shared/utils/axiosGosafe';

// ─── DEVICE LIST ──────────────────────────────────────────────────────────────

/**
 * Thiết bị trả về từ GET /v1/gps_tracking/devices (và stream).
 * Lưu ý: BE trả camelCase + số ở dạng string; mapApiDeviceToDevice đọc linh hoạt
 * cả snake_case/camelCase nên giữ optional cho cả hai biến thể.
 * `batteryPercent` là % pin chính chủ từ thiết bị — ưu tiên hơn ước tính từ điện áp.
 */
export interface ApiDevice {
  id: string;
  deviceImei?: string;
  device_imei?: string;
  latitude: number | string;
  longitude: number | string;
  speed: number | string;
  altitude: number | string;
  gpsFixed?: boolean;
  gps_fixed?: boolean;
  satelliteCount?: number;
  satellite_count?: number;
  gsmSignal?: number;
  gsm_signal?: number;
  /** % pin chính chủ (0–100) — field riêng, ưu tiên dùng trực tiếp */
  batteryPercent?: number | null;
  battery_percent?: number | null;
  /** Mức pin thô của firmware (có thể null) — không phải %, không dùng cho thanh pin */
  batteryLevel?: number | null;
  batteryVoltage?: number | string | null;
  battery_voltage?: number | string | null;
  externalVoltage?: number | string | null;
  external_voltage?: number | string | null;
  deviceModel?: string;
  device_model?: string;
  firmwareVersion?: string;
  firmware_version?: string;
  eventId?: number;
  event_id?: number;
  eventName?: string;
  event_name?: string;
  lastDeviceTime?: string;
  last_device_time?: string;
  lastSeen?: string;
  last_seen?: string;
}

export interface ApiDevicesResponse {
  code: number;
  message?: string;
  data: ApiDevice[];
  total: number;
  page: number;
  limit: number;
}

// ─── HISTORY PARAMS ───────────────────────────────────────────────────────────

/** GET /v1/gps_tracking/history — Lịch sử di chuyển theo IMEI */
export interface GpsHistoryParams {
  imei: string;
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
}

// ─── HISTORY POINT ────────────────────────────────────────────────────────────

/** Một điểm GPS trong lịch sử di chuyển (đã chuẩn hoá) */
export interface GpsTrackingPoint {
  id?: string;
  imei?: string;
  lat: number;
  lng: number;
  speed?: number;
  altitude?: number;
  azimuth?: number;
  hdop?: number;
  vdop?: number;
  gpsFix?: boolean;
  satelliteCount?: number;
  gsmSignal?: number;
  gsmRegistration?: number;
  gsmMcc?: string;
  gsmMnc?: string;
  deviceModel?: string;
  firmwareVersion?: string;
  hardwareVersion?: string;
  batteryVoltage?: number | null;
  externalVoltage?: number;
  eventStatus?: boolean;
  eventId?: number;
  eventName?: string;
  deviceTime?: string;
  serverTime?: string;
  /** Timestamp chuẩn hoá — ưu tiên server_time */
  timestamp: string;
  rawPacket?: string;
}

/** Wrapper phân trang */
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Response chuẩn GoSafe */
export interface GosafeApiResponse<T> {
  code: number;
  message?: string;
  data: T;
}

export type GpsHistoryResponse = GosafeApiResponse<PaginatedData<GpsTrackingPoint>>;

// ─── NORMALISE HISTORY RESPONSE ───────────────────────────────────────────────

export function normaliseHistoryResponse(
  raw: any,
  params: GpsHistoryParams,
): PaginatedData<GpsTrackingPoint> {
  // Dạng 1: { data: { items: [], total, page, ... } }
  if (raw?.data?.items !== undefined) {
    const d = raw.data;
    return {
      items: d.items.map(normalisePoint),
      total: d.total ?? d.items.length,
      page: d.page ?? params.page ?? 1,
      limit: d.limit ?? params.limit ?? 50,
      totalPages: d.totalPages ?? Math.ceil((d.total ?? d.items.length) / (d.limit ?? params.limit ?? 50)),
    };
  }
  // Dạng 2: { data: [], total, page, limit, totalPages } — array trực tiếp
  if (Array.isArray(raw?.data)) {
    const total = raw.total ?? raw.data.length;
    const limit = raw.limit ?? params.limit ?? 50;
    return {
      items: raw.data.map(normalisePoint),
      total,
      page: raw.page ?? params.page ?? 1,
      limit,
      totalPages: raw.totalPages ?? Math.ceil(total / limit),
    };
  }
  return { items: [], total: 0, page: 1, limit: 50, totalPages: 0 };
}

/** Chuẩn hoá field names từ server về GpsTrackingPoint */
function normalisePoint(raw: any): GpsTrackingPoint {
  // Server có thể trả snake_case hoặc camelCase → đọc cả hai.
  const batV = raw.battery_voltage ?? raw.batteryVoltage;
  const extV = raw.external_voltage ?? raw.externalVoltage;
  return {
    id: raw.id,
    imei: raw.device_imei ?? raw.deviceImei ?? raw.imei,
    lat: Number(raw.latitude ?? raw.lat ?? 0),
    lng: Number(raw.longitude ?? raw.lng ?? raw.lon ?? 0),
    timestamp: raw.server_time ?? raw.serverTime ?? raw.device_time ?? raw.deviceTime ?? raw.lastSeen ?? raw.timestamp ?? raw.time ?? '',
    speed: raw.speed != null ? Number(raw.speed) : undefined,
    altitude: raw.altitude != null ? Number(raw.altitude) : undefined,
    azimuth: raw.azimuth != null ? Number(raw.azimuth) : undefined,
    hdop: raw.hdop != null ? Number(raw.hdop) : undefined,
    vdop: raw.vdop != null ? Number(raw.vdop) : undefined,
    gpsFix: raw.gps_fixed ?? raw.gpsFixed,
    satelliteCount: (raw.satellite_count ?? raw.satelliteCount) != null ? Number(raw.satellite_count ?? raw.satelliteCount) : undefined,
    gsmSignal: (raw.gsm_signal ?? raw.gsmSignal) != null ? Number(raw.gsm_signal ?? raw.gsmSignal) : undefined,
    gsmRegistration: raw.gsm_registration ?? raw.gsmRegistration,
    gsmMcc: raw.gsm_mcc ?? raw.gsmMcc,
    gsmMnc: raw.gsm_mnc ?? raw.gsmMnc,
    deviceModel: raw.device_model ?? raw.deviceModel,
    firmwareVersion: raw.firmware_version ?? raw.firmwareVersion,
    hardwareVersion: raw.hardware_version ?? raw.hardwareVersion,
    batteryVoltage: batV != null ? Number(batV) : null,
    externalVoltage: extV != null ? Number(extV) : undefined,
    eventStatus: raw.event_status ?? raw.eventStatus,
    eventId: raw.event_id ?? raw.eventId,
    eventName: raw.event_name ?? raw.eventName,
    deviceTime: raw.device_time ?? raw.deviceTime,
    serverTime: raw.server_time ?? raw.serverTime,
    rawPacket: raw.raw_packet ?? raw.rawPacket,
  };
}

// ─── API METHODS ─────────────────────────────────────────────────────────────

/** Mã sự kiện G737 (GET /v1/gps_tracking/events?eventId=). */
export const GPS_EVENT_NAMES: Record<number, string> = {
  1: 'Di chuyển',
  2: 'Phá sóng GSM',
  3: 'Hàng rào địa lý',
  4: 'Đứt cáp quang',
  5: 'SOS',
  6: 'Định vị lần đầu',
  7: 'Pin beacon yếu',
  8: 'Điện áp thấp',
  9: 'Sụt áp',
  10: 'Vào vùng',
  11: 'Rời vùng',
  13: 'Số dư SIM'
};

/** Mã sự kiện quan trọng cần cảnh báo nổi (overlay). */
export const GPS_EVENT_ID = {
  FIBER_CUT: 4,
  SOS: 5,
  ZONE_ENTER: 10,
  ZONE_LEAVE: 11
} as const;

/** Sự kiện GPS đã chuẩn hoá (từ GET /v1/gps_tracking/events). */
export interface GpsEvent {
  id: string;
  imei: string;
  eventId: number;
  eventName: string;
  coords: [number, number];
  timestamp: Date;
}

/**
 * Chuẩn hoá 1 bản ghi sự kiện từ server → GpsEvent.
 * Schema response không có trong api-docs nên đọc phòng thủ cả camelCase/snake_case
 * (cùng quy ước với normalisePoint).
 */
export function mapApiEvent(raw: any): GpsEvent {
  const imei = String(raw.device_imei ?? raw.deviceImei ?? raw.imei ?? '').trim();
  const ts =
    raw.server_time ?? raw.serverTime ?? raw.device_time ?? raw.deviceTime ??
    raw.created_at ?? raw.createdAt ?? raw.timestamp ?? raw.time;
  return {
    id: String(raw.id ?? raw.eventId ?? `${imei}-${ts ?? ''}`),
    imei,
    eventId: Number(raw.event_id ?? raw.eventId ?? 0),
    eventName: String(raw.event_name ?? raw.eventName ?? ''),
    coords: [Number(raw.latitude ?? raw.lat) || 0, Number(raw.longitude ?? raw.lng) || 0],
    timestamp: ts ? new Date(ts) : new Date()
  };
}

/** GET /v1/gps_tracking/events — bộ lọc danh sách sự kiện. */
export interface GpsEventParams {
  imei?: string;
  eventId?: number;
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
}

/** POST /v1/gps_tracking/command — lệnh xuống thiết bị (TCP, fallback UDP). */
export interface GpsCommandBody {
  imei: string;
  /** VD: 'INTERVAL' (kèm value '30'), 'RESET' */
  command: string;
  value?: string;
}

export const gosafeTrackingApi = {
  /**
   * GET /v1/gps_tracking/devices — Danh sách thiết bị + vị trí hiện tại.
   * BE mặc định limit=20 (paginated) → phải xin limit lớn để seed HẾT thiết bị,
   * nếu không bản đồ chỉ hiện 20 vị trí đầu. Stream chỉ đẩy delta nên REST là
   * nguồn snapshot đầy đủ.
   */
  getDevices: (limit = 1000): AxiosPromise<ApiDevicesResponse> =>
    axiosGosafe({ url: '/v1/gps_tracking/devices', method: 'GET', params: { page: 1, limit } }),

  /** GET /v1/gps_tracking/device/{imei} — Chi tiết 1 thiết bị + telemetry */
  getDevice: (imei: string): AxiosPromise<any> =>
    axiosGosafe({ url: `/v1/gps_tracking/device/${imei}`, method: 'GET' }),

  /** GET /v1/gps_tracking/latest — Vị trí mới nhất (bỏ trống imei = tất cả) */
  getLatest: (imei?: string): AxiosPromise<any> =>
    axiosGosafe({ url: '/v1/gps_tracking/latest', method: 'GET', params: imei ? { imei } : undefined }),

  /** GET /v1/gps_tracking/history — Lịch sử di chuyển theo IMEI */
  getHistory: (params: GpsHistoryParams): AxiosPromise<any> =>
    axiosGosafe({ url: '/v1/gps_tracking/history', method: 'GET', params }),

  /** GET /v1/gps_tracking/events — Sự kiện (SOS / mất điện / hàng rào…) */
  getEvents: (params?: GpsEventParams): AxiosPromise<any> =>
    axiosGosafe({ url: '/v1/gps_tracking/events', method: 'GET', params }),

  /** GET /v1/gps_tracking/stats — Thống kê dashboard (tổng/SOS/đang kết nối…) */
  getStats: (): AxiosPromise<any> =>
    axiosGosafe({ url: '/v1/gps_tracking/stats', method: 'GET' }),

  /** GET /v1/gps_tracking/connected — Thiết bị đang kết nối trực tiếp (in-memory) */
  getConnected: (): AxiosPromise<any> =>
    axiosGosafe({ url: '/v1/gps_tracking/connected', method: 'GET' }),

  /** POST /v1/gps_tracking/command — Gửi lệnh xuống thiết bị (INTERVAL/RESET) */
  sendCommand: (body: GpsCommandBody): AxiosPromise<any> =>
    axiosGosafe({ url: '/v1/gps_tracking/command', method: 'POST', data: body }),
};
