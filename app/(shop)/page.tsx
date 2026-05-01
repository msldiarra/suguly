import type { Metadata } from 'next'
import Link from 'next/link'
import { getProducts } from '@/lib/products'
import { ProductCard } from '@/components/product/ProductCard'
import { TrustBanner } from '@/components/ui/TrustBanner'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Suguly — E-commerce Bamako | Livraison rapide, Orange Money',
  description:
    'Achetez électronique, mode, beauté et plus sur Suguly. Livraison rapide à Bamako, paiement Orange Money.',
}

import { CATEGORIES } from '@/lib/categories'

export default async function HomePage() {
  const [nouveautesResult, popularResult] = await Promise.all([
    getProducts({ sortBy: 'newest', limit: 8 }),
    getProducts({ sortBy: 'newest', limit: 4, page: 2 }),
  ])

  const nouveautes = nouveautesResult.products
  const populaires = popularResult.products

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
      {/* Hero Banner */}
      <div className="relative bg-white border border-[#D1D1D1] rounded-2xl px-6 sm:px-14 py-12 sm:py-16 mb-7 overflow-hidden flex items-center justify-between shadow-sm">
        <div className="relative z-10 max-w-xl">
          <span className="inline-block px-3 py-1 bg-[#F7F7F8] border border-[#D1D1D1] rounded-full text-[10px] font-bold text-text mb-4 uppercase tracking-widest">
            Bienvenue sur Suguly
          </span>
          <h1 className="font-head text-3xl sm:text-5xl font-semibold text-text leading-[1.1] mb-5 tracking-tight">
            Vos produits préférés, <br />
            <span className="text-text/90 underline decoration-1 underline-offset-8">livrés chez vous.</span>
          </h1>
          <p className="text-sm sm:text-base text-text-light max-w-md leading-relaxed mb-8">
            Électronique, mode, beauté et plus — paiement Orange Money, livraison rapide à Bamako.
          </p>
          <Link
            href="/categorie/electronique"
            className="inline-block px-7 py-3 bg-text text-white rounded-xl font-medium text-sm hover:bg-black transition-colors"
          >
            Explorer les produits
          </Link>
        </div>
        {/* Decorative subtle element */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#FDF9F4] to-transparent pointer-events-none hidden sm:block" />
      </div>

      {/* Trust banner */}
      <div className="mb-9">
        <TrustBanner />
      </div>

      {/* Category pills */}
      <section className="mb-9">
        <h2 className="font-head text-lg sm:text-xl font-semibold mb-4">Catégories</h2>
        <div className="flex gap-2.5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/categorie/${cat.id}`}
              className="px-4 py-2.5 rounded-full border border-[#D1D1D1] bg-white text-[13px] font-semibold text-text hover:border-text transition-all shadow-sm hover:shadow-md"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Nouveautés */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-head text-lg sm:text-xl font-semibold">Nouveautés</h2>
          <Link href="/catalogue" className="text-text-light font-medium text-sm hover:text-text transition-colors">
            Tout voir →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {nouveautes.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Meilleures ventes */}
      {populaires.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-head text-lg sm:text-xl font-semibold">Meilleures ventes</h2>
            <Link href="/catalogue" className="text-text-light font-medium text-sm hover:text-text transition-colors">
              Tout voir →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {populaires.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Orange Money banner */}
      <div className="bg-black rounded-xl px-6 sm:px-12 py-8 sm:py-10 flex flex-wrap items-center justify-between gap-6 border border-[#333]">
        <div className="max-w-md">
          <p className="font-head font-semibold text-lg sm:text-xl text-white mb-2">
            Paiement Sécurisé Orange Money
          </p>
          <p className="text-xs text-[#999] leading-relaxed">
            Profitez de la simplicité du paiement mobile Orange Money Mali. Paiement sécurisé ou paiement à la livraison selon votre préférence.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-[#222] border border-[#333] px-5 py-3 rounded-xl">
          <div className="w-10 h-10 bg-[#FF6600] rounded-lg flex items-center justify-center shadow-lg">
            <span className="font-bold text-sm text-white">OM</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-semibold text-sm">Orange Money</span>
            <span className="text-[10px] text-[#777] uppercase tracking-widest">Paiement sécurisé</span>
          </div>
        </div>
      </div>
    </div>
  )
}
