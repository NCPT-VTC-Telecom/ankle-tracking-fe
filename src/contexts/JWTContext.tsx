import { createContext, ReactElement, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

//third-party
import axios from 'axios';
import axiosServices from 'utils/axios';
import * as Crypto from 'crypto-js';
import { enqueueSnackbar } from 'notistack';
import Cookies from 'universal-cookie';

// reducer - state management
// import { LOGIN, LOGOUT } from 'store/reducers/actions';

//redux
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store';
import { loginStore, logoutStore, setCurrentAds, setCurrentSite } from 'store/reducers/auth';
import { handlerIconVariants } from 'store/reducers/snackbar';

// project-imports
import Loader from 'components/Loader';

//types
import { JWTContextType, UserProfile } from 'types/auth';

//constant
import { useIntl } from 'react-intl';
import { RoleData } from 'types';
import { clearAllTokens, getRefreshToken, setAccessToken, setRefreshToken } from 'utils/auth';
import { API_PATH_AUTHENTICATE, API_PATH_ROLE } from 'utils/constant';

const JWTContext = createContext<JWTContextType | null>(null);

export interface UserGroupLv3 {
  id: number;
  group_id_lv1: number;
  group_id_lv2: number;
  group_id_lv3: number;
  user_id: string;
  isRead: boolean;
  isWrite: boolean;
}

const getAccessKey = (arrRole: RoleData[]) => {
  return arrRole.map((role) => role.access);
};

const getParentId = (arrRole: UserGroupLv3[], level: 2 | 3) => {
  if (level === 2) {
    return arrRole.map((role) => role.group_id_lv2);
  } else {
    return arrRole.map((role) => role.group_id_lv3);
  }
};

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
            dispatch(loginStore({ user: mockUser, isLoggedIn: true }));
            dispatch(setCurrentSite({ siteId: '' }));
            dispatch(setCurrentAds({ adId: [] }));
            return;
          }
          const response = await axiosServices.get(API_PATH_AUTHENTICATE.verifyLogin);
          if (response.data.code === 0) {
            const getRole3 = await axiosServices.get(API_PATH_ROLE.dataRole, {
              params: {
                level: 3,
                roleId: getParentId(response.data.data.user_group_lv3, 3),
                pageSize: 100
              }
            });
            const getRole2 = await axiosServices.get(API_PATH_ROLE.dataRole, {
              params: {
                level: 2,
                roleId: getParentId(response.data.data.user_group_lv2, 2),
                pageSize: 100
              }
            });

            dispatch(loginStore({ user: response.data.data, isLoggedIn: true }));
            // dispatch(setCurrentSite({ siteId: response.data.data.sites[0].site_id }));
            dispatch(setCurrentSite({ siteId: '' }));
            if (response.data?.data?.ads.length > 0) {
              dispatch(setCurrentAds({ adId: response.data.data?.ads.map((item: any) => item.ad_id) }));
            } else {
              dispatch(setCurrentAds({ adId: [] }));
            }
            if (getRole2.data.code === 0 && getRole3.data.code === 0) {
              const keyAccess = {
                level2: getAccessKey(getRole2.data.data),
                level3: getAccessKey(getRole3.data.data)
              };

              const permissions = {
                level2: getRole2.data.data,
                level3: getRole3.data.data
              };

              const parseString = JSON.stringify(keyAccess);
              const permissionsString = JSON.stringify(permissions);
              const encryptedData = Crypto.AES.encrypt(parseString, import.meta.env.VITE_APP_SECRET_KEY as string).toString();

              const encryptedDataPermission = Crypto.AES.encrypt(
                permissionsString,
                import.meta.env.VITE_APP_SECRET_KEY as string
              ).toString();

              sessionStorage.setItem('accessPermission', encryptedData);
              sessionStorage.setItem('dataPermission', encryptedDataPermission);
            } else {
              setAccessToken('');
              dispatch(logoutStore());
              // dispatch(clearDataRoles());
              navigate(`/login`, {
                state: {
                  from: ''
                }
              });
            }
          } else {
            setAccessToken('');
            // dispatch(clearDataRoles());
            dispatch(logoutStore());
            navigate(`/login`, {
              state: {
                from: ''
              }
            });
          }
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

        dispatch(loginStore({ isLoggedIn: true, user: mockUser }));

        setAccessToken('mock-gosafe-access-token');
        setRefreshToken('mock-gosafe-refresh-token');

        // Create encrypted permission data in sessionStorage to prevent decrypt error in hooks
        const mockPermissions = {
          level2: [{ access: 'admin-management' }, { access: 'dashboard' }, { access: 'clients-management' }],
          level3: [{ access: 'admin-management' }, { access: 'dashboard' }, { access: 'clients-management' }]
        };
        const mockKeyAccess = {
          level2: ['admin-management', 'dashboard', 'clients-management'],
          level3: ['admin-management', 'dashboard', 'clients-management']
        };

        const parseString = JSON.stringify(mockKeyAccess);
        const permissionsString = JSON.stringify(mockPermissions);
        const encryptedData = Crypto.AES.encrypt(parseString, import.meta.env.VITE_APP_SECRET_KEY as string).toString();
        const encryptedDataPermission = Crypto.AES.encrypt(permissionsString, import.meta.env.VITE_APP_SECRET_KEY as string).toString();

        sessionStorage.setItem('accessPermission', encryptedData);
        sessionStorage.setItem('dataPermission', encryptedDataPermission);

        return { code: 0 };
      }

      const res = await axios.post(`${import.meta.env.VITE_APP_BACKEND_API_TEST_WIFI + API_PATH_AUTHENTICATE.loginUser}`, {
        username,
        password
      });

      dispatch(loginStore({ isLoggedIn: true, user: res.data.data.user }));
      setAccessToken(res.data.data.accessToken);

      // Store refresh token if present in response
      if (res.data.data.refreshToken) {
        setRefreshToken(res.data.data.refreshToken);
      }

      return { code: res.data.code };
    } catch (err) {
      dispatch(logoutStore());
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
    const res = await axios.post(`${import.meta.env.VITE_APP_BACKEND_API_TEST_WIFI + API_PATH_AUTHENTICATE.registerUser}`, {
      phoneNumber: phoneNumber,
      email,
      isAdmin,
      username,
      password,
      fullname: `${firstName} ${lastName}`
    });

    return { code: res.data.code, message: res.data.message };
  };

  const logout = async (silent: boolean = false) => {
    const refreshToken = getRefreshToken();

    // Revoke refresh token on server if present
    if (refreshToken) {
      try {
        await axiosServices.post(API_PATH_AUTHENTICATE.logout, {
          refreshToken
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    // Clear tokens and state
    clearAllTokens();
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
      const res = await axios.post(`${import.meta.env.VITE_APP_BACKEND_API_TEST_WIFI + API_PATH_AUTHENTICATE.resetPassword}`, {
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
      const res = await axios.get(`${import.meta.env.VITE_APP_BACKEND_API_TEST_WIFI + API_PATH_AUTHENTICATE.verifyEmail}`, {
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
