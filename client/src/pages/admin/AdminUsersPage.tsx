import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import api from '@/lib/api';
import type { AdminUser, PagedResult, UserAdminSummary, UserRole } from '@/types';
import { roleLabels } from '@/lib/labels';
import { formatDate } from '@/lib/format';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatCard } from '@/components/admin/StatCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Modal, ModalActions } from '@/components/admin/Modal';

const col = createColumnHelper<AdminUser>();

const emptyCreate = {
  email: '',
  password: '',
  fullName: '',
  phone: '',
  role: 'Staff' as UserRole,
};

export function AdminUsersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [activeFilter, setActiveFilter] = useState<'' | 'true' | 'false'>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [editForm, setEditForm] = useState({ fullName: '', phone: '', role: 'Staff' as UserRole });
  const [newPassword, setNewPassword] = useState('');
  const [formError, setFormError] = useState('');

  const queryKey = ['admin-users', page, search, roleFilter, activeFilter];

  const { data: summary } = useQuery({
    queryKey: ['admin-users-summary'],
    queryFn: async () => (await api.get<UserAdminSummary>('/admin/users/summary')).data,
  });

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () =>
      (
        await api.get<PagedResult<AdminUser>>('/admin/users', {
          params: {
            page,
            pageSize: 15,
            search: search || undefined,
            role: roleFilter || undefined,
            isActive: activeFilter === '' ? undefined : activeFilter === 'true',
          },
        })
      ).data,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-users'] });
    qc.invalidateQueries({ queryKey: ['admin-users-summary'] });
  };

  const createUser = useMutation({
    mutationFn: () => api.post('/admin/users', createForm),
    onSuccess: () => {
      invalidate();
      setCreateOpen(false);
      setCreateForm(emptyCreate);
      setFormError('');
    },
    onError: () => setFormError('Không thể tạo tài khoản. Kiểm tra email đã tồn tại.'),
  });

  const updateUser = useMutation({
    mutationFn: () => api.put(`/admin/users/${editUser!.id}`, editForm),
    onSuccess: () => {
      invalidate();
      setEditUser(null);
      setFormError('');
    },
    onError: () => setFormError('Không thể cập nhật tài khoản.'),
  });

  const resetPassword = useMutation({
    mutationFn: () => api.patch(`/admin/users/${resetUser!.id}/password`, { newPassword }),
    onSuccess: () => {
      setResetUser(null);
      setNewPassword('');
      setFormError('');
    },
    onError: () => setFormError('Không thể đặt lại mật khẩu.'),
  });

  const updateActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/admin/users/${id}/active`, { isActive }),
    onSuccess: invalidate,
    onError: () => alert('Không thể đổi trạng thái (có thể là admin cuối cùng hoặc tài khoản của bạn).'),
  });

  const openEdit = (user: AdminUser) => {
    setFormError('');
    setEditUser(user);
    setEditForm({ fullName: user.fullName, phone: user.phone ?? '', role: user.role });
  };

  const columns = [
    col.accessor('email', { header: 'Email' }),
    col.accessor('fullName', { header: 'Họ tên' }),
    col.accessor('phone', { header: 'SĐT', cell: (i) => i.getValue() ?? '—' }),
    col.accessor('role', { header: 'Vai trò', cell: (i) => roleLabels[i.getValue()] }),
    col.accessor('isActive', {
      header: 'Trạng thái',
      cell: ({ row }) => (
        <button
          type="button"
          className={`text-sm font-medium ${row.original.isActive ? 'text-emerald-600' : 'text-red-500'}`}
          onClick={() => updateActive.mutate({ id: row.original.id, isActive: !row.original.isActive })}
        >
          {row.original.isActive ? 'Hoạt động' : 'Đã khóa'}
        </button>
      ),
    }),
    col.accessor('createdAt', { header: 'Ngày tạo', cell: (i) => formatDate(i.getValue()) }),
    col.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(row.original)}>
            Sửa
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setFormError(''); setResetUser(row.original); }}>
            Mật khẩu
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({ data: data?.items ?? [], columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div>
      <AdminPageHeader
        title="Quản lý tài khoản"
        description="Tạo và quản lý admin, nhân viên và khách hàng"
        action={<Button onClick={() => { setFormError(''); setCreateOpen(true); }}>+ Tài khoản mới</Button>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Tổng" value={summary?.total ?? '—'} />
        <StatCard label="Khách hàng" value={summary?.customers ?? '—'} />
        <StatCard label="Nhân viên" value={summary?.staff ?? '—'} />
        <StatCard label="Admin" value={summary?.admins ?? '—'} />
        <StatCard label="Đã khóa" value={summary?.inactive ?? '—'} />
      </div>

      <Card className="mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <Input
              label="Tìm kiếm"
              placeholder="Email hoặc tên..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (setSearch(searchInput), setPage(1))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-900/80">Vai trò</label>
            <select
              className="rounded-xl border border-brand-200 px-3 py-2 text-sm"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value as UserRole | ''); setPage(1); }}
            >
              <option value="">Tất cả</option>
              {(['Customer', 'Staff', 'Admin'] as UserRole[]).map((r) => (
                <option key={r} value={r}>{roleLabels[r]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-900/80">Trạng thái</label>
            <select
              className="rounded-xl border border-brand-200 px-3 py-2 text-sm"
              value={activeFilter}
              onChange={(e) => { setActiveFilter(e.target.value as '' | 'true' | 'false'); setPage(1); }}
            >
              <option value="">Tất cả</option>
              <option value="true">Hoạt động</option>
              <option value="false">Đã khóa</option>
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
                  Trang {data.page} / {data.totalPages} ({data.totalCount} tài khoản)
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
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Tạo tài khoản"
        footer={
          <ModalActions
            onCancel={() => setCreateOpen(false)}
            onConfirm={() => createUser.mutate()}
            loading={createUser.isPending}
          />
        }
      >
        <div className="space-y-3">
          <Input label="Email" type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
          <Input label="Mật khẩu" type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} />
          <Input label="Họ tên" value={createForm.fullName} onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })} />
          <Input label="SĐT" value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} />
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-900/80">Vai trò</label>
            <select
              className="w-full rounded-xl border border-brand-200 px-3 py-2 text-sm"
              value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as UserRole })}
            >
              {(['Customer', 'Staff', 'Admin'] as UserRole[]).map((r) => (
                <option key={r} value={r}>{roleLabels[r]}</option>
              ))}
            </select>
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
        </div>
      </Modal>

      <Modal
        open={!!editUser}
        onClose={() => setEditUser(null)}
        title="Sửa tài khoản"
        footer={
          <ModalActions
            onCancel={() => setEditUser(null)}
            onConfirm={() => updateUser.mutate()}
            loading={updateUser.isPending}
          />
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-brand-700/70">{editUser?.email}</p>
          <Input label="Họ tên" value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} />
          <Input label="SĐT" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-900/80">Vai trò</label>
            <select
              className="w-full rounded-xl border border-brand-200 px-3 py-2 text-sm"
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
            >
              {(['Customer', 'Staff', 'Admin'] as UserRole[]).map((r) => (
                <option key={r} value={r}>{roleLabels[r]}</option>
              ))}
            </select>
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
        </div>
      </Modal>

      <Modal
        open={!!resetUser}
        onClose={() => setResetUser(null)}
        title="Đặt lại mật khẩu"
        footer={
          <ModalActions
            onCancel={() => setResetUser(null)}
            onConfirm={() => resetPassword.mutate()}
            loading={resetPassword.isPending}
            confirmLabel="Đặt lại"
          />
        }
      >
        <p className="mb-3 text-sm text-brand-700/70">{resetUser?.email}</p>
        <Input label="Mật khẩu mới" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        {formError && <p className="mt-2 text-sm text-red-600">{formError}</p>}
      </Modal>
    </div>
  );
}
