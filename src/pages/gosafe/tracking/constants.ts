import type { Device, Geofence, DeviceFormState, GfFormState, HistoryFilters, ZoneType, ZoneSchedule } from './types';

// Lịch mặc định khi người dùng bật giới hạn giờ: giờ hành chính T2–T6.
export const DEFAULT_ZONE_SCHEDULE: ZoneSchedule = {
  daysOfWeek: [1, 2, 3, 4, 5],
  startTime: '08:00',
  endTime: '17:00'
};

export const WEEKDAY_LABELS: Record<number, string> = {
  1: 'T2',
  2: 'T3',
  3: 'T4',
  4: 'T5',
  5: 'T6',
  6: 'T7',
  7: 'CN'
};

// ─── ZONE PRESETS (khớp zoneType/category của API zone_management) ───────────────

export interface ZonePreset {
  zoneType: ZoneType;
  /** category gửi lên API */
  category: string;
  /** Tên hiển thị ngắn cho preset */
  label: string;
  /** Mô tả quy tắc cảnh báo */
  description: string;
  /** Màu mặc định của preset */
  color: string;
  /** Cảnh báo khi RA (exit) hay VÀO (enter) vùng */
  alert: 'exit' | 'enter';
}

export const ZONE_PRESETS: ZonePreset[] = [
  {
    zoneType: 'allowed',
    category: 'ALLOWED',
    label: 'Vùng an toàn',
    description: 'Đối tượng phải ở trong vùng. Cảnh báo khi RA khỏi vùng.',
    color: '#22c55e',
    alert: 'exit'
  },
  {
    zoneType: 'restricted',
    category: 'FORBIDDEN',
    label: 'Vùng cấm',
    description: 'Đối tượng không được vào. Cảnh báo khi VÀO vùng.',
    color: '#ef4444',
    alert: 'enter'
  },
  {
    zoneType: 'warning',
    category: 'WARNING',
    label: 'Vùng cảnh báo',
    description: 'Khu vực nhạy cảm. Cảnh báo mức thấp khi VÀO vùng.',
    color: '#f59e0b',
    alert: 'enter'
  }
];

export const ZONE_PRESET_MAP = Object.fromEntries(
  ZONE_PRESETS.map((p) => [p.zoneType, p])
) as Record<ZoneType, ZonePreset>;

// ─── MAP ──────────────────────────────────────────────────────────────────────

export const DEVICE_PALETTE = [
  '#2772ed',
  '#22c55e',
  '#f59e0b',
  '#a855f7',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
  '#ef4444'
];

/** 614 Điện Biên Phủ, Phường Vườn Lài, Quận Phú Nhuận, TP.HCM */
export const BASE_CENTER: [number, number] = [10.770685, 106.676672];

export const INITIAL_GEOFENCES: Geofence[] = [
  {
    id: 'dbp-614',
    name: 'Khu vực 614 ĐBP',
    address: '614 Điện Biên Phủ, Phường Vườn Lài, Q.Phú Nhuận, TP.HCM',
    color: '#22c55e',
    zoneType: 'allowed',
    schedule: null,
    coordinates: [
      [10.771685, 106.675672],
      [10.771685, 106.677672],
      [10.769685, 106.677672],
      [10.769685, 106.675672]
    ],
    active: true
  },
  {
    id: 'zone-b',
    name: 'Khu vực lân cận',
    address: 'Phường Vườn Lài, Q.Phú Nhuận, TP.HCM',
    color: '#f59e0b',
    zoneType: 'warning',
    schedule: null,
    coordinates: [
      [10.772185, 106.678172],
      [10.772185, 106.679172],
      [10.771185, 106.679172],
      [10.771185, 106.678172]
    ],
    active: false
  }
];

/**
 * Không seed thiết bị mock — danh sách rỗng cho đến khi snapshot từ API trả về.
 * Tránh hiển thị thiết bị/telemetry giả khi mới vào.
 */
export const INITIAL_DEVICES: Device[] = [];

// ─── EMPTY FORMS ──────────────────────────────────────────────────────────────

export const EMPTY_DEVICE_FORM: DeviceFormState = {
  name: '',
  type: 'Person',
  deviceType: 'Gosafe G737P',
  uniqueId: '',
  phoneNumber: '',
  color: DEVICE_PALETTE[2],
  assignedGeofenceId: null,
  regionId: null,
  subjectFullName: '',
  subjectIdNumber: '',
  subjectCrime: '',
  subjectSentence: '',
  subjectStartDate: '',
  subjectReleaseDate: '',
  subjectNotes: ''
};

export const EMPTY_GF_FORM: GfFormState = {
  name: '',
  address: '',
  color: ZONE_PRESET_MAP.restricted.color,
  zoneType: 'restricted',
  schedule: null,
  coordinates: []
};

export const DEFAULT_HISTORY_FILTERS: HistoryFilters = {
  from: new Date(Date.now() - 7 * 86400_000).toISOString().slice(0, 10),
  to: new Date().toISOString().slice(0, 10),
  limit: 50
};
