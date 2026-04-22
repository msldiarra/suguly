'use client'

import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useCallback, Suspense, useEffect } from 'react'
import { Logo } from './Logo'

import { CATEGORIES } from '@/lib/categories'

interface HeaderProps {
  initialCartCount?: number
}

function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [focused, setFocused] = useState(false)

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (query.trim()) {
        router.push(`/catalogue?q=${encodeURIComponent(query.trim())}`)
      } else {
        router.push('/catalogue')
      }
    },
    [query, router]
  )

  return (
    <form onSubmit={handleSearch} className="flex-1">
      <div
        className={`flex items-center bg-[#F7F7F8] rounded-xl gap-2 px-3 border transition-colors ${
          focused ? 'border-primary bg-white shadow-sm' : 'border-transparent hover:bg-[#F0F0F1]'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Rechercher un produit..."
          aria-label="Rechercher un produit"
          className="flex-1 bg-transparent border-none py-2.5 text-sm text-text outline-none placeholder:text-[#888]"
        />
      </div>
    </form>
  )
}

function CategoryNav() {
  const pathname = usePathname()

  return (
    <div className="border-t border-bg-card overflow-x-auto scrollbar-none">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 flex gap-1 sm:gap-2">
        {CATEGORIES.map((cat) => {
          const active = pathname === `/categorie/${cat.id}`
          return (
            <Link
              key={cat.id}
              href={`/categorie/${cat.id}`}
              className={`py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                active
                  ? 'text-text border-text'
                  : 'text-text-light border-transparent hover:text-text'
              }`}
            >
              {cat.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function Header({ initialCartCount = 0 }: HeaderProps) {
  const [cartCount, setCartCount] = useState(initialCartCount)

  useEffect(() => {
    const updateCount = () => {
      const cart = localStorage.getItem('suguly_cart')
      if (cart) {
        try {
          const items = JSON.parse(cart)
          const count = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0)
          setCartCount(count)
        } catch (e) {
          setCartCount(0)
        }
      } else {
        setCartCount(0)
      }
    }

    updateCount()
    window.addEventListener('cart-updated', updateCount)
    return () => window.removeEventListener('cart-updated', updateCount)
  }, [])
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#D1D1D1]">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8">
        {/* Top bar: Logo & Icons */}
        <div className="py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-5">
          <Logo size="md" />

          {/* Desktop Search */}
          <div className="hidden sm:block flex-1 max-w-md mx-auto">
            <Suspense fallback={<div className="h-10 bg-[#F7F7F8] rounded-xl animate-pulse" />}>
              <SearchBar />
            </Suspense>
          </div>

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
        </div>

        {/* Mobile Search: second row */}
        <div className="sm:hidden pb-3">
          <Suspense fallback={<div className="h-10 bg-[#F7F7F8] rounded-xl animate-pulse" />}>
            <SearchBar />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={null}>
        <CategoryNav />
      </Suspense>
    </header>
  )
}
