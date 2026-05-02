'use client'

import { useState } from 'react'
import { Stars } from '../ui/Stars'
import type { Review } from '@/lib/reviews'

interface ProductTabsProps {
  description: string | null
  features: string[]
  materials: string[]
  brand: string | null
  catLabel: string
  rating: number
  reviewsCount: number
  reviews: Review[]
}

export function ProductTabs({
  description,
  features,
  materials,
  brand,
  catLabel,
  rating,
  reviewsCount,
  reviews,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'features' | 'reviews'>('description')

  const hasFeatures = features.length > 0 || brand || catLabel || materials.length > 0

  return (
    <div className="mt-8">
      {/* Tab Headers */}
      <div className="border-b border-[#D1D1D1] mb-8 overflow-x-auto scrollbar-none">
        <div className="flex gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('description')}
            className={`py-2.5 px-4 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'description'
                ? 'text-text border-text'
                : 'text-text-light border-transparent hover:text-text'
            }`}
          >
            Description
          </button>
          {hasFeatures && (
            <button
              onClick={() => setActiveTab('features')}
              className={`py-2.5 px-4 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'features'
                  ? 'text-text border-text'
                  : 'text-text-light border-transparent hover:text-text'
              }`}
            >
              Caractéristiques
            </button>
          )}
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-2.5 px-4 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'text-text border-text'
                : 'text-text-light border-transparent hover:text-text'
            }`}
          >
            Avis Clients
            <span className="bg-primary-light text-primary px-1.5 py-0.5 rounded text-[10px]">{reviewsCount}</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[100px]">
        {activeTab === 'description' && (
          <div className="animate-in fade-in duration-300">
            {description ? (
              <p className="text-sm leading-relaxed text-text max-w-none prose prose-sm">
                {description}
              </p>
            ) : (
              <p className="text-sm text-text-light italic">Aucune description disponible.</p>
            )}
          </div>
        )}

        {activeTab === 'features' && (
          <div className="animate-in fade-in duration-300">
            {features.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                {features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 bg-[#F7F7F8] border border-[#E5E5E5] rounded-lg p-3">
                    <span className="text-[#16A34A] text-sm mt-0.5">✓</span>
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
                    <div key={k} className="bg-white border border-[#D1D1D1] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-[10px] font-bold text-text-light uppercase tracking-widest mb-1.5">{k}</p>
                      <p className="text-sm font-semibold text-text leading-tight">{v}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Summary */}
              <div className="md:w-1/3">
                <div className="bg-[#F7F7F8] border border-[#D1D1D1] rounded-2xl p-6 text-center">
                  <p className="text-4xl font-head font-bold text-text mb-1">{rating.toFixed(1)}</p>
                  <div className="flex justify-center mb-2">
                    <Stars rating={rating} />
                  </div>
                  <p className="text-xs text-text-light uppercase tracking-widest font-semibold">
                    Sur la base de {reviewsCount} avis
                  </p>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 space-y-6">
                {reviews.map((r, i) => (
                  <div key={i} className="border-b border-[#E5E5E5] pb-6 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-bold text-text mb-0.5">{r.name}</p>
                        <Stars rating={r.rating} />
                      </div>
                      <span className="text-[10px] text-text-light font-medium">{r.date}</span>
                    </div>
                    <p className="text-sm text-text-light leading-relaxed italic">
                      &ldquo;{r.body}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
