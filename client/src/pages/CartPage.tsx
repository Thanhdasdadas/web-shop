import { Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Cart } from '@/types';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';

export function CartPage() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => (await api.get<Cart>('/cart')).data,
  });

  const updateQty = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      api.patch(`/cart/items/${productId}`, { quantity }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });

  const removeItem = useMutation({
    mutationFn: (productId: string) => api.delete(`/cart/items/${productId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });

  if (isLoading) return <p className="py-20 text-center text-brand-600">Đang tải giỏ hàng...</p>;

  if (!cart?.items.length) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl">🛍️</div>
        <p className="text-lg font-medium text-brand-900">Giỏ hàng trống</p>
        <p className="mt-2 text-slate-500">Khám phá mỹ phẩm và thêm vào giỏ nhé!</p>
        <Link to="/san-pham" className="mt-6 inline-block">
          <Button size="lg">Tiếp tục mua sắm</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold text-brand-900">Giỏ hàng</h1>
      <p className="mt-1 text-sm text-brand-700/70">{cart.items.length} sản phẩm</p>

      <div className="mt-8 space-y-4">
        {cart.items.map((item) => (
          <Card key={item.productId} className="flex flex-col gap-4 border-brand-100 sm:flex-row sm:items-center">
            <img
              src={item.image ?? 'https://picsum.photos/100'}
              alt=""
              className="h-28 w-full rounded-xl object-cover sm:h-24 sm:w-24"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-900">{item.productName}</h3>
              <p className="mt-1 font-medium text-brand-700">{formatCurrency(item.price)}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-200 text-lg hover:bg-brand-50"
                  onClick={() => updateQty.mutate({ productId: item.productId, quantity: item.quantity - 1 })}
                >
                  −
                </button>
                <span className="min-w-[2rem] text-center font-medium">{item.quantity}</span>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-200 text-lg hover:bg-brand-50 disabled:opacity-40"
                  onClick={() => updateQty.mutate({ productId: item.productId, quantity: item.quantity + 1 })}
                  disabled={item.quantity >= item.stockAvailable}
                >
                  +
                </button>
                <button
                  type="button"
                  className="ml-auto text-sm text-red-500 hover:text-red-700"
                  onClick={() => removeItem.mutate(item.productId)}
                >
                  Xóa
                </button>
              </div>
            </div>
            <p className="text-right text-lg font-bold text-brand-800 sm:pl-4">
              {formatCurrency(item.price * item.quantity)}
            </p>
          </Card>
        ))}
      </div>

      <Card className="mt-8 border-brand-200 bg-gradient-to-br from-white to-brand-50/40">
        <div className="flex justify-between text-lg">
          <span className="font-medium text-slate-700">Tạm tính</span>
          <span className="font-bold text-brand-800">{formatCurrency(cart.subtotal)}</span>
        </div>
        <p className="mt-2 text-sm text-slate-500">Phí vận chuyển 30.000đ — tính khi thanh toán</p>
        {user ? (
          <Link to="/thanh-toan" className="mt-5 block">
            <Button className="w-full" size="lg">
              Thanh toán COD
            </Button>
          </Link>
        ) : (
          <Link to="/dang-nhap" className="mt-5 block">
            <Button className="w-full" size="lg">
              Đăng nhập để thanh toán
            </Button>
          </Link>
        )}
      </Card>
    </div>
  );
}
