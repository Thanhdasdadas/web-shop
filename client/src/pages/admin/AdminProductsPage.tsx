import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import api from '@/lib/api';
import type { Category, PagedResult, Product, ProductAdminSummary } from '@/types';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/admin/StatCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Modal, ModalActions } from '@/components/admin/Modal';
import { ProductImageField } from '@/components/admin/ProductImageField';
import { parseImageUrls, slugify } from '@/lib/slug';

const col = createColumnHelper<Product>();

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  price: 0,
  categoryId: '',
  sku: '',
  images: '',
  isPublished: true,
  initialStock: 10,
  lowStockThreshold: 5,
};

function toForm(p: Product) {
  return {
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    categoryId: p.categoryId,
    sku: p.sku,
    images: p.images.join(', '),
    isPublished: p.isPublished,
    initialStock: 0,
    lowStockThreshold: 5,
  };
}

export function AdminProductsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [publishedFilter, setPublishedFilter] = useState<'' | 'true' | 'false'>('');
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const queryKey = ['admin-products', page, search, categoryFilter, publishedFilter];

  const { data: summary } = useQuery({
    queryKey: ['admin-products-summary'],
    queryFn: async () => (await api.get<ProductAdminSummary>('/admin/products/summary')).data,
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => (await api.get<Category[]>('/admin/categories')).data,
  });

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () =>
      (
        await api.get<PagedResult<Product>>('/admin/products', {
          params: {
            page,
            pageSize: 15,
            search: search || undefined,
            categoryId: categoryFilter || undefined,
            isPublished: publishedFilter === '' ? undefined : publishedFilter === 'true',
          },
        })
      ).data,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-products'] });
    qc.invalidateQueries({ queryKey: ['admin-products-summary'] });
    qc.invalidateQueries({ queryKey: ['products'] });
    qc.invalidateQueries({ queryKey: ['categories'] });
  };

  const createProduct = useMutation({
    mutationFn: () =>
      api.post('/admin/products', {
        name: form.name,
        slug: form.slug,
        description: form.description,
        price: Number(form.price),
        categoryId: form.categoryId,
        sku: form.sku,
        isPublished: form.isPublished,
        initialStock: Number(form.initialStock),
        lowStockThreshold: Number(form.lowStockThreshold),
        images: parseImageUrls(form.images),
      }),
    onSuccess: () => {
      invalidate();
      setShowCreate(false);
      setForm(emptyForm);
      setFormError('');
    },
    onError: () => setFormError('Không thể tạo sản phẩm.'),
  });

  const updateProduct = useMutation({
    mutationFn: () =>
      api.put(`/admin/products/${editId}`, {
        name: form.name,
        slug: form.slug,
        description: form.description,
        price: Number(form.price),
        categoryId: form.categoryId,
        sku: form.sku,
        isPublished: form.isPublished,
        images: parseImageUrls(form.images),
      }),
    onSuccess: () => {
      invalidate();
      setEditId(null);
      setFormError('');
    },
    onError: () => setFormError('Không thể cập nhật sản phẩm.'),
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      api.patch(`/admin/products/${id}/publish`, { isPublished }),
    onSuccess: invalidate,
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/products/${id}`),
    onSuccess: invalidate,
  });

  const openEdit = (product: Product) => {
    setFormError('');
    setEditId(product.id);
    setForm(toForm(product));
  };

  const openCreate = () => {
    setFormError('');
    setForm(emptyForm);
    setShowCreate(true);
  };

  const onNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      slug: showCreate || !f.slug ? slugify(name) : f.slug,
    }));
  };

  const columns = [
    col.display({
      id: 'thumb',
      header: 'Ảnh',
      cell: ({ row }) => {
        const src = row.original.images[0];
        return src ? (
          <img src={src} alt="" className="h-12 w-12 rounded-lg border border-brand-100 object-cover" />
        ) : (
          <span className="text-slate-400">—</span>
        );
      },
    }),
    col.accessor('name', { header: 'Tên' }),
    col.accessor('sku', { header: 'SKU' }),
    col.accessor('categoryName', { header: 'Danh mục', cell: (i) => i.getValue() ?? '—' }),
    col.accessor('price', { header: 'Giá', cell: (i) => formatCurrency(i.getValue()) }),
    col.accessor('stock', { header: 'Tồn', cell: (i) => i.getValue() ?? 0 }),
    col.accessor('isPublished', {
      header: 'Hiển thị',
      cell: ({ row }) => (
        <button
          type="button"
          className={`text-sm font-medium ${row.original.isPublished ? 'text-emerald-600' : 'text-slate-400'}`}
          onClick={() => togglePublish.mutate({ id: row.original.id, isPublished: !row.original.isPublished })}
        >
          {row.original.isPublished ? 'Đang bán' : 'Ẩn'}
        </button>
      ),
    }),
    col.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(row.original)}>
            Sửa
          </Button>
          <Button variant="danger" size="sm" onClick={() => deleteProduct.mutate(row.original.id)}>
            Xóa
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({ data: data?.items ?? [], columns, getCoreRowModel: getCoreRowModel() });

  const formFields = (
    <div className="grid gap-3 sm:grid-cols-2">
      <Input label="Tên sản phẩm" value={form.name} onChange={(e) => onNameChange(e.target.value)} />
      <div>
        <Input
          label="Slug (đường dẫn)"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
        />
        <p className="mt-0.5 text-xs text-slate-500">Tự tạo từ tên; có thể sửa tay</p>
      </div>
      <Input label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
      <Input label="Giá" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-900/80">Danh mục</label>
        <select
          className="w-full rounded-xl border border-brand-200 px-3 py-2 text-sm"
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
        >
          <option value="">Chọn danh mục</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      {showCreate && (
        <>
          <Input
            label="Tồn ban đầu"
            type="number"
            value={form.initialStock}
            onChange={(e) => setForm({ ...form, initialStock: Number(e.target.value) })}
          />
          <Input
            label="Ngưỡng tồn thấp"
            type="number"
            value={form.lowStockThreshold}
            onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })}
          />
        </>
      )}
      <ProductImageField value={form.images} onChange={(images) => setForm({ ...form, images })} />
      <textarea
        className="sm:col-span-2 rounded-xl border border-brand-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
        placeholder="Mô tả"
        rows={3}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input
          type="checkbox"
          checked={form.isPublished}
          onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
        />
        Hiển thị trên cửa hàng
      </label>
    </div>
  );

  return (
    <div>
      <AdminPageHeader
        title="Quản lý mỹ phẩm"
        description="Thêm, chỉnh sửa và ẩn/hiện sản phẩm"
        action={<Button onClick={openCreate}>+ Sản phẩm mới</Button>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tổng SP" value={summary?.total ?? '—'} />
        <StatCard label="Đang bán" value={summary?.published ?? '—'} />
        <StatCard label="Đang ẩn" value={summary?.unpublished ?? '—'} />
        <StatCard label="Sắp hết hàng" value={summary?.lowStock ?? '—'} hint="Dưới ngưỡng tồn kho" />
      </div>

      <Card className="mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <Input
              label="Tìm kiếm"
              placeholder="Tên hoặc SKU..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (setSearch(searchInput), setPage(1))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-900/80">Danh mục</label>
            <select
              className="rounded-xl border border-brand-200 px-3 py-2 text-sm"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-900/80">Trạng thái</label>
            <select
              className="rounded-xl border border-brand-200 px-3 py-2 text-sm"
              value={publishedFilter}
              onChange={(e) => {
                setPublishedFilter(e.target.value as '' | 'true' | 'false');
                setPage(1);
              }}
            >
              <option value="">Tất cả</option>
              <option value="true">Đang bán</option>
              <option value="false">Đang ẩn</option>
            </select>
          </div>
          <Button variant="secondary" onClick={() => { setSearch(searchInput); setPage(1); }}>
            Lọc
          </Button>
        </div>
      </Card>

      <Card className="overflow-x-auto">
        {isLoading ? (
          <p className="text-sm text-brand-600">Đang tải...</p>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-brand-100 text-left text-brand-700/70">
                    {hg.headers.map((h) => (
                      <th key={h.id} className="pb-2 pr-4 font-medium">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-brand-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-2.5 pr-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {data && data.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-brand-700/70">
                  Trang {data.page} / {data.totalPages} ({data.totalCount} sản phẩm)
                </span>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Trước
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= data.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Thêm sản phẩm"
        footer={
          <ModalActions
            onCancel={() => setShowCreate(false)}
            onConfirm={() => createProduct.mutate()}
            loading={createProduct.isPending}
          />
        }
      >
        {formFields}
        {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}
      </Modal>

      <Modal
        open={!!editId}
        onClose={() => setEditId(null)}
        title="Sửa sản phẩm"
        footer={
          <ModalActions
            onCancel={() => setEditId(null)}
            onConfirm={() => updateProduct.mutate()}
            loading={updateProduct.isPending}
          />
        }
      >
        {formFields}
        {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}
      </Modal>
    </div>
  );
}
