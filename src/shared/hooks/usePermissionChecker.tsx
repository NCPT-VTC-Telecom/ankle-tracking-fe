import { UserGroupLv3 } from 'shared/contexts/JWTContext';
import { useCallback, useMemo } from 'react';
import { RoleData } from 'shared/types';
import CryptoJS from 'crypto-js';
import { RootState, useSelector } from 'shared/store';

interface PermissionResult {
  canView: boolean;
  canWrite: boolean;
  roleInfo?: RoleData;
}

export const usePermissionChecker = () => {
  const user = useSelector((state: RootState) => state.authSlice.user);

  const decryptPermissions = useCallback(() => {
    try {
      const dataPermission = sessionStorage.getItem('dataPermission');
      if (!dataPermission) return null;

      const decrypted = CryptoJS.AES.decrypt(dataPermission, import.meta.env.VITE_APP_SECRET_KEY as string);
      const originalMessage = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(originalMessage).level3 || [];
    } catch (error) {
      console.error('Error decrypting permissions:', error);
      return null;
    }
  }, []);

  const roles: RoleData[] = decryptPermissions();

  const userPermissions: UserGroupLv3[] = user?.user_group_lv3 || [];
  // Tạo map cho roles để tìm kiếm nhanh
  const roleMap = useMemo(() => {
    return roles.reduce((acc, role) => {
      acc[role.id] = role;
      return acc;
    }, {} as Record<number, RoleData>);
  }, [roles]);

  // Tạo map cho user permissions
  const userPermissionMap = useMemo(() => {
    return userPermissions.reduce((acc, permission) => {
      acc[permission.group_id_lv3] = permission;
      return acc;
    }, {} as Record<number, UserGroupLv3>);
  }, [userPermissions]);

  const checkPermissionByRoleId = (roleId: number): PermissionResult => {
    const role = roleMap[roleId];
    const userPermission = userPermissionMap[roleId];

    if (!role) {
      return {
        canView: false,
        canWrite: false
      };
    }

    if (!userPermission) {
      return {
        canView: false,
        canWrite: false,
        roleInfo: role
      };
    }

    return {
      canView: userPermission.isRead,
      canWrite: userPermission.isWrite,
      roleInfo: role
    };
  };

  // Hàm kiểm tra quyền theo access string
  const checkPermissionByAccess = (access: string): PermissionResult => {
    const role = roles.find((r) => r.access === access);

    if (user && user.username === 'admin') {
      return {
        canView: true,
        canWrite: true
      };
    }

    if (!role) {
      return {
        canView: false,
        canWrite: false
      };
    }

    return checkPermissionByRoleId(role.id);
  };

  return {
    checkPermissionByAccess
  };
};
