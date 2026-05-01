'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface HeaderActionsProps {
  initialCartCount?: number
}

export function HeaderActions({ initialCartCount = 0 }: HeaderActionsProps) {
  const [cartCount, setCartCount] = useState(initialCartCount)

  useEffect(() => {
    const updateCount = () => {
      const cart = localStorage.getItem('suguly_cart')
      if (!cart) {
        setCartCount(0)
        return
      }

      try {
        const items = JSON.parse(cart)
        const count = items.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 1), 0)
        setCartCount(count)
      } catch {
        setCartCount(0)
      }
    }

    updateCount()
    window.addEventListener('cart-updated', updateCount)
    return () => window.removeEventListener('cart-updated', updateCount)
  }, [])

  return (
    <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
      <Link href="/compte" aria-label="Mon compte" className="text-text-light hover:text-text p-2 transition-colors">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
      </Link>
      <Link href="/panier" aria-label={`Panier (${cartCount} articles)`} className="relative text-text-light hover:text-text p-2 transition-colors">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        {cartCount > 0 && (
          <span className="absolute top-1 right-1 bg-text text-white rounded-full text-[9px] font-medium min-w-[15px] h-[15px] flex items-center justify-center px-1 border border-white">
            {cartCount}
          </span>
        )}
      </Link>
    </div>
  )
}
