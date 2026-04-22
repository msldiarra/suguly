export function formatPrice(amount: number): string {
  return amount.toLocaleString('fr-FR') + ' FCFA'
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
