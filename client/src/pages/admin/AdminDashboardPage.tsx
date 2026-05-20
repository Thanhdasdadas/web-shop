import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { DashboardSummary } from '@/types';
import { formatCurrency, formatDate } from '@/lib/format';
import { orderStatusLabels, orderStatusColors } from '@/lib/labels';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get<DashboardSummary>('/admin/dashboard/summary')).data,
  });

  if (isLoading) return <p>Đang tải...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Tổng quan</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-slate-500">Doanh thu (đã giao)</p>
          <p className="mt-1 text-2xl font-bold text-brand-700">{formatCurrency(data?.totalRevenue ?? 0)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Tổng đơn hàng</p>
          <p className="mt-1 text-2xl font-bold">{data?.totalOrders ?? 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Sắp hết hàng</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{data?.lowStockProducts.length ?? 0}</p>
        </Card>
      </div>

      {data && Object.keys(data.ordersByStatus).length > 0 && (
        <Card className="mt-6">
          <h2 className="font-semibold">Đơn theo trạng thái</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {Object.entries(data.ordersByStatus).map(([status, count]) => (
              <div key={status} className="rounded-lg bg-slate-50 px-4 py-2">
                <span className="text-sm text-slate-600">{orderStatusLabels[status as keyof typeof orderStatusLabels] ?? status}</span>
                <span className="ml-2 font-bold">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {data && data.lowStockProducts.length > 0 && (
        <Card className="mt-6">
          <h2 className="font-semibold text-amber-700">Cảnh báo tồn kho thấp</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {data.lowStockProducts.map((p) => (
              <li key={p.productId} className="flex justify-between">
                <span>{p.productName}</span>
                <span className="text-amber-600">
                  {p.quantityOnHand} / ngưỡng {p.lowStockThreshold}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="mt-6">
        <h2 className="font-semibold">Đơn hàng mới nhất</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="pb-2">Mã đơn</th>
                <th className="pb-2">Ngày</th>
                <th className="pb-2">Trạng thái</th>
                <th className="pb-2 text-right">Tổng</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-slate-100">
                  <td className="py-2 font-medium">{o.orderNumber}</td>
                  <td className="py-2">{formatDate(o.createdAt)}</td>
                  <td className="py-2">
                    <Badge className={orderStatusColors[o.status]}>{orderStatusLabels[o.status]}</Badge>
                  </td>
                  <td className="py-2 text-right">{formatCurrency(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
