import Cookies from 'universal-cookie';

const cookies = new Cookies();

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const setAccessToken = (token: string) => {
  if (!token) {
    clearAccessToken();
    return;
  }
  const formatted = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  cookies.set(ACCESS_TOKEN_KEY, formatted, { path: '/' });
};

/**
 * Xóa access token khỏi cookies và axios header
 */
export const clearAccessToken = () => {
  cookies.remove(ACCESS_TOKEN_KEY, { path: '/' });
};

/**
 * Lấy access token từ cookies
 */
export const getAccessToken = (): string | undefined => {
  return cookies.get(ACCESS_TOKEN_KEY);
};

/**
 * Refresh token helpers
 */
export const setRefreshToken = (token: string) => {
  cookies.set(REFRESH_TOKEN_KEY, token, { path: '/' });
};

export const getRefreshToken = (): string | undefined => {
  return cookies.get(REFRESH_TOKEN_KEY);
};

export const clearRefreshToken = () => {
  cookies.remove(REFRESH_TOKEN_KEY, { path: '/' });
};

/**
 * Xóa toàn bộ token
 */
export const clearAllTokens = () => {
  clearAccessToken();
  clearRefreshToken();
};
