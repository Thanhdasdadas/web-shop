import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/lib/format';
import { orderStatusLabels } from '@/lib/labels';
import type { OrderStatus } from '@/types';

const BRAND = '#db2777';
const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  Confirmed: '#3b82f6',
  Shipping: '#6366f1',
  Delivered: '#10b981',
  Cancelled: '#ef4444',
};

type RevenuePoint = { label: string; revenue: number; orderCount?: number };

export function RevenueBarChart({ data, title }: { data: RevenuePoint[]; title: string }) {
  if (data.length === 0) {
    return <p className="py-12 text-center text-sm text-slate-500">Chưa có dữ liệu doanh thu.</p>;
  }
  return (
    <div>
      <h3 className="mb-3 font-semibold text-brand-900">{title}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(v, name) =>
                name === 'revenue' ? formatCurrency(Number(v ?? 0)) : [v ?? 0, 'Số đơn']
              }
              labelFormatter={(l) => `Ngày ${l}`}
            />
            <Bar dataKey="revenue" name="Doanh thu" fill={BRAND} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function RevenueLineChart({ data, title }: { data: RevenuePoint[]; title: string }) {
  if (data.length === 0) {
    return <p className="py-12 text-center text-sm text-slate-500">Chưa có dữ liệu doanh thu.</p>;
  }
  return (
    <div>
      <h3 className="mb-3 font-semibold text-brand-900">{title}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
            <Line type="monotone" dataKey="revenue" stroke={BRAND} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function OrderStatusPieChart({
  ordersByStatus,
  title,
}: {
  ordersByStatus: Record<string, number>;
  title: string;
}) {
  const pieData = Object.entries(ordersByStatus).map(([status, value]) => ({
    name: orderStatusLabels[status as OrderStatus] ?? status,
    status,
    value,
  }));

  if (pieData.length === 0) {
    return <p className="py-12 text-center text-sm text-slate-500">Chưa có đơn hàng.</p>;
  }

  return (
    <div>
      <h3 className="mb-3 font-semibold text-brand-900">{title}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {pieData.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function TopProductsBarChart({
  data,
  title,
}: {
  data: { productName: string; quantitySold: number; revenue: number }[];
  title: string;
}) {
  const chartData = data.slice(0, 8).map((p) => ({
    name: p.productName.length > 22 ? `${p.productName.slice(0, 22)}…` : p.productName,
    revenue: p.revenue,
    quantity: p.quantitySold,
  }));

  if (chartData.length === 0) {
    return <p className="py-12 text-center text-sm text-slate-500">Chưa có sản phẩm bán.</p>;
  }

  return (
    <div>
      <h3 className="mb-3 font-semibold text-brand-900">{title}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
            <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
            <Bar dataKey="revenue" fill="#be185d" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function OrdersCountBarChart({ data, title }: { data: RevenuePoint[]; title: string }) {
  if (data.length === 0) return null;
  return (
    <div>
      <h3 className="mb-3 font-semibold text-brand-900">{title}</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="orderCount" name="Số đơn" fill="#f472b6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
