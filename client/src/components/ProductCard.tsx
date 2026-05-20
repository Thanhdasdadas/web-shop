import { Link } from '@tanstack/react-router';
import type { Product } from '@/types';
import { formatCurrency } from '@/lib/format';
import { Card } from '@/components/ui/Card';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to="/san-pham/$slug" params={{ slug: product.slug }}>
      <Card className="group overflow-hidden transition hover:border-brand-300 hover:shadow-md">
        <div className="aspect-square overflow-hidden rounded-lg bg-slate-100">
          <img
            src={product.images[0] ?? 'https://picsum.photos/400'}
            alt={product.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        </div>
        <h3 className="mt-3 font-semibold text-slate-900 line-clamp-2">{product.name}</h3>
        <p className="mt-1 text-lg font-bold text-brand-700">{formatCurrency(product.price)}</p>
        {product.stock !== undefined && product.stock <= 5 && (
          <p className="mt-1 text-xs text-amber-600">Chỉ còn {product.stock} sản phẩm</p>
        )}
      </Card>
    </Link>
  );
}
