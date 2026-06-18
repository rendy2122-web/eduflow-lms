import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient, getTenantDbUrl } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { scryptSync } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email, password, tenantId } = await req.json();

    if (!email || !password || !tenantId) {
      return NextResponse.json({ success: false, error: 'Email, sandi, dan Tenant ID wajib diisi' }, { status: 400 });
    }

    const dbUrl = getTenantDbUrl(tenantId);
    const tenantPrisma = getPrismaClient(dbUrl);

    // Look up user by email in the isolated tenant database
    const user = await tenantPrisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Email tidak terdaftar di sekolah ini' }, { status: 401 });
    }

    // Verify password. Support salted scrypt hashes stored as 'salt$hash'.
    const stored = user.password_hash || '';
    if (stored.includes('$')) {
      const [salt, hash] = stored.split('$');
      const derived = scryptSync(password, salt, 64).toString('hex');
      if (derived !== hash) {
        return NextResponse.json({ success: false, error: 'Kata sandi salah' }, { status: 401 });
      }
    } else {
      // Fallback to plaintext comparison for legacy seeded DBs
      if (user.password_hash !== password) {
        return NextResponse.json({ success: false, error: 'Kata sandi salah' }, { status: 401 });
      }
    }

    // Set secure HTTP-Only cookies
    const cookieStore = cookies();
    cookieStore.set('session_email', user.email, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 }); // 7 days
    cookieStore.set('session_role', user.role, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
    cookieStore.set('session_id', user.id, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        nama: user.nama,
      }
    });
  } catch (err: any) {
    console.error('Error in login API:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
