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
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { toast } from '@/stores/toastStore';

export function RegisterPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '' });
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const finishAuth = async (data: AuthResponse) => {
    setAuth(data.user, data.accessToken, data.refreshToken, rememberMe);
    await mergeGuestCart();
    qc.invalidateQueries({ queryKey: ['cart'] });
    navigate({ to: '/' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', form);
      await finishAuth(data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (idToken: string) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post<AuthResponse>('/auth/google', { idToken, rememberMe });
      await finishAuth(data);
      toast('Đăng ký / đăng nhập Google thành công', 'success');
    } catch {
      setError('Google Sign-In thất bại');
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
          <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-800">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-brand-300"
            />
            Ghi nhớ đăng nhập
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-100" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500">hoặc</span>
          </div>
        </div>

        <GoogleSignInButton onSuccess={handleGoogle} disabled={loading} />

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
