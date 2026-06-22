import { AxiosPromise } from 'axios';
import axiosGosafe from 'utils/axiosGosafe';
import type { Geofence, SubjectInfo } from 'pages/gosafe/tracking/types';

export interface GosafePaginated<T> {
  code: number;
  message?: string;
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface GosafeSingle<T> {
  code: number;
  message?: string;
  data: T;
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  filters?: string;
  status?: string;
  [k: string]: unknown;
}

// ─── ZONES (Geofences) ──────────────────────────────────────────────────────

export const zonesApi = {
  list: (params?: ListParams): AxiosPromise<GosafePaginated<any>> =>
    axiosGosafe({ url: '/v1/zone_management/list', method: 'GET', params }),
  detail: (id: string): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/zone_management/detail', method: 'GET', params: { id } }),
  create: (body: any): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/zone_management/create', method: 'POST', data: body }),
  update: (id: string, body: any): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/zone_management/update', method: 'POST', params: { id }, data: body }),
  delete: (id: string): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/zone_management/delete', method: 'POST', params: { id } }),
  /** Gán vùng cho phạm nhân (offender_zones) */
  assign: (body: {
    zoneId: string;
    offenderId: string;
    isActive?: boolean;
  }): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/zone_management/assign', method: 'POST', data: body })
};

// ─── DEVICES ────────────────────────────────────────────────────────────────

export const devicesApi = {
  list: (params?: ListParams): AxiosPromise<GosafePaginated<any>> =>
    axiosGosafe({ url: '/v1/device_management/list', method: 'GET', params }),
  detail: (id: string): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/device_management/detail', method: 'GET', params: { id } }),
  create: (body: any): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/device_management/create', method: 'POST', data: body }),
  update: (id: string, body: any): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({
      url: '/v1/device_management/update',
      method: 'POST',
      params: { id },
      data: body
    }),
  changeStatus: (body: { deviceId: string; status: string }): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/device_management/change_status', method: 'POST', data: body }),
  delete: (id: string): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/device_management/delete', method: 'POST', params: { id } })
};

// ─── OFFENDERS (Phạm nhân) ───────────────────────────────────────────────────

export const offendersApi = {
  list: (params?: ListParams): AxiosPromise<GosafePaginated<any>> =>
    axiosGosafe({ url: '/v1/offender_management/list', method: 'GET', params }),
  detail: (id: string): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/offender_management/detail', method: 'GET', params: { id } }),
  create: (body: any): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/offender_management/create', method: 'POST', data: body }),
  update: (id: string, body: any): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({
      url: '/v1/offender_management/update',
      method: 'POST',
      params: { id },
      data: body
    }),
  delete: (id: string): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/offender_management/delete', method: 'POST', params: { id } }),
  assignOfficer: (body: {
    offenderId: string;
    officerId: string;
  }): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/offender_management/assign_officer', method: 'POST', data: body }),
  assignDevice: (body: {
    offenderId: string;
    deviceId: string | null;
  }): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/offender_management/assign_device', method: 'POST', data: body })
};

// ─── ALERTS ─────────────────────────────────────────────────────────────────

export const alertsApi = {
  list: (params?: ListParams): AxiosPromise<GosafePaginated<any>> =>
    axiosGosafe({ url: '/v1/alert_management/list', method: 'GET', params }),
  detail: (id: string): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/alert_management/detail', method: 'GET', params: { id } }),
  acknowledge: (body: { alertId: string; notes?: string }): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/alert_management/acknowledge', method: 'POST', data: body }),
  close: (body: { alertId: string; notes?: string }): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/alert_management/close', method: 'POST', data: body })
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export const notificationsApi = {
  list: (params?: ListParams): AxiosPromise<GosafePaginated<any>> =>
    axiosGosafe({ url: '/v1/notifications', method: 'GET', params }),
  markRead: (notificationId: string): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: `/v1/notifications/${notificationId}`, method: 'POST', data: { isRead: true } }),
  /** Đăng ký FCM token để nhận push notification (POST /v1/notifications/register_device) */
  registerDevice: (fcmToken: string): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/notifications/register_device', method: 'POST', data: { fcmToken } })
};

// ─── ALERT TYPES ───────────────────────────────────────────────────────────────

export const alertTypesApi = {
  list: (params?: ListParams): AxiosPromise<GosafePaginated<any>> =>
    axiosGosafe({ url: '/v1/alert_type_management/list', method: 'GET', params }),
  detail: (id: string | number): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/alert_type_management/detail', method: 'GET', params: { id } }),
  create: (body: any): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/alert_type_management/create', method: 'POST', data: body }),
  update: (id: string | number, body: any): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({
      url: '/v1/alert_type_management/update',
      method: 'POST',
      params: { id },
      data: body
    })
};

