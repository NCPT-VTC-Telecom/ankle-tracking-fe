import type { PaginatedData, GpsTrackingPoint } from 'api/gosafe.tracking.api';

// ─── DOMAIN TYPES ─────────────────────────────────────────────────────────────

export interface SubjectInfo {
  fullName: string;
  idNumber: string;
  crime: string;
  sentence: string;
  startDate: string;
  releaseDate: string;
  notes: string;
}

export interface DeviceStatus {
  battery: number;              // ước tính % (0–100) từ điện áp
  batteryVoltage: number | null; // điện áp pin (V), null nếu dùng nguồn ngoài
  externalVoltage: number | null; // điện áp nguồn ngoài (V)
  signalStrength: number;       // 0–4 thanh (map từ gsm_signal 1–5)
  connectionStatus: 'online' | 'offline' | 'unstable';
  lastGpsUpdate: Date | null;   // last_device_time
  lastServerSync: Date | null;  // last_seen (server nhận)
  gpsAccuracy: number;          // metres
  gpsFix: boolean;              // gps_fixed
  satelliteCount: number;       // số vệ tinh
  speed: number;                // km/h
  altitude: number;             // độ cao (m)
  eventId: number;
  eventName: string;            // Normal / SOS / ...
  deviceModel: string;          // G737-4G
  firmwareVersion: string;      // V1.18d0609
}

export interface Device {
  id: string;
  name: string;
  type: 'Person' | 'Vehicle' | 'Asset';
  deviceType: string;
  uniqueId: string;
  phoneNumber: string;
  color: string;
  subject: SubjectInfo | null;
  status: DeviceStatus;
  coords: [number, number];
  angle: number;
  pathHistory: [number, number][];
  assignedGeofenceId: string | null;
}

/**
 * Loại vùng — ánh xạ trực tiếp `zoneType` của API zone_management:
 *  - allowed:    vùng an toàn (inclusion) → cảnh báo khi đối tượng RA khỏi vùng
 *  - restricted: vùng cấm (exclusion)     → cảnh báo khi đối tượng VÀO vùng
 *  - warning:    vùng cảnh báo            → cảnh báo mức thấp khi VÀO vùng
 */
export type ZoneType = 'allowed' | 'restricted' | 'warning';

/**
 * Lịch áp dụng vùng — khớp ZoneScheduleDto của API.
 * null = áp dụng 24/7 (không giới hạn giờ).
 */
export interface ZoneSchedule {
  daysOfWeek: number[]; // 1=T2 … 7=CN
  startTime: string;    // 'HH:mm'
  endTime: string;      // 'HH:mm'
}

export interface Geofence {
  id: string;
  name: string;
  address: string;
  color: string;
  zoneType: ZoneType;
  schedule: ZoneSchedule | null;
  coordinates: [number, number][];
  active: boolean;
}

export interface EventLog {
  id: string;
  time: string;
  message: string;
  type: 'info' | 'warning' | 'success';
}

// ─── FORM TYPES ────────────────────────────────────────────────────────────────

export type DeviceFormState = {
  name: string;
  type: 'Person' | 'Vehicle' | 'Asset';
  deviceType: string;
  uniqueId: string;
  phoneNumber: string;
  color: string;
  subjectFullName: string;
  subjectIdNumber: string;
  subjectCrime: string;
  subjectSentence: string;
  subjectStartDate: string;
  subjectReleaseDate: string;
  subjectNotes: string;
};

export type GfFormState = {
  name: string;
  address: string;
  color: string;
  zoneType: ZoneType;
  schedule: ZoneSchedule | null;
  coordinates?: [number, number][];
};

// ─── HISTORY ──────────────────────────────────────────────────────────────────

export interface DeviceHistoryState {
  loading: boolean;
  error: string | null;
  data: PaginatedData<GpsTrackingPoint> | null;
}

export interface HistoryFilters {
  from: string;
  to: string;
  limit: number;
}

// ─── CRITICAL ALERTS ──────────────────────────────────────────────────────────

export type CriticalAlertType = 'sos' | 'fiber_cut';

export interface CriticalAlert {
  /** Unique per incident — includes IMEI + timestamp to avoid duplicates */
  id: string;
  type: CriticalAlertType;
  /** device.uniqueId / ApiDevice.device_imei */
  imei: string;
  /** GPS coordinates at the moment the alert fired */
  coords: [number, number];
  timestamp: Date;
  /** id bản ghi alert_management (nếu khớp được) — dùng để acknowledge/close trên server */
  alertId?: string;
}

// ─── THEME PROPS (shared by sub-components) ───────────────────────────────────

export interface ThemeProps {
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}
