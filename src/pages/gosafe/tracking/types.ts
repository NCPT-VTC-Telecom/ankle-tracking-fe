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
  battery: number;
  signalStrength: number;       // 0–4 GSM bars
  connectionStatus: 'online' | 'offline' | 'unstable';
  lastGpsUpdate: Date | null;
  lastServerSync: Date | null;
  gpsAccuracy: number;          // metres
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
  isSimulating: boolean;
  simIndex: number;
  assignedGeofenceId: string | null;
}

export interface Geofence {
  id: string;
  name: string;
  address: string;
  color: string;
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

export type GfFormState = { name: string; address: string; color: string };

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

// ─── THEME PROPS (shared by sub-components) ───────────────────────────────────

export interface ThemeProps {
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}
