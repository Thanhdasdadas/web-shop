import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Coupon, CouponDiscountType } from '@/types';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/admin/Modal';
import { toast } from '@/stores/toastStore';

export function AdminCouponsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discountType: 'Percent' as CouponDiscountType,
    value: 10,
    minOrderAmount: 200000,
    maxDiscount: 50000,
    usageLimit: 100,
    isActive: true,
  });

  const { data: coupons } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => (await api.get<Coupon[]>('/admin/coupons')).data,
  });

  const create = useMutation({
    mutationFn: async () => api.post('/admin/coupons', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
      setOpen(false);
      toast('Đã tạo mã', 'success');
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] }),
  });

  return (
    <div>
      <AdminPageHeader title="Mã giảm giá" action={<Button onClick={() => setOpen(true)}>Thêm mã</Button>} />
      <div className="mt-6 overflow-x-auto rounded-xl border border-brand-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-brand-50 text-left">
            <tr>
              <th className="p-3">Mã</th>
              <th className="p-3">Loại</th>
              <th className="p-3">Giá trị</th>
              <th className="p-3">Đã dùng</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {coupons?.map((c) => (
              <tr key={c.id} className="border-t border-brand-50">
                <td className="p-3 font-mono font-medium">{c.code}</td>
                <td className="p-3">{c.discountType}</td>
                <td className="p-3">{c.value}</td>
                <td className="p-3">
                  {c.usedCount}
                  {c.usageLimit ? ` / ${c.usageLimit}` : ''}
                </td>
                <td className="p-3">
                  <Button variant="ghost" size="sm" onClick={() => remove.mutate(c.id)}>
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Mã mới">
        <div className="space-y-3">
          <Input label="Mã" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <Input label="Giá trị (% hoặc VNĐ)" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
          <Input label="Đơn tối thiểu" type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })} />
          <Button onClick={() => create.mutate()} disabled={create.isPending}>
            Lưu
          </Button>
        </div>
      </Modal>
    </div>
  );
}
