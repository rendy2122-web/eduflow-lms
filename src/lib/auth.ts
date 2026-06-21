import { cookies } from 'next/headers';
import { getActivePrisma, getTenantDbUrl, getPrismaClient } from '@/lib/prisma';

export interface AuthResult {
  authorized: boolean;
  error?: string;
  status?: number;
  user?: any;
}

/**
 * Check if user session is valid.
 * First tries x-tenant-id header (from middleware/URL).
 * Falls back to session_tenant_id cookie (for /login without tenant prefix).
 */
export async function checkAuth(allowedRoles: string[]): Promise<AuthResult> {
  try {
    const cookieStore = cookies();
    const email = cookieStore.get('session_email')?.value;
    const role = cookieStore.get('session_role')?.value;
    const sessionTenantId = cookieStore.get('session_tenant_id')?.value;

    if (!email || !role) {
      return {
        authorized: false,
        error: 'Sesi habis, silakan login kembali',
        status: 401
      };
    }

    if (!allowedRoles.includes(role)) {
      return {
        authorized: false,
        error: 'Akses ditolak: peran tidak sesuai',
        status: 403
      };
    }

    // Determine Prisma client: try active (header-based), then cookie-based
    let activePrisma;
    try {
      activePrisma = getActivePrisma();
      // Quick test: try to query user
      const testUser = await activePrisma.user.findUnique({ where: { email } });
      if (testUser) {
        return { authorized: true, user: testUser };
      }
    } catch (e) {
      console.log('[checkAuth] Header-based prisma failed, trying cookie:', e);
    }

    // Fallback: use session_tenant_id cookie
    if (sessionTenantId) {
      const dbUrl = getTenantDbUrl(sessionTenantId);
      activePrisma = getPrismaClient(dbUrl);
      const user = await activePrisma.user.findUnique({ where: { email } });
      if (user) {
        return { authorized: true, user };
      }
    }

    return {
      authorized: false,
      error: 'Akun tidak terdaftar di tenant sekolah ini',
      status: 401
    };
  } catch (err: any) {
    console.error('[checkAuth Error]:', err);
    return {
      authorized: false,
      error: 'Terjadi kesalahan otorisasi: ' + err.message,
      status: 500
    };
  }
}
