import { StaticPageLayout } from './StaticPageLayout';

const faqs = [
  {
    q: 'Làm sao để đặt hàng?',
    a: 'Chọn sản phẩm → Thêm vào giỏ → Đăng nhập → Thanh toán và điền địa chỉ giao hàng.',
  },
  {
    q: 'Có thanh toán online không?',
    a: 'Hiện tại hỗ trợ COD (trả tiền khi nhận hàng). VNPay sẽ được bổ sung ở giai đoạn sau.',
  },
  {
    q: 'Tôi có cần tài khoản không?',
    a: 'Bạn có thể xem sản phẩm và thêm giỏ không cần đăng nhập; khi thanh toán cần đăng nhập để tạo đơn.',
  },
  {
    q: 'Làm sao theo dõi đơn hàng?',
    a: 'Vào mục Đơn hàng sau khi đăng nhập để xem trạng thái đơn của bạn.',
  },
];

export function FaqPage() {
  return (
    <StaticPageLayout title="Câu hỏi thường gặp">
      <ul className="space-y-6">
        {faqs.map((f) => (
          <li key={f.q}>
            <h2 className="font-semibold text-brand-900">{f.q}</h2>
            <p className="mt-2">{f.a}</p>
          </li>
        ))}
      </ul>
    </StaticPageLayout>
  );
}
