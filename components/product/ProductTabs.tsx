'use client'

import { useState } from 'react'

interface ProductTabsProps {
  description: string | null
  features: string[]
  materials: string[]
  brand: string | null
  catLabel: string
}

export function ProductTabs({
  description,
  features,
  materials,
  brand,
  catLabel,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'features'>('description')

  const hasFeatures = features.length > 0 || brand || catLabel || materials.length > 0

  return (
    <div className="mt-8">
      {/* Tab Headers */}
      <div className="border-b border-[#D1D1D1] mb-8 flex gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('description')}
          className={[
            'py-3 px-6 text-xs uppercase tracking-widest font-bold transition-all whitespace-nowrap',
            activeTab === 'description'
              ? 'text-text border-b-2 border-text -mb-px'
              : 'text-text-light hover:text-text',
          ].join(' ')}
        >
          Description
        </button>
        {hasFeatures && (
          <button
            onClick={() => setActiveTab('features')}
            className={[
              'py-3 px-6 text-xs uppercase tracking-widest font-bold transition-all whitespace-nowrap',
              activeTab === 'features'
                ? 'text-text border-b-2 border-text -mb-px'
                : 'text-text-light hover:text-text',
            ].join(' ')}
          >
            Caractéristiques
          </button>
        )}
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
      </div>
    </div>
  )
}
