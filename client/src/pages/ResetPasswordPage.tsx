import { useState } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { toast } from '@/stores/toastStore';

export function ResetPasswordPage() {
  const search = useSearch({ strict: false }) as { token?: string };
  const [token, setToken] = useState(search.token ?? '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      toast('Đã đổi mật khẩu', 'success');
    } catch {
      toast('Token không hợp lệ hoặc đã hết hạn', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <h1 className="text-2xl font-bold">Đặt lại mật khẩu</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Input label="Token" value={token} onChange={(e) => setToken(e.target.value)} required />
          <Input label="Mật khẩu mới" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" className="w-full" disabled={loading}>
            Cập nhật
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link to="/dang-nhap" className="text-brand-600 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </Card>
    </div>
  );
}
