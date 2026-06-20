import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';

// Simple client untuk development (SQLite)
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
  
  const defaultUrl = process.env.DATABASE_URL || `file:${process.cwd().replace(/\\/g, '/')}/prisma/dev.db`;
  console.log(`[getActivePrisma] Fallback to: "${defaultUrl}"`);
  return getPrismaClient(defaultUrl);
}

// Export default prisma untuk kompatibilitas
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const activeClient = getActivePrisma();
    const value = Reflect.get(activeClient, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(activeClient);
    }
    return value;
  },
});

export default prisma;