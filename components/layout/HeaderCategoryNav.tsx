'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CATEGORIES } from '@/lib/categories'

export function HeaderCategoryNav() {
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
                  ? 'text-primary border-primary'
                  : 'text-text-light border-transparent hover:text-primary'
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
