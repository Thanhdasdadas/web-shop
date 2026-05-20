import { Link, Outlet } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Cart } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';

export function StoreLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isStaffOrAdmin = useAuthStore((s) => s.isStaffOrAdmin);

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => (await api.get<Cart>('/cart')).data,
  });

  const cartCount = cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-brand-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
          <Link to="/" className="text-xl font-bold text-brand-700">
            Glow Beauty
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <Link to="/san-pham" className="hover:text-brand-600">
              Mỹ phẩm
            </Link>
            {user && (
              <Link to="/don-hang" className="hover:text-brand-600">
                Đơn hàng
              </Link>
            )}
            {isStaffOrAdmin() && (
              <Link to="/admin" className="hover:text-brand-600">
                Quản trị
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/gio-hang" className="relative rounded-lg p-2 hover:bg-brand-50">
              <span className="text-lg">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <>
                <span className="hidden text-sm text-slate-600 sm:inline">Xin chào, {user.fullName}</span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Link to="/dang-nhap">
                  <Button variant="ghost" size="sm">
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/dang-ky">
                  <Button size="sm">Đăng ký</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-brand-100 bg-white py-8 text-center text-sm text-slate-500">
        © 2026 Glow Beauty — Mỹ phẩm chính hãng · Thanh toán COD khi nhận hàng
      </footer>
    </div>
  );
}
