import { AxiosPromise } from 'axios';
import axiosGosafe from 'utils/axiosGosafe';

// ─── DEVICE LIST ──────────────────────────────────────────────────────────────

/** Thiết bị trả về từ GET /v1/gps_tracking/devices */
export interface ApiDevice {
  id: string;
  device_imei: string;
  latitude: number;
  longitude: number;
  speed: number;
  altitude: number;
  gps_fixed: boolean;
  satellite_count: number;
  gsm_signal: number;
  battery_voltage: number | null;
  external_voltage: number;
  device_model: string;
  firmware_version: string;
  event_id: number;
  event_name: string;
  last_device_time: string;
  last_seen: string;
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
  return {
    id: raw.id,
    imei: raw.device_imei ?? raw.imei,
    lat: Number(raw.latitude ?? raw.lat ?? 0),
    lng: Number(raw.longitude ?? raw.lng ?? raw.lon ?? 0),
    timestamp: raw.server_time ?? raw.device_time ?? raw.timestamp ?? raw.time ?? '',
    speed: raw.speed != null ? Number(raw.speed) : undefined,
    altitude: raw.altitude != null ? Number(raw.altitude) : undefined,
    azimuth: raw.azimuth != null ? Number(raw.azimuth) : undefined,
    hdop: raw.hdop != null ? Number(raw.hdop) : undefined,
    vdop: raw.vdop != null ? Number(raw.vdop) : undefined,
    gpsFix: raw.gps_fixed,
    satelliteCount: raw.satellite_count != null ? Number(raw.satellite_count) : undefined,
    gsmSignal: raw.gsm_signal != null ? Number(raw.gsm_signal) : undefined,
    gsmRegistration: raw.gsm_registration,
    gsmMcc: raw.gsm_mcc,
    gsmMnc: raw.gsm_mnc,
    deviceModel: raw.device_model,
    firmwareVersion: raw.firmware_version,
    hardwareVersion: raw.hardware_version,
    batteryVoltage: raw.battery_voltage,
    externalVoltage: raw.external_voltage != null ? Number(raw.external_voltage) : undefined,
    eventStatus: raw.event_status,
    eventId: raw.event_id,
    eventName: raw.event_name,
    deviceTime: raw.device_time,
    serverTime: raw.server_time,
    rawPacket: raw.raw_packet,
  };
}

// ─── API METHODS ─────────────────────────────────────────────────────────────

export const gosafeTrackingApi = {
  /** GET /v1/gps_tracking/devices — Danh sách thiết bị + vị trí hiện tại */
  getDevices: (): AxiosPromise<ApiDevicesResponse> =>
    axiosGosafe({ url: '/v1/gps_tracking/devices', method: 'GET' }),

  /** GET /v1/gps_tracking/history — Lịch sử di chuyển theo IMEI */
  getHistory: (params: GpsHistoryParams): AxiosPromise<any> =>
    axiosGosafe({ url: '/v1/gps_tracking/history', method: 'GET', params }),
};
