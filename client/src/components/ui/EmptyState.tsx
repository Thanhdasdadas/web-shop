import type { ReactNode } from 'react';

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: string;
};

export function EmptyState({ title, description, action, icon = '📦' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 px-6 py-16 text-center">
      <span className="text-4xl" aria-hidden>
        {icon}
      </span>
      <h3 className="mt-4 text-lg font-semibold text-brand-900">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-brand-700/70">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
