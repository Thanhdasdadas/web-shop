import { useState } from 'react';
import { Link, Outlet } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Cart } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { StoreFooter } from '@/components/layout/StoreFooter';

const navLinks = [
  { to: '/san-pham' as const, label: 'Mỹ phẩm' },
  { to: '/ve-chung-toi' as const, label: 'Về chúng tôi' },
];

export function StoreLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isStaffOrAdmin = useAuthStore((s) => s.isStaffOrAdmin);

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => (await api.get<Cart>('/cart')).data,
  });

  const cartCount = cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-brand-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
          <Link to="/" className="text-xl font-bold text-brand-700">
            Glow Beauty
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-brand-600">
                {l.label}
              </Link>
            ))}
            {user && (
              <>
                <Link to="/don-hang" className="hover:text-brand-600">
                  Đơn hàng
                </Link>
                <Link to="/tai-khoan" className="hover:text-brand-600">
                  Tài khoản
                </Link>
                <Link to="/yeu-thich" className="hover:text-brand-600">
                  Yêu thích
                </Link>
              </>
            )}
            {isStaffOrAdmin() && (
              <Link to="/admin" className="hover:text-brand-600">
                Quản trị
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/gio-hang" className="relative rounded-lg p-2 hover:bg-brand-50" aria-label="Giỏ hàng">
              <span className="text-lg">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <>
                <span className="hidden max-w-[120px] truncate text-sm text-slate-600 lg:inline">
                  {user.fullName}
                </span>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={logout}>
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Link to="/dang-nhap" className="hidden sm:block">
                  <Button variant="ghost" size="sm">
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/dang-ky" className="hidden sm:block">
                  <Button size="sm">Đăng ký</Button>
                </Link>
              </>
            )}
            <button
              type="button"
              className="rounded-lg p-2 text-slate-600 hover:bg-brand-50 md:hidden"
              aria-label="Menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="border-t border-brand-100 bg-white px-4 py-4 md:hidden">
            <ul className="space-y-3 text-sm font-medium text-slate-700">
              {navLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} onClick={() => setMenuOpen(false)}>
                    {l.label}
                  </Link>
                </li>
              ))}
              {user && (
                <>
                  <li>
                    <Link to="/don-hang" onClick={() => setMenuOpen(false)}>
                      Đơn hàng
                    </Link>
                  </li>
                  <li>
                    <Link to="/tai-khoan" onClick={() => setMenuOpen(false)}>
                      Tài khoản
                    </Link>
                  </li>
                  <li>
                    <Link to="/yeu-thich" onClick={() => setMenuOpen(false)}>
                      Yêu thích
                    </Link>
                  </li>
                </>
              )}
              {isStaffOrAdmin() && (
                <li>
                  <Link to="/admin" onClick={() => setMenuOpen(false)}>
                    Quản trị
                  </Link>
                </li>
              )}
              {!user && (
                <>
                  <li>
                    <Link to="/dang-nhap" onClick={() => setMenuOpen(false)}>
                      Đăng nhập
                    </Link>
                  </li>
                  <li>
                    <Link to="/dang-ky" onClick={() => setMenuOpen(false)}>
                      Đăng ký
                    </Link>
                  </li>
                </>
              )}
              {user && (
                <li>
                  <button type="button" className="text-left text-red-600" onClick={() => { logout(); setMenuOpen(false); }}>
                    Đăng xuất
                  </button>
                </li>
              )}
            </ul>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <StoreFooter />

      {cartCount > 0 && (
        <Link
          to="/gio-hang"
          className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-brand-700 md:hidden"
        >
          🛒 Giỏ hàng ({cartCount})
        </Link>
      )}
    </div>
  );
}

