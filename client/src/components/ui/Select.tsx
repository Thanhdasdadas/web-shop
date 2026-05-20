import clsx from 'clsx';
import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Select({ label, error, hint, className, id, children, ...props }: SelectProps) {
  const selectId = id ?? props.name;
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-brand-900/80">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={clsx(
            'w-full appearance-none rounded-xl border border-brand-200 bg-white px-3 py-2.5 pr-10 text-sm text-slate-900 shadow-sm',
            'focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200',
            'disabled:cursor-not-allowed disabled:bg-brand-50 disabled:text-slate-400',
            error && 'border-red-400',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-400" aria-hidden>
          ▾
        </span>
      </div>
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
