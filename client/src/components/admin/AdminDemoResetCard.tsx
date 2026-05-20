import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from '@/stores/toastStore';
import { useAuthStore } from '@/stores/authStore';

const CONFIRM_PHRASE = 'RESET-DEMO';

type DemoResetStatus = { enabled: boolean; confirmPhraseRequired: string };
type DemoResetResult = {
  success: boolean;
  message: string;
  ordersRemoved: number;
  customersRemoved: number;
  productsSeeded: number;
};

export function AdminDemoResetCard() {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [phrase, setPhrase] = useState('');

  const { data: status } = useQuery({
    queryKey: ['demo-reset-status'],
    queryFn: async () => (await api.get<DemoResetStatus>('/admin/demo/reset-status')).data,
    enabled: isAdmin(),
  });

  const reset = useMutation({
    mutationFn: async () =>
      (await api.post<DemoResetResult>('/admin/demo/reset', { confirmPhrase: phrase })).data,
    onSuccess: (result) => {
      toast(result.message, 'success');
      setOpen(false);
      setPhrase('');
      qc.invalidateQueries();
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast(err.response?.data?.message ?? 'Reset thất bại', 'error');
    },
  });

  if (!isAdmin() || status?.enabled === false) return null;

  return (
    <Card className="mt-8 border-amber-200 bg-amber-50/50">
      <h2 className="font-semibold text-amber-900">Reset dữ liệu demo</h2>
      <p className="mt-2 text-sm text-amber-900/80">
        Xóa đơn hàng, giỏ, đánh giá, khách đăng ký, mã giảm giá tùy chỉnh và làm mới catalog mẫu Flower Knows + mã{' '}
        <strong>GLOW10</strong>. Giữ tài khoản Admin/Staff.
      </p>
      {!open ? (
        <Button type="button" variant="secondary" className="mt-4" onClick={() => setOpen(true)}>
          Reset dữ liệu demo…
        </Button>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-amber-900">
            Gõ <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">{CONFIRM_PHRASE}</code> để xác nhận:
          </p>
          <input
            type="text"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm"
            placeholder={CONFIRM_PHRASE}
            autoComplete="off"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className="bg-amber-700 hover:bg-amber-800"
              disabled={phrase.trim() !== CONFIRM_PHRASE || reset.isPending}
              onClick={() => reset.mutate()}
            >
              {reset.isPending ? 'Đang reset…' : 'Xác nhận reset'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => { setOpen(false); setPhrase(''); }}>
              Hủy
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
