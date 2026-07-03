import { AxiosPromise } from 'axios';
import axiosGosafe from 'shared/utils/axiosGosafe';

/**
 * GPS Simulator API — cập nhật dữ liệu giả vào đúng luồng xử lý thật của GoSafe
 * (ghi gps_tracking_logs, upsert gps_device_status, chạy AlertEngine, đẩy SSE).
 *
 * Base URL: /v1/gps_sim (nối sau baseURL của axiosGosafe = /api/gosafe).
 * Auth: Public (không cần token) — nhưng vẫn đi qua axiosGosafe để dùng chung
 * proxy dev + interceptor lỗi.
 *
 * Envelope chung: { code, message, data }. code: 0 = OK, -1 = lỗi nghiệp vụ.
 */

export interface SimEnvelope<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/** POST /v1/gps_sim/position — 1 bản tin vị trí */
export interface SimPositionBody {
  imei: string;
  latitude: number;
  longitude: number;
  speed?: number; // km/h (mặc định 0)
  altitude?: number; // mét (mặc định 10)
  azimuth?: number; // hướng 0–360° (mặc định 0)
  satellites?: number; // số vệ tinh (mặc định 12)
  batteryVoltage?: number; // Vôn (mặc định 3.9)
  moving?: boolean; // true→"Moving", false→"Rest" (mặc định true)
  deviceTime?: string; // ISO, mặc định now
}

/** POST /v1/gps_sim/sos — tín hiệu SOS */
export interface SimSosBody {
  imei: string;
  latitude?: number; // nên gửi để bản tin kèm GPS
  longitude?: number;
  status?: boolean; // true = kích hoạt (mặc định), false = huỷ
  batteryVoltage?: number; // Vôn (mặc định 3.7)
  deviceTime?: string;
}

export interface SimWaypoint {
  latitude: number;
  longitude: number;
}

/** POST /v1/gps_sim/route — giả lập di chuyển theo lộ trình */
export interface SimRouteBody {
  imei: string;
  waypoints: SimWaypoint[]; // ≥ 2 điểm
  steps?: number; // số điểm nội suy giữa 2 mốc (mặc định 10)
  speed?: number; // km/h (mặc định 30)
  intervalMs?: number; // 0 = đồng bộ; >0 = chạy nền (mặc định 0)
  batteryVoltage?: number; // Vôn (mặc định 3.9)
}

/** POST /v1/gps_sim/event — sự kiện G737 tổng quát (SOS/geofence/fiber/crash…) */
export interface SimEventBody {
  imei: string;
  eventId: number; // mã sự kiện G737 (xem G737_EVENTS)
  status?: boolean; // true = kích hoạt (Triggered, mặc định), false = phục hồi (Restored)
  latitude?: number; // vĩ độ nơi phát sự kiện
  longitude?: number; // kinh độ nơi phát sự kiện
  batteryVoltage?: number; // Vôn
  deviceTime?: string; // ISO 8601, mặc định now
}

/** Danh mục mã sự kiện G737 (dùng cho dropdown chọn sự kiện). */
export interface G737Event {
  id: number;
  label: string;
}

export const G737_EVENTS: G737Event[] = [
  { id: 2, label: 'GSM Jamming (phá sóng)' },
  { id: 3, label: 'Geo-fence (ra/vào vùng)' },
  { id: 4, label: 'Fiber cut (đứt cáp)' },
  { id: 5, label: 'SOS' },
  { id: 8, label: 'Low voltage (pin yếu)' },
  { id: 9, label: 'Under voltage (sụt áp)' },
  { id: 16, label: 'Towing (kéo/di dời)' },
  { id: 17, label: 'Crash (va chạm)' },
  { id: 19, label: 'Overspeed (quá tốc độ)' }
];

export const gpsSimApi = {
  /** cập nhật 1 điểm GPS — data = gps_device_status sau upsert. */
  position: (body: SimPositionBody): AxiosPromise<SimEnvelope> =>
    axiosGosafe.post('/v1/gps_sim/position', body),

  /** Kích hoạt / huỷ SOS (eventId=5) — AlertEngine xử lý như SOS thật. */
  sos: (body: SimSosBody): AxiosPromise<SimEnvelope> =>
    axiosGosafe.post('/v1/gps_sim/sos', body),

  /** Nội suy tuyến tính giữa waypoints rồi cập nhật nhiều bản tin type=data. */
  route: (
    body: SimRouteBody
  ): AxiosPromise<
    SimEnvelope<{ imei: string; totalPoints: number; intervalMs?: number; mode: 'sync' | 'background' }>
  > => axiosGosafe.post('/v1/gps_sim/route', body),

  /** Sự kiện G737 tổng quát — AlertEngine xử lý theo eventId (geofence/fiber/crash…). */
  event: (body: SimEventBody): AxiosPromise<SimEnvelope> =>
    axiosGosafe.post('/v1/gps_sim/event', body)
};

export default gpsSimApi;
