import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { PagedResult, Product, Category } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/Button';

export function HomePage() {
  const { data: products } = useQuery({
    queryKey: ['products', 'home'],
    queryFn: async () => (await api.get<PagedResult<Product>>('/products', { params: { pageSize: 8 } })).data,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Category[]>('/categories')).data,
  });

  return (
    <div>
      <section className="border-b border-brand-200 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-100">
            Mỹ phẩm chính hãng
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">
            Làm đẹp mỗi ngày, tự tin tỏa sáng
          </h1>
          <p className="mt-4 max-w-xl text-base text-brand-50/95">
            Chăm sóc da, trang điểm, tóc và nước hoa — giao tận nơi, thanh toán COD khi nhận hàng.
          </p>
          <Link to="/san-pham" className="mt-8 inline-block">
            <Button size="lg" variant="secondary" className="!bg-white !text-brand-700 hover:!bg-brand-50">
              Khám phá ngay
            </Button>
          </Link>
        </div>
      </section>

      {categories && categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12">
          <h2 className="text-2xl font-bold text-brand-900">Danh mục</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                to="/san-pham"
                search={{ categoryId: c.id }}
                className="rounded-full border border-brand-200 bg-white px-4 py-2 text-sm text-brand-800 hover:border-brand-400 hover:text-brand-600"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-brand-900">Mỹ phẩm nổi bật</h2>
          <Link to="/san-pham" className="text-sm font-medium text-brand-600 hover:underline">
            Xem tất cả →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products?.items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
