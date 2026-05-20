import clsx from 'clsx';
import { useToastStore } from '@/stores/toastStore';

const styles: Record<string, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  info: 'border-brand-200 bg-white text-brand-900',
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={clsx(
            'pointer-events-auto min-w-[240px] max-w-sm rounded-xl border px-4 py-3 text-sm shadow-lg',
            styles[t.type]
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <span>{t.message}</span>
            <button
              type="button"
              className="opacity-60 hover:opacity-100"
              onClick={() => dismiss(t.id)}
              aria-label="Đóng"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
