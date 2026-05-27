import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import crypto from 'crypto'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Ensure the SQLite database file exists and has tables + admin user.
 * This runs once when the module is first imported.
 */
function initDatabase() {
  try {
    // Ensure db directory exists
    const dbDir = join(process.cwd(), 'db')
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true })
    }

    // Create a temporary Prisma client to check if tables exist
    const tmpClient = new PrismaClient({ log: [] })
    tmpClient.adminUser.count().then(async (count) => {
      if (count === 0) {
        const hash = crypto.createHash('sha256').update('user').digest('hex')
        await tmpClient.adminUser.create({
          data: { username: 'user', password: hash, fullName: 'Super Admin', role: 'superadmin', isActive: true },
        })
        console.log('[db] Super admin created (user/user)')
      }
      await tmpClient.$disconnect()
    }).catch(async (err) => {
      // Tables don't exist yet — push schema
      const msg = (err as Error).message || ''
      if (msg.includes('no such table') || msg.includes('SQLITE_CANTOPEN') || msg.includes('SQLITE_ERROR')) {
        console.log('[db] Tables missing. Pushing schema...')
        try {
          execSync('npx prisma db push --skip-generate 2>&1', {
            cwd: process.cwd(),
            stdio: 'pipe',
            timeout: 60000,
          })
          console.log('[db] Schema pushed.')

          // Now seed the admin user
          const seedClient = new PrismaClient({ log: [] })
          const hash = crypto.createHash('sha256').update('user').digest('hex')
          try {
            await seedClient.adminUser.create({
              data: { username: 'user', password: hash, fullName: 'Super Admin', role: 'superadmin', isActive: true },
            })
            console.log('[db] Super admin created (user/user)')
          } catch {
            // User may already exist
          }
          await seedClient.$disconnect()
        } catch (e) {
          console.error('[db] Schema push failed:', e)
        }
      }
      await tmpClient.$disconnect()
    })
  } catch (e) {
    console.error('[db] Init error:', e)
  }
}

// Run init on module load
initDatabase()

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
