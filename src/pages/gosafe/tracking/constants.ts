import type { Device, Geofence, DeviceFormState, GfFormState, HistoryFilters } from './types';

// ─── MAP ──────────────────────────────────────────────────────────────────────

export const DEVICE_PALETTE = [
  '#2772ed', '#22c55e', '#f59e0b', '#a855f7',
  '#06b6d4', '#ec4899', '#84cc16', '#ef4444',
];

/** 614 Điện Biên Phủ, P.25, Q.Bình Thạnh, TP.HCM */
export const BASE_CENTER: [number, number] = [10.8016, 106.7100];

// ─── INITIAL DATA ─────────────────────────────────────────────────────────────

export const INITIAL_GEOFENCES: Geofence[] = [
  {
    id: 'dbp-614',
    name: 'Khu dân cư ĐBP',
    address: '614 Điện Biên Phủ, P.25, Q.Bình Thạnh, TP.HCM',
    color: '#22c55e',
    coordinates: [
      [10.8022, 106.7094], [10.8022, 106.7106],
      [10.8010, 106.7106], [10.8010, 106.7094],
    ],
    active: true,
  },
  {
    id: 'zone-b',
    name: 'Khu vực B',
    address: '620 Điện Biên Phủ, P.25, Q.Bình Thạnh, TP.HCM',
    color: '#3b82f6',
    coordinates: [
      [10.8026, 106.7108], [10.8026, 106.7118],
      [10.8018, 106.7118], [10.8018, 106.7108],
    ],
    active: false,
  },
];

export const INITIAL_DEVICES: Device[] = [
  {
    id: 'dev-001',
    name: 'VTC-G001',
    type: 'Person',
    deviceType: 'Gosafe G737P',
    uniqueId: '869487063154339',
    phoneNumber: '+84909679250',
    color: DEVICE_PALETTE[0],
    subject: {
      fullName: 'Nguyễn Văn Bình',
      idNumber: '079200123456',
      crime: 'Trộm cắp tài sản (Đ173 BLHS)',
      sentence: '36 tháng tù giam',
      startDate: '2024-03-15',
      releaseDate: '2027-03-14',
      notes: 'Đang chấp hành án tại địa phương. Tuân thủ tốt.',
    },
    status: {
      battery: 88, signalStrength: 3, connectionStatus: 'online',
      lastGpsUpdate: new Date(), lastServerSync: new Date(), gpsAccuracy: 5,
    },
    coords: [10.8016, 106.7100],
    angle: 0, pathHistory: [], isSimulating: false, simIndex: 0,
    assignedGeofenceId: 'dbp-614',
  },
  {
    id: 'dev-002',
    name: 'VTC-G002',
    type: 'Person',
    deviceType: 'Gosafe G737P',
    uniqueId: '869487063154340',
    phoneNumber: '+84909679251',
    color: DEVICE_PALETTE[1],
    subject: {
      fullName: 'Trần Minh Đức',
      idNumber: '079199876543',
      crime: 'Gây rối trật tự công cộng (Đ318 BLHS)',
      sentence: '18 tháng cải tạo không giam giữ',
      startDate: '2025-01-10',
      releaseDate: '2026-07-09',
      notes: 'Lần đầu vi phạm. Có công việc ổn định.',
    },
    status: {
      battery: 62, signalStrength: 4, connectionStatus: 'online',
      lastGpsUpdate: new Date(), lastServerSync: new Date(), gpsAccuracy: 4,
    },
    coords: [10.8018, 106.7098],
    angle: 0, pathHistory: [], isSimulating: false, simIndex: 0,
    assignedGeofenceId: 'dbp-614',
  },
];

// ─── EMPTY FORMS ──────────────────────────────────────────────────────────────

export const EMPTY_DEVICE_FORM: DeviceFormState = {
  name: '', type: 'Person', deviceType: 'Gosafe G737P',
  uniqueId: '', phoneNumber: '', color: DEVICE_PALETTE[2],
  subjectFullName: '', subjectIdNumber: '', subjectCrime: '',
  subjectSentence: '', subjectStartDate: '', subjectReleaseDate: '', subjectNotes: '',
};

export const EMPTY_GF_FORM: GfFormState = { name: '', address: '', color: '#3b82f6' };

export const DEFAULT_HISTORY_FILTERS: HistoryFilters = {
  from: new Date(Date.now() - 7 * 86400_000).toISOString().slice(0, 10),
  to: new Date().toISOString().slice(0, 10),
  limit: 50,
};
