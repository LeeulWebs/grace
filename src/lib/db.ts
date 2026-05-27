import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'
import crypto from 'crypto'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let initialized = false

async function ensureDatabase() {
  if (initialized) return
  initialized = true

  const dbPath = join(process.cwd(), 'db', 'custom.db')
  const dbExists = existsSync(dbPath)

  if (!dbExists) {
    console.log('[db] Database file not found. Creating...')
    try {
      execSync('npx prisma db push --skip-generate 2>&1', {
        cwd: process.cwd(),
        stdio: 'pipe',
        timeout: 30000,
      })
      console.log('[db] Database schema pushed successfully.')
    } catch (e) {
      console.error('[db] Failed to push schema:', e)
    }
  }

  // Check if admin user exists, if not seed it
  try {
    const prisma = new PrismaClient({ log: [] })
    const userCount = await prisma.adminUser.count()
    if (userCount === 0) {
      console.log('[db] No admin user found. Seeding default admin...')
      const hash = crypto.createHash('sha256').update('user').digest('hex')
      await prisma.adminUser.create({
        data: { username: 'user', password: hash, fullName: 'Admin User', role: 'admin' }
      })
      console.log('[db] Default admin user created (username: user, password: user)')
    }
    await prisma.$disconnect()
  } catch (e) {
    // Table might not exist yet, that's ok - the API routes will handle it
    console.log('[db] Could not check admin user (tables may not exist yet):', (e as Error).message)
  }
}

// Run initialization
ensureDatabase().catch(console.error)

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
