import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '@/lib/api';
import type { SalesReport } from '@/types';
import { formatCurrency } from '@/lib/format';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/Button';
import { downloadExport } from '@/lib/downloadBlob';

export function AdminReportsPage() {
  const [groupBy, setGroupBy] = useState<'day' | 'month'>('day');

  const { data: report } = useQuery({
    queryKey: ['admin-report', groupBy],
    queryFn: async () =>
      (await api.get<SalesReport>('/admin/reports/sales', { params: { groupBy } })).data,
  });

  return (
    <div>
      <AdminPageHeader
        title="Báo cáo doanh thu"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setGroupBy(groupBy === 'day' ? 'month' : 'day')}>
              Theo {groupBy === 'day' ? 'tháng' : 'ngày'}
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
            <div className="rounded-xl border border-brand-100 bg-white p-4">
              <p className="text-sm text-slate-500">Doanh thu (đã giao)</p>
              <p className="text-2xl font-bold text-brand-800">{formatCurrency(report.totalRevenue)}</p>
            </div>
            <div className="rounded-xl border border-brand-100 bg-white p-4">
              <p className="text-sm text-slate-500">Tổng đơn</p>
              <p className="text-2xl font-bold">{report.totalOrders}</p>
            </div>
            <div className="rounded-xl border border-brand-100 bg-white p-4">
              <p className="text-sm text-slate-500">Đơn đã giao</p>
              <p className="text-2xl font-bold">{report.deliveredOrders}</p>
            </div>
          </div>

          <div className="mt-8 h-80 rounded-xl border border-brand-100 bg-white p-4">
            <h2 className="mb-4 font-semibold">Doanh thu theo thời gian</h2>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={report.revenueByPeriod}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
                <Bar dataKey="revenue" fill="#db2777" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 rounded-xl border border-brand-100 bg-white p-4">
            <h2 className="font-semibold">Top sản phẩm</h2>
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="pb-2">Sản phẩm</th>
                  <th>SL</th>
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
          </div>
        </>
      )}
    </div>
  );
}
