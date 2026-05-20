import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { DashboardSummary, SalesReport } from '@/types';
import { formatCurrency, formatDate } from '@/lib/format';
import { orderStatusLabels, orderStatusColors } from '@/lib/labels';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/admin/StatCard';
import {
  RevenueBarChart,
  RevenueLineChart,
  OrderStatusPieChart,
  TopProductsBarChart,
  OrdersCountBarChart,
} from '@/components/admin/AdminCharts';
import { AdminDemoResetCard } from '@/components/admin/AdminDemoResetCard';

function last30DaysFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString();
}

export function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get<DashboardSummary>('/admin/dashboard/summary')).data,
  });

  const { data: report, isLoading: reportLoading } = useQuery({
    queryKey: ['dashboard-sales'],
    queryFn: async () =>
      (
        await api.get<SalesReport>('/admin/reports/sales', {
          params: { from: last30DaysFrom(), groupBy: 'day' },
        })
      ).data,
  });

  const revenueSeries = useMemo(
    () =>
      report?.revenueByPeriod.map((p) => ({
        label: p.label.slice(5),
        revenue: p.revenue,
        orderCount: p.orderCount,
      })) ?? [],
    [report]
  );

  if (isLoading) return <p className="text-brand-700">Đang tải tổng quan...</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Tổng quan</h1>
          <p className="mt-1 text-sm text-slate-500">Biểu đồ 30 ngày gần nhất — đơn đã giao tính doanh thu</p>
        </div>
        <Link to="/admin/bao-cao">
          <Button variant="secondary">Báo cáo chi tiết →</Button>
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Doanh thu (đã giao)" value={formatCurrency(data?.totalRevenue ?? 0)} />
        <StatCard label="Tổng đơn hàng" value={data?.totalOrders ?? 0} />
        <StatCard label="Đơn đã giao" value={report?.deliveredOrders ?? '—'} />
        <StatCard
          label="Sắp hết hàng"
          value={data?.lowStockProducts.length ?? 0}
          hint="Cần nhập thêm kho"
        />
      </div>

      {reportLoading ? (
        <p className="mt-8 text-center text-slate-500">Đang tải biểu đồ...</p>
      ) : (
        <>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card className="border-brand-100">
              <RevenueBarChart data={revenueSeries} title="Doanh thu theo ngày" />
            </Card>
            <Card className="border-brand-100">
              <RevenueLineChart data={revenueSeries} title="Xu hướng doanh thu" />
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card className="border-brand-100">
              {data && (
                <OrderStatusPieChart ordersByStatus={data.ordersByStatus} title="Đơn hàng theo trạng thái" />
              )}
            </Card>
            <Card className="border-brand-100">
              <OrdersCountBarChart data={revenueSeries} title="Số đơn đã giao theo ngày" />
            </Card>
          </div>

          {report && report.topProducts.length > 0 && (
            <Card className="mt-6 border-brand-100">
              <TopProductsBarChart data={report.topProducts} title="Top sản phẩm theo doanh thu" />
            </Card>
          )}
        </>
      )}

      {data && Object.keys(data.ordersByStatus).length > 0 && (
        <Card className="mt-6 lg:hidden">
          <h2 className="font-semibold">Đơn theo trạng thái (số liệu)</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {Object.entries(data.ordersByStatus).map(([status, count]) => (
              <div key={status} className="rounded-lg bg-slate-50 px-4 py-2">
                <span className="text-sm text-slate-600">
                  {orderStatusLabels[status as keyof typeof orderStatusLabels] ?? status}
                </span>
                <span className="ml-2 font-bold">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {data && data.lowStockProducts.length > 0 && (
        <Card className="mt-6 border-amber-200 bg-amber-50/30">
          <h2 className="font-semibold text-amber-800">Cảnh báo tồn kho thấp</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {data.lowStockProducts.map((p) => (
              <li key={p.productId} className="flex justify-between">
                <span>{p.productName}</span>
                <span className="text-amber-700">
                  {p.quantityOnHand} / ngưỡng {p.lowStockThreshold}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <AdminDemoResetCard />

      <Card className="mt-6">
        <h2 className="font-semibold text-brand-900">Đơn hàng mới nhất</h2>
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
