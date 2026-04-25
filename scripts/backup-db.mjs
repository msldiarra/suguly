import fs from 'fs'
import path from 'path'

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) return

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex).trim()
    let value = trimmed.slice(eqIndex + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

function resolveDatabasePath() {
  const url = process.env.DATABASE_URL
  if (!url?.startsWith('file:')) {
    throw new Error('DATABASE_URL must use the SQLite file: format')
  }
  return url.slice('file:'.length)
}

function timestamp() {
  const now = new Date()
  const yyyy = now.getUTCFullYear()
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(now.getUTCDate()).padStart(2, '0')
  const hh = String(now.getUTCHours()).padStart(2, '0')
  const min = String(now.getUTCMinutes()).padStart(2, '0')
  const sec = String(now.getUTCSeconds()).padStart(2, '0')
  return `${yyyy}${mm}${dd}-${hh}${min}${sec}`
}

loadLocalEnv()

const sourcePath = resolveDatabasePath()
const backupsDir = path.join(process.cwd(), 'backups')
fs.mkdirSync(backupsDir, { recursive: true })

const destinationPath = path.join(backupsDir, `suguly-${timestamp()}.db`)
fs.copyFileSync(sourcePath, destinationPath)

console.log(`Backup created: ${destinationPath}`)
