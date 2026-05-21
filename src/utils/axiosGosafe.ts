import axios from 'axios';

/**
 * Dedicated Axios instance for the GoSafe GPS Tracking backend.
 * Base URL: VITE_APP_BACKEND_API_GOSAFE (https://gosafe.vtctelecom.com.vn/api/gosafe)
 *
 * This is a separate instance from the main WiFi management API because
 * GoSafe runs on a different service and may use different auth in the future.
 */
// In dev Vite proxies /api/gosafe → gosafe.vtctelecom.com.vn (no CORS).
// In production the full URL is used (same-domain deployment = no CORS).
const baseURL = import.meta.env.DEV
  ? '/api/gosafe'
  : (import.meta.env.VITE_APP_BACKEND_API_GOSAFE ?? 'https://gosafe.vtctelecom.com.vn/api/gosafe');

const axiosGosafe = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach auth token if available (extend when GoSafe adds auth)
axiosGosafe.interceptors.request.use(
  (config) => {
    // TODO: attach GoSafe-specific token here when authentication is required
    // const token = localStorage.getItem('gosafe_token');
    // if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — normalise error messages
axiosGosafe.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isCancel(error)) return new Promise(() => {});
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    if (!error.response) {
      return Promise.reject({ error: 'Không thể kết nối đến máy chủ GoSafe. Vui lòng kiểm tra mạng.' });
    }
    if (error.response.status === 401) {
      return Promise.reject({ error: 'Không có quyền truy cập GoSafe API.' });
    }
    if (error.response.status === 404) {
      return Promise.reject({ error: 'Không tìm thấy dữ liệu GPS cho thiết bị này.' });
    }
    if (error.response.status >= 500) {
      return Promise.reject({ error: 'Lỗi máy chủ GoSafe. Vui lòng thử lại sau.' });
    }
    return Promise.reject(error);
  }
);

export default axiosGosafe;
