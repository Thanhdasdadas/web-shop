import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import type { Product } from '@/types';
import { formatCurrency } from '@/lib/format';
import { Card } from '@/components/ui/Card';

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
    >
      <Link to="/san-pham/$slug" params={{ slug: product.slug }}>
        <Card className="group overflow-hidden transition-shadow hover:border-brand-300 hover:shadow-lg">
          <motion.div
            className="aspect-square overflow-hidden rounded-lg bg-slate-100"
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          >
            <img
              src={product.images[0] ?? 'https://picsum.photos/400'}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </motion.div>
          <h3 className="mt-3 line-clamp-2 font-semibold text-slate-900">{product.name}</h3>
          <p className="mt-1 text-lg font-bold text-brand-700">{formatCurrency(product.price)}</p>
          {product.stock !== undefined && product.stock <= 5 && (
            <p className="mt-1 text-xs text-amber-600">Chỉ còn {product.stock} sản phẩm</p>
          )}
        </Card>
      </Link>
    </motion.div>
  );
}
