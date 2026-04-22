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
    } else {
      // Default behavior if no prop provided
      const raw = localStorage.getItem('suguly_cart')
      const cart = raw ? JSON.parse(raw) : []
      const existing = cart.find((i: { id: number }) => i.id === product.id)
      
      if (existing) {
        existing.quantity = Math.min(existing.quantity + 1, 10)
      } else {
        cart.push({
          id: product.id,
          title: product.title,
          price: product.price,
          imageUrl: product.imageUrl,
          slug: product.slug,
          category: product.category,
          quantity: 1,
        })
      }
      localStorage.setItem('suguly_cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('cart-updated'))
    }
    
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

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

        <button
          onClick={handleAdd}
          aria-label={`Ajouter ${product.title} au panier`}
          className={`mt-3 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            added ? 'bg-black text-white' : 'bg-white text-text border border-[#D1D1D1] hover:bg-[#F7F7F8] hover:border-text shadow-sm'
          }`}
        >
          {added ? '✓ Ajouté' : 'Ajouter'}
        </button>
      </div>
    </Link>
  )
}
