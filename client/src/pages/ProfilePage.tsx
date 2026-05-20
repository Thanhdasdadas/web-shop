import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { redirect } from '@tanstack/react-router';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/stores/toastStore';
import type { User } from '@/types';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setPhone(user.phone ?? '');
    }
  }, [user]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      const { data } = await api.put<User>('/auth/profile', { fullName, phone: phone || null });
      return data;
    },
    onSuccess: (data) => {
      setUser(data);
      toast('Đã cập nhật hồ sơ', 'success');
    },
    onError: () => toast('Không thể cập nhật hồ sơ', 'error'),
  });

  const changePassword = useMutation({
    mutationFn: async () =>
      api.post('/auth/change-password', { currentPassword, newPassword }),
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      toast('Đã đổi mật khẩu', 'success');
    },
    onError: () => toast('Mật khẩu hiện tại không đúng', 'error'),
  });

  if (!user) {
    throw redirect({ to: '/dang-nhap' });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Breadcrumb items={[{ label: 'Trang chủ', to: '/' }, { label: 'Tài khoản' }]} />
      <h1 className="text-3xl font-bold text-brand-900">Tài khoản</h1>
      <p className="mt-2 text-sm text-slate-600">{user.email}</p>

      <Card className="mt-8 space-y-4">
        <h2 className="font-semibold text-brand-900">Thông tin cá nhân</h2>
        <Input label="Họ tên" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Input label="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Button onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending}>
          Lưu thay đổi
        </Button>
      </Card>

      <Card className="mt-6 space-y-4">
        <h2 className="font-semibold text-brand-900">Đổi mật khẩu</h2>
        <Input
          label="Mật khẩu hiện tại"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          label="Mật khẩu mới"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Button
          variant="secondary"
          onClick={() => changePassword.mutate()}
          disabled={changePassword.isPending || !currentPassword || newPassword.length < 6}
        >
          Đổi mật khẩu
        </Button>
      </Card>
    </div>
  );
}
