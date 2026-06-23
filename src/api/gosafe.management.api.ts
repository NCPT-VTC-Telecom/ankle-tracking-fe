import { AxiosPromise } from 'axios';
import axiosGosafe from 'utils/axiosGosafe';
import type { Geofence, SubjectInfo, ZoneType, ZoneSchedule, Device } from 'pages/gosafe/tracking/types';
import { ZONE_PRESET_MAP } from 'pages/gosafe/tracking/constants';
import { num, voltageToPercent, placeholderStatus } from 'pages/gosafe/tracking/utils';

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
  /** Vùng giao với khung nhìn bản đồ (bounding box). Cap 500 + cờ meta.truncated. */
  map: (bbox: {
    swLat: number;
    swLng: number;
    neLat: number;
    neLng: number;
    offenderId?: string;
  }): AxiosPromise<GosafePaginated<any>> =>
    axiosGosafe({ url: '/v1/zone_management/map', method: 'GET', params: bbox }),
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
  /** Thiết bị trong khung nhìn bản đồ (bounding box) — đồng nhất với zonesApi.map. */
  map: (bbox: {
    swLat: number;
    swLng: number;
    neLat: number;
    neLng: number;
    offenderId?: string;
  }): AxiosPromise<GosafePaginated<any>> =>
    axiosGosafe({ url: '/v1/device_management/map', method: 'GET', params: bbox }),
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
    axiosGosafe({ url: '/v1/offender_management/assign_device', method: 'POST', data: body }),

  // ── Cán bộ phụ trách ──
  /** Danh sách cán bộ được gán cho phạm nhân */
  officers: (offenderId: string): AxiosPromise<GosafePaginated<any>> =>
    axiosGosafe({ url: '/v1/offender_management/officers', method: 'GET', params: { id: offenderId } }),
  addOfficer: (body: {
    offenderId: string;
    officerId: string;
    assignmentRole?: 'PRIMARY' | 'SECONDARY' | 'SUPPORT';
    isPrimary?: boolean;
  }): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/offender_management/add_officer', method: 'POST', data: body }),
  setPrimaryOfficer: (body: { offenderId: string; officerId: string }): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/offender_management/set_primary_officer', method: 'POST', data: body }),
  removeOfficer: (body: { offenderId: string; officerId: string }): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/offender_management/remove_officer', method: 'POST', data: body }),

  // ── Bản án (offenses) ──
  /** Danh sách bản án của phạm nhân (bản án hiệu lực xếp trước) */
  offenses: (offenderId: string): AxiosPromise<GosafePaginated<any>> =>
    axiosGosafe({ url: '/v1/offender_management/offenses', method: 'GET', params: { id: offenderId } }),
  addOffense: (body: OffenseBody & { offenderId: string }): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/offender_management/add_offense', method: 'POST', data: body }),
  updateOffense: (body: OffenseBody & { offenseId: string }): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/offender_management/update_offense', method: 'POST', data: body }),
  setCurrentOffense: (offenseId: string): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/offender_management/set_current_offense', method: 'POST', data: { offenseId } }),
  deleteOffense: (offenseId: string): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/offender_management/delete_offense', method: 'POST', data: { offenseId } }),

  // ── Tài khoản ứng dụng cho phạm nhân ──
  createAccount: (body: {
    offenderId: string;
    usernameType?: 'CITIZEN_ID' | 'PHONE';
    phoneNumber?: string;
  }): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/offender_management/create_account', method: 'POST', data: body })
};

/** Trường bản án dùng chung cho add/update offense. */
export interface OffenseBody {
  crime?: string;
  lawArticle?: string;
  sentenceType?: string;
  sentenceTerm?: string;
  probationMonths?: number;
  courtName?: string;
  judgmentNumber?: string;
  judgmentDate?: string;
  isCurrent?: boolean;
}

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

/** Body POST /v1/notifications/send (SendNotificationDto). title & body bắt buộc. */
export interface SendNotificationBody {
  title: string;
  body: string;
  /** UUID người nhận; bỏ trống → gửi theo role */
  userIds?: string[];
  /** Role ID người nhận (nếu không truyền userIds) */
  roleIds?: number[];
  /** Dữ liệu bổ sung key-value (vd: offenderId, alertId) */
  data?: Record<string, unknown>;
}

export const notificationsApi = {
  list: (params?: ListParams): AxiosPromise<GosafePaginated<any>> =>
    axiosGosafe({ url: '/v1/notifications', method: 'GET', params }),
  /** Admin soạn & gửi thông báo CHỦ ĐỘNG (push FCM + lưu DB). type mặc định = system. */
  send: (body: SendNotificationBody): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/notifications/send', method: 'POST', data: body }),
  /** Cập nhật 1 thông báo (UpdateUserNotificationDto): đánh dấu đã đọc / xoá. */
  update: (
    notificationId: string,
    patch: { isRead?: boolean; isDeleted?: boolean }
  ): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: `/v1/notifications/${notificationId}`, method: 'POST', data: patch }),
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
  /** Người dùng tự đổi mật khẩu (cần mật khẩu cũ). */
  changePassword: (
    id: string,
    body: { oldPassword: string; newPassword: string }
  ): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/user_management/change_password', method: 'POST', params: { id }, data: body }),
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
  /**
   * Tạo địa bàn. BE bắt buộc: name, code, description, path, level (đã xác minh bằng test
   * thật — không phải optional như api-docs cắt). parentId null cho địa bàn gốc.
   * path = materialized path (vd "vn", "vn.79"); level: gốc = 1.
   */
  create: (body: {
    name: string;
    code: string;
    description: string;
    path: string;
    level: number;
    parentId?: string | null;
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

// ─── CHECK-IN (Điểm danh) ──────────────────────────────────────────────────────

export const checkinApi = {
  // ── Phía quản lý (cán bộ/superadmin) ──
  /** Danh sách lượt điểm danh */
  list: (params?: ListParams): AxiosPromise<GosafePaginated<any>> =>
    axiosGosafe({ url: '/v1/checkin_management/list', method: 'GET', params }),
  detail: (id: string): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/checkin_management/detail', method: 'GET', params: { id } }),
  /** Các lần điểm danh phát sinh theo lịch (occurrences) */
  occurrences: (params?: ListParams): AxiosPromise<GosafePaginated<any>> =>
    axiosGosafe({ url: '/v1/checkin_management/occurrences', method: 'GET', params }),
  /** Xác minh (duyệt/từ chối) một lượt điểm danh */
  verify: (body: { id: string; approve: boolean; rejectionReason?: string }): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/checkin_management/verify', method: 'POST', data: body }),

  // ── Phía đối tượng (self check-in) ──
  /** Tạo lượt điểm danh (kèm ảnh + toạ độ) */
  selfCreate: (body: { ruleId: string; locationLat: number; locationLng: number; imageProof?: string }): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/checkin_self/create', method: 'POST', data: body }),
  selfToday: (): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/checkin_self/today', method: 'GET' }),
  selfUpcoming: (): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/checkin_self/upcoming', method: 'GET' }),
  selfHistory: (params?: ListParams): AxiosPromise<GosafePaginated<any>> =>
    axiosGosafe({ url: '/v1/checkin_self/history', method: 'GET', params }),
  selfUpload: (data: FormData): AxiosPromise<GosafeSingle<any>> =>
    axiosGosafe({ url: '/v1/checkin_self/upload', method: 'POST', data })
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

  const zoneType = normalizeZoneType(z.zoneType ?? z.category);

  return {
    id: String(z.id ?? z.zoneId ?? `zone-${idx}`),
    name: z.name ?? z.zoneName ?? `Vùng ${idx + 1}`,
    address: z.address ?? z.description ?? '',
    color: z.color ?? ZONE_PRESET_MAP[zoneType].color ?? ZONE_COLORS[idx % ZONE_COLORS.length],
    zoneType,
    schedule: normalizeSchedule(z.schedule),
    coordinates,
    active: z.isActive ?? z.active ?? true
  };
}

/** Chuẩn hoá ZoneScheduleDto từ API → ZoneSchedule (null nếu thiếu/không hợp lệ). */
function normalizeSchedule(raw: any): ZoneSchedule | null {
  if (!raw || !Array.isArray(raw.daysOfWeek) || !raw.startTime || !raw.endTime) return null;
  return {
    daysOfWeek: raw.daysOfWeek.map((d: any) => Number(d)).filter((d: number) => d >= 1 && d <= 7),
    startTime: String(raw.startTime),
    endTime: String(raw.endTime)
  };
}

/** Chuẩn hoá zoneType/category bất kỳ (hoa/thường, FORBIDDEN…) về ZoneType hợp lệ. */
function normalizeZoneType(raw: unknown): ZoneType {
  const v = String(raw ?? '').toLowerCase();
  if (v === 'allowed' || v === 'safe') return 'allowed';
  if (v === 'warning' || v === 'warn') return 'warning';
  return 'restricted';
}

/**
 * Geofence domain → body create/update zone (polygon).
 * Khớp CreateZoneDto/UpdateZoneDto: zoneType chữ thường (allowed|restricted|warning),
 * mô tả dùng `description`, toạ độ dạng ZoneCoordinateDto {latitude, longitude}.
 */
export function geofenceToApiBody(gf: Partial<Geofence>): any {
  const zoneType = gf.zoneType ?? 'restricted';
  const preset = ZONE_PRESET_MAP[zoneType];
  const body: any = {
    name: gf.name,
    description: gf.address ?? '',
    color: gf.color,
    zoneType,
    category: preset.category,
    fenceType: 'polygon',
    coordinates: (gf.coordinates ?? []).map(([lat, lng]) => ({ latitude: lat, longitude: lng })),
    isActive: gf.active ?? true
  };
  // Chỉ gửi schedule khi có giới hạn giờ; null = áp dụng 24/7.
  if (gf.schedule) body.schedule = gf.schedule;
  return body;
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

/**
 * device_management item → Device domain (nguồn chính cho bảng Quản lý thiết bị).
 * Mỗi item kèm `gpsStatus` (telemetry mới nhất, null nếu chưa ping). Nếu có thiết bị
 * sống cùng IMEI từ feed GPS (`live`) → tái dùng telemetry sống (SSE) + id để thao tác
 * (định vị/sửa) khớp store; chỉ ghi đè field inventory. Field đọc phòng thủ vì schema
 * device_management không công bố đầy đủ trong api-docs.
 */
export function mapApiMgmtDeviceToDevice(raw: any, live: Device | undefined, fallbackColor: string): Device {
  const pick = (...keys: string[]) => {
    for (const k of keys) if (raw?.[k] != null && raw[k] !== '') return raw[k];
    return undefined;
  };
  const imei = String(pick('imei', 'deviceImei', 'device_imei') ?? '').trim() || (live?.uniqueId ?? '');
  const name = String(pick('name', 'deviceName', 'device_name') ?? '') || live?.name || imei || 'Thiết bị';
  const model = String(pick('model', 'deviceModel', 'device_model') ?? '') || live?.deviceType || '';
  const sim = String(pick('phoneNumber', 'phone', 'msisdn', 'sim', 'simNumber', 'sim_number') ?? '') || live?.phoneNumber || '';
  const fw = String(pick('firmwareVersion', 'firmware_version') ?? '') || live?.status.firmwareVersion || '';

  const offenderRaw = raw?.offender ?? raw?.assignedOffender ?? raw?.assigned_offender ?? null;
  const subject = live?.subject ?? (offenderRaw ? mapApiOffenderToSubject(offenderRaw) : null);

  // Có telemetry sống (SSE) → giữ nguyên, chỉ ghi đè field inventory + giữ id store.
  if (live) {
    return {
      ...live,
      name,
      deviceType: model || live.deviceType,
      uniqueId: imei || live.uniqueId,
      phoneNumber: sim,
      subject,
      status: {
        ...live.status,
        firmwareVersion: fw || live.status.firmwareVersion,
        deviceModel: model || live.status.deviceModel
      }
    };
  }

  // Không có live → đọc telemetry từ gpsStatus đính kèm (có thể null nếu chưa ping).
  const gps = raw?.gpsStatus ?? raw?.gps_status ?? raw?.latestTelemetry ?? {};
  const gp = (...keys: string[]) => {
    for (const k of keys) if (gps?.[k] != null && gps[k] !== '') return gps[k];
    return undefined;
  };
  const hasGps = gps && Object.keys(gps).length > 0;
  const lat = num(gp('latitude', 'lat'), 0);
  const lng = num(gp('longitude', 'lng', 'lon'), 0);
  const batV = gp('batteryVoltage', 'battery_voltage');
  const bpRaw = gp('batteryPercent', 'battery_percent');
  const battery = bpRaw != null
    ? Math.max(0, Math.min(100, Math.round(num(bpRaw))))
    : voltageToPercent(batV != null ? num(batV) : null, 0);
  const lastRep = gp('lastReportAt', 'last_report_at', 'lastSeen', 'last_seen', 'lastDeviceTime', 'last_device_time');
  const lastSeen = lastRep ? new Date(lastRep) : null;
  const minutesSince = lastSeen ? (Date.now() - lastSeen.getTime()) / 60000 : Infinity;

  const base = placeholderStatus(model);
  return {
    id: `mgmt-${pick('id', '_id', 'deviceId') ?? imei}`,
    name,
    type: 'Person',
    deviceType: model,
    uniqueId: imei,
    phoneNumber: sim,
    color: fallbackColor,
    subject,
    status: {
      ...base,
      battery: hasGps ? battery : 0,
      batteryVoltage: batV != null ? num(batV) : null,
      signalStrength: Math.min(4, Math.max(0, num(gp('gsmSignal', 'gsm_signal', 'signalStrength')) - 1)),
      connectionStatus:
        gp('isOnline') === true ? 'online'
          : minutesSince > 10 ? 'offline'
          : minutesSince > 2 ? 'unstable'
          : hasGps ? 'online' : 'offline',
      lastGpsUpdate: lastSeen,
      lastServerSync: lastSeen,
      satelliteCount: num(gp('satelliteCount', 'satellite_count', 'gpsSatellites')),
      speed: num(gp('speed')),
      altitude: num(gp('altitude')),
      gpsFix: Boolean(gp('gpsFixed', 'gps_fixed', 'gpsFix')) || (hasGps && (lat !== 0 || lng !== 0)),
      eventName: String(gp('eventName', 'event_name') ?? 'Normal'),
      firmwareVersion: fw,
      deviceModel: model
    },
    coords: [lat, lng],
    angle: 0,
    pathHistory: [],
    assignedGeofenceId: null
  };
}

/** Đọc mảng data an toàn từ response GoSafe (data | data.items). */
export function extractList(raw: any): any[] {
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.data?.items)) return raw.data.items;
  if (Array.isArray(raw)) return raw;
  return [];
}
