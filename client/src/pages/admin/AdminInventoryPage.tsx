import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { InventoryItem } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  delta: number;
  reason: string;
  actorName?: string;
  createdAt: string;
}

export function AdminInventoryPage() {
  const qc = useQueryClient();
  const [productId, setProductId] = useState('');
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState('');

  const { data: inventory } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => (await api.get<InventoryItem[]>('/admin/inventory')).data,
  });

  const { data: logs } = useQuery({
    queryKey: ['inventory-logs'],
    queryFn: async () => (await api.get<InventoryLog[]>('/admin/inventory/logs')).data,
  });

  const adjust = useMutation({
    mutationFn: () => api.post('/admin/inventory/adjust', { productId, delta: Number(delta), reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      qc.invalidateQueries({ queryKey: ['inventory-logs'] });
      setDelta(0);
      setReason('');
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Kho hàng</h1>

      <Card className="mt-6">
        <h2 className="font-semibold">Điều chỉnh tồn kho</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <select
            className="rounded-lg border px-3 py-2 text-sm min-w-[200px]"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">Chọn sản phẩm</option>
            {inventory?.map((i) => (
              <option key={i.productId} value={i.productId}>
                {i.productName} (hiện: {i.quantityOnHand})
              </option>
            ))}
          </select>
          <Input type="number" label="Thay đổi (+/-)" value={delta} onChange={(e) => setDelta(Number(e.target.value))} />
          <Input label="Lý do" value={reason} onChange={(e) => setReason(e.target.value)} />
          <Button className="self-end" onClick={() => adjust.mutate()} disabled={!productId || !reason}>
            Cập nhật
          </Button>
        </div>
      </Card>

      <Card className="mt-6 overflow-x-auto">
        <h2 className="mb-4 font-semibold">Tồn kho hiện tại</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="pb-2">Sản phẩm</th>
              <th className="pb-2">SKU</th>
              <th className="pb-2">Tồn</th>
              <th className="pb-2">Ngưỡng</th>
            </tr>
          </thead>
          <tbody>
            {inventory?.map((i) => (
              <tr key={i.productId} className="border-b">
                <td className="py-2">{i.productName}</td>
                <td className="py-2">{i.sku}</td>
                <td className="py-2">
                  {i.quantityOnHand}
                  {i.isLowStock && <Badge className="ml-2 bg-amber-100 text-amber-800">Thấp</Badge>}
                </td>
                <td className="py-2">{i.lowStockThreshold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="mt-6">
        <h2 className="mb-4 font-semibold">Lịch sử biến động</h2>
        <ul className="space-y-2 text-sm">
          {logs?.map((log) => (
            <li key={log.id} className="flex justify-between border-b border-slate-100 py-2">
              <span>
                {log.productName}: <strong>{log.delta > 0 ? '+' : ''}{log.delta}</strong> — {log.reason}
              </span>
              <span className="text-slate-500">{log.actorName ?? 'Hệ thống'}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
