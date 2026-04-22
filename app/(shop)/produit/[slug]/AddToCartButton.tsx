'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Product } from '@prisma/client'

interface AddToCartButtonProps {
  product: Product
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const router = useRouter()

  function handleAdd() {
    const raw = localStorage.getItem('suguly_cart')
    const cart = raw ? JSON.parse(raw) : []
    const existing = cart.find((i: { id: number }) => i.id === product.id)
    if (existing) {
      existing.quantity = Math.min(existing.quantity + qty, 10)
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        imageUrl: product.imageUrl,
        slug: product.slug,
        category: product.category,
        quantity: qty,
      })
    }
    localStorage.setItem('suguly_cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  function handleBuyNow() {
    handleAdd()
    router.push('/checkout')
  }

  return (
    <div className="space-y-4">
      {/* Quantity selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-text-light">Quantité</span>
        <div className="flex items-center border border-[#E5E5E5] rounded-lg overflow-hidden">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3 py-2 bg-white text-text-light text-sm hover:bg-[#F7F7F8] transition-colors"
            aria-label="Diminuer quantité"
          >
            −
          </button>
          <span className="px-4 py-2 font-medium text-sm min-w-[40px] text-center border-x border-[#E5E5E5]">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(10, q + 1))}
            className="px-3 py-2 bg-white text-text-light text-sm hover:bg-[#F7F7F8] transition-colors"
            aria-label="Augmenter quantité"
          >
            +
          </button>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <button
          onClick={handleAdd}
          className={`flex-1 py-3 px-6 rounded-xl font-medium text-sm text-white transition-colors ${
            added ? 'bg-emerald-600' : 'bg-text hover:bg-black'
          }`}
        >
          {added ? '✓ Ajouté au panier' : 'Ajouter au panier'}
        </button>
        <button
          onClick={handleBuyNow}
          className="flex-1 py-3 px-6 rounded-xl font-medium text-sm text-text bg-white border border-[#E5E5E5] hover:border-[#D1D1D1] hover:bg-[#F7F7F8] transition-colors"
        >
          Acheter maintenant
        </button>
      </div>
    </div>
  )
}
