import axios, { type InternalAxiosRequestConfig } from 'axios';
import { getAuthItem, setAuthItem, clearAuthItems } from './authStorage';
import { getSessionId } from './session';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAuthItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['X-Session-Id'] = getSessionId();
  return config;
});

let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = getAuthItem('refreshToken');
      if (!refreshToken) return Promise.reject(error);

      if (!refreshing) {
        refreshing = axios
          .post<{ accessToken: string; refreshToken: string }>('/api/auth/refresh', { refreshToken })
          .then((r) => {
            setAuthItem('accessToken', r.data.accessToken);
            setAuthItem('refreshToken', r.data.refreshToken);
            return r.data.accessToken;
          })
          .catch(() => {
            clearAuthItems(['accessToken', 'refreshToken']);
            return null;
          })
          .finally(() => {
            refreshing = null;
          });
      }

      const newToken = await refreshing;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
