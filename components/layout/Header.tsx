'use client'

import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useCallback, Suspense } from 'react'
import { Logo } from './Logo'

const CATEGORIES = [
  { id: 'electronique', label: 'Électronique' },
  { id: 'mode', label: 'Mode & Accessoires' },
  { id: 'maison', label: 'Maison & Déco' },
  { id: 'beaute', label: 'Beauté & Soins' },
  { id: 'divers', label: 'Divers' },
]

interface HeaderProps {
  cartCount?: number
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
        className={`flex items-center bg-bg rounded-xl gap-2 px-3 border-2 transition-colors ${
          focused ? 'border-primary' : 'border-transparent'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-light-rgb, #7a6f66)" strokeWidth="2.5" strokeLinecap="round">
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
          className="flex-1 bg-transparent border-none py-2.5 text-sm text-text outline-none placeholder:text-text-light"
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
              className={`py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                active
                  ? 'text-primary border-primary'
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

export function Header({ cartCount = 0 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-3 flex items-center gap-3 sm:gap-5">
        <Logo size="md" />

        <Suspense fallback={<div className="flex-1" />}>
          <SearchBar />
        </Suspense>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <Link href="/compte" aria-label="Mon compte" className="text-text-light hover:text-text p-1.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
          <Link href="/panier" aria-label={`Panier (${cartCount} articles)`} className="relative text-text p-1.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-white rounded-full text-[10px] font-extrabold min-w-4 h-4 flex items-center justify-center px-1">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <Suspense fallback={null}>
        <CategoryNav />
      </Suspense>
    </header>
  )
}