// ─── USERS ───────────────────────────────────────────────────────────────────

export const usersApi = {
  list: (params?: ListParams): AxiosPromise<GosafePaginated<any>> =>
    axiosGosafe({ url: '/v1/user_management/list', method: 'GET', params }),
  officers: (): AxiosPromise<GosafePaginated<any>> =>
    axiosGosafe({ url: '/v1/user_management/officers', method: 'GET' }),
  create: (body: any): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/user_management/create', method: 'POST', data: body }),
  update: (id: string, body: any): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({
      url: '/v1/user_management/update',
      method: 'POST',
      params: { id },
      data: body
    }),
  delete: (id: string): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/user_management/delete', method: 'POST', params: { id } }),
  lock: (id: string): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/user_management/lock', method: 'POST', params: { id } }),
  unlock: (id: string): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/user_management/unlock', method: 'POST', params: { id } }),
  resetPassword: (body: { userId: string; newPassword: string }): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/user_management/reset_password', method: 'POST', data: body }),
  assignRoles: (body: {
    userId: string;
    roleIds: (string | number)[];
  }): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/user_management/assign_roles', method: 'POST', data: body }),
  assignRegions: (body: {
    userId: string;
    regionIds: (string | number)[];
  }): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/user_management/assign_regions', method: 'POST', data: body })
};

// ─── ROLES & PERMISSIONS ──────────────────────────────────────────────────────

export const rolesApi = {
  list: (params?: ListParams): AxiosPromise<GosafePaginated<any>> =>
    axiosGosafe({ url: '/v1/role_management/list', method: 'GET', params }),
  detail: (id: string | number): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/role_management/detail', method: 'GET', params: { id } }),
  create: (body: {
    name: string;
    description?: string;
    permissionIds?: (string | number)[];
  }): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/role_management/create', method: 'POST', data: body }),
  update: (
    id: string | number,
    body: { name?: string; description?: string }
  ): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/role_management/update', method: 'POST', params: { id }, data: body }),
  setPermissions: (body: {
    roleId: string | number;
    permissionIds: (string | number)[];
  }): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/role_management/set_permissions', method: 'POST', data: body }),
  delete: (id: string | number): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/role_management/delete', method: 'POST', params: { id } })
};

export const permissionsApi = {
  list: (): AxiosPromise<GosafeSingle<{ flat: any[]; grouped: Record<string, any[]> }>> =>
    axiosGosafe({ url: '/v1/permission_management/list', method: 'GET' })
};

// ─── REGIONS (Địa bàn) ─────────────────────────────────────────────────────────

export const regionsApi = {
  list: (params?: ListParams): AxiosPromise<GosafePaginated<any>> =>
    axiosGosafe({ url: '/v1/region_management/list', method: 'GET', params }),
  tree: (rootId?: string | number): AxiosPromise<GosafeSingle<any[]>> =>
    axiosGosafe({
      url: '/v1/region_management/tree',
      method: 'GET',
      params: rootId != null ? { rootId } : undefined
    }),
  create: (body: {
    name: string;
    code: string;
    path?: string;
    level?: number;
    parentId?: string | number;
  }): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/region_management/create', method: 'POST', data: body }),
  update: (id: string | number, body: any): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({
      url: '/v1/region_management/update',
      method: 'POST',
      params: { id },
      data: body
    }),
  delete: (id: string | number): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/region_management/delete', method: 'POST', params: { id } })
};

// ─── COMPLIANCE RULES (Lịch trình bắt buộc) ──────────────────────────────────

export const complianceApi = {
  list: (params?: ListParams): AxiosPromise<GosafePaginated<any>> =>
    axiosGosafe({ url: '/v1/compliance_management/list', method: 'GET', params }),
  detail: (id: string): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/compliance_management/detail', method: 'GET', params: { id } }),
  create: (body: any): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/compliance_management/create', method: 'POST', data: body }),
  update: (id: string, body: any): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({
      url: '/v1/compliance_management/update',
      method: 'POST',
      params: { id },
      data: body
    }),
  delete: (id: string): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/compliance_management/delete', method: 'POST', params: { id } })
};

// ─── MAP HELPERS ──────────────────────────────────────────────────────────────

/** Xấp xỉ hình tròn → polygon n đỉnh quanh tâm (lat,lng) bán kính mét. */
export function circleToPolygon(
  lat: number,
  lng: number,
  radiusMeters: number,
  n = 24
): [number, number][] {
  const pts: [number, number][] = [];
  const dLat = radiusMeters / 111320; // mét → độ vĩ
  const dLng = radiusMeters / (111320 * Math.cos((lat * Math.PI) / 180));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 2 * Math.PI;
    pts.push([lat + dLat * Math.sin(a), lng + dLng * Math.cos(a)]);
  }
  return pts;
}

