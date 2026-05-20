import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-xl font-medium transition disabled:opacity-50',
        {
          'bg-brand-500 text-white shadow-sm hover:bg-brand-600': variant === 'primary',
          'bg-white border border-brand-200 text-brand-800 hover:bg-brand-50': variant === 'secondary',
          'bg-red-500 text-white hover:bg-red-600': variant === 'danger',
          'text-brand-700 hover:bg-brand-100': variant === 'ghost',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
