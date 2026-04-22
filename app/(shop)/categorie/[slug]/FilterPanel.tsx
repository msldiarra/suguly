'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import { formatPrice } from '@/lib/format'

const PRICE_MAX = 50000

interface FilterPanelProps {
  activeFilters: {
    sortBy: string
    priceMax: number
  }
}

export function FilterPanel({ activeFilters }: FilterPanelProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [priceMax, setPriceMax] = useState(activeFilters.priceMax)

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      params.delete('page')
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [router, pathname, searchParams]
  )

  const handlePriceChange = (val: number) => {
    setPriceMax(val)
  }

  const handlePriceCommit = (val: number) => {
    updateFilter('maxPrice', val < PRICE_MAX ? String(val) : null)
  }

  return (
    <div className={`bg-white rounded-xl p-5 border border-[#E5E5E5] ${isPending ? 'opacity-60' : ''}`}>
      <h3 className="font-head text-sm font-semibold mb-4">Filtres</h3>

      {/* Sort */}
      <div className="mb-5">
        <p className="text-xs font-medium text-text-light uppercase tracking-wide mb-2.5">Trier par</p>
        {[
          ['default', 'Plus récents'],
          ['price-asc', 'Prix croissant'],
          ['price-desc', 'Prix décroissant'],
        ].map(([val, label]) => (
          <label key={val} className="flex items-center gap-2 mb-2 cursor-pointer text-sm">
            <input
              type="radio"
              name="sort"
              checked={activeFilters.sortBy === val}
              onChange={() => updateFilter('sortBy', val === 'default' ? null : val)}
              className="accent-text"
            />
            {label}
          </label>
        ))}
      </div>

      {/* Price slider */}
      <div>
        <p className="text-xs font-medium text-text-light uppercase tracking-wide mb-2.5">Prix max</p>
        <input
          type="range"
          min={2000}
          max={PRICE_MAX}
          step={500}
          value={priceMax}
          onChange={(e) => handlePriceChange(Number(e.target.value))}
          onMouseUp={(e) => handlePriceCommit(Number((e.target as HTMLInputElement).value))}
          onTouchEnd={(e) => handlePriceCommit(Number((e.target as HTMLInputElement).value))}
          className="w-full accent-text"
          aria-label="Prix maximum"
        />
        <div className="flex justify-between text-xs text-text-light mt-1">
          <span>0 FCFA</span>
          <span className="font-medium text-text">{formatPrice(priceMax)}</span>
        </div>
      </div>
    </div>
  )
}
