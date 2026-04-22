import { describe, it, expect } from 'vitest'
import { formatPrice, formatDate } from '@/lib/format'

describe('formatPrice', () => {
  it('formats zero', () => {
    expect(formatPrice(0)).toBe('0 FCFA')
  })

  it('formats a round number', () => {
    expect(formatPrice(15000)).toBe('15 000 FCFA')
  })

  it('formats a large number with spaces', () => {
    // French locale uses narrow no-break space (U+202F) as thousands separator
    const result = formatPrice(1500000)
    expect(result).toMatch(/1\s?500\s?000 FCFA/)
  })

  it('appends FCFA suffix', () => {
    expect(formatPrice(5500)).toMatch(/FCFA$/)
  })

  it('formats decimal values', () => {
    const result = formatPrice(9999.5)
    expect(result).toMatch(/FCFA$/)
  })
})

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2026-04-18')
    expect(result).toMatch(/2026/)
    expect(result).toMatch(/avril/)
  })

  it('formats a Date object', () => {
    const result = formatDate(new Date('2026-01-01'))
    expect(result).toMatch(/2026/)
    expect(result).toMatch(/janvier/)
  })
})
