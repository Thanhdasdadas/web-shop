import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearch, Link } from '@tanstack/react-router';
import api from '@/lib/api';
import type { PagedResult, Product, Category } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

type ProductSearch = {
  categoryId?: string;
  search?: string;
  sortBy?: string;
  inStockOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
};

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'name_asc', label: 'Tên A–Z' },
];

export function ProductsPage() {
  const search = useSearch({ strict: false }) as ProductSearch;
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState(search.search ?? '');
  const sortBy = search.sortBy ?? 'newest';
  const inStockOnly = search.inStockOnly ?? false;
  const [minPrice, setMinPrice] = useState(search.minPrice?.toString() ?? '');
  const [maxPrice, setMaxPrice] = useState(search.maxPrice?.toString() ?? '');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Category[]>('/categories')).data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, search.categoryId, search.search, sortBy, inStockOnly, search.minPrice, search.maxPrice],
    queryFn: async () =>
      (
        await api.get<PagedResult<Product>>('/products', {
          params: {
            page,
            pageSize: 12,
            categoryId: search.categoryId,
            search: search.search || undefined,
            sortBy,
            inStockOnly: inStockOnly || undefined,
            minPrice: search.minPrice,
            maxPrice: search.maxPrice,
          },
        })
      ).data,
  });

  const updateSearch = (patch: Partial<ProductSearch>) => {
    setPage(1);
    navigate({
      to: '/san-pham',
      search: {
        categoryId: search.categoryId,
        search: search.search,
        sortBy,
        inStockOnly,
        ...patch,
      },
    });
  };

  const applySearch = () => updateSearch({ search: q || undefined });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-900">Mỹ phẩm</h1>
        <p className="mt-2 text-brand-700/70">Chăm sóc da, trang điểm và làm đẹp chính hãng</p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-brand-100 bg-white p-4 shadow-sm lg:flex-row lg:items-end lg:flex-wrap">
        <form
          className="min-w-[200px] flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            applySearch();
          }}
        >
          <Input label="Tìm kiếm" placeholder="Tên sản phẩm, SKU..." value={q} onChange={(e) => setQ(e.target.value)} />
        </form>
        <div className="w-full sm:w-48">
          <Select
            label="Danh mục"
            value={search.categoryId ?? ''}
            onChange={(e) => updateSearch({ categoryId: e.target.value || undefined })}
          >
            <option value="">Tất cả danh mục</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Select label="Sắp xếp" value={sortBy} onChange={(e) => updateSearch({ sortBy: e.target.value })}>
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm text-brand-800">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => updateSearch({ inStockOnly: e.target.checked || undefined })}
            className="rounded border-brand-300"
          />
          Chỉ còn hàng
        </label>
        <div className="w-full sm:w-36">
          <Input label="Giá từ" type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
        </div>
        <div className="w-full sm:w-36">
          <Input label="Giá đến" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setPage(1);
            navigate({
              to: '/san-pham',
              search: {
                categoryId: search.categoryId,
                search: search.search,
                sortBy,
                inStockOnly: inStockOnly || undefined,
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined,
              },
            });
          }}
        >
          Lọc
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-8">
          <ProductGridSkeleton count={12} />
        </div>
      ) : data?.items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Không tìm thấy sản phẩm"
            description="Thử đổi từ khóa hoặc bỏ bộ lọc danh mục."
            action={
              <Link to="/san-pham">
                <Button variant="secondary">Xem tất cả</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-slate-500">{data?.totalCount} sản phẩm</p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data?.items.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
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
