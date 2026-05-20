import clsx from 'clsx';

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('rounded-2xl border border-brand-100 bg-white p-5 shadow-sm shadow-brand-100/50', className)}>
      {children}
    </div>
  );
}
