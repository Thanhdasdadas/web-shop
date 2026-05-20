import { Button } from '@/components/ui/Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-brand-900/20 backdrop-blur-sm"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-brand-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold text-brand-900">{title}</h2>
          <button type="button" onClick={onClose} className="text-brand-400 hover:text-brand-700">
            ✕
          </button>
        </div>
        {children}
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function ModalActions({
  onCancel,
  onConfirm,
  confirmLabel = 'Lưu',
  loading,
  danger,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  loading?: boolean;
  danger?: boolean;
}) {
  return (
    <>
      <Button variant="secondary" onClick={onCancel}>
        Hủy
      </Button>
      <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} disabled={loading}>
        {loading ? 'Đang xử lý...' : confirmLabel}
      </Button>
    </>
  );
}
