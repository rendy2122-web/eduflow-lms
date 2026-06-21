import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient, getTenantDbUrl, getTenantList } from '@/lib/prisma';
import { cookies, headers } from 'next/headers';
import { scryptSync } from 'crypto';

// Helper: verify password against stored hash
function verifyPassword(password: string, stored: string): boolean {
  if (stored.includes('$')) {
    const [salt, hash] = stored.split('$');
    const derived = scryptSync(password, salt, 64).toString('hex');
    return derived === hash;
  }
  // Fallback to plaintext comparison for legacy seeded DBs
  return stored === password;
}

// Helper: search user across ALL active tenant databases
async function findUserAcrossTenants(email: string): Promise<{ user: any; tenantId: string; tenantName: string }[]> {
  const tenants = await getTenantList();
  const results: { user: any; tenantId: string; tenantName: string }[] = [];
  
  for (const tenant of tenants) {
    try {
      const dbUrl = getTenantDbUrl(tenant.pathSegment);
      const tenantPrisma = getPrismaClient(dbUrl);
      const user = await tenantPrisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, role: true, nama: true, password_hash: true }
      });
      if (user) {
        results.push({ user, tenantId: tenant.pathSegment, tenantName: tenant.name });
      }
    } catch (err) {
      console.error(`[Login] Error searching tenant ${tenant.pathSegment}:`, err);
      // Skip problematic tenant DBs silently
    }
  }
  return results;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, tenantId: clientTenantId } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email dan sandi wajib diisi' }, { status: 400 });
    }

    // Determine tenantId priority:
    // 1. From client request body (multi-tenant selection step)
    // 2. From x-tenant-id header (URL-based resolution via middleware)
    // 3. Null → will search across all tenants
    const headerList = headers();
    const headerTenantId = headerList.get('x-tenant-id') || '';
    let resolvedTenantId = clientTenantId || headerTenantId || '';
    
    // SECURITY: Validate tenantId against known tenant list
    const allTenants = await getTenantList();
    const validTenantIds = allTenants.map(t => t.pathSegment);
    if (resolvedTenantId && !validTenantIds.includes(resolvedTenantId)) {
      return NextResponse.json({ success: false, error: 'Sekolah tidak valid' }, { status: 400 });
    }

    let user: any = null;
    let tenantId = resolvedTenantId;
    let tenantName = '';

    if (resolvedTenantId) {
      // CASE 1: Tenant already known — direct login
      const dbUrl = getTenantDbUrl(resolvedTenantId);
      const tenantPrisma = getPrismaClient(dbUrl);
      user = await tenantPrisma.user.findUnique({
        where: { email },
      });
      
      if (!user) {
        return NextResponse.json({ success: false, error: 'Email atau password tidak sesuai' }, { status: 401 });
      }
      
      const tenantInfo = allTenants.find(t => t.pathSegment === resolvedTenantId);
      tenantName = tenantInfo?.name || '';
    } else {
      // CASE 2: No tenant — search across all active tenant databases
      const foundUsers = await findUserAcrossTenants(email);
      
      if (foundUsers.length === 0) {
        return NextResponse.json({ success: false, error: 'Email atau password tidak sesuai' }, { status: 401 });
      }
      
      if (foundUsers.length === 1) {
        // Single tenant match — login directly
        user = foundUsers[0].user;
        tenantId = foundUsers[0].tenantId;
        tenantName = foundUsers[0].tenantName;
      } else {
        // Multiple tenants — verify password first, then return choices
        // Try each tenant to find which one has matching password
        const validMatches: typeof foundUsers = [];
        for (const found of foundUsers) {
          if (verifyPassword(password, found.user.password_hash || '')) {
            validMatches.push(found);
          }
        }
        
        if (validMatches.length === 0) {
          return NextResponse.json({ success: false, error: 'Email atau password tidak sesuai' }, { status: 401 });
        }
        
        if (validMatches.length === 1) {
          // Only one has correct password
          user = validMatches[0].user;
          tenantId = validMatches[0].tenantId;
          tenantName = validMatches[0].tenantName;
        } else {
          // Multiple tenants with correct password — let user choose
          return NextResponse.json({
            success: false,
            multiTenant: true,
            tenants: validMatches.map(m => ({
              tenantId: m.tenantId,
              tenantName: m.tenantName
            })),
            error: 'Akun Anda terdaftar di lebih dari satu sekolah. Silakan pilih sekolah.'
          }, { status: 300 });
        }
      }
    }

    // Verify password
    if (!verifyPassword(password, user.password_hash || '')) {
      return NextResponse.json({ success: false, error: 'Email atau password tidak sesuai' }, { status: 401 });
    }

    // Set secure HTTP-Only cookies
    const cookieStore = cookies();
    cookieStore.set('session_email', user.email, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 }); // 7 days
    cookieStore.set('session_role', user.role, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
    cookieStore.set('session_id', user.id, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
    cookieStore.set('session_tenant_id', tenantId, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
    cookieStore.set('session_tenant_name', tenantName, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });

    return NextResponse.json({
      success: true,
      tenantId,
      tenantName,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        nama: user.nama,
      }
    });
  } catch (err: any) {
    console.error('Error in login API:', err);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan sistem. Silakan coba lagi.' }, { status: 500 });
  }
}
