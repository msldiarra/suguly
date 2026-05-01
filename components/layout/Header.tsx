import { Suspense } from 'react'
import { Logo } from './Logo'
import { HeaderActions } from './HeaderActions'
import { HeaderSearchBar } from './HeaderSearchBar'
import { HeaderCategoryNav } from './HeaderCategoryNav'

interface HeaderProps {
  initialCartCount?: number
}

export function Header({ initialCartCount = 0 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#D1D1D1]">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8">
        <div className="py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-5">
          <Logo size="md" />

          <div className="hidden sm:block flex-1 max-w-md mx-auto">
            <Suspense fallback={<div className="h-10 bg-[#F7F7F8] rounded-xl animate-pulse" />}>
              <HeaderSearchBar />
            </Suspense>
          </div>

          <HeaderActions initialCartCount={initialCartCount} />
        </div>

        <div className="sm:hidden pb-3">
          <Suspense fallback={<div className="h-10 bg-[#F7F7F8] rounded-xl animate-pulse" />}>
            <HeaderSearchBar />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={null}>
        <HeaderCategoryNav />
      </Suspense>
    </header>
  )
}
