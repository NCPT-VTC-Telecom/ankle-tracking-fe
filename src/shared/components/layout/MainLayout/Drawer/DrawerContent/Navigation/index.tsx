import { useCallback, useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, useMediaQuery } from '@mui/material';
import NavGroup from './NavGroup';
import menuItem from 'shared/menu-items';
import { useSelector } from 'shared/store';
import useConfig from 'shared/hooks/useConfig';
import { HORIZONTAL_MAX_ITEM } from 'config';
import { NavItemType } from 'shared/types/menu';
import { MenuOrientation } from 'shared/types/config';
import * as CryptoJS from 'crypto-js';
import Cookies from 'universal-cookie';

const cookies = new Cookies();
const Navigation = () => {
  const theme = useTheme();
  const downLG = useMediaQuery(theme.breakpoints.down('lg'));
  const { menuOrientation } = useConfig();
  const { drawerOpen } = useSelector((state) => state.menu);
  // const [accessKey, setAccessKey] = useState<any>([]);
  const [selectedItems, setSelectedItems] = useState<string | undefined>('');
  const [selectedLevel, setSelectedLevel] = useState<number>(0);
  const [menuItems, setMenuItems] = useState<{ items: NavItemType[] }>({ items: [] });
  // const [isReload, setIsReload] = useState(false);
  const [isMenuInitialized, setIsMenuInitialized] = useState(false);

  // const isLoggedIn = useSelector((state) => state.authSlice.isLoggedIn);
  const isLoggedIn = useSelector((state) => state.authSlice.isLoggedIn);
  const user = useSelector((state) => state.authSlice.user);

  const decryptPermissions = useCallback(() => {
    try {
      const accessPermission = sessionStorage.getItem('accessPermission');
      if (!accessPermission) return null;

      const decrypted = CryptoJS.AES.decrypt(accessPermission, import.meta.env.VITE_APP_SECRET_KEY as string);
      const originalMessage = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(originalMessage);
    } catch (error) {
      console.error('Error decrypting permissions:', error);
      return null;
    }
  }, []);

  const initializeNavigation = useCallback(async () => {
    const accessToken = cookies.get('accessToken');
    if (!accessToken || !isLoggedIn || !user) {
      setMenuItems({ items: [] });
      setIsMenuInitialized(true);
      return;
    }

    const permissions = decryptPermissions();

    if (!permissions?.level3 || permissions?.level3.length === 0) {
      // If permissions aren't available, wait for a short time and try again
      setTimeout(initializeNavigation, 100);
      return;
    }

    const permissionsWithDashboard = [...permissions.level3, 'dashboard'];
    const filteredMenuItems = filterMenuItems(menuItem.items, permissionsWithDashboard);

    setMenuItems({ items: filteredMenuItems });
    setIsMenuInitialized(true);
    //eslint-disable-next-line
  }, [isLoggedIn, user, cookies, decryptPermissions]);

  // Initial setup
  useEffect(() => {
    setIsMenuInitialized(false);
    initializeNavigation();
  }, [initializeNavigation]);

  // Watch for permission changes
  useEffect(() => {
    const handleStorageChange = () => {
      setIsMenuInitialized(false);
      initializeNavigation();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [initializeNavigation]);

  if (!isMenuInitialized) {
    return null; // or return a loading spinner
  }

  console.log({ menuItems });

  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  const lastItem = isHorizontal ? HORIZONTAL_MAX_ITEM : null;
  let lastItemIndex = menuItems.items.length - 1;
  let remItems: NavItemType[] = [];
  let lastItemId: string;

  if (lastItem && lastItem < menuItems.items.length) {
    lastItemId = menuItems.items[lastItem - 1].id!;
    lastItemIndex = lastItem - 1;
    remItems = menuItems.items.slice(lastItem - 1, menuItems.items.length).map((item) => ({
      title: item.title,
      elements: item.children,
      icon: item.icon
    }));
  }

  const navGroups = menuItems.items.slice(0, lastItemIndex + 1).map((item) => {
    switch (item.type) {
      case 'group':
        return (
          <NavGroup
            key={item.id}
            setSelectedItems={setSelectedItems}
            setSelectedLevel={setSelectedLevel}
            selectedLevel={selectedLevel}
            selectedItems={selectedItems}
            lastItem={lastItem!}
            remItems={remItems}
            lastItemId={lastItemId}
            item={item}
          />
        );
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });

  return (
    <Box
      sx={{
        pt: drawerOpen ? (isHorizontal ? 0 : 2) : 0,
        '& > ul:first-of-type': { mt: 0 },
        display: isHorizontal ? { xs: 'block', lg: 'flex' } : 'block'
      }}
    >
      {navGroups}
    </Box>
  );
};

const filterMenuItems = (items: NavItemType[], access_permission: string[]): NavItemType[] => {
  return items.reduce((acc: NavItemType[], item: NavItemType) => {
    // Xử lý mục 'group' hoặc 'collapse' có chứa các mục con
    if (item.type === 'group' || item.type === 'collapse') {
      const filteredChildren = item.children ? filterMenuItems(item.children, access_permission) : [];
      // Chỉ thêm nhóm nếu có con của nó được phép hiển thị
      if (filteredChildren.length > 0) {
        acc.push({ ...item, children: filteredChildren });
      }
    }
    // Xử lý mục 'item' đơn lẻ
    else if (item.type === 'item' && access_permission.includes(item.id || '')) {
      acc.push(item);
    }
    return acc;
  }, []);
};

export default Navigation;
