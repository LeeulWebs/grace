import { PrismaClient } from '@prisma/client'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import crypto from 'crypto'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Raw SQL to create all tables that Prisma expects.
 * This eliminates the need for `prisma db push` CLI command.
 * Column names must match Prisma's schema field names exactly.
 */
const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  fullName TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'admin',
  isActive BOOLEAN NOT NULL DEFAULT 1,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT NOT NULL UNIQUE,
  "userId" INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS contact_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fullName TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  service TEXT,
  message TEXT NOT NULL DEFAULT '',
  isRead BOOLEAN NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  isActive BOOLEAN NOT NULL DEFAULT 1,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS service_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '',
  lightColor TEXT NOT NULL DEFAULT '',
  borderColor TEXT NOT NULL DEFAULT '',
  services TEXT NOT NULL DEFAULT '[]',
  sortOrder INTEGER NOT NULL DEFAULT 0,
  isActive BOOLEAN NOT NULL DEFAULT 1,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  client TEXT,
  location TEXT,
  startDate DATETIME,
  endDate DATETIME,
  status TEXT NOT NULL DEFAULT 'completed',
  imageUrl TEXT,
  isFeatured BOOLEAN NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fullName TEXT NOT NULL DEFAULT '',
  position TEXT NOT NULL DEFAULT '',
  bio TEXT,
  imageUrl TEXT,
  email TEXT,
  phone TEXT,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  isActive BOOLEAN NOT NULL DEFAULT 1,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fullName TEXT NOT NULL DEFAULT '',
  company TEXT,
  position TEXT,
  content TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 5,
  imageUrl TEXT,
  isActive BOOLEAN NOT NULL DEFAULT 1,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`

/**
 * Ensure database is initialized: tables exist + admin user seeded.
 * Uses raw SQL — no Prisma CLI or execSync needed.
 */
export async function ensureDatabase(prisma: PrismaClient): Promise<boolean> {
  // Ensure the db directory exists
  const dbDir = join(process.cwd(), 'db')
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true })
  }

  try {
    // Quick check: do tables exist?
    await prisma.$queryRawUnsafe('SELECT count(*) FROM admin_users')
  } catch {
    // Tables don't exist — create them with raw SQL
    console.log('[db] Creating tables with raw SQL...')
    try {
      const statements = CREATE_TABLES_SQL.split(';').map(s => s.trim()).filter(Boolean)
      for (const stmt of statements) {
        await prisma.$executeRawUnsafe(stmt)
      }
      console.log('[db] All tables created.')
    } catch (err) {
      console.error('[db] Failed to create tables:', err)
      return false
    }
  }

  // Ensure admin user exists
  try {
    const count = await prisma.adminUser.count()
    if (count === 0) {
      const hash = crypto.createHash('sha256').update('user').digest('hex')
      await prisma.adminUser.create({
        data: {
          username: 'user',
          password: hash,
          fullName: 'Super Admin',
          role: 'superadmin',
          isActive: true,
        },
      })
      console.log('[db] Super admin created (user/user)')
    }
  } catch (err) {
    console.error('[db] Failed to seed admin:', err)
    return false
  }

  return true
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
