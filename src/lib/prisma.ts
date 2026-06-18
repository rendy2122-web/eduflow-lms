import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';

const clients: Record<string, PrismaClient> = {};

export function getTenantDbUrl(tenantId: string): string {
  const baseDir = process.cwd().replace(/\\/g, '/');
  if (tenantId === 'control' || tenantId === 'saas-admin') {
    return `file:${baseDir}/prisma/control.db`;
  }
  return `file:${baseDir}/prisma/tenants/${tenantId}.db`;
}

export function getPrismaClient(dbUrl: string): PrismaClient {
  if (!clients[dbUrl]) {
    const client = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
    });

    // Auto-create OnlineClass table if it doesn't exist (SQLite file databases)
    if (dbUrl.includes('.db') || dbUrl.startsWith('file:')) {
      // Safely ensure avatar_url column exists in Profile table
      client.$executeRawUnsafe(`
        ALTER TABLE "Profile" ADD COLUMN "avatar_url" TEXT
      `).catch(() => {
        // Ignored if column already exists
      });

      client.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "OnlineClass" (
          "id" TEXT PRIMARY KEY NOT NULL,
          "title" TEXT NOT NULL,
          "date" TEXT NOT NULL,
          "time" TEXT NOT NULL,
          "platform" TEXT NOT NULL,
          "link" TEXT NOT NULL,
          "class_name" TEXT NOT NULL,
          "subject_name" TEXT NOT NULL,
          "notes" TEXT,
          "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).catch(err => {
        console.error(`[Prisma Init] Error creating OnlineClass table for ${dbUrl}:`, err);
      });
    }

    clients[dbUrl] = client;
  }
  return clients[dbUrl];
}

export function getActivePrisma(): PrismaClient {
  try {
    const headerList = headers();
    const tenantId = headerList.get('x-tenant-id');
    if (tenantId) {
      const dbUrl = getTenantDbUrl(tenantId);
      console.log(`[getActivePrisma] tenantId: "${tenantId}", dbUrl: "${dbUrl}"`);
      return getPrismaClient(dbUrl);
    }
  } catch (e) {
    console.error(`[getActivePrisma] Error reading headers:`, e);
  }
  const baseDir = process.cwd().replace(/\\/g, '/');
  const defaultUrl = process.env.DATABASE_URL || `file:${baseDir}/prisma/dev.db`;
  console.log(`[getActivePrisma] Fallback to defaultUrl: "${defaultUrl}"`);
  return getPrismaClient(defaultUrl);
}

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const activeClient = getActivePrisma();
    const value = Reflect.get(activeClient, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(activeClient);
    }
    return value;
  }
});

