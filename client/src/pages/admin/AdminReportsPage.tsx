import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { DashboardSummary, SalesReport } from '@/types';
import { formatCurrency } from '@/lib/format';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { downloadExport } from '@/lib/downloadBlob';
import {
  RevenueBarChart,
  RevenueLineChart,
  OrderStatusPieChart,
  TopProductsBarChart,
  OrdersCountBarChart,
} from '@/components/admin/AdminCharts';

export function AdminReportsPage() {
  const [groupBy, setGroupBy] = useState<'day' | 'month'>('day');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  const { data: report } = useQuery({
    queryKey: ['admin-report', groupBy],
    queryFn: async () =>
      (await api.get<SalesReport>('/admin/reports/sales', { params: { groupBy } })).data,
  });

  const { data: summary } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get<DashboardSummary>('/admin/dashboard/summary')).data,
  });

  const revenueSeries = useMemo(
    () =>
      report?.revenueByPeriod.map((p) => ({
        label: groupBy === 'month' ? p.label : p.label.slice(5),
        revenue: p.revenue,
        orderCount: p.orderCount,
      })) ?? [],
    [report, groupBy]
  );

  return (
    <div>
      <AdminPageHeader
        title="Báo cáo & biểu đồ"
        description="Quan sát doanh thu, đơn hàng và sản phẩm bán chạy"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setGroupBy(groupBy === 'day' ? 'month' : 'day')}>
              Nhóm theo {groupBy === 'day' ? 'tháng' : 'ngày'}
            </Button>
            <Button variant="secondary" onClick={() => setChartType(chartType === 'bar' ? 'line' : 'bar')}>
              {chartType === 'bar' ? 'Biểu đồ đường' : 'Biểu đồ cột'}
            </Button>
            <Button variant="secondary" onClick={() => downloadExport('/admin/export/orders', 'don-hang.xlsx')}>
              Xuất Excel đơn
            </Button>
          </div>
        }
      />

      {report && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Card className="border-brand-100 bg-gradient-to-br from-white to-brand-50/40">
              <p className="text-sm text-slate-500">Doanh thu (đã giao)</p>
              <p className="text-2xl font-bold text-brand-800">{formatCurrency(report.totalRevenue)}</p>
            </Card>
            <Card>
              <p className="text-sm text-slate-500">Tổng đơn</p>
              <p className="text-2xl font-bold">{report.totalOrders}</p>
            </Card>
            <Card>
              <p className="text-sm text-slate-500">Đơn đã giao</p>
              <p className="text-2xl font-bold text-emerald-700">{report.deliveredOrders}</p>
            </Card>
          </div>

          <Card className="mt-8 border-brand-100">
            {chartType === 'bar' ? (
              <RevenueBarChart data={revenueSeries} title="Doanh thu theo thời gian" />
            ) : (
              <RevenueLineChart data={revenueSeries} title="Doanh thu theo thời gian" />
            )}
          </Card>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card className="border-brand-100">
              {summary && (
                <OrderStatusPieChart ordersByStatus={summary.ordersByStatus} title="Phân bổ trạng thái đơn" />
              )}
            </Card>
            <Card className="border-brand-100">
              <OrdersCountBarChart data={revenueSeries} title="Số đơn giao theo kỳ" />
            </Card>
          </div>

          <Card className="mt-6 border-brand-100">
            <TopProductsBarChart data={report.topProducts} title="Top sản phẩm (doanh thu)" />
          </Card>

          <Card className="mt-6">
            <h2 className="font-semibold">Bảng top sản phẩm</h2>
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="pb-2">Sản phẩm</th>
                  <th>SL bán</th>
                  <th>Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {report.topProducts.map((p) => (
                  <tr key={p.productId} className="border-t border-brand-50">
                    <td className="py-2">{p.productName}</td>
                    <td>{p.quantitySold}</td>
                    <td>{formatCurrency(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
