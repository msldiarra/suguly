import { describe, it, expect } from 'vitest'
import { isMalianPhone, formatMalianPhone } from '@/lib/validate'

describe('isMalianPhone', () => {
  it('accepts exactly 8 digits', () => {
    expect(isMalianPhone('76543210')).toBe(true)
    expect(isMalianPhone('20012345')).toBe(true)
  })

  it('accepts 8 digits with spaces (strips them)', () => {
    expect(isMalianPhone('76 54 32 10')).toBe(true)
  })

  it('rejects fewer than 8 digits', () => {
    expect(isMalianPhone('7654321')).toBe(false)
  })

  it('rejects more than 8 digits', () => {
    expect(isMalianPhone('765432100')).toBe(false)
  })

  it('rejects letters', () => {
    expect(isMalianPhone('7654321a')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isMalianPhone('')).toBe(false)
  })

  it('rejects +223 prefix', () => {
    // Should pass only 8-digit local part
    expect(isMalianPhone('+22376543210')).toBe(false)
  })
})

describe('formatMalianPhone', () => {
  it('prepends +223', () => {
    expect(formatMalianPhone('76543210')).toBe('+22376543210')
  })

  it('strips spaces before formatting', () => {
    expect(formatMalianPhone('76 54 32 10')).toBe('+22376543210')
  })
})
