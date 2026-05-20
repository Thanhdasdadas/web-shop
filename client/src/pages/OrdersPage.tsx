import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { PagedResult, Order } from '@/types';
import { formatCurrency, formatDate } from '@/lib/format';
import { orderStatusLabels, orderStatusColors } from '@/lib/labels';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => (await api.get<PagedResult<Order>>('/orders')).data,
  });

  if (isLoading) return <p className="p-10 text-center">Đang tải...</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Đơn hàng của tôi</h1>
      <div className="mt-8 space-y-4">
        {data?.items.map((order) => (
          <Link key={order.id} to="/don-hang/$id" params={{ id: order.id }}>
            <Card className="hover:border-brand-300 transition">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
                </div>
                <Badge className={orderStatusColors[order.status]}>{orderStatusLabels[order.status]}</Badge>
                <p className="font-bold text-brand-700">{formatCurrency(order.total)}</p>
              </div>
            </Card>
          </Link>
        ))}
        {!data?.items.length && <p className="text-center text-slate-500">Chưa có đơn hàng nào</p>}
      </div>
    </div>
  );
}
