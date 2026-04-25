/**
 * Import products from sheetgen SQLite database into Suguly.
 *
 * Usage: npm run import:sheetgen -- --db /path/to/sheetgen.db [--confidence 0.7]
 *
 * Reads product_sheets and photos tables, converts images to WebP via Sharp,
 * upserts into Suguly product table (idempotent, keyed on slug).
 */

import Database from 'better-sqlite3'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import { buildStoredPricing } from '../lib/pricing'

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

function mapCategory(raw: string | null): string {
  if (!raw) return 'divers'
  const text = raw.toLowerCase()
  if (text.includes('jouet') || text.includes('enfant') || text.includes('bébé') || text.includes('bebe') || text.includes('peluche')) return 'enfant'
  if (text.includes('mixeur') || text.includes('fer à repasser') || text.includes('ventilateur') || text.includes('électroménager') || text.includes('electromenager')) return 'electromenager'
  if (text.includes('vêtement') || text.includes('vetement') || text.includes('chaussure') || text.includes('sac') || text.includes('mode') || text.includes('accessoire')) return 'mode'
  if (text.includes('lampe') || text.includes('déco') || text.includes('deco') || text.includes('maison') || text.includes('verre') || text.includes('cuisine')) return 'maison'
  if (text.includes('beauté') || text.includes('beaute') || text.includes('cosmétique') || text.includes('soin')) return 'beaute'
  if (text.includes('électronique') || text.includes('electronique') || text.includes('téléphone') || text.includes('écouteur') || text.includes('audio')) return 'electronique'
  return 'divers'
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

function getTargetDbPath(): string {
  const url = process.env.DATABASE_URL
  if (!url?.startsWith('file:')) {
    throw new Error('DATABASE_URL must use the SQLite file: format')
  }
  return url.slice('file:'.length)
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
  const targetDb = new Database(getTargetDbPath())

  const products = sg
    .prepare(
      `SELECT ps.*, p.original_path as photo_filepath
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

    try {
      const data = {
        sheetgenId: row.id,
        title: row.title,
        description: row.description,
        ...buildStoredPricing(row.price ?? 0),
        currency: row.currency ?? 'XOF',
        brand: row.brand,
        category: mapCategory(row.category),
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

      const existing = targetDb.prepare(`SELECT id FROM "Product" WHERE "slug" = ?`).get(row.slug) as { id: number } | undefined
      if (existing) {
        targetDb.prepare(`
          UPDATE "Product"
          SET "sheetgenId" = ?, "title" = ?, "description" = ?, "basePrice" = ?, "price" = ?, "currency" = ?, "brand" = ?,
              "category" = ?, "categoryHierarchy" = ?, "tags" = ?, "colors" = ?, "materials" = ?, "features" = ?,
              "metaDescription" = ?, "slug" = ?, "seoKeywords" = ?, "imageUrl" = ?, "isActive" = ?, "confidence" = ?,
              "updatedAt" = CURRENT_TIMESTAMP
          WHERE "slug" = ?
        `).run(
          data.sheetgenId, data.title, data.description, data.basePrice, data.price, data.currency, data.brand,
          data.category, data.categoryHierarchy, data.tags, data.colors, data.materials, data.features,
          data.metaDescription, data.slug, data.seoKeywords, data.imageUrl, data.isActive ? 1 : 0, data.confidence,
          row.slug
        )
        stats.updated++
      } else {
        targetDb.prepare(`
          INSERT INTO "Product" (
            "sheetgenId", "title", "description", "basePrice", "price", "currency", "brand", "category",
            "categoryHierarchy", "tags", "colors", "materials", "features", "metaDescription", "slug",
            "seoKeywords", "imageUrl", "isActive", "confidence", "createdAt", "updatedAt"
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).run(
          data.sheetgenId, data.title, data.description, data.basePrice, data.price, data.currency, data.brand,
          data.category, data.categoryHierarchy, data.tags, data.colors, data.materials, data.features,
          data.metaDescription, data.slug, data.seoKeywords, data.imageUrl, data.isActive ? 1 : 0, data.confidence
        )
        stats.created++
      }
    } catch (err) {
      console.error(`  ✗ Error for ${row.slug}: ${(err as Error).message}`)
      stats.errors++
    }
  }

  sg.close()
  targetDb.close()

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
