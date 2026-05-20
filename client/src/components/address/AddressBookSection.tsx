import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { SavedAddress } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { toast } from '@/stores/toastStore';

const empty = {
  label: 'Nhà',
  fullName: '',
  phone: '',
  addressLine: '',
  ward: '',
  district: '',
  city: '',
  isDefault: false,
};

export function AddressBookSection() {
  const qc = useQueryClient();
  const [form, setForm] = useState(empty);

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => (await api.get<SavedAddress[]>('/addresses')).data,
  });

  const save = useMutation({
    mutationFn: async () => api.post('/addresses', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] });
      setForm(empty);
      toast('Đã lưu địa chỉ', 'success');
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/addresses/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  });

  return (
    <Card className="mt-6">
      <h2 className="font-semibold text-brand-900">Sổ địa chỉ giao hàng</h2>
      <ul className="mt-4 space-y-3">
        {addresses?.map((a) => (
          <li key={a.id} className="rounded-lg border border-brand-100 p-3 text-sm">
            <p className="font-medium text-brand-800">
              {a.label} {a.isDefault && <span className="text-xs text-brand-600">(Mặc định)</span>}
            </p>
            <p className="text-slate-600">
              {a.fullName} · {a.phone} — {a.addressLine}, {a.ward}, {a.district}, {a.city}
            </p>
            <Button variant="ghost" size="sm" className="mt-2 text-red-600" onClick={() => remove.mutate(a.id)}>
              Xóa
            </Button>
          </li>
        ))}
        {addresses?.length === 0 && <p className="text-sm text-slate-500">Chưa có địa chỉ đã lưu.</p>}
      </ul>

      <div className="mt-6 space-y-3 border-t border-brand-100 pt-4">
        <p className="text-sm font-medium text-brand-800">Thêm địa chỉ mới</p>
        <Input label="Nhãn" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Họ tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <Input label="SĐT" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <Input label="Số nhà, đường" value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })} />
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Phường/Xã" value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} />
          <Input label="Quận/Huyện" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
          <Input label="Tỉnh/TP" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
          Đặt làm mặc định
        </label>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          Lưu địa chỉ
        </Button>
      </div>
    </Card>
  );
}
