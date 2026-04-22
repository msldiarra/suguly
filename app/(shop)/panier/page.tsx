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
      <div className="max-w-lg mx-auto py-24 px-4 text-center">
        <div className="w-16 h-16 bg-[#F7F7F8] border border-[#E5E5E5] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <h2 className="font-head text-2xl font-semibold mb-2 text-text">Votre panier est vide</h2>
        <p className="text-sm text-text-light mb-8 max-w-[280px] mx-auto">Parcourez nos produits pour commencer à composer votre sélection.</p>
        <Link
          href="/"
          className="inline-block px-8 py-3.5 bg-text text-white rounded-xl font-medium text-sm hover:bg-black transition-colors"
        >
          Découvrir les produits
        </Link>
      </div>
    )
  }

  const subtotal = calcSubtotal(cart)

  return (
    <div className="max-w-screen-lg mx-auto px-4 sm:px-8 py-6 sm:py-10">
      <h1 className="font-head text-2xl sm:text-3xl font-semibold mb-8 flex items-baseline gap-3">
        Mon panier
        <span className="text-text-light font-normal text-base sm:text-lg">({cart.length})</span>
      </h1>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Items list */}
        <div className="flex-1 space-y-3">
          {cart.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-4 flex gap-3.5 shadow-sm relative group">
              <Link href={`/produit/${item.slug}`} className="flex-shrink-0">
                <ProductImg title={item.title} category={item.category} imageUrl={item.imageUrl} size={72} />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/produit/${item.slug}`} className="block text-sm font-medium text-text leading-snug mb-1.5 hover:opacity-70 transition-opacity">
                  {item.title}
                </Link>
                <p className="font-head font-semibold text-text text-sm mb-3">{formatPrice(item.price)}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-[#E5E5E5] rounded-lg overflow-hidden">
                    <button
                      onClick={() => syncCart(updateQuantity(cart, item.id, item.quantity - 1))}
                      className="px-2.5 py-1.5 bg-white text-text hover:bg-[#F7F7F8] transition-colors"
                      aria-label="Diminuer"
                    >
                      −
                    </button>
                    <span className="px-3 py-1.5 font-medium text-xs border-x border-[#E5E5E5]">{item.quantity}</span>
                    <button
                      onClick={() => syncCart(updateQuantity(cart, item.id, item.quantity + 1))}
                      className="px-2.5 py-1.5 bg-white text-text hover:bg-[#F7F7F8] transition-colors"
                      aria-label="Augmenter"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => syncCart(removeFromCart(cart, item.id))}
                    className="py-1.5 px-3 rounded-lg text-[10px] font-bold text-text-light border border-[#D1D1D1] hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all uppercase tracking-wider"
                  >
                    Retirer
                  </button>
                </div>
              </div>
            </div>
          ))}

          <Link href="/" className="inline-block text-text-light font-medium text-xs hover:text-text transition-colors mt-4">
            ← Continuer mes achats
          </Link>
        </div>

        {/* Summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-xl p-6 border border-[#E5E5E5] shadow-sm sticky top-24">
            <h3 className="font-head font-semibold text-base mb-6">Récapitulatif</h3>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-text-light">Sous-total</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm mb-5">
              <span className="text-text-light">Livraison</span>
              <span className="text-[10px] text-text-light uppercase tracking-tight font-medium">Étape suivante</span>
            </div>
            <div className="border-t border-[#E5E5E5] pt-5 flex justify-between mb-8">
              <span className="font-semibold text-base">Total</span>
              <span className="font-head font-semibold text-xl text-text">{formatPrice(subtotal)}</span>
            </div>
            <button
              onClick={() => router.push('/checkout')}
              className="w-full py-4 bg-text text-white rounded-xl font-medium text-sm hover:bg-black transition-colors"
            >
              Passer la commande
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
