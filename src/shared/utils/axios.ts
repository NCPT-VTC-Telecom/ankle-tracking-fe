import axios from 'axios';
import { store } from 'shared/store';
import { ENV } from 'settings';
import Cookies from 'universal-cookie';
import { API_PATH_AUTHENTICATE } from './constant';
import { getAccessToken, setAccessToken, setRefreshToken } from './auth';

const axiosServices = axios.create({
  baseURL: import.meta.env.VITE_APP_BACKEND_API_TEST_WIFI
});

const cookies = new Cookies();

let lastAlertTime = 0;
const alertCoolDown = 1000;
let alertShown = false;
let redirecting = false;

// Refresh token management
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosServices.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers['Authorization'] = token;
    }
    const state = store.getState(); // Lấy state từ Redux store
    const siteId = state.authSlice.user?.currentSites;
    // Thêm `siteId` vào params của mọi request nếu có
    if (siteId && siteId !== 'default') {
      config.params = config.params || {};
      config.params['siteId'] = siteId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosServices.interceptors.response.use(
  async (response: any) => {
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid response format.');
    }

    // Handle code -3 (token expired or no permission) - Try to refresh token first
    if (response.data.code === -3) {
      // console.log('🔴 Received code -3 from API:', response.config.url);
      const originalRequest = response.config;

      // Skip refresh for refresh token API itself
      if (originalRequest.url?.includes(API_PATH_AUTHENTICATE.refreshToken)) {
        // console.log('⚠️ Refresh token API itself returned -3, redirecting to login');
        const now = Date.now();
        if (now - lastAlertTime > alertCoolDown && !alertShown && !redirecting) {
          alertShown = true;
          redirecting = true;
          setTimeout(() => {
            alert("You don't have permission");
            window.location.href = '/login';
          }, 100);
          lastAlertTime = now;
        }
        throw new Error('Permission denied');
      }

      // If not already retried, try to refresh token
      if (!originalRequest._retry) {
        // console.log('🔄 Attempting token refresh...');

        if (isRefreshing) {
          // console.log('⏳ Already refreshing, queueing request');
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              console.log('✅ Queue resolved with token, retrying request');
              originalRequest.headers['Authorization'] = token;
              return axiosServices(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = cookies.get('refreshToken');
        // console.log('🔑 Refresh token from cookies:', refreshToken ? 'exists' : 'missing');

        if (!refreshToken) {
          // No refresh token available, redirect to login
          isRefreshing = false;
          cookies.remove('accessToken');
          cookies.remove('refreshToken');
          localStorage.removeItem('user');

          const now = Date.now();
          if (now - lastAlertTime > alertCoolDown && !alertShown && !redirecting) {
            alertShown = true;
            redirecting = true;
            setTimeout(() => {
              alert("You don't have permission");
              window.location.href = '/login';
            }, 100);
            lastAlertTime = now;
          }
          throw new Error('Permission denied');
        }

        try {
          // Call refresh token API
          // console.log('📡 Calling refresh token API...');
          const refreshResponse = await axios.post(`${import.meta.env.VITE_APP_BACKEND_API_TEST_WIFI}${API_PATH_AUTHENTICATE.refreshToken}`, {
            refreshToken
          });

          // console.log('📥 Refresh token response:', refreshResponse.data);

          if (refreshResponse.data.code === 0) {
            // console.log('✅ Refresh token successful');
            const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;

            // Store new tokens using auth helpers
            setAccessToken(accessToken);
            setRefreshToken(newRefreshToken);

            // Get formatted token with Bearer prefix
            const formattedToken = getAccessToken();
            console.log('🔐 New access token stored, retrying original request');

            // Update axios default header
            axiosServices.defaults.headers.common['Authorization'] = formattedToken;
            originalRequest.headers['Authorization'] = formattedToken;

            // Process queued requests with formatted token
            processQueue(null, formattedToken);
            isRefreshing = false;

            // Retry original request
            return axiosServices(originalRequest);
          } else {
            // console.log('❌ Refresh token failed with code:', refreshResponse.data.code);
            throw new Error('Refresh token failed');
          }
        } catch (refreshError) {
          // console.log('❌ Refresh token error:', refreshError);
          processQueue(refreshError, null);
          isRefreshing = false;

          // Refresh failed, clear tokens and redirect
          cookies.remove('accessToken');
          cookies.remove('refreshToken');
          localStorage.removeItem('user');

          const now = Date.now();
          if (now - lastAlertTime > alertCoolDown && !alertShown && !redirecting) {
            alertShown = true;
            redirecting = true;
            setTimeout(() => {
              alert("You don't have permission");
              window.location.href = '/login';
            }, 100);
            lastAlertTime = now;
          }

          throw refreshError;
        }
      } else {
        // Already retried, show error
        const now = Date.now();
        if (now - lastAlertTime > alertCoolDown && !alertShown && !redirecting) {
          alertShown = true;
          redirecting = true;
          setTimeout(() => {
            alert("You don't have permission");
            window.location.href = '/login';
          }, 100);
          lastAlertTime = now;
        }
        throw new Error('Permission denied');
      }
    } else {
      return response;
    }
  },
  async (error: any) => {
    if (axios.isCancel(error)) {
      return new Promise(() => { });
    }

    const originalRequest = error.config;

    // Handle 401 Unauthorized - Try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // console.log('401 Error detected, attempting token refresh...');
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = token;
            return axiosServices(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = cookies.get('refreshToken');

      if (!refreshToken) {
        // No refresh token available, redirect to login
        isRefreshing = false;
        cookies.remove('accessToken');
        cookies.remove('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Call refresh token API
        const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_API_TEST_WIFI}${API_PATH_AUTHENTICATE.refreshToken}`, {
          refreshToken
        });

        // console.log('Refresh token response:', response.data);

        if (response.data.code === 0) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          // Store new tokens using auth helpers
          setAccessToken(accessToken);
          setRefreshToken(newRefreshToken);

          // Get formatted token with Bearer prefix
          const formattedToken = getAccessToken();

          // Update axios default header
          axiosServices.defaults.headers.common['Authorization'] = formattedToken;
          originalRequest.headers['Authorization'] = formattedToken;

          // Process queued requests with formatted token
          processQueue(null, formattedToken);

          // Retry original request
          return axiosServices(originalRequest);
        } else {
          throw new Error('Refresh token failed');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Refresh failed, clear tokens and redirect
        cookies.remove('accessToken');
        cookies.remove('refreshToken');
        localStorage.removeItem('user');

        if (!redirecting) {
          redirecting = true;
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response && error.response.status === 500 && ENV !== 'development') {
      // window.location.href = '/maintenance/500';
      return Promise.reject({ error: 'Server error: Please try again later.' });
    } else if (error.response) {
      return Promise.reject({ error: 'There was a problem retrieving data. Please try again later.' });
    } else if (error.request) {
      return Promise.reject({ error: 'Unable to connect to the data server. Please check your internet connection.' });
    } else {
      return Promise.reject({ error: 'An unexpected error occurred. Please try again.' });
    }
  }
);

// Reset flags after navigation
window.addEventListener('popstate', () => {
  alertShown = false;
  redirecting = false;
});

export default axiosServices;
