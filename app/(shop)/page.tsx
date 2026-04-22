import type { Metadata } from 'next'
import Link from 'next/link'
import { getProducts } from '@/lib/products'
import { ProductCard } from '@/components/product/ProductCard'
import { TrustBanner } from '@/components/ui/TrustBanner'

export const metadata: Metadata = {
  title: 'Suguly — E-commerce Bamako | Livraison rapide, Orange Money',
  description:
    'Achetez électronique, mode, beauté et plus sur Suguly. Livraison rapide à Bamako, paiement Orange Money.',
}

const CATEGORIES = [
  { id: 'electronique', label: 'Électronique' },
  { id: 'mode', label: 'Mode & Accessoires' },
  { id: 'maison', label: 'Maison & Déco' },
  { id: 'beaute', label: 'Beauté & Soins' },
  { id: 'divers', label: 'Divers' },
]

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
      <div className="relative bg-primary rounded-2xl px-6 sm:px-14 py-8 sm:py-12 mb-7 overflow-hidden flex items-center justify-between">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            background:
              'repeating-linear-gradient(120deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px)',
          }}
        />
        <div className="relative z-10 max-w-lg">
          <span className="inline-block px-3.5 py-1 bg-white rounded-full text-xs font-extrabold text-primary mb-3.5 shadow-sm">
            Bienvenue sur Suguly
          </span>
          <h1 className="font-head text-2xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight mb-3.5">
            Vos produits préférés,<br />livrés chez vous.
          </h1>
          <p className="text-sm sm:text-base text-white/85 max-w-sm leading-relaxed mb-6">
            Électronique, mode, beauté et plus — paiement Orange Money, livraison rapide à Bamako.
          </p>
          <Link
            href="/categorie/electronique"
            className="inline-block px-7 py-3 bg-white text-primary rounded-full font-extrabold text-sm shadow-lg hover:scale-105 transition-transform"
          >
            Explorer les produits →
          </Link>
        </div>
        {/* Decorative circles */}
        <svg
          className="absolute opacity-[0.07] hidden sm:block"
          style={{ right: -10, bottom: -30 }}
          width="280"
          height="280"
          viewBox="0 0 280 280"
        >
          <circle cx="140" cy="140" r="130" fill="none" stroke="#fff" strokeWidth="1.5" />
          <circle cx="140" cy="140" r="90" fill="none" stroke="#fff" strokeWidth="1.5" />
          <circle cx="140" cy="140" r="50" fill="none" stroke="#fff" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Trust banner */}
      <div className="mb-9">
        <TrustBanner />
      </div>

      {/* Category pills */}
      <section className="mb-9">
        <h2 className="font-head text-lg sm:text-2xl font-extrabold mb-4">Catégories</h2>
        <div className="flex gap-2.5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/categorie/${cat.id}`}
              className="px-4 py-2.5 rounded-full border-2 border-bg-card bg-white text-sm font-semibold text-text hover:border-primary hover:text-primary transition-colors"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Nouveautés */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-head text-lg sm:text-2xl font-extrabold">Nouveautés</h2>
          <Link href="/catalogue" className="text-primary font-bold text-sm hover:underline">
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
            <h2 className="font-head text-lg sm:text-2xl font-extrabold">Meilleures ventes</h2>
            <Link href="/catalogue" className="text-primary font-bold text-sm hover:underline">
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
      <div className="bg-text rounded-2xl px-6 sm:px-12 py-6 sm:py-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-head font-extrabold text-lg sm:text-2xl text-white mb-1">
            Paiement Orange Money
          </p>
          <p className="text-sm text-gray-400">Prépaiement ou paiement à la livraison. Simple et sécurisé.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FF6600] rounded-xl flex items-center justify-center">
            <span className="font-black text-xl text-white">OM</span>
          </div>
          <span className="text-white font-bold text-base">Orange Money Mali</span>
        </div>
      </div>
    </div>
  )
}
