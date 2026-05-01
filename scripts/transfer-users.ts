/**
 * Transfer users from local SQLite (suguly.db) to production PostgreSQL.
 * Usage: npm run transfer:users
 */

import Database from 'better-sqlite3'
import { prisma } from '../lib/db'
import path from 'path'
import fs from 'fs'

const SQLITE_DB_PATH = path.join(process.cwd(), 'prisma/suguly.db')

async function main() {
  if (!fs.existsSync(SQLITE_DB_PATH)) {
    console.error(`Base de données source introuvable : ${SQLITE_DB_PATH}`)
    process.exit(1)
  }

  console.log(`👤 Transfert des utilisateurs depuis ${SQLITE_DB_PATH}...`)

  const sqlite = new Database(SQLITE_DB_PATH, { readonly: true })

  // Lire les clients depuis SQLite
  const customers = sqlite.prepare('SELECT * FROM Customer').all() as any[]

  console.log(`   Trouvé ${customers.length} utilisateurs à transférer.`)

  let count = 0
  for (const user of customers) {
    try {
      // Upsert basé sur le numéro de téléphone (unique)
      await prisma.customer.upsert({
        where: { phone: user.phone },
        update: {
          name: user.name,
          quartier: user.quartier,
          pinHash: user.pinHash,
          role: user.role,
        },
        create: {
          name: user.name,
          phone: user.phone,
          quartier: user.quartier,
          pinHash: user.pinHash,
          role: user.role,
        }
      })
      count++
    } catch (err) {
      console.error(`   ✗ Erreur pour l'utilisateur ${user.phone}: ${(err as Error).message}`)
    }
  }

  sqlite.close()
  console.log(`\n✅ Transfert terminé : ${count} utilisateurs synchronisés.`)
}

main().catch(console.error)
