import * as Crypto from 'crypto-js';
import { UserProfile } from 'shared/types/auth';

/**
 * Helper xử lý phiên đăng nhập GoSafe (tách khỏi JWTContext để gọn file chính).
 * - Ghi permission mã hoá để các hook quyền không lỗi.
 * - Map user API → UserProfile + suy ra vai trò/superadmin/phạm vi địa bàn.
 */

const GOSAFE_ACCESS = ['admin-management', 'dashboard', 'clients-management'];

/** Ghi accessPermission/dataPermission mã hoá vào sessionStorage. */
export function writeGosafePermissions() {
  const keyAccess = { level2: GOSAFE_ACCESS, level3: GOSAFE_ACCESS };
  const permissions = {
    level2: GOSAFE_ACCESS.map((access) => ({ access })),
    level3: GOSAFE_ACCESS.map((access) => ({ access }))
  };
  const secret = import.meta.env.VITE_APP_SECRET_KEY as string;
  sessionStorage.setItem('accessPermission', Crypto.AES.encrypt(JSON.stringify(keyAccess), secret).toString());
  sessionStorage.setItem('dataPermission', Crypto.AES.encrypt(JSON.stringify(permissions), secret).toString());
}

/** Trích danh sách tên vai trò từ user API (nhiều dạng field khả dĩ). */
export function extractRoleNames(apiUser: any): string[] {
  const out: string[] = [];
  if (apiUser?.role) out.push(apiUser.role);
  if (apiUser?.roleName) out.push(apiUser.roleName);
  (apiUser?.roles ?? apiUser?.user_roles ?? []).forEach((r: any) => out.push(r?.name ?? r?.roleName ?? r?.code ?? r));
  if (apiUser?.user_group?.name) out.push(apiUser.user_group.name);
  return out.filter(Boolean).map(String);
}

/** Trích mã quyền (code/resource) từ user API. */
export function extractPermissionCodes(apiUser: any): string[] {
  const out: string[] = [];
  (apiUser?.permissions ?? apiUser?.user_permissions ?? []).forEach((p: any) => out.push(p?.code ?? p?.resource ?? p?.name ?? p));
  // permissions có thể lồng trong roles
  (apiUser?.roles ?? apiUser?.user_roles ?? []).forEach((r: any) =>
    (r?.permissions ?? []).forEach((p: any) => out.push(p?.code ?? p?.resource ?? p?.name ?? p))
  );
  return out.filter(Boolean).map(String);
}

/**
 * Superadmin = có quyền quản trị hệ thống (user/role/region/provider/device/sim) hoặc
 * tên vai trò chứa "SUPER". Admin (cán bộ địa bàn) chỉ quản lý đối tượng trong phạm vi.
 */
export function computeIsSuperAdmin(apiUser: any): boolean {
  if (apiUser?.isSuperAdmin === true) return true;
  const roles = extractRoleNames(apiUser).map((n) => n.toUpperCase());
  if (roles.some((n) => n.includes('SUPER'))) return true;
  const perms = extractPermissionCodes(apiUser).map((p) => p.toLowerCase());
  return perms.some((p) =>
    /user_management|role_management|permission_management|region_management|provider_management|device_management|sim_management/.test(p)
  );
}

/** Map user trả về từ GoSafe API → UserProfile (điền default an toàn cho field thiếu). */
export function mapGosafeUser(apiUser: any, username: string): UserProfile {
  const id = apiUser?.id ?? apiUser?.userId ?? 'gosafe-user-id';
  const roleNames = extractRoleNames(apiUser);
  const regionIds = (apiUser?.regionAccess ?? apiUser?.regions ?? apiUser?.region_access ?? apiUser?.regionIds ?? [])
    .map((r: any) => String(r?.regionId ?? r?.region_id ?? r?.id ?? r))
    .filter(Boolean);
  if (apiUser?.primaryRegionId && !regionIds.includes(String(apiUser.primaryRegionId))) {
    regionIds.unshift(String(apiUser.primaryRegionId));
  }
  const u: any = {
    id,
    email: apiUser?.email ?? '',
    name: apiUser?.name ?? apiUser?.fullname ?? apiUser?.fullName ?? username,
    fullname: apiUser?.fullname ?? apiUser?.fullName ?? apiUser?.name ?? username,
    username: apiUser?.username ?? username,
    phoneNumber: apiUser?.phoneNumber ?? apiUser?.phone ?? '',
    role: roleNames[0] ?? apiUser?.user_group?.name,
    currentSites: 'gosafe-site',
    currentRegion: 'gosafe-region',
    currentAds: [],
    sites: [{ site_id: 'gosafe-site', user_id: id, name: 'GoSafe' }],
    regions: [{ id: 1, region_id: 'gosafe-region', user_id: id }],
    user_group: { id: 1, name: roleNames[0] ?? 'Admin' },
    user_group_lv2: [{ group_id_lv2: 1, user_id: id }],
    user_group_lv3: [{ group_id_lv3: 1, user_id: id }],
    // ── GoSafe role context (dùng cho phân quyền menu) ──
    gosafeRoles: roleNames,
    gosafePermissions: extractPermissionCodes(apiUser),
    gosafeRegionIds: regionIds,
    gosafeIsSuperAdmin: computeIsSuperAdmin(apiUser)
  };
  return u as UserProfile;
}
