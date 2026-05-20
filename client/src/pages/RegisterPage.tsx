import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import api from '@/lib/api';
import type { AuthResponse } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { mergeGuestCart } from '@/lib/cartMerge';
import { useQueryClient } from '@tanstack/react-query';

export function RegisterPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', form);
      setAuth(data.user, data.accessToken, data.refreshToken);
      await mergeGuestCart();
      qc.invalidateQueries({ queryKey: ['cart'] });
      navigate({ to: '/' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <h1 className="text-2xl font-bold">Đăng ký</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label="Họ tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Mật khẩu" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Đã có tài khoản?{' '}
          <Link to="/dang-nhap" className="text-brand-600 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </Card>
    </div>
  );
}
