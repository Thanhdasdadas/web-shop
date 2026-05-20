import type { AxiosError } from 'axios';

type ApiErrorBody = {
  message?: string;
  title?: string;
  errors?: Record<string, string[]>;
};

export function getApiErrorMessage(error: unknown, fallback = 'Đã xảy ra lỗi'): string {
  const err = error as AxiosError<ApiErrorBody>;
  const data = err.response?.data;
  if (!data) return fallback;

  if (data.errors) {
    const lines = Object.values(data.errors).flat().filter(Boolean);
    if (lines.length > 0) return lines.join(' ');
  }

  return data.message ?? data.title ?? fallback;
}
