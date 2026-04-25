'use client'

import { useCallback, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function HeaderSearchBar() {
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
