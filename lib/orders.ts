export function generateOrderNumber(): string {
  const num = Math.floor(Math.random() * 90000) + 10000
  return `SGY-${num}`
}

// Valid status transitions
const STATUS_TRANSITIONS: Record<string, string[]> = {
  NEW: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['DELIVERING', 'CANCELLED'],
  DELIVERING: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
}

export function isValidStatusTransition(from: string, to: string): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false
}

export function getNextStatuses(current: string): string[] {
  return STATUS_TRANSITIONS[current] ?? []
}
