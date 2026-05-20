import { StaticPageLayout } from './StaticPageLayout';

export function AboutPage() {
  return (
    <StaticPageLayout title="Về chúng tôi">
      <p>
        <strong>Glow Beauty</strong> là cửa hàng mỹ phẩm trực tuyến demo cho đồ án WebShop, xây dựng
        với React, ASP.NET Core 8 và MongoDB.
      </p>
      <p className="mt-4">
        Chúng tôi tập trung vào sản phẩm chăm sóc da và trang điểm chính hãng, giao hàng nhanh và
        hỗ trợ thanh toán khi nhận hàng (COD).
      </p>
    </StaticPageLayout>
  );
}
