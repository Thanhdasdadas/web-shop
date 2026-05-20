import type { ReactNode } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';

type Props = { title: string; children: ReactNode };

export function StaticPageLayout({ title, children }: Props) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumb items={[{ label: 'Trang chủ', to: '/' }, { label: title }]} />
      <h1 className="text-3xl font-bold text-brand-900">{title}</h1>
      <div className="prose prose-brand mt-8 max-w-none text-slate-700">{children}</div>
    </div>
  );
}
