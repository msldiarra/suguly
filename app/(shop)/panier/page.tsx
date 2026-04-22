'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { CartItem } from '@/lib/cart'
import { calcSubtotal, updateQuantity, removeFromCart } from '@/lib/cart'
import { formatPrice } from '@/lib/format'
import { ProductImg } from '@/components/product/ProductImg'

export default function PanierPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const raw = localStorage.getItem('suguly_cart')
    setCart(raw ? JSON.parse(raw) : [])
    setMounted(true)
  }, [])

  const syncCart = (newCart: CartItem[]) => {
    setCart(newCart)
    localStorage.setItem('suguly_cart', JSON.stringify(newCart))
    window.dispatchEvent(new Event('cart-updated'))
  }

  if (!mounted) return null

  if (cart.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-20 px-4 text-center">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" className="mx-auto mb-4">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        <h2 className="font-head text-2xl font-extrabold mb-2">Votre panier est vide</h2>
        <p className="text-sm text-text-light mb-6">Parcourez nos produits pour commencer vos achats.</p>
        <Link
          href="/"
          className="inline-block px-7 py-3 bg-primary text-white rounded-xl font-extrabold text-sm hover:bg-primary-dark transition-colors"
        >
          Découvrir les produits
        </Link>
      </div>
    )
  }

  const subtotal = calcSubtotal(cart)

  return (
    <div className="max-w-screen-lg mx-auto px-4 sm:px-8 py-6 sm:py-8">
      <h1 className="font-head text-xl sm:text-3xl font-extrabold mb-6">
        Mon panier ({cart.length} article{cart.length > 1 ? 's' : ''})
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Items list */}
        <div className="flex-1 space-y-3">
          {cart.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-4 flex gap-3.5 shadow-sm">
              <Link href={`/produit/${item.slug}`} className="flex-shrink-0">
                <ProductImg title={item.title} category={item.category} imageUrl={item.imageUrl} size={72} />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/produit/${item.slug}`} className="block text-sm font-semibold text-text leading-snug mb-1.5 hover:text-primary transition-colors">
                  {item.title}
                </Link>
                <p className="font-head font-extrabold text-primary text-sm mb-2.5">{formatPrice(item.price)}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border-2 border-bg-card rounded-lg overflow-hidden">
                    <button
                      onClick={() => syncCart(updateQuantity(cart, item.id, item.quantity - 1))}
                      className="px-2.5 py-1.5 bg-white font-bold text-text hover:bg-bg"
                      aria-label="Diminuer"
                    >
                      −
                    </button>
                    <span className="px-3 py-1.5 font-bold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => syncCart(updateQuantity(cart, item.id, item.quantity + 1))}
                      className="px-2.5 py-1.5 bg-white font-bold text-primary hover:bg-bg"
                      aria-label="Augmenter"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => syncCart(removeFromCart(cart, item.id))}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}

          <Link href="/" className="inline-block text-primary font-bold text-sm hover:underline mt-2">
            ← Continuer mes achats
          </Link>
        </div>

        {/* Summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
            <h3 className="font-head font-extrabold text-base mb-4">Récapitulatif</h3>
            <div className="flex justify-between text-sm mb-2.5">
              <span className="text-text-light">Sous-total</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm mb-4">
              <span className="text-text-light">Livraison</span>
              <span className="text-xs text-text-light font-semibold">Calculé à l&apos;étape suivante</span>
            </div>
            <div className="border-t border-bg-card pt-3.5 flex justify-between mb-5">
              <span className="font-extrabold text-base">Estimation</span>
              <span className="font-head font-black text-lg text-primary">{formatPrice(subtotal)}</span>
            </div>
            <button
              onClick={() => router.push('/checkout')}
              className="w-full py-3.5 bg-primary text-white rounded-xl font-extrabold text-sm hover:bg-primary-dark transition-colors"
            >
              Passer la commande →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
