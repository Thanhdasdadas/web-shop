import axios, { type InternalAxiosRequestConfig } from 'axios';
import { getSessionId } from './session';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
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
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return Promise.reject(error);

      if (!refreshing) {
        refreshing = axios
          .post<{ accessToken: string; refreshToken: string }>('/api/auth/refresh', { refreshToken })
          .then((r) => {
            localStorage.setItem('accessToken', r.data.accessToken);
            localStorage.setItem('refreshToken', r.data.refreshToken);
            return r.data.accessToken;
          })
          .catch(() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
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
