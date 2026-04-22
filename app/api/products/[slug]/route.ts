import { NextRequest, NextResponse } from 'next/server'
import { getProductBySlug, getSimilarProducts } from '@/lib/products'

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  try {
    const product = await getProductBySlug(slug)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    const similar = await getSimilarProducts(product.category, product.slug)
    return NextResponse.json({ product, similar })
  } catch (err) {
    console.error('[GET /api/products/:slug]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
