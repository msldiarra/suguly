export const QUARTIERS = [
  'Badalabougou',
  'Bamako-Coura',
  'Hamdallaye',
  'Hippodrome',
  'Kalaban-Coro',
  'Lafiabougou',
  'Magnambougou',
  'Missira',
  'Niamakoro',
  'Quinzambougou',
  'Sabalibougou',
  'Sogoniko',
  'Torokorobougou',
  'Yirimadio',
  'Zone Industrielle',
  'Autre quartier',
]

// Delivery fee in FCFA by quartier
const QUARTIER_FEES: Record<string, number> = {
  'Badalabougou': 1500,
  'Bamako-Coura': 1500,
  'Hamdallaye': 1500,
  'Hippodrome': 1500,
  'Kalaban-Coro': 2000,
  'Lafiabougou': 1500,
  'Magnambougou': 2000,
  'Missira': 1500,
  'Niamakoro': 2000,
  'Quinzambougou': 1500,
  'Sabalibougou': 2000,
  'Sogoniko': 2000,
  'Torokorobougou': 1500,
  'Yirimadio': 2500,
  'Zone Industrielle': 1500,
  'Autre quartier': 2500,
}

export function getDeliveryFee(quartier: string, express = false): number {
  const base = QUARTIER_FEES[quartier] ?? 2500
  return express ? base * 2 : base
}
