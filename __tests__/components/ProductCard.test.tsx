import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductCard } from '@/components/product/ProductCard'
import type { Product } from '@prisma/client'

const mockProduct: Product = {
  id: 1,
  sheetgenId: null,
  title: 'Écouteurs sans fil Bluetooth',
  description: 'Son stéréo haute qualité',
  price: 15900,
  currency: 'XOF',
  brand: 'SoundPro',
  category: 'electronique',
  categoryHierarchy: null,
  tags: JSON.stringify(['Nouveau']),
  colors: JSON.stringify(['#222']),
  materials: null,
  features: null,
  metaDescription: null,
  slug: 'ecouteurs-sans-fil',
  seoKeywords: null,
  imageUrl: null,
  isActive: true,
  confidence: 0.95,
  createdAt: new Date(),
  updatedAt: new Date(),
}

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock ProductImg
vi.mock('@/components/product/ProductImg', () => ({
  ProductImg: ({ title }: { title: string }) => <div data-testid="product-img">{title}</div>,
}))

describe('ProductCard', () => {
  it('renders the product title', () => {
    render(<ProductCard product={mockProduct} />)
    // Title appears in the card text and the placeholder img mock — check at least one exists
    const titles = screen.getAllByText('Écouteurs sans fil Bluetooth')
    expect(titles.length).toBeGreaterThanOrEqual(1)
  })

  it('renders the formatted price', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText(/15 900 FCFA/)).toBeInTheDocument()
  })

  it('renders the Nouveau badge', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Nouveau')).toBeInTheDocument()
  })

  it('renders a link to the product page', () => {
    render(<ProductCard product={mockProduct} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/produit/ecouteurs-sans-fil')
  })

  it('renders add to cart button when onAddToCart is provided', () => {
    const onAdd = vi.fn()
    render(<ProductCard product={mockProduct} onAddToCart={onAdd} />)
    expect(screen.getByRole('button', { name: /ajouter.*panier/i })).toBeInTheDocument()
  })

  it('calls onAddToCart when button is clicked', () => {
    const onAdd = vi.fn()
    render(<ProductCard product={mockProduct} onAddToCart={onAdd} />)
    const btn = screen.getByRole('button', { name: /ajouter.*panier/i })
    fireEvent.click(btn)
    expect(onAdd).toHaveBeenCalledWith(mockProduct)
  })

  it('does not render add to cart button without handler', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('renders placeholder image when imageUrl is null', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByTestId('product-img')).toBeInTheDocument()
  })
})
