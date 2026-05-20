import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { PagedResult, Review } from '@/types';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/Button';

export function AdminReviewsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => (await api.get<PagedResult<Review>>('/admin/reviews', { params: { pageSize: 50 } })).data,
  });

  const approve = useMutation({
    mutationFn: async (id: string) => api.post(`/admin/reviews/${id}/approve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reviews'] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/reviews/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reviews'] }),
  });

  return (
    <div>
      <AdminPageHeader title="Đánh giá sản phẩm" />
      <div className="mt-6 space-y-3">
        {data?.items.map((r) => (
          <div key={r.id} className="rounded-xl border border-brand-100 bg-white p-4 text-sm">
            <p className="font-medium">{r.userFullName} — {'★'.repeat(r.rating)}</p>
            <p className="mt-1 text-slate-600">{r.comment}</p>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => approve.mutate(r.id)}>
                Duyệt
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove.mutate(r.id)}>
                Xóa
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
