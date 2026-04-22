// Validates a Malian phone number: 8 digits
export function isMalianPhone(phone: string): boolean {
  return /^\d{8}$/.test(phone.replace(/\s/g, ''))
}

// Returns the full international number
export function formatMalianPhone(phone: string): string {
  const cleaned = phone.replace(/\s/g, '')
  return `+223${cleaned}`
}
