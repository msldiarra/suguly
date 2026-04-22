'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { formatPrice } from '@/lib/format'

const SORT_LABELS: Record<string, string> = {
  'price-asc': 'Prix croissant',
  'price-desc': 'Prix décroissant',
}

export function ActiveFilterChips() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const chips: { label: string; removeKey: string }[] = []

  const sortBy = searchParams.get('sortBy')
  if (sortBy && SORT_LABELS[sortBy]) chips.push({ label: SORT_LABELS[sortBy], removeKey: 'sortBy' })

  const maxPrice = searchParams.get('maxPrice')
  if (maxPrice) chips.push({ label: `Max ${formatPrice(Number(maxPrice))}`, removeKey: 'maxPrice' })

  const q = searchParams.get('q')
  if (q) chips.push({ label: `"${q}"`, removeKey: 'q' })

  if (chips.length === 0) return null

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(key)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip) => (
        <button
          key={chip.removeKey}
          onClick={() => removeFilter(chip.removeKey)}
          className="flex items-center gap-1.5 px-3 py-1 bg-primary-light text-primary rounded-full text-xs font-semibold hover:bg-primary hover:text-white transition-colors"
        >
          {chip.label}
          <span aria-hidden>×</span>
        </button>
      ))}
    </div>
  )
}
