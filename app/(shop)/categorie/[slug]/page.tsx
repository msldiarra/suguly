import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getProducts } from '@/lib/products'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { FilterPanel } from './FilterPanel'
import { ActiveFilterChips } from './ActiveFilterChips'

import { getCategoryLabel, CATEGORIES } from '@/lib/categories'

const CATEGORY_META: Record<string, { description: string }> = {
  electronique: {
    description: 'Écouteurs, chargeurs, montres connectées et plus. Livraison à Bamako.',
  },
  electromenager: {
    description: 'Mixeurs, fers à repasser, ventilateurs. Équipement pour la maison.',
  },
  maison: {
    description: "Lampes, coussins, organisateurs pour votre maison. Livraison à Bamako.",
  },
  mode: {
    description: 'Vêtements, sacs, chaussures et accessoires de mode. Livraison à Bamako.',
  },
  beaute: {
    description: 'Crèmes, huiles, maquillage adapté aux carnations africaines. Livraison Bamako.',
  },
  enfant: {
    description: 'Jouets, tricycles, accessoires pour bébés et enfants.',
  },
  divers: {
    description: 'Multiprises, sacs à dos, calculatrices et plus. Livraison à Bamako.',
  },
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sortBy?: string; maxPrice?: string; q?: string; page?: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const meta = CATEGORY_META[slug]
  if (!meta) return {}
  const label = getCategoryLabel(slug)
  return {
    title: label,
    description: meta.description,
    openGraph: { title: `${label} | Suguly`, description: meta.description },
  }
}

export async function generateStaticParams() {
  return Object.keys(CATEGORY_META).map((slug) => ({ slug }))
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const sp = await searchParams
  const meta = CATEGORY_META[slug]
  if (!meta) notFound()
  const label = getCategoryLabel(slug)

  const sortBy = (sp.sortBy ?? 'default') as 'default' | 'price-asc' | 'price-desc' | 'newest'
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined
  const page = sp.page ? Number(sp.page) : 1

  const result = await getProducts({
    category: slug,
    sortBy,
    maxPrice,
    search: sp.q,
    page,
  })

  const activeFilters = {
    sortBy: sp.sortBy ?? 'default',
    priceMax: maxPrice ?? 50000,
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label },
        ]}
      />

      <div className="flex gap-7">
        {/* Sidebar filters — desktop */}
        <aside className="hidden lg:block w-52 flex-shrink-0">
          <Suspense fallback={<div className="bg-white rounded-xl h-64 animate-pulse" />}>
            <FilterPanel activeFilters={activeFilters} />
          </Suspense>
        </aside>

        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h1 className="font-head text-xl sm:text-2xl font-extrabold">{label}</h1>
              <p className="text-sm text-text-light">
                {result.total} résultat{result.total !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Active filter chips */}
          <Suspense fallback={null}>
            <ActiveFilterChips />
          </Suspense>

          {/* Mobile filters drawer */}
          <div className="lg:hidden mb-4">
            <Suspense fallback={null}>
              <FilterPanel activeFilters={activeFilters} />
            </Suspense>
          </div>

          <ProductGrid products={result.products} columns={3} />

          {/* Pagination */}
          {result.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`?${new URLSearchParams({ ...sp, page: String(p) }).toString()}`}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold border transition-colors ${
                    p === page
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-text border-bg-card hover:border-primary'
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
