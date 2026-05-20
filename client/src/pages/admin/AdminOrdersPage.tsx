import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import api from '@/lib/api';
import type { PagedResult, Order, OrderStatus } from '@/types';
import { formatCurrency, formatDate } from '@/lib/format';
import { orderStatusLabels, orderStatusColors } from '@/lib/labels';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const col = createColumnHelper<Order>();
const statuses: OrderStatus[] = ['Pending', 'Confirmed', 'Shipping', 'Delivered', 'Cancelled'];

export function AdminOrdersPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('Confirmed');
  const [note, setNote] = useState('');

  const { data } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: async () =>
      (
        await api.get<PagedResult<Order>>('/admin/orders', {
          params: statusFilter ? { status: statusFilter } : {},
        })
      ).data,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      api.patch(`/admin/orders/${id}/status`, { status, note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      setSelectedId(null);
    },
  });

  const columns = [
    col.accessor('orderNumber', { header: 'Mã đơn' }),
    col.accessor('createdAt', { header: 'Ngày', cell: (i) => formatDate(i.getValue()) }),
    col.accessor('status', {
      header: 'Trạng thái',
      cell: (i) => (
        <Badge className={orderStatusColors[i.getValue()]}>{orderStatusLabels[i.getValue()]}</Badge>
      ),
    }),
    col.accessor('total', { header: 'Tổng', cell: (i) => formatCurrency(i.getValue()) }),
    col.display({
      id: 'actions',
      cell: ({ row }) => (
        <Button size="sm" variant="secondary" onClick={() => setSelectedId(row.original.id)}>
          Cập nhật
        </Button>
      ),
    }),
  ];

  const table = useReactTable({ data: data?.items ?? [], columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div>
      <h1 className="text-2xl font-bold">Đơn hàng</h1>
      <select
        className="mt-4 rounded-lg border px-3 py-2 text-sm"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
      >
        <option value="">Tất cả trạng thái</option>
        {statuses.map((s) => (
          <option key={s} value={s}>
            {orderStatusLabels[s]}
          </option>
        ))}
      </select>

      {selectedId && (
        <Card className="mt-4">
          <h3 className="font-semibold">Cập nhật trạng thái</h3>
          <div className="mt-3 flex flex-wrap gap-3">
            <select className="rounded-lg border px-3 py-2 text-sm" value={newStatus} onChange={(e) => setNewStatus(e.target.value as OrderStatus)}>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {orderStatusLabels[s]}
                </option>
              ))}
            </select>
            <input
              className="rounded-lg border px-3 py-2 text-sm flex-1"
              placeholder="Ghi chú"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button onClick={() => updateStatus.mutate({ id: selectedId, status: newStatus })}>Lưu</Button>
            <Button variant="ghost" onClick={() => setSelectedId(null)}>
              Hủy
            </Button>
          </div>
        </Card>
      )}

      <Card className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b text-left text-slate-500">
                {hg.headers.map((h) => (
                  <th key={h.id} className="pb-2 pr-4">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-2 pr-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
