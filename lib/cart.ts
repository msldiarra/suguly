export interface CartItem {
  id: number
  title: string
  price: number
  imageUrl: string | null
  slug: string
  category: string | null
  quantity: number
}

export function calcSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function calcTotal(items: CartItem[], deliveryFee: number): number {
  return calcSubtotal(items) + deliveryFee
}

export function addToCart(cart: CartItem[], product: Omit<CartItem, 'quantity'>): CartItem[] {
  const existing = cart.find((i) => i.id === product.id)
  if (existing) {
    return cart.map((i) =>
      i.id === product.id ? { ...i, quantity: Math.min(i.quantity + 1, 10) } : i
    )
  }
  return [...cart, { ...product, quantity: 1 }]
}

export function updateQuantity(cart: CartItem[], id: number, quantity: number): CartItem[] {
  if (quantity <= 0) return cart.filter((i) => i.id !== id)
  return cart.map((i) => (i.id === id ? { ...i, quantity: Math.min(quantity, 10) } : i))
}

export function removeFromCart(cart: CartItem[], id: number): CartItem[] {
  return cart.filter((i) => i.id !== id)
}

export function cartCount(cart: CartItem[]): number {
  return cart.reduce((sum, i) => sum + i.quantity, 0)
}
