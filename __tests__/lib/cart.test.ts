import { describe, it, expect } from 'vitest'
import {
  calcSubtotal,
  calcTotal,
  addToCart,
  updateQuantity,
  removeFromCart,
  cartCount,
  type CartItem,
} from '@/lib/cart'

const item1: CartItem = {
  id: 1,
  title: 'Écouteurs Bluetooth',
  price: 15900,
  imageUrl: null,
  slug: 'ecouteurs',
  category: 'electronique',
  quantity: 2,
}

const item2: CartItem = {
  id: 2,
  title: 'Chargeur 65W',
  price: 8500,
  imageUrl: null,
  slug: 'chargeur',
  category: 'electronique',
  quantity: 1,
}

describe('calcSubtotal', () => {
  it('returns 0 for empty cart', () => {
    expect(calcSubtotal([])).toBe(0)
  })

  it('calculates single item × qty', () => {
    expect(calcSubtotal([item1])).toBe(15900 * 2)
  })

  it('sums multiple items', () => {
    expect(calcSubtotal([item1, item2])).toBe(15900 * 2 + 8500)
  })
})

describe('calcTotal', () => {
  it('adds delivery fee to subtotal', () => {
    expect(calcTotal([item1], 1500)).toBe(15900 * 2 + 1500)
  })

  it('handles zero delivery fee', () => {
    expect(calcTotal([item2], 0)).toBe(8500)
  })
})

describe('addToCart', () => {
  it('adds a new product', () => {
    const cart = addToCart([], { ...item1, quantity: 0 })
    expect(cart).toHaveLength(1)
    expect(cart[0].quantity).toBe(1)
  })

  it('increments quantity for existing product', () => {
    const cart = addToCart([item1], { ...item1, quantity: 0 })
    expect(cart).toHaveLength(1)
    expect(cart[0].quantity).toBe(3) // 2 + 1
  })

  it('caps quantity at 10', () => {
    const bigCart: CartItem = { ...item1, quantity: 10 }
    const cart = addToCart([bigCart], { ...item1, quantity: 0 })
    expect(cart[0].quantity).toBe(10)
  })
})

describe('updateQuantity', () => {
  it('updates the quantity', () => {
    const cart = updateQuantity([item1, item2], 1, 5)
    expect(cart.find((i) => i.id === 1)?.quantity).toBe(5)
  })

  it('removes item when quantity ≤ 0', () => {
    const cart = updateQuantity([item1, item2], 1, 0)
    expect(cart).toHaveLength(1)
    expect(cart[0].id).toBe(2)
  })

  it('caps at 10', () => {
    const cart = updateQuantity([item1], 1, 99)
    expect(cart[0].quantity).toBe(10)
  })
})

describe('removeFromCart', () => {
  it('removes the specified item', () => {
    const cart = removeFromCart([item1, item2], 1)
    expect(cart).toHaveLength(1)
    expect(cart[0].id).toBe(2)
  })

  it('returns same cart if id not found', () => {
    const cart = removeFromCart([item1], 999)
    expect(cart).toHaveLength(1)
  })
})

describe('cartCount', () => {
  it('returns 0 for empty cart', () => {
    expect(cartCount([])).toBe(0)
  })

  it('sums quantities', () => {
    expect(cartCount([item1, item2])).toBe(3) // 2 + 1
  })
})
