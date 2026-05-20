import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post<{ message: string; resetToken?: string }>('/auth/forgot-password', { email });
      setResetToken(data.resetToken ?? null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <h1 className="text-2xl font-bold">Quên mật khẩu</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" className="w-full" disabled={loading}>
            Gửi yêu cầu
          </Button>
        </form>
        {resetToken && (
          <div className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
            <p className="font-medium">Token dev (dùng trên trang đặt lại mật khẩu):</p>
            <code className="mt-1 block break-all">{resetToken}</code>
            <Link to="/dat-lai-mat-khau" search={{ token: resetToken }} className="mt-2 inline-block text-brand-600 underline">
              Đặt lại mật khẩu →
            </Link>
          </div>
        )}
        <p className="mt-4 text-center text-sm">
          <Link to="/dang-nhap" className="text-brand-600 hover:underline">
            ← Đăng nhập
          </Link>
        </p>
      </Card>
    </div>
  );
}
