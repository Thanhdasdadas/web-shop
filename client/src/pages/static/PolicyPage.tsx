import { StaticPageLayout } from './StaticPageLayout';

export function PolicyPage() {
  return (
    <StaticPageLayout title="Chính sách mua hàng">
      <h2 className="text-lg font-semibold text-brand-900">Giao hàng</h2>
      <p className="mt-2">Giao trong 2–5 ngày làm việc tại nội thành (demo).</p>
      <h2 className="mt-6 text-lg font-semibold text-brand-900">Đổi trả</h2>
      <p className="mt-2">
        Sản phẩm lỗi hoặc không đúng mô tả được đổi trong 7 ngày kể từ khi nhận (còn nguyên tem,
        hộp).
      </p>
      <h2 className="mt-6 text-lg font-semibold text-brand-900">Thanh toán</h2>
      <p className="mt-2">Thanh toán tiền mặt (COD) khi shipper giao hàng thành công.</p>
    </StaticPageLayout>
  );
}
