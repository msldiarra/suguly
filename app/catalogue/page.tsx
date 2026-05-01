import type { Metadata } from 'next'
import Link from 'next/link'
import { getProducts } from '@/lib/products'
import { ProductGrid } from '@/components/product/ProductGrid'

interface CataloguePageProps {
  searchParams: Promise<{ q?: string; sortBy?: string; minPrice?: string; maxPrice?: string; page?: string }>
}

export async function generateMetadata({ searchParams }: CataloguePageProps): Promise<Metadata> {
  const params = await searchParams
  const query = params.q
  return {
    title: query ? `Résultats pour "${query}"` : 'Catalogue',
    description: query
      ? `Recherche "${query}" sur Suguly. Livraison rapide à Bamako, paiement Orange Money.`
      : 'Parcourez tout le catalogue Suguly. Électronique, mode, beauté, maison.',
  }
}

export default async function CataloguePage({ searchParams }: CataloguePageProps) {
  const params = await searchParams
  const { q, sortBy, minPrice, maxPrice, page } = params

  const result = await getProducts({
    search: q,
    sortBy: sortBy as 'default' | 'price-asc' | 'price-desc' | 'newest' | undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    page: page ? Number(page) : 1,
  })

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
      <div className="mb-5">
        {q && (
          <p className="text-sm text-text-light mb-2">
            {result.total} résultat{result.total !== 1 ? 's' : ''} pour «{' '}
            <strong className="text-text">{q}</strong> »
          </p>
        )}
        <h1 className="font-head text-xl sm:text-3xl font-extrabold">
          {q ? `Résultats pour "${q}"` : 'Tous les produits'}
        </h1>
      </div>

      <ProductGrid products={result.products} columns={4} />

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-3">
          <Link
            href={{
              query: { ...params, page: Math.max(1, result.page - 1) }
            }}
            className={[
              'px-4 py-2 rounded-xl border border-[#D1D1D1] text-sm font-semibold transition-all',
              result.page <= 1 ? 'opacity-30 pointer-events-none' : 'hover:bg-[#F7F7F8]'
            ].join(' ')}
          >
            ← Précédent
          </Link>
          <span className="text-xs font-bold text-text-light uppercase tracking-widest">
            Page {result.page} sur {result.totalPages}
          </span>
          <Link
            href={{
              query: { ...params, page: Math.min(result.totalPages, result.page + 1) }
            }}
            className={[
              'px-4 py-2 rounded-xl border border-[#D1D1D1] text-sm font-semibold transition-all',
              result.page >= result.totalPages ? 'opacity-30 pointer-events-none' : 'hover:bg-[#F7F7F8]'
            ].join(' ')}
          >
            Suivant →
          </Link>
        </div>
      )}

      {result.total === 0 && q && (
        <div className="text-center py-8 text-text-light">
          <p className="text-sm">Aucun résultat pour cette recherche.</p>
          <p className="text-sm mt-1">
            Essayez de chercher par catégorie :{' '}
            <a href="/categorie/electronique" className="text-primary font-semibold hover:underline">
              Électronique
            </a>
            ,{' '}
            <a href="/categorie/mode" className="text-primary font-semibold hover:underline">
              Mode
            </a>
            …
          </p>
        </div>
      )}
    </div>
  )
}
