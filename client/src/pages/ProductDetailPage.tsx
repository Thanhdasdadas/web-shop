import { useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Product } from '@/types';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function ProductDetailPage() {
  const { slug } = useParams({ strict: false }) as { slug: string };
  const [qty, setQty] = useState(1);
  const qc = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => (await api.get<Product>(`/products/${slug}`)).data,
  });

  const addToCart = useMutation({
    mutationFn: async () => api.post('/cart/items', { productId: product!.id, quantity: qty }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });

  if (isLoading) return <p className="p-10 text-center">Đang tải...</p>;
  if (!product) return <p className="p-10 text-center">Không tìm thấy sản phẩm</p>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-slate-100">
          <img src={product.images[0]} alt={product.name} className="w-full object-cover" />
        </div>
        <div>
          <p className="text-sm text-brand-600">{product.categoryName}</p>
          <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>
          <p className="mt-4 text-2xl font-bold text-brand-700">{formatCurrency(product.price)}</p>
          <p className="mt-2 text-sm text-slate-500">SKU: {product.sku}</p>
          {product.stock !== undefined && (
            <p className="mt-1 text-sm text-slate-600">Còn {product.stock} sản phẩm</p>
          )}
          <p className="mt-6 text-slate-600 leading-relaxed">{product.description}</p>

          <Card className="mt-8">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Số lượng</label>
              <input
                type="number"
                min={1}
                max={product.stock ?? 99}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-20 rounded-lg border px-3 py-2"
              />
            </div>
            <div className="mt-4 flex gap-3">
              <Button
                onClick={() => addToCart.mutate()}
                disabled={addToCart.isPending || (product.stock ?? 0) < 1}
              >
                {addToCart.isSuccess ? 'Đã thêm!' : 'Thêm vào giỏ'}
              </Button>
              <Link to="/gio-hang">
                <Button variant="secondary">Xem giỏ hàng</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
