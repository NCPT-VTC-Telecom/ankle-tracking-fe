import type { Device, Geofence, DeviceFormState, GfFormState, HistoryFilters } from './types';

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
    color: '#3b82f6',
    coordinates: [
      [10.772185, 106.678172],
      [10.772185, 106.679172],
      [10.771185, 106.679172],
      [10.771185, 106.678172]
    ],
    active: false
  }
];

export const INITIAL_DEVICES: Device[] = [
  {
    id: 'dev-001',
    name: 'VTC-G001',
    type: 'Person',
    deviceType: 'Gosafe G737P',
    uniqueId: '869487063154339',
    phoneNumber: '+84900000001',
    color: DEVICE_PALETTE[0],
    // Tên phạm nhân lấy từ offender_management API (gán trong useTracking),
    // không hardcode để tránh hiển thị sai so với dữ liệu thật.
    subject: null,
    status: {
      battery: 88,
      batteryVoltage: null,
      externalVoltage: 3.86,
      signalStrength: 3,
      connectionStatus: 'online',
      lastGpsUpdate: new Date(),
      lastServerSync: new Date(),
      gpsAccuracy: 5,
      gpsFix: false,
      satelliteCount: 3,
      speed: 0,
      altitude: 23,
      eventId: 0,
      eventName: 'Normal',
      deviceModel: 'G737-4G',
      firmwareVersion: 'V1.18d0609'
    },
    coords: [10.770685, 106.676672],
    angle: 0,
    pathHistory: [],
    assignedGeofenceId: 'dbp-614'
  }
];

// ─── EMPTY FORMS ──────────────────────────────────────────────────────────────

export const EMPTY_DEVICE_FORM: DeviceFormState = {
  name: '',
  type: 'Person',
  deviceType: 'Gosafe G737P',
  uniqueId: '',
  phoneNumber: '',
  color: DEVICE_PALETTE[2],
  subjectFullName: '',
  subjectIdNumber: '',
  subjectCrime: '',
  subjectSentence: '',
  subjectStartDate: '',
  subjectReleaseDate: '',
  subjectNotes: ''
};

export const EMPTY_GF_FORM: GfFormState = { name: '', address: '', color: '#3b82f6' };

export const DEFAULT_HISTORY_FILTERS: HistoryFilters = {
  from: new Date(Date.now() - 7 * 86400_000).toISOString().slice(0, 10),
  to: new Date().toISOString().slice(0, 10),
  limit: 50
};
