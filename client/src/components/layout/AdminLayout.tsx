import { Link, Outlet, useRouterState } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import clsx from 'clsx';

const nav = [
  { to: '/admin', label: 'Tổng quan', exact: true },
  { to: '/admin/san-pham', label: 'Mỹ phẩm' },
  { to: '/admin/danh-muc', label: 'Danh mục' },
  { to: '/admin/kho', label: 'Kho hàng' },
  { to: '/admin/don-hang', label: 'Đơn hàng' },
  { to: '/admin/nguoi-dung', label: 'Tài khoản', adminOnly: true },
];

export function AdminLayout() {
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-brand-50">
      <aside className="flex w-64 shrink-0 flex-col border-r border-brand-200 bg-brand-100/60">
        <div className="border-b border-brand-200 p-5">
          <Link to="/" className="text-lg font-bold text-brand-800">
            Glow Beauty
          </Link>
          <p className="text-xs text-brand-600/80">Quản trị cửa hàng</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav
            .filter((n) => !n.adminOnly || isAdmin())
            .map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={clsx(
                    'block rounded-xl px-3 py-2.5 text-sm font-medium transition',
                    active ? 'bg-brand-500 text-white shadow-sm' : 'text-brand-800 hover:bg-brand-200/60'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
        </nav>
        <div className="border-t border-brand-200 p-3">
          <Link to="/" className="mb-2 block text-sm text-brand-700 hover:text-brand-900">
            ← Về cửa hàng
          </Link>
          <button type="button" onClick={logout} className="text-sm text-brand-600 hover:text-red-600">
            Đăng xuất
          </button>
        </div>
      </aside>
      <div className="flex-1 overflow-auto p-6 md:p-8">
        <Outlet />
      </div>
    </div>
  );
}
