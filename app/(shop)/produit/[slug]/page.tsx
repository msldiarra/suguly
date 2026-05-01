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

import { getCategoryLabel } from '@/lib/categories'
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

import { ProductTabs } from '@/components/product/ProductTabs'

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
          <div className="lg:w-[480px] flex-shrink-0">
            <div className="bg-white border border-[#D1D1D1] rounded-2xl p-8 flex items-center justify-center shadow-sm">
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
            <h1 className="font-head text-2xl sm:text-3xl font-semibold text-text leading-tight mb-3">
              {product.title}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-2.5 my-4">
              <span className="font-head text-2xl sm:text-3xl font-semibold text-text">
                {formatPrice(product.price)}
              </span>
            </div>

            {/* Meta chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              {product.brand && (
                <span className="px-3 py-1.5 bg-[#F7F7F8] border border-[#D1D1D1] rounded-lg text-[10px] uppercase tracking-wider font-semibold text-text">
                  Marque : {product.brand}
                </span>
              )}
              {materials.length > 0 && (
                <span className="px-3 py-1.5 bg-[#F7F7F8] border border-[#D1D1D1] rounded-lg text-[10px] uppercase tracking-wider font-semibold text-text">
                  Matière : {materials.join(', ')}
                </span>
              )}
            </div>

            {/* Colors selection hidden for now to avoid confusion */}
            {/* 
            {colors.length > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs uppercase tracking-widest font-semibold text-text">Coloris :</span>
                <div className="flex gap-2">
                  {colors.map((c, i) => (
                    <div
                      key={i}
                      style={{ background: c }}
                      className="w-7 h-7 rounded-full border border-[#D1D1D1] hover:scale-110 transition-transform cursor-pointer shadow-sm"
                      title={c}
                    />
                  ))}
                </div>
              </div>
            )}
            */}

            <AddToCartButton product={product} />

            {/* Delivery info */}
            <div className="mt-8 bg-[#F7F7F8] border border-[#D1D1D1] rounded-xl p-4 flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-[#D1D1D1] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14" /><path d="M13 5l7 7-7 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-text mb-0.5 uppercase tracking-wide">Livraison à Bamako</p>
                <p className="text-xs text-text leading-relaxed">
                  Standard <strong>1 500 FCFA</strong> · Express <strong>3 000 FCFA</strong> <br/> 
                  <span className="text-text-light font-medium mt-1 inline-block">Délai estimé : 24h à 48h</span>
                </p>
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
            <h2 className="font-head text-xl sm:text-2xl font-semibold">Produits similaires</h2>
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
