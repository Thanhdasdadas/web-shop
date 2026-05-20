import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import api from '@/lib/api';
import type { PagedResult, Product, Category } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

type ProductSearch = { categoryId?: string; search?: string };

export function ProductsPage() {
  const search = useSearch({ strict: false }) as ProductSearch;
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState(search.search ?? '');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Category[]>('/categories')).data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, search.categoryId, q],
    queryFn: async () =>
      (
        await api.get<PagedResult<Product>>('/products', {
          params: { page, pageSize: 12, categoryId: search.categoryId, search: q || undefined },
        })
      ).data,
  });

  const applySearch = () => {
    setPage(1);
    navigate({ to: '/san-pham', search: { categoryId: search.categoryId, search: q || undefined } });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-900">Mỹ phẩm</h1>
        <p className="mt-2 text-brand-700/70">Chăm sóc da, trang điểm và làm đẹp chính hãng</p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-brand-100 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <form
          className="flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            applySearch();
          }}
        >
          <Input label="Tìm kiếm" placeholder="Tên sản phẩm, SKU..." value={q} onChange={(e) => setQ(e.target.value)} />
        </form>
        <div className="w-full sm:w-64">
          <Select
            label="Danh mục"
            value={search.categoryId ?? ''}
            onChange={(e) => {
              setPage(1);
              navigate({
                to: '/san-pham',
                search: { categoryId: e.target.value || undefined, search: search.search },
              });
            }}
          >
            <option value="">Tất cả danh mục</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <Button type="button" variant="secondary" onClick={applySearch}>
          Lọc
        </Button>
      </div>

      {isLoading ? (
        <p className="mt-12 text-center text-brand-700">Đang tải sản phẩm...</p>
      ) : data?.items.length === 0 ? (
        <p className="mt-12 text-center text-slate-500">Không tìm thấy sản phẩm phù hợp.</p>
      ) : (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data?.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {data && data.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Trước
              </Button>
              <span className="text-sm text-brand-800">
                Trang {page} / {data.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