const ZONE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#06b6d4', '#ec4899'];

/** API zone → Geofence domain. Hỗ trợ cả polygon (coordinates[]) và circle. */
export function mapApiZoneToGeofence(z: any, idx = 0): Geofence {
  let coordinates: [number, number][] = [];

  const rawCoords = z.coordinates ?? z.polygon ?? z.points;
  if (Array.isArray(rawCoords) && rawCoords.length >= 3) {
    coordinates = rawCoords.map((c: any): [number, number] => {
      if (Array.isArray(c)) return [Number(c[0]), Number(c[1])];
      return [Number(c.lat ?? c.latitude), Number(c.lng ?? c.longitude)];
    });
  } else if (z.latitude != null && z.longitude != null && z.radius != null) {
    coordinates = circleToPolygon(Number(z.latitude), Number(z.longitude), Number(z.radius));
  }

  return {
    id: String(z.id ?? z.zoneId ?? `zone-${idx}`),
    name: z.name ?? z.zoneName ?? `Vùng ${idx + 1}`,
    address: z.address ?? z.description ?? '',
    color: z.color ?? ZONE_COLORS[idx % ZONE_COLORS.length],
    coordinates,
    active: z.isActive ?? z.active ?? true
  };
}

/**
 * Geofence domain → body create/update zone (polygon).
 * Khớp CreateZoneDto/UpdateZoneDto: zoneType chữ thường (allowed|restricted|warning),
 * mô tả dùng `description`, toạ độ dạng ZoneCoordinateDto {latitude, longitude}.
 */
export function geofenceToApiBody(gf: Partial<Geofence>): any {
  return {
    name: gf.name,
    description: gf.address ?? '',
    color: gf.color,
    zoneType: 'restricted',
    category: 'FORBIDDEN',
    fenceType: 'polygon',
    coordinates: (gf.coordinates ?? []).map(([lat, lng]) => ({ latitude: lat, longitude: lng })),
    isActive: gf.active ?? true
  };
}

/**
 * API offender → SubjectInfo domain (dùng cho Device.subject).
 * Map theo schema offender_management thật (xem api-docs):
 *  - tên: `fullname`, CCCD: `citizenId`/`citizenIdMasked`
 *  - tội danh + bản án nằm ở offense hiện hành (`offense`/`currentOffense`/`offenses[].isCurrent`)
 *    với `crime`, `sentenceType`, `sentenceTerm`
 *  - thời hạn án: `sentenceStartDate`/`sentenceEndDate`
 */
export function mapApiOffenderToSubject(o: any): SubjectInfo {
  // Tìm bản án hiện hành: ưu tiên object lồng, rồi mảng offenses, cuối cùng field phẳng.
  const offense =
    o.offense ??
    o.currentOffense ??
    (Array.isArray(o.offenses) ? o.offenses.find((x: any) => x?.isCurrent) ?? o.offenses[0] : undefined) ??
    o;

  const crime = offense?.crime ?? o.crime ?? o.subjectType ?? '';
  const sentence =
    [offense?.sentenceType ?? o.sentenceType, offense?.sentenceTerm ?? o.sentenceTerm]
      .filter(Boolean)
      .join(' · ') || (o.sentence ?? '');

  return {
    fullName: o.fullname ?? o.fullName ?? o.displayName ?? o.name ?? '',
    idNumber: o.citizenId ?? o.citizenIdMasked ?? o.idNumber ?? o.cccd ?? '',
    crime,
    sentence,
    startDate: o.sentenceStartDate ?? o.startDate ?? o.start_date ?? '',
    releaseDate: o.sentenceEndDate ?? o.releaseDate ?? o.release_date ?? '',
    notes: o.notes ?? o.note ?? o.address ?? o.hometown ?? ''
  };
}

/**
 * Trích các khoá có thể dùng để gán offender ↔ thiết bị (đã chuẩn hoá lowercase, bỏ rỗng).
 * BE có thể nối qua IMEI hoặc deviceId (UUID), nên gom hết các biến thể field có thể có.
 */
export function offenderDeviceKeys(o: any): string[] {
  const dev = o?.device ?? {};
  const raw = [
    o?.imei, o?.deviceImei, o?.device_imei,
    dev?.imei, dev?.deviceImei, dev?.device_imei,
    o?.deviceId, o?.device_id, dev?.id
  ];
  return Array.from(
    new Set(
      raw
        .filter((v) => v != null && v !== '')
        .map((v) => String(v).trim().toLowerCase())
    )
  );
}

/** Đọc mảng data an toàn từ response GoSafe (data | data.items). */
export function extractList(raw: any): any[] {
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.data?.items)) return raw.data.items;
  if (Array.isArray(raw)) return raw;
  return [];
}
