/**
 * Import products from sheetgen SQLite database into Suguly.
 *
 * Usage: npm run import:sheetgen -- --db /path/to/sheetgen.db [--confidence 0.7]
 *
 * Reads product_sheets and photos tables, converts images to WebP via Sharp,
 * upserts into Suguly product table (idempotent, keyed on slug).
 */

import Database from 'better-sqlite3'
import { PrismaClient } from '@prisma/client'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

const DEFAULT_CONFIDENCE = 0.7
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'products')

interface SheetgenProduct {
  id: number
  title: string
  description: string | null
  price: number | null
  currency: string | null
  brand: string | null
  category: string | null
  category_hierarchy: string | null
  tags: string | null
  colors: string | null
  materials: string | null
  features: string | null
  meta_description: string | null
  slug: string
  seo_keywords: string | null
  confidence: number | null
  photo_id: number | null
}

interface SheetgenPhoto {
  id: number
  filepath: string | null
}

async function convertToWebP(sourcePath: string, destSlug: string): Promise<string | null> {
  const dest = path.join(IMAGES_DIR, `${destSlug}.webp`)
  try {
    await sharp(sourcePath).webp({ quality: 80 }).toFile(dest)
    return `/images/products/${destSlug}.webp`
  } catch (err) {
    console.warn(`  ⚠  Image conversion failed for ${sourcePath}: ${(err as Error).message}`)
    return null
  }
}

function parseArgs(): { dbPath: string; confidenceThreshold: number } {
  const args = process.argv.slice(2)
  let dbPath = ''
  let confidence = DEFAULT_CONFIDENCE

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--db' && args[i + 1]) dbPath = args[++i]
    if (args[i] === '--confidence' && args[i + 1]) confidence = parseFloat(args[++i])
  }

  if (!dbPath) {
    console.error('Usage: npm run import:sheetgen -- --db /path/to/sheetgen.db [--confidence 0.7]')
    process.exit(1)
  }
  return { dbPath, confidenceThreshold: confidence }
}

async function main() {
  const { dbPath, confidenceThreshold } = parseArgs()

  if (!fs.existsSync(dbPath)) {
    console.error(`Database not found: ${dbPath}`)
    process.exit(1)
  }

  console.log(`📦 Importing from ${dbPath} (confidence ≥ ${confidenceThreshold})`)
  fs.mkdirSync(IMAGES_DIR, { recursive: true })

  const sg = new Database(dbPath, { readonly: true })
  const prisma = new PrismaClient()

  const products = sg
    .prepare(
      `SELECT ps.*, p.filepath as photo_filepath
       FROM product_sheets ps
       LEFT JOIN photos p ON p.id = ps.photo_id`
    )
    .all() as (SheetgenProduct & { photo_filepath?: string })[]

  console.log(`Found ${products.length} products in sheetgen`)

  const stats = { created: 0, updated: 0, skipped: 0, errors: 0 }

  for (const row of products) {
    const confidence = row.confidence ?? 0

    if (confidence < confidenceThreshold) {
      stats.skipped++
      continue
    }

    let imageUrl: string | null = null
    if (row.photo_filepath && fs.existsSync(row.photo_filepath)) {
      imageUrl = await convertToWebP(row.photo_filepath, row.slug)
    }

    const data = {
      sheetgenId: row.id,
      title: row.title,
      description: row.description,
      price: row.price ?? 0,
      currency: row.currency ?? 'XOF',
      brand: row.brand,
      category: row.category,
      categoryHierarchy: row.category_hierarchy,
      tags: row.tags,
      colors: row.colors,
      materials: row.materials,
      features: row.features,
      metaDescription: row.meta_description,
      slug: row.slug,
      seoKeywords: row.seo_keywords,
      imageUrl,
      isActive: true,
      confidence,
    }

    try {
      const existing = await prisma.product.findUnique({ where: { slug: row.slug } })
      if (existing) {
        await prisma.product.update({ where: { slug: row.slug }, data })
        stats.updated++
      } else {
        await prisma.product.create({ data })
        stats.created++
      }
    } catch (err) {
      console.error(`  ✗ Error for ${row.slug}: ${(err as Error).message}`)
      stats.errors++
    }
  }

  sg.close()
  await prisma.$disconnect()

  console.log(`\n✅ Import complete:`)
  console.log(`   ${stats.created} créés`)
  console.log(`   ${stats.updated} mis à jour`)
  console.log(`   ${stats.skipped} ignorés (confiance trop basse)`)
  console.log(`   ${stats.errors} erreurs`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
