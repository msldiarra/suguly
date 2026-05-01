export interface Category {
  id: string
  label: string
}

export const CATEGORIES: Category[] = [
  { id: 'electronique', label: 'Électronique & High-Tech' },
  { id: 'electromenager', label: 'Électroménager' },
  { id: 'maison', label: 'Maison & Déco' },
  { id: 'mode', label: 'Mode & Accessoires' },
  { id: 'beaute', label: 'Beauté & Soins' },
  { id: 'enfant', label: 'Enfant & Jouets' },
  { id: 'divers', label: 'Divers' },
]

export function getCategoryLabel(id: string | null | undefined): string {
  if (!id) return ''
  const cat = CATEGORIES.find((c) => c.id === id)
  return cat ? cat.label : id
}
