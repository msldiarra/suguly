import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductBySlug, getSimilarProducts } from '@/lib/products'
import { formatPrice } from '@/lib/format'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Badge } from '@/components/ui/Badge'
import { ProductImg } from '@/components/product/ProductImg'
import { ProductCard } from '@/components/product/ProductCard'
import { AddToCartButton } from './AddToCartButton'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

function safeParseJson<T>(val: string | null): T | null {
  if (!val) return null
  try { return JSON.parse(val) as T } catch { return null }
}

function getCategoryLabel(slug: string | null): string {
  const map: Record<string, string> = {
    electronique: 'Électronique',
    mode: 'Mode & Accessoires',
    maison: 'Maison & Déco',
    beaute: 'Beauté & Soins',
    divers: 'Divers',
  }
  return map[slug ?? ''] ?? slug ?? ''
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}

  const keywords = safeParseJson<string[]>(product.seoKeywords) ?? []
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://suguly.com'

  return {
    title: product.title,
    description: product.metaDescription ?? product.description ?? undefined,
    keywords,
    openGraph: {
      title: product.title,
      description: product.metaDescription ?? product.description ?? '',
      url: `${siteUrl}/produit/${slug}`,
      images: product.imageUrl ? [{ url: product.imageUrl }] : [],
    },
    other: {
      'product:price:amount': String(product.price),
      'product:price:currency': product.currency,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const similar = await getSimilarProducts(product.category, product.slug)
  const colors = safeParseJson<string[]>(product.colors) ?? []
  const features = safeParseJson<string[]>(product.features) ?? []
  const materials = safeParseJson<string[]>(product.materials) ?? []
  const tags = safeParseJson<string[]>(product.tags) ?? []
  const badge = tags.find((t) => t === 'Nouveau' || t === 'Populaire') ?? null
  const catLabel = getCategoryLabel(product.category)

  // JSON-LD structured data (Schema.org Product)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description ?? product.metaDescription ?? '',
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Suguly' },
    },
    image: product.imageUrl ?? undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <Breadcrumb
          items={[
            { label: 'Accueil', href: '/' },
            { label: catLabel, href: `/categorie/${product.category}` },
            { label: product.title },
          ]}
        />

        {/* Product layout */}
        <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 mb-12">
          {/* Image */}
          <div className="lg:w-[420px] flex-shrink-0">
            <div className="bg-bg-card rounded-2xl p-6 flex items-center justify-center">
              <ProductImg
                title={product.title}
                category={product.category}
                imageUrl={product.imageUrl}
                size={300}
                priority
              />
            </div>
          </div>

          {/* Info panel */}
          <div className="flex-1 min-w-0">
            {badge && <div className="mb-2"><Badge label={badge} /></div>}
            <h1 className="font-head text-2xl sm:text-3xl font-extrabold text-text leading-tight mb-3">
              {product.title}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-2.5 my-4">
              <span className="font-head text-3xl sm:text-4xl font-black text-primary">
                {formatPrice(product.price)}
              </span>
            </div>

            {/* Meta chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product.brand && (
                <span className="px-2.5 py-1 bg-bg-card rounded-lg text-xs font-semibold text-text-light">
                  Marque : {product.brand}
                </span>
              )}
              {materials.length > 0 && (
                <span className="px-2.5 py-1 bg-bg-card rounded-lg text-xs font-semibold text-text-light">
                  Matière : {materials.join(', ')}
                </span>
              )}
            </div>

            {/* Colors */}
            {colors.length > 0 && (
              <div className="flex items-center gap-2 mb-5">
                <span className="text-sm font-semibold text-text-light">Coloris :</span>
                {colors.map((c, i) => (
                  <div
                    key={i}
                    style={{ background: c }}
                    className="w-6 h-6 rounded-full border-2 border-bg-card hover:scale-110 transition-transform cursor-pointer"
                    title={c}
                  />
                ))}
              </div>
            )}

            <AddToCartButton product={product} />

            {/* Delivery info */}
            <div className="mt-4 bg-primary-light rounded-xl p-3.5 flex gap-2.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-dark)" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
              </svg>
              <div>
                <p className="text-sm font-bold text-primary-dark mb-0.5">Livraison à Bamako</p>
                <p className="text-xs text-primary-dark/80">Standard 1 500 FCFA · Express 3 000 FCFA · Délai 24–48h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Description / Features */}
        <ProductTabs
          description={product.description}
          features={features}
          materials={materials}
          brand={product.brand}
          catLabel={catLabel}
        />

        {/* Similar products */}
        {similar.length > 0 && (
          <section className="mt-12">
            <h2 className="font-head text-xl sm:text-2xl font-extrabold mb-4">Produits similaires</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {similar.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}

// Server-rendered tabs (no interactivity needed for content)
function ProductTabs({
  description,
  features,
  materials,
  brand,
  catLabel,
}: {
  description: string | null
  features: string[]
  materials: string[]
  brand: string | null
  catLabel: string
}) {
  return (
    <div>
      <div className="border-b-2 border-bg-card mb-5 flex gap-1">
        <span className="py-2.5 px-5 text-sm font-bold text-primary border-b-2 border-primary -mb-0.5">
          Description
        </span>
        {features.length > 0 && (
          <span className="py-2.5 px-5 text-sm font-bold text-text-light">Caractéristiques</span>
        )}
      </div>

      {description && (
        <p className="text-sm leading-relaxed text-text mb-5">{description}</p>
      )}

      {features.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-2 bg-bg-card rounded-lg p-3">
              <span className="text-primary font-bold text-sm mt-0.5">✓</span>
              <span className="text-sm text-text">{f}</span>
            </div>
          ))}
        </div>
      )}

      {(brand || catLabel || materials.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {([
            brand ? (['Marque', brand] as [string, string]) : null,
            catLabel ? (['Catégorie', catLabel] as [string, string]) : null,
            materials.length > 0 ? (['Matière', materials.join(', ')] as [string, string]) : null,
          ] as ([string, string] | null)[])
            .filter((x): x is [string, string] => x !== null)
            .map(([k, v]) => (
              <div key={k} className="bg-bg-card rounded-lg p-3.5">
                <p className="text-[10px] font-bold text-text-light uppercase tracking-widest mb-1">{k}</p>
                <p className="text-sm font-semibold text-text">{v}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
