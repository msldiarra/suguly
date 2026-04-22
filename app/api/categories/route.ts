import { NextResponse } from 'next/server'
import { getCategories } from '@/lib/products'

export async function GET() {
  try {
    const categories = await getCategories()
    return NextResponse.json({ categories })
  } catch (err) {
    console.error('[GET /api/categories]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
