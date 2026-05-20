import api from '@/lib/api';

function sessionKey(type: 'view' | 'click', productId: string) {
  return `metric:${type}:${productId}`;
}

/** Mỗi phiên trình duyệt chỉ +1 view cho một sản phẩm (tránh F5 spam). */
export function trackProductView(productId: string) {
  const key = sessionKey('view', productId);
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');
  api.post(`/products/${productId}/track/view`).catch(() => {});
}

export function trackProductClick(productId: string) {
  api.post(`/products/${productId}/track/click`).catch(() => {});
}
