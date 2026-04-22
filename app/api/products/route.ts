import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/products'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const filters = {
    category: searchParams.get('category') ?? undefined,
    search: searchParams.get('q') ?? undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    sortBy: (searchParams.get('sortBy') ?? 'default') as 'default' | 'price-asc' | 'price-desc' | 'newest',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
  }

  try {
    const result = await getProducts(filters)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[GET /api/products]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
