import { describe, expect, it } from 'vitest'
import {
  buildStoredPricing,
  getDefaultMarginPercent,
  getMarginMultiplier,
  roundUpToThousands,
  resolveMarginPercent,
} from '@/lib/pricing'

describe('pricing', () => {
  it('uses the default margin when no override is provided', () => {
    expect(resolveMarginPercent()).toBe(getDefaultMarginPercent())
  })

  it('builds stored pricing from the base price', () => {
    expect(buildStoredPricing(10000)).toEqual({
      basePrice: 10000,
      price: roundUpToThousands(10000 * getMarginMultiplier()),
    })
  })

  it('keeps the default margin accessible', () => {
    expect(resolveMarginPercent()).toBe(getDefaultMarginPercent())
  })

  it('rounds prices up to the next thousand', () => {
    expect(roundUpToThousands(10450)).toBe(11000)
    expect(roundUpToThousands(15080)).toBe(16000)
    expect(roundUpToThousands(25030)).toBe(26000)
    expect(roundUpToThousands(11000)).toBe(11000)
  })
})
