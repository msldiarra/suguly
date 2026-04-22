import { describe, it, expect } from 'vitest'
import { generateOrderNumber, isValidStatusTransition, getNextStatuses } from '@/lib/orders'

describe('generateOrderNumber', () => {
  it('generates SGY-XXXXX format', () => {
    const num = generateOrderNumber()
    expect(num).toMatch(/^SGY-\d{5}$/)
  })

  it('generates unique numbers (statistical check)', () => {
    const nums = new Set(Array.from({ length: 100 }, () => generateOrderNumber()))
    expect(nums.size).toBeGreaterThan(90)
  })
})

describe('isValidStatusTransition', () => {
  it('allows NEW → PREPARING', () => {
    expect(isValidStatusTransition('NEW', 'PREPARING')).toBe(true)
  })

  it('allows NEW → CANCELLED', () => {
    expect(isValidStatusTransition('NEW', 'CANCELLED')).toBe(true)
  })

  it('allows PREPARING → READY', () => {
    expect(isValidStatusTransition('PREPARING', 'READY')).toBe(true)
  })

  it('allows READY → DELIVERING', () => {
    expect(isValidStatusTransition('READY', 'DELIVERING')).toBe(true)
  })

  it('allows DELIVERING → DELIVERED', () => {
    expect(isValidStatusTransition('DELIVERING', 'DELIVERED')).toBe(true)
  })

  it('rejects NEW → DELIVERED', () => {
    expect(isValidStatusTransition('NEW', 'DELIVERED')).toBe(false)
  })

  it('rejects DELIVERED → any', () => {
    expect(isValidStatusTransition('DELIVERED', 'CANCELLED')).toBe(false)
    expect(isValidStatusTransition('DELIVERED', 'NEW')).toBe(false)
  })

  it('rejects CANCELLED → any', () => {
    expect(isValidStatusTransition('CANCELLED', 'NEW')).toBe(false)
  })

  it('rejects unknown status', () => {
    expect(isValidStatusTransition('UNKNOWN', 'NEW')).toBe(false)
  })
})

describe('getNextStatuses', () => {
  it('returns correct next statuses for NEW', () => {
    expect(getNextStatuses('NEW')).toEqual(expect.arrayContaining(['PREPARING', 'CANCELLED']))
  })

  it('returns empty array for DELIVERED', () => {
    expect(getNextStatuses('DELIVERED')).toEqual([])
  })

  it('returns empty array for CANCELLED', () => {
    expect(getNextStatuses('CANCELLED')).toEqual([])
  })
})
