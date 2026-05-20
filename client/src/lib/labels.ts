import type { OrderStatus, PaymentStatus, UserRole } from '@/types';

export const orderStatusLabels: Record<OrderStatus, string> = {
  Pending: 'Chờ xác nhận',
  Confirmed: 'Đã xác nhận',
  Shipping: 'Đang giao',
  Delivered: 'Đã giao',
  Cancelled: 'Đã hủy',
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  Pending: 'Chưa thu',
  Paid: 'Đã thu (COD)',
};

export const roleLabels: Record<UserRole, string> = {
  Customer: 'Khách hàng',
  Staff: 'Nhân viên',
  Admin: 'Quản trị',
};

export const orderStatusColors: Record<OrderStatus, string> = {
  Pending: 'bg-amber-100 text-amber-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Shipping: 'bg-indigo-100 text-indigo-800',
  Delivered: 'bg-emerald-100 text-emerald-800',
  Cancelled: 'bg-red-100 text-red-800',
};
