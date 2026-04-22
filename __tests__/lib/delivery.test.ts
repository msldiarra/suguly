import { describe, it, expect } from 'vitest'
import { getDeliveryFee, QUARTIERS } from '@/lib/delivery'

describe('getDeliveryFee', () => {
  it('returns standard fee for central quartiers', () => {
    expect(getDeliveryFee('Badalabougou', false)).toBe(1500)
    expect(getDeliveryFee('Hippodrome', false)).toBe(1500)
  })

  it('returns higher fee for distant quartiers', () => {
    expect(getDeliveryFee('Yirimadio', false)).toBe(2500)
  })

  it('doubles the fee for express', () => {
    const standard = getDeliveryFee('Badalabougou', false)
    const express = getDeliveryFee('Badalabougou', true)
    expect(express).toBe(standard * 2)
  })

  it('applies default fee for unknown quartier', () => {
    expect(getDeliveryFee('Quartier Inconnu', false)).toBe(2500)
  })

  it('charges express for unknown quartier correctly', () => {
    expect(getDeliveryFee('Quartier Inconnu', true)).toBe(5000)
  })
})

describe('QUARTIERS list', () => {
  it('contains expected quartiers', () => {
    expect(QUARTIERS).toContain('Badalabougou')
    expect(QUARTIERS).toContain('Hippodrome')
    expect(QUARTIERS).toContain('Yirimadio')
    expect(QUARTIERS).toContain('Autre quartier')
  })

  it('has at least 10 quartiers', () => {
    expect(QUARTIERS.length).toBeGreaterThanOrEqual(10)
  })
})
