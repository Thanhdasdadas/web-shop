import { Link } from '@tanstack/react-router';

export type BreadcrumbItem = { label: string; to?: string };

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-brand-700/80">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-brand-300">/</span>}
            {item.to ? (
              <Link to={item.to} className="hover:text-brand-600 hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-brand-900">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
