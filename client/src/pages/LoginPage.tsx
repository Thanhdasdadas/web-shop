import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import api from '@/lib/api';
import type { AuthResponse } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { mergeGuestCart } from '@/lib/cartMerge';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { toast } from '@/stores/toastStore';

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const finishLogin = async (data: AuthResponse, remember: boolean) => {
    setAuth(data.user, data.accessToken, data.refreshToken, remember);
    await mergeGuestCart();
    if (data.user.role === 'Staff' || data.user.role === 'Admin') navigate({ to: '/admin' });
    else navigate({ to: '/' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password, rememberMe });
      await finishLogin(data, rememberMe);
    } catch {
      setError('Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (idToken: string) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post<AuthResponse>('/auth/google', { idToken, rememberMe });
      await finishLogin(data, rememberMe);
      toast('Đăng nhập Google thành công', 'success');
    } catch {
      setError('Đăng nhập Google thất bại. Kiểm tra GOOGLE_CLIENT_ID trên server.');
      toast('Đăng nhập Google thất bại', 'error');
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
          <Input
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-800">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-brand-300 text-brand-600"
            />
            Ghi nhớ đăng nhập (30 ngày)
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
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
          Chưa có tài khoản?{' '}
          <Link to="/dang-ky" className="text-brand-600 hover:underline">
            Đăng ký
          </Link>
        </p>
        <p className="mt-4 rounded-lg bg-brand-50 p-3 text-xs text-brand-700/80">
          <span className="font-medium text-brand-800">Admin:</span> dùng email/mật khẩu trong{' '}
          <code className="text-brand-900">.env</code>. Google Sign-In cần{' '}
          <code className="text-brand-900">GOOGLE_CLIENT_ID</code> +{' '}
          <code className="text-brand-900">VITE_GOOGLE_CLIENT_ID</code>.
        </p>
      </Card>
    </div>
  );
}
