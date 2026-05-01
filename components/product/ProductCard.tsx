import Link from 'next/link'
import { formatPrice } from '@/lib/format'
import type { Product } from '@prisma/client'
import { ProductImg } from './ProductImg'
import { Badge } from '../ui/Badge'
import { AddToCartCardButton } from './AddToCartCardButton'

interface ProductCardProps {
  product: Product
  compact?: boolean
  onAddToCart?: (product: Product) => void
}

function getFirstBadge(product: Product): string | null {
  const tags = safeParseJson<string[]>(product.tags) ?? []
  if (tags.includes('Nouveau')) return 'Nouveau'
  if (tags.includes('Populaire')) return 'Populaire'
  return null
}

function safeParseJson<T>(val: string | null): T | null {
  if (!val) return null
  try { return JSON.parse(val) as T } catch { return null }
}

export function ProductCard({ product, compact = false, onAddToCart }: ProductCardProps) {
  const badge = getFirstBadge(product)

  return (
    <Link
      href={`/produit/${product.slug}`}
      className="group bg-white rounded-xl overflow-hidden border border-[#D1D1D1] hover:border-text transition-all duration-300 flex flex-col hover:shadow-md"
    >
      {/* Image area */}
      <div className={`relative bg-white flex items-center justify-center ${compact ? 'p-3' : 'p-4'}`}>
        <ProductImg
          title={product.title}
          category={product.category}
          imageUrl={product.imageUrl}
          size={compact ? 110 : 160}
        />
        {badge && (
          <span className="absolute top-2 left-2">
            <Badge label={badge} />
          </span>
        )}
      </div>

      {/* Info */}
      <div className={`flex flex-col flex-1 gap-1.5 bg-white border-t border-[#D1D1D1] ${compact ? 'p-3 pb-3.5' : 'p-4 pb-5'}`}>
        <p
          className={`text-text font-medium leading-snug line-clamp-2 ${compact ? 'text-xs h-8' : 'text-sm h-10'}`}
        >
          {product.title}
        </p>

        <div className={`flex items-baseline gap-1.5 mt-auto ${compact ? '' : 'mt-1.5'}`}>
          <span
            className={`font-semibold text-text ${compact ? 'text-sm' : 'text-[15px]'}`}
          >
            {formatPrice(product.price)}
          </span>
        </div>

        <AddToCartCardButton product={product} onAddToCart={onAddToCart} />
      </div>
    </Link>
  )
}
