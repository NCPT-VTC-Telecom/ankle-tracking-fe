import { AxiosPromise } from 'axios';
import axiosGosafe from 'utils/axiosGosafe';

// ─── REQUEST PARAMS ───────────────────────────────────────────────────────────

/** GET /v1/gps_tracking/history — Lịch sử di chuyển theo IMEI */
export interface GpsHistoryParams {
  /** IMEI thiết bị G737 (required) — ví dụ: "869487063154339" */
  imei: string;
  /** Trang hiện tại, mặc định 1 */
  page?: number;
  /** Số bản ghi mỗi trang, mặc định 50 */
  limit?: number;
  /** Thời điểm bắt đầu — ISO 8601, ví dụ "2026-05-01T00:00:00Z" */
  from?: string;
  /** Thời điểm kết thúc — ISO 8601, ví dụ "2026-05-31T23:59:59Z" */
  to?: string;
}

// ─── RESPONSE TYPES ───────────────────────────────────────────────────────────

/** Một điểm GPS trong lịch sử di chuyển */
export interface GpsTrackingPoint {
  /** IMEI thiết bị */
  imei?: string;
  /** Vĩ độ */
  lat: number;
  /** Kinh độ */
  lng: number;
  /** Thời điểm ghi nhận (ISO 8601) */
  timestamp: string;
  /** Tốc độ (km/h) */
  speed?: number;
  /** Mức pin (%) */
  battery?: number;
  /** Cường độ tín hiệu GSM (0–4) */
  signal?: number;
  /** Độ chính xác GPS (metres) */
  accuracy?: number;
  /** Độ cao (metres) */
  altitude?: number;
  /** Góc hướng đi (degrees) */
  heading?: number;
  /** Loại sự kiện */
  eventType?: string;
}

/** Wrapper phân trang trả về từ server */
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Response chuẩn từ GoSafe API */
export interface GosafeApiResponse<T> {
  code: number;
  message?: string;
  data: T;
}

export type GpsHistoryResponse = GosafeApiResponse<PaginatedData<GpsTrackingPoint>>;

// ─── HELPER — normalise response về format thống nhất ────────────────────────
/**
 * Một số server trả về data dưới dạng mảng trực tiếp, một số trong {items, total, ...}.
 * Hàm này đảm bảo luôn trả về PaginatedData.
 */
export function normaliseHistoryResponse(
  raw: any,
  params: GpsHistoryParams
): PaginatedData<GpsTrackingPoint> {
  // Dạng 1: { data: { items: [], total: N, page: N, ... } }
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
  // Dạng 2: { data: [] } — mảng trực tiếp trong data
  if (Array.isArray(raw?.data)) {
    return {
      items: raw.data.map(normalisePoint),
      total: raw.total ?? raw.data.length,
      page: params.page ?? 1,
      limit: params.limit ?? 50,
      totalPages: Math.ceil((raw.total ?? raw.data.length) / (params.limit ?? 50)),
    };
  }
  // Fallback — không nhận dạng được format
  return { items: [], total: 0, page: 1, limit: 50, totalPages: 0 };
}

/** Chuẩn hoá field names từ server (lat/latitude, lng/longitude, time/timestamp...) */
function normalisePoint(raw: any): GpsTrackingPoint {
  return {
    imei: raw.imei,
    lat: Number(raw.lat ?? raw.latitude ?? 0),
    lng: Number(raw.lng ?? raw.longitude ?? raw.lon ?? 0),
    timestamp: raw.timestamp ?? raw.time ?? raw.createdAt ?? '',
    speed: raw.speed != null ? Number(raw.speed) : undefined,
    battery: raw.battery != null ? Number(raw.battery) : undefined,
    signal: raw.signal != null ? Number(raw.signal) : undefined,
    accuracy: raw.accuracy != null ? Number(raw.accuracy) : undefined,
    altitude: raw.altitude != null ? Number(raw.altitude) : undefined,
    heading: raw.heading != null ? Number(raw.heading) : undefined,
    eventType: raw.eventType ?? raw.event_type,
  };
}

// ─── API METHODS ─────────────────────────────────────────────────────────────

export const gosafeTrackingApi = {
  /**
   * GET /v1/gps_tracking/history
   * Lịch sử di chuyển theo IMEI (paginated + date range)
   */
  getHistory: (params: GpsHistoryParams): AxiosPromise<any> =>
    axiosGosafe({
      url: '/v1/gps_tracking/history',
      method: 'GET',
      params,
    }),
};
