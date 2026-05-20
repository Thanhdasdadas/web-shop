import { Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { WishlistItem } from '@/types';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

export function WishlistPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => (await api.get<{ items: WishlistItem[] }>('/wishlist')).data,
  });

  const remove = useMutation({
    mutationFn: async (productId: string) => api.delete(`/wishlist/${productId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  if (isLoading) return <p className="p-10 text-center">Đang tải...</p>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold text-brand-900">Yêu thích</h1>
      {!data?.items.length ? (
        <div className="mt-8">
          <EmptyState title="Danh sách trống" action={<Link to="/san-pham"><Button>Mua sắm</Button></Link>} />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.items.map((item) => (
            <Card key={item.productId}>
              <Link to="/san-pham/$slug" params={{ slug: item.slug }}>
                <img src={item.image ?? 'https://picsum.photos/200'} alt="" className="aspect-square w-full rounded-lg object-cover" />
                <h3 className="mt-2 font-semibold">{item.name}</h3>
                <p className="text-brand-700 font-bold">{formatCurrency(item.price)}</p>
              </Link>
              <Button variant="ghost" size="sm" className="mt-2 text-red-600" onClick={() => remove.mutate(item.productId)}>
                Bỏ yêu thích
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
