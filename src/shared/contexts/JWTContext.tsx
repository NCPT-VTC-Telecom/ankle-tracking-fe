import { createContext, ReactElement, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

//third-party
import axios from 'axios';
import axiosGosafe from 'shared/utils/axiosGosafe';
import { enqueueSnackbar } from 'notistack';
import Cookies from 'universal-cookie';

// reducer - state management
// import { LOGIN, LOGOUT } from 'shared/store/reducers/actions';

//redux
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'shared/store';
import { loginStore, logoutStore, setCurrentAds, setCurrentSite } from 'shared/store/reducers/auth';
import { handlerIconVariants } from 'shared/store/reducers/snackbar';

// project-imports
import Loader from 'shared/components/Loader';

//types
import { JWTContextType, UserProfile } from 'shared/types/auth';

//constant
import { useIntl } from 'react-intl';
import { clearAllTokens, setAccessToken } from 'shared/utils/auth';
import { mapGosafeUser, writeGosafePermissions } from 'shared/utils/gosafeAuth';

const JWTContext = createContext<JWTContextType | null>(null);

// Giữ type này vì usePermissionChecker import từ đây.
export interface UserGroupLv3 {
  id: number;
  group_id_lv1: number;
  group_id_lv2: number;
  group_id_lv3: number;
  user_id: string;
  isRead: boolean;
  isWrite: boolean;
}

export const JWTProvider = ({ children }: { children: ReactElement }) => {
  const dispatch = useDispatch();
  const state = useSelector((state: RootState) => state.authSlice);
  const navigate = useNavigate();
  const cookies = new Cookies();
  const accessToken = cookies.get('accessToken');
  const intl = useIntl();
  const location = useLocation();

  useEffect(() => {
    const init = async () => {
      if (accessToken) {
        try {
          if (accessToken && accessToken.includes('mock-gosafe-access-token')) {
            const mockUser: UserProfile = {
              id: 'mock-gosafe-admin-id',
              email: 'gosafe_admin@vtctelecom.com.vn',
              name: 'GoSafe Admin',
              fullname: 'GoSafe Administrator',
              username: 'gosafe_admin',
              phoneNumber: '0912345678',
              currentSites: 'mock-site',
              currentRegion: 'mock-region',
              currentAds: [],
              sites: [{ site_id: 'mock-site', user_id: 'mock-gosafe-admin-id', name: 'Mock Site' }],
              regions: [{ id: 1, region_id: 'mock-region', user_id: 'mock-gosafe-admin-id' }],
              user_group: { id: 1, name: 'Admin' },
              user_group_lv2: [{ group_id_lv2: 1, user_id: 'mock-gosafe-admin-id' }],
              user_group_lv3: [{ group_id_lv3: 1, user_id: 'mock-gosafe-admin-id' }]
            };
            (mockUser as any).gosafeIsSuperAdmin = true; // tài khoản demo = superadmin
            dispatch(loginStore({ user: mockUser, isLoggedIn: true }));
            dispatch(setCurrentSite({ siteId: '' }));
            dispatch(setCurrentAds({ adId: [] }));
            return;
          }
          // GoSafe token thật → verify_login khôi phục user.
          const gosafeToken = localStorage.getItem('gosafe_token');
          if (gosafeToken) {
            const response = await axiosGosafe.get('/v1/auth_management/verify_login');
            const userData = response.data?.data ?? response.data?.user ?? response.data;
            if (userData && (response.data?.code === 0 || response.data?.code === undefined)) {
              dispatch(loginStore({ user: mapGosafeUser(userData, userData?.username ?? ''), isLoggedIn: true }));
              dispatch(setCurrentSite({ siteId: '' }));
              dispatch(setCurrentAds({ adId: [] }));
              writeGosafePermissions();
              return;
            }
          }
          // Không xác minh được phiên → đăng xuất.
          setAccessToken('');
          dispatch(logoutStore());
          navigate(`/login`, { state: { from: '' } });
        } catch (err) {
          dispatch(logoutStore());
          // dispatch(clearDataRoles());
          navigate(`/login`, {
            state: {
              from: ''
            }
          });
        }
      } else if (location.pathname === '/passpoint-download') {
        dispatch(logoutStore());
        return;
      } else if (location.pathname === '/') {
        // Kiểm tra nếu đang ở root path và landing page được bật
        const env = import.meta.env.VITE_APP_ENV;
        const isLandingEnabled = env === 'production' || env === 'development';
        if (isLandingEnabled) {
          dispatch(logoutStore());
          return;
        }
        // Nếu landing không được bật, redirect bình thường
        dispatch(logoutStore());
        navigate(`/login`, {
          state: {
            from: ''
          }
        });
      } else {
        dispatch(logoutStore());
        // dispatch(clearDataRoles());
        navigate(`/login`, {
          state: {
            from: ''
          }
        });
      }
    };
    init();
    //eslint-disable-next-line
  }, [dispatch, accessToken]);

  const login = async (username: string, password: string): Promise<{ code: number }> => {
    try {
      setAccessToken('');

      // Bypass for mock test accounts
      if (username === 'gosafe_admin' && password === 'admin') {
        const mockUser: UserProfile = {
          id: 'mock-gosafe-admin-id',
          email: 'gosafe_admin@vtctelecom.com.vn',
          name: 'GoSafe Admin',
          fullname: 'GoSafe Administrator',
          username: username,
          phoneNumber: '0912345678',
          currentSites: 'mock-site',
          currentRegion: 'mock-region',
          currentAds: [],
          sites: [{ site_id: 'mock-site', user_id: 'mock-gosafe-admin-id', name: 'Mock Site' }],
          regions: [{ id: 1, region_id: 'mock-region', user_id: 'mock-gosafe-admin-id' }],
          user_group: { id: 1, name: 'Admin' },
          user_group_lv2: [{ group_id_lv2: 1, user_id: 'mock-gosafe-admin-id' }],
          user_group_lv3: [{ group_id_lv3: 1, user_id: 'mock-gosafe-admin-id' }]
        };

        (mockUser as any).gosafeIsSuperAdmin = true; // tài khoản demo = superadmin
        dispatch(loginStore({ isLoggedIn: true, user: mockUser }));

        setAccessToken('mock-gosafe-access-token');
        localStorage.removeItem('gosafe_token'); // token rỗng → API quản lý tự fallback local
        writeGosafePermissions();
        return { code: 0 };
      }

      // ── Đăng nhập GoSafe Admin thật ──
      try {
        const res = await axiosGosafe.post('/v1/auth_management/login_admin', { username, password });
        const data = res.data?.data ?? res.data;
        const accessToken = data?.accessToken ?? data?.token;
        const loginUser = data?.user ?? data;
        if ((res.data?.code === 0 || res.data?.code === undefined) && accessToken) {
          localStorage.setItem('gosafe_token', accessToken);
          setAccessToken(accessToken);
          // login_admin trả user tối giản; roles/regionAccess chỉ có ở verify_login → lấy thêm.
          let fullUser = loginUser;
          try {
            const vr = await axiosGosafe.get('/v1/auth_management/verify_login');
            fullUser = vr.data?.data ?? vr.data?.user ?? vr.data ?? loginUser;
          } catch {
            /* giữ user tối giản nếu verify_login lỗi */
          }
          dispatch(loginStore({ isLoggedIn: true, user: mapGosafeUser(fullUser, username) }));
          dispatch(setCurrentSite({ siteId: '' }));
          dispatch(setCurrentAds({ adId: [] }));
          writeGosafePermissions();
          return { code: 0 };
        }
        dispatch(logoutStore());
        return { code: res.data?.code ?? -1 };
      } catch (apiErr: any) {
        // API lỗi/không reachable: fallback mock chỉ áp dụng cho gosafe_admin/admin (đã xử lý ở trên).
        dispatch(logoutStore());
        if (axios.isAxiosError(apiErr) && !apiErr.response) return { code: -5 };
        return { code: -1 };
      }
    } catch (err: any) {
      dispatch(logoutStore());
      if (axios.isAxiosError(err)) {
        if (!err.response) return { code: -5 };
        if (err.response.status >= 500) return { code: -4 };
      }
      return { code: -1 };
    }
  };

  const register = async (
    phoneNumber: string,
    username: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    isAdmin: boolean
  ): Promise<{ code: number; message: string }> => {
    try {
      const res = await axiosGosafe.post('/v1/auth_management/register', {
        phoneNumber: phoneNumber,
        email,
        isAdmin,
        username,
        password,
        fullname: `${firstName} ${lastName}`
      });

      return { code: res.data.code, message: res.data.message };
    } catch (err: any) {
      if (err.response && err.response.data) {
        return {
          code: err.response.data.code ?? -1,
          message: err.response.data.message ?? err.message
        };
      }
      return { code: -1, message: err.message };
    }
  };

  const logout = async (silent: boolean = false) => {
    // GoSafe không có endpoint logout phía server → chỉ xoá token/state cục bộ.
    clearAllTokens();
    try { localStorage.removeItem('gosafe_token'); } catch {}
    dispatch(logoutStore());

    if (!silent) {
      // Show logout success message only if not silent
      enqueueSnackbar(intl.formatMessage({ id: 'logout-success' }), {
        variant: 'success'
      });
    }

    const env = import.meta.env.VITE_APP_ENV;
    const isLandingEnabled = env === 'production' || env === 'development';
    if (isLandingEnabled) {
      navigate('/gosafe', { replace: true });
    } else {
      navigate(`/login`, {
        state: {
          from: ''
        }
      });
    }
  };

  const resetPassword = async (username: string, email: string, newPassword: string) => {
    try {
      const res = await axiosGosafe.post('/v1/auth_management/reset_password', {
        username,
        email,
        newPassword
      });
      return { ...res.data };
    } catch (err) {
      dispatch(
        handlerIconVariants({
          iconVariant: 'useemojis'
        })
      );
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    }
  };

  const verifyEmail = async (email: string) => {
    try {
      const res = await axiosGosafe.get('/v1/auth_management/verify_email', {
        params: {
          email
        }
      });
      return { ...res.data };
    } catch (err) {
      dispatch(
        handlerIconVariants({
          iconVariant: 'useemojis'
        })
      );
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    }
  };

  const updateProfile = () => {};

  if (!state.isInitialized) {
    return <Loader />;
  }

  return (
    <JWTContext.Provider value={{ ...state, login, logout, register, resetPassword, updateProfile, verifyEmail }}>
      {children}
    </JWTContext.Provider>
  );
};

export default JWTContext;
