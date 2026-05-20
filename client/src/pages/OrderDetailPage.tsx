import { useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Order } from '@/types';
import { formatCurrency, formatDate } from '@/lib/format';
import { orderStatusLabels, paymentStatusLabels, orderStatusColors } from '@/lib/labels';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export function OrderDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => (await api.get<Order>(`/orders/${id}`)).data,
  });

  if (isLoading) return <p className="p-10 text-center">Đang tải...</p>;
  if (!order) return <p className="p-10 text-center">Không tìm thấy đơn hàng</p>;

  const addr = order.shippingAddress;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
        <Badge className={orderStatusColors[order.status]}>{orderStatusLabels[order.status]}</Badge>
      </div>
      <p className="mt-1 text-sm text-slate-500">{formatDate(order.createdAt)}</p>

      <Card className="mt-6">
        <h2 className="font-semibold">Sản phẩm</h2>
        <ul className="mt-3 space-y-2">
          {order.items.map((i) => (
            <li key={i.productId} className="flex justify-between text-sm">
              <span>
                {i.productName} × {i.quantity}
              </span>
              <span>{formatCurrency(i.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t pt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Tạm tính</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Phí vận chuyển</span>
            <span>{formatCurrency(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between font-bold text-base">
            <span>Tổng</span>
            <span className="text-brand-700">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="font-semibold">Giao hàng</h2>
        <p className="mt-2 text-sm">
          {addr.fullName} — {addr.phone}
          <br />
          {addr.addressLine}, {addr.ward}, {addr.district}, {addr.city}
        </p>
      </Card>

      <Card className="mt-4">
        <h2 className="font-semibold">Thanh toán COD</h2>
        <p className="mt-2 text-sm">Trạng thái: {paymentStatusLabels[order.paymentStatus]}</p>
      </Card>
    </div>
  );
}
