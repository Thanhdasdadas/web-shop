import { useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Product } from '@/types';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ProductGallery } from '@/components/ProductGallery';
import { ProductCard } from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/stores/toastStore';

export function ProductDetailPage() {
  const { slug } = useParams({ strict: false }) as { slug: string };
  const [qty, setQty] = useState(1);
  const qc = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => (await api.get<Product>(`/products/${slug}`)).data,
  });

  const { data: related, isLoading: relatedLoading } = useQuery({
    queryKey: ['product-related', slug],
    queryFn: async () => (await api.get<Product[]>(`/products/${slug}/related`)).data,
    enabled: !!slug,
  });

  const addToCart = useMutation({
    mutationFn: async () => api.post('/cart/items', { productId: product!.id, quantity: qty }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
      toast('Đã thêm vào giỏ hàng', 'success');
    },
    onError: () => toast('Không thể thêm vào giỏ', 'error'),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <ProductGridSkeleton count={2} />
      </div>
    );
  }

  if (!product) {
    return <p className="p-10 text-center text-slate-500">Không tìm thấy sản phẩm</p>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: 'Trang chủ', to: '/' },
          { label: 'Mỹ phẩm', to: '/san-pham' },
          { label: product.name },
        ]}
      />
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name} />
        <div>
          <p className="text-sm text-brand-600">{product.categoryName}</p>
          <h1 className="mt-2 text-3xl font-bold text-brand-900">{product.name}</h1>
          <p className="mt-4 text-2xl font-bold text-brand-700">{formatCurrency(product.price)}</p>
          <p className="mt-2 text-sm text-slate-500">SKU: {product.sku}</p>
          {product.stock !== undefined && (
            <p className={`mt-1 text-sm ${product.stock < 1 ? 'text-red-600' : 'text-slate-600'}`}>
              {product.stock < 1 ? 'Hết hàng' : `Còn ${product.stock} sản phẩm`}
            </p>
          )}
          <p className="mt-6 leading-relaxed text-slate-600">{product.description}</p>

          <Card className="mt-8">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Số lượng</label>
              <input
                type="number"
                min={1}
                max={product.stock ?? 99}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-20 rounded-lg border border-brand-200 px-3 py-2"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                onClick={() => addToCart.mutate()}
                disabled={addToCart.isPending || (product.stock ?? 0) < 1}
              >
                Thêm vào giỏ
              </Button>
              <Link to="/gio-hang">
                <Button variant="secondary">Xem giỏ hàng</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      <section className="mt-16 border-t border-brand-100 pt-12">
        <h2 className="text-xl font-bold text-brand-900">Sản phẩm liên quan</h2>
        {relatedLoading ? (
          <div className="mt-6">
            <ProductGridSkeleton count={4} />
          </div>
        ) : related && related.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Chưa có sản phẩm liên quan.</p>
        )}
      </section>
    </div>
  );
}
