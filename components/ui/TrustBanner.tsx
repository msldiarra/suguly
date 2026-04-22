const ITEMS = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
      </svg>
    ),
    label: 'Livraison rapide à Bamako',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="3" /><line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    label: 'Paiement Orange Money',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    label: 'Produits vérifiés',
  },
]

export function TrustBanner() {
  return (
    <div className="bg-white rounded-xl py-3.5 px-6 flex flex-wrap justify-center gap-5 border border-[#E5E5E5]">
      {ITEMS.map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-text-light">
          {item.icon}
          <span className="text-sm font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
