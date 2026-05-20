import { Link } from '@tanstack/react-router';

export function StoreFooter() {
  return (
    <footer className="border-t border-brand-100 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-bold text-brand-700">Glow Beauty</p>
          <p className="mt-2 text-sm text-slate-600">
            Mỹ phẩm chính hãng — chăm sóc da, trang điểm và làm đẹp mỗi ngày.
          </p>
        </div>
        <div>
          <p className="font-semibold text-brand-900">Mua sắm</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              <Link to="/san-pham" className="hover:text-brand-600">
                Tất cả sản phẩm
              </Link>
            </li>
            <li>
              <Link to="/gio-hang" className="hover:text-brand-600">
                Giỏ hàng
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-brand-900">Hỗ trợ</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              <Link to="/ve-chung-toi" className="hover:text-brand-600">
                Về chúng tôi
              </Link>
            </li>
            <li>
              <Link to="/cau-hoi-thuong-gap" className="hover:text-brand-600">
                Câu hỏi thường gặp
              </Link>
            </li>
            <li>
              <Link to="/chinh-sach" className="hover:text-brand-600">
                Chính sách mua hàng
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-brand-900">Liên hệ</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>Hotline: 1900 1234</li>
            <li>Email: hello@glowbeauty.vn</li>
            <li>Thanh toán COD khi nhận hàng</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-50 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Glow Beauty. Đồ án WebShop — MongoDB + React + ASP.NET Core.
      </div>
    </footer>
  );
}
