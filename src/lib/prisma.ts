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
    const tenantId = headerList.get('x-tenant-id') || '';
    if (tenantId) {
      const dbUrl = getTenantDbUrl(tenantId);
      console.log(`[getActivePrisma] Header tenantId: "${tenantId}", dbUrl: "${dbUrl}"`);
      return getPrismaClient(dbUrl);
    }
  } catch (e) {
    console.error(`[getActivePrisma] Error reading headers:`, e);
  }
  
  // Fallback: try cookie-based session_tenant_id (for /login without tenant prefix)
  try {
    const { cookies } = require('next/headers');
    const cookieStore = cookies();
    const sessionTenantId = cookieStore.get('session_tenant_id')?.value;
    if (sessionTenantId) {
      const dbUrl = getTenantDbUrl(sessionTenantId);
      console.log(`[getActivePrisma] Cookie session_tenant_id: "${sessionTenantId}", dbUrl: "${dbUrl}"`);
      return getPrismaClient(dbUrl);
    }
  } catch (e) {
    console.log('[getActivePrisma] No cookie tenant:', (e as Error).message);
  }
  
  const defaultUrl = process.env.DATABASE_URL || `file:${process.cwd().replace(/\\/g, '/')}/prisma/dev.db`;
  console.log(`[getActivePrisma] Fallback to: "${defaultUrl}"`);
  return getPrismaClient(defaultUrl);
}

/**
 * getTenantList() - Mengambil daftar tenant aktif dari database control.
 * Untuk development, jika control DB belum ada, fallback ke list statis.
 */
export async function getTenantList(): Promise<{ pathSegment: string; name: string; status: string }[]> {
  const baseDir = process.cwd().replace(/\\/g, '/');
  const controlDbUrl = `file:${baseDir}/prisma/control.db`;
  
  try {
    const controlPrisma = getPrismaClient(controlDbUrl);
    const tenants = await controlPrisma.tenant.findMany({
      select: { pathSegment: true, name: true, status: true },
      where: { status: { not: 'SUSPENDED' } }
    });
    
    if (tenants.length > 0) {
      return tenants.map(t => ({
        pathSegment: t.pathSegment,
        name: t.name,
        status: t.status
      }));
    }
  } catch (e) {
    console.log('[getTenantList] Control DB not available, using fallback:', e);
  }
  
  // Fallback: scan prisma/tenants directory for .db files
  try {
    const fs = require('fs');
    const path = require('path');
    const tenantsDir = path.join(process.cwd(), 'prisma', 'tenants');
    if (fs.existsSync(tenantsDir)) {
      const files = fs.readdirSync(tenantsDir).filter((f: string) => f.endsWith('.db'));
      if (files.length > 0) {
        return files.map((f: string) => ({
          pathSegment: f.replace('.db', ''),
          name: f.replace('.db', '').charAt(0).toUpperCase() + f.replace('.db', '').slice(1),
          status: 'ACTIVE'
        }));
      }
    }
  } catch (e) {
    console.log('[getTenantList] Filesystem fallback not available:', e);
  }
  
  // Ultimate fallback: return empty list
  return [];
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