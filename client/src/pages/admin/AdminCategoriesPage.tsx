import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Category } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const { data } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => (await api.get<Category[]>('/admin/categories')).data,
  });

  const create = useMutation({
    mutationFn: () => api.post('/admin/categories', { name, slug, isActive: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      setName('');
      setSlug('');
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-categories'] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Danh mục</h1>
      <Card className="mt-6">
        <div className="flex flex-wrap gap-3">
          <Input label="Tên" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <Button className="self-end" onClick={() => create.mutate()}>
            Thêm
          </Button>
        </div>
      </Card>
      <Card className="mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="pb-2">Tên</th>
              <th className="pb-2">Slug</th>
              <th className="pb-2">Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data?.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="py-2">{c.name}</td>
                <td className="py-2">{c.slug}</td>
                <td className="py-2">{c.isActive ? 'Hoạt động' : 'Ẩn'}</td>
                <td className="py-2 text-right">
                  <Button variant="danger" size="sm" onClick={() => remove.mutate(c.id)}>
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
