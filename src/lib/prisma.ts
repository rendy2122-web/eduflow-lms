import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';

const clients: Record<string, PrismaClient> = {};

export function getTenantDbUrl(tenantId: string): string {
  // For PostgreSQL (Supabase), use the main DATABASE_URL for all tenants
  // Multi-tenancy will be handled at application level with tenant_id columns
  const baseDir = process.cwd().replace(/\\/g, '/');
  
  if (tenantId === 'control' || tenantId === 'saas-admin') {
    return process.env.DATABASE_URL || `file:${baseDir}/prisma/control.db`;
  }
  
  // For PostgreSQL, return the main DATABASE_URL
  // The application will filter by tenant_id in queries
  return process.env.DATABASE_URL || `file:${baseDir}/prisma/tenants/${tenantId}.db`;
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
  },
});

export default prisma;