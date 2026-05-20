import api from '@/lib/api';
import { getSessionId } from '@/lib/session';

/** Gộp giỏ khách (session) vào giỏ user sau đăng nhập/đăng ký. */
export async function mergeGuestCart(): Promise<void> {
  try {
    await api.post('/cart/merge', {}, { headers: { 'X-Session-Id': getSessionId() } });
  } catch {
    /* giỏ session trống hoặc chưa đăng nhập */
  }
}
