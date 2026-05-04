'use client'

import { useState } from 'react'
import type { Product } from '@prisma/client'

interface AddToCartCardButtonProps {
  product: Product
  className?: string
  onAddToCart?: (product: Product) => void
}

export function AddToCartCardButton({
  product,
  className = '',
  onAddToCart,
}: AddToCartCardButtonProps) {
  const [added, setAdded] = useState(false)

  function handleAdd(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()

    if (onAddToCart) {
      onAddToCart(product)
    } else {
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
    window.setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      onClick={handleAdd}
      aria-label={`Ajouter ${product.title} au panier`}
      className={[
        'mt-3 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95',
        added ? 'bg-accent text-white shadow-sm' : 'bg-primary text-white hover:bg-primary-dark shadow-md',
        className,
      ].join(' ')}
    >
      {added ? '✓ Ajouté' : 'Ajouter'}
    </button>
  )
}
