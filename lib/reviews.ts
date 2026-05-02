export interface Review {
  name: string
  date: string
  body: string
  rating: number
}

const MOCK_REVIEWS_POOL: Review[] = [
  { name: 'Fatoumata K.', date: '2026-05-02', body: 'Très satisfait de mon achat. La qualité est au rendez-vous et la livraison a été très rapide à Bamako.', rating: 5 },
  { name: 'Ousmane T.', date: '2026-05-01', body: 'Conforme aux photos. Le service client sur WhatsApp est très réactif.', rating: 4 },
  { name: 'Aminata Diallo', date: '2026-05-02', body: 'Produit original et bien emballé. Je repasserai commande sans hésiter.', rating: 5 },
  { name: 'Moussa B.', date: '2026-05-01', body: 'Excellent service. Livraison effectuée en moins de 24h.', rating: 5 },
  { name: 'Djénéba S.', date: '2026-05-02', body: 'Bon produit, mais j\'aurais aimé plus de choix de couleurs.', rating: 4 },
  { name: 'Ibrahim Maïga', date: '2026-05-02', body: 'Suguly est devenu ma boutique préférée. Top qualité.', rating: 5 },
  { name: 'Mariam T.', date: '2026-05-01', body: 'Article conforme et prix imbattable sur le marché.', rating: 5 },
]

export function getProductRating(productId: number) {
  // Deterministic but varied rating
  const rating = 4.6 + (productId % 4) / 10 // 4.6 to 4.9
  const count = 5 + (productId % 15) // 5 to 20 reviews
  
  // Pick a subset of reviews using a rotation/offset based on productId
  // This ensures different products have different reviewers, but the same product
  // always has the same reviewers.
  const poolSize = MOCK_REVIEWS_POOL.length
  const numToPick = 2 + (productId % 3) // Pick 2 to 4 reviews
  
  const reviews: Review[] = []
  for (let i = 0; i < numToPick; i++) {
    // Offset the starting index by productId, then step by i
    const index = (productId + i) % poolSize
    reviews.push(MOCK_REVIEWS_POOL[index])
  }
  
  return { rating, count, reviews }
}
