import { prisma } from './db'
import type { Product } from '@prisma/client'

export interface ProductFilters {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  colors?: string[]
  sortBy?: 'default' | 'price-asc' | 'price-desc' | 'newest'
  page?: number
  limit?: number
}

export interface ProductListResult {
  products: Product[]
  total: number
  page: number
  totalPages: number
}

export async function getProducts(filters: ProductFilters = {}): Promise<ProductListResult> {
  const { category, search, minPrice, maxPrice, sortBy = 'default', page = 1, limit = 20 } = filters
  const skip = (page - 1) * limit

  const where = buildWhereClause({ category, search, minPrice, maxPrice, colors: filters.colors })
  const orderBy = buildOrderBy(sortBy)

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip, take: limit }),
    prisma.product.count({ where }),
  ])

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return prisma.product.findUnique({ where: { slug, isActive: true } })
}

export async function getSimilarProducts(category: string | null, excludeSlug: string, limit = 4): Promise<Product[]> {
  if (!category) return []
  return prisma.product.findMany({
    where: { category, isActive: true, slug: { not: excludeSlug } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function getCategories(): Promise<{ category: string; count: number }[]> {
  const results = await prisma.product.groupBy({
    by: ['category'],
    where: { isActive: true, category: { not: null } },
    _count: true,
  })
  return results.map((r) => ({ category: r.category!, count: r._count }))
}

function buildWhereClause(filters: Pick<ProductFilters, 'category' | 'search' | 'minPrice' | 'maxPrice' | 'colors'>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { isActive: true }

  if (filters.category) where.category = filters.category

  if (filters.search) {
    const q = filters.search.toLowerCase()
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { brand: { contains: q } },
      { tags: { contains: q } },
      { seoKeywords: { contains: q } },
    ]
  }

  if (filters.minPrice !== undefined) where.price = { ...where.price, gte: filters.minPrice }
  if (filters.maxPrice !== undefined) where.price = { ...where.price, lte: filters.maxPrice }

  return where
}

function buildOrderBy(sortBy: ProductFilters['sortBy']) {
  switch (sortBy) {
    case 'price-asc': return { price: 'asc' as const }
    case 'price-desc': return { price: 'desc' as const }
    case 'newest': return { createdAt: 'desc' as const }
    default: return { createdAt: 'desc' as const }
  }
}
