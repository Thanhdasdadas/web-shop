import { useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import type { Cart, Order } from '@/types';
import { formatCurrency } from '@/lib/format';
import { getApiErrorMessage } from '@/lib/errors';
import { mergeGuestCart } from '@/lib/cartMerge';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { AddressSelects } from '@/components/address/AddressSelects';

const schema = z.object({
  fullName: z.string().min(1, 'Bắt buộc'),
  phone: z.string().min(9, 'Số điện thoại không hợp lệ').max(15),
  addressLine: z.string().min(1, 'Bắt buộc'),
  ward: z.string().optional(),
  district: z.string().min(1, 'Chọn quận/huyện'),
  city: z.string().min(1, 'Chọn tỉnh/thành phố'),
  note: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const SHIPPING_FEE = 30000;

export function CheckoutPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => (await api.get<Cart>('/cart')).data,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: user?.fullName ?? '',
      phone: user?.phone ?? '',
      city: '',
      district: '',
      ward: '',
      addressLine: '',
      note: '',
    },
  });

  const city = watch('city');
  const district = watch('district');
  const ward = watch('ward');

  useEffect(() => {
    mergeGuestCart().then(() => qc.invalidateQueries({ queryKey: ['cart'] }));
  }, [qc]);

  useEffect(() => {
    if (user?.fullName) setValue('fullName', user.fullName);
    if (user?.phone) setValue('phone', user.phone);
  }, [user, setValue]);

  const createOrder = useMutation({
    mutationFn: async (data: FormData) =>
      (
        await api.post<Order>('/orders', {
          shippingAddress: {
            fullName: data.fullName.trim(),
            phone: data.phone.trim(),
            addressLine: data.addressLine.trim(),
            ward: data.ward?.trim() || null,
            district: data.district.trim(),
            city: data.city.trim(),
          },
          note: data.note?.trim() || null,
        })
      ).data,
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ['cart'] });
      navigate({ to: '/don-hang/$id', params: { id: order.id } });
    },
  });

  if (cartLoading) {
    return <p className="py-20 text-center text-brand-700">Đang tải giỏ hàng...</p>;
  }

  if (!cart?.items.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-lg text-slate-600">Giỏ hàng trống, chưa thể đặt hàng.</p>
        <Link to="/san-pham" className="mt-6 inline-block">
          <Button>Mua sắm ngay</Button>
        </Link>
      </div>
    );
  }

  const total = cart.subtotal + SHIPPING_FEE;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-900">Thanh toán COD</h1>
        <p className="mt-2 text-brand-700/80">Thanh toán tiền mặt khi nhận hàng — an tâm, không trả trước</p>
      </div>

      <form
        onSubmit={handleSubmit(
          (d) => createOrder.mutate(d),
          () => window.scrollTo({ top: 0, behavior: 'smooth' })
        )}
        className="grid gap-8 lg:grid-cols-5"
      >
        <Card className="lg:col-span-3 border-brand-100">
          <h2 className="text-lg font-semibold text-brand-900">Địa chỉ giao hàng</h2>
          <div className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Họ tên người nhận" {...register('fullName')} error={errors.fullName?.message} />
              <Input label="Số điện thoại" {...register('phone')} error={errors.phone?.message} />
            </div>
            <Input
              label="Số nhà, tên đường"
              placeholder="VD: 123 Nguyễn Huệ"
              {...register('addressLine')}
              error={errors.addressLine?.message}
            />
            <AddressSelects setValue={setValue} errors={errors} values={{ city, district, ward: ward ?? '' }} />
            <Input label="Ghi chú đơn hàng (tuỳ chọn)" {...register('note')} />
          </div>
        </Card>

        <Card className="lg:col-span-2 h-fit border-brand-200 bg-gradient-to-b from-white to-brand-50/50">
          <h2 className="text-lg font-semibold text-brand-900">Đơn hàng của bạn</h2>
          <ul className="mt-4 max-h-48 space-y-3 overflow-y-auto text-sm">
            {cart.items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-2 border-b border-brand-50 pb-2">
                <span className="text-slate-700">
                  {i.productName} <span className="text-slate-400">×{i.quantity}</span>
                </span>
                <span className="shrink-0 font-medium">{formatCurrency(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-brand-100 pt-4 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Tạm tính</span>
              <span>{formatCurrency(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Phí vận chuyển</span>
              <span>{formatCurrency(SHIPPING_FEE)}</span>
            </div>
            <div className="flex justify-between border-t border-brand-100 pt-3 text-lg font-bold text-brand-800">
              <span>Tổng thanh toán</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          {(errors.city || errors.district || errors.fullName || errors.phone || errors.addressLine) && (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Vui lòng điền đủ thông tin và chọn Tỉnh, Quận trước khi đặt hàng.
            </p>
          )}
          <Button type="submit" className="mt-6 w-full" size="lg" disabled={createOrder.isPending}>
            {createOrder.isPending ? 'Đang đặt hàng...' : 'Xác nhận đặt hàng COD'}
          </Button>
          {createOrder.isError && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {getApiErrorMessage(createOrder.error, 'Không thể đặt hàng. Vui lòng thử lại.')}
            </p>
          )}
          <Link to="/gio-hang" className="mt-3 block text-center text-sm text-brand-600 hover:underline">
            ← Quay lại giỏ hàng
          </Link>
        </Card>
      </form>
    </div>
  );
}
