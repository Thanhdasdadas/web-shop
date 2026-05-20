import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import api from '@/lib/api';
import type { AuthResponse } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { mergeGuestCart } from '@/lib/cartMerge';

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
      setAuth(data.user, data.accessToken, data.refreshToken);
      await mergeGuestCart();
      if (data.user.role === 'Staff' || data.user.role === 'Admin') navigate({ to: '/admin' });
      else navigate({ to: '/' });
    } catch {
      setError('Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <h1 className="text-2xl font-bold">Đăng nhập</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Mật khẩu" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Chưa có tài khoản?{' '}
          <Link to="/dang-ky" className="text-brand-600 hover:underline">
            Đăng ký
          </Link>
        </p>
        <p className="mt-4 rounded-lg bg-brand-50 p-3 text-xs text-brand-700/80">
          <span className="font-medium text-brand-800">Admin dev:</span> admin@webshop.vn / Admin@123
        </p>
      </Card>
    </div>
  );
}
