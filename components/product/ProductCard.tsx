'use client'

import Link from 'next/link'
import { useState } from 'react'
import { formatPrice } from '@/lib/format'
import type { Product } from '@prisma/client'
import { ProductImg } from './ProductImg'
import { Badge } from '../ui/Badge'

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
  const [added, setAdded] = useState(false)
  const badge = getFirstBadge(product)

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (onAddToCart) {
      onAddToCart(product)
      setAdded(true)
      setTimeout(() => setAdded(false), 1500)
    }
  }

  return (
    <Link
      href={`/produit/${product.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-bg-card hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
    >
      {/* Image area */}
      <div className={`relative bg-bg-card flex items-center justify-center ${compact ? 'p-3' : 'p-4'}`}>
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
      <div className={`flex flex-col flex-1 gap-1.5 ${compact ? 'p-2.5 pb-3' : 'p-3.5 pb-4'}`}>
        <p
          className={`text-text font-semibold leading-snug line-clamp-2 ${compact ? 'text-xs' : 'text-sm'}`}
        >
          {product.title}
        </p>

        <div className={`flex items-baseline gap-1.5 mt-auto ${compact ? '' : 'mt-1'}`}>
          <span
            className={`font-head font-extrabold text-primary ${compact ? 'text-sm' : 'text-base'}`}
          >
            {formatPrice(product.price)}
          </span>
        </div>

        {onAddToCart && (
          <button
            onClick={handleAdd}
            aria-label={`Ajouter ${product.title} au panier`}
            className={`mt-1 py-1.5 px-2.5 rounded-lg text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 ${
              added ? 'bg-emerald-600' : 'bg-primary hover:bg-primary-dark'
            }`}
          >
            {added ? '✓ Ajouté !' : '+ Panier'}
          </button>
        )}
      </div>
    </Link>
  )
}
