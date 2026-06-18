import { cookies } from 'next/headers';
import { getActivePrisma } from '@/lib/prisma';

export interface AuthResult {
  authorized: boolean;
  error?: string;
  status?: number;
  user?: any;
}

export async function checkAuth(allowedRoles: string[]): Promise<AuthResult> {
  try {
    const cookieStore = cookies();
    const email = cookieStore.get('session_email')?.value;
    const role = cookieStore.get('session_role')?.value;

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

    // Verify user exists in active tenant database
    const activePrisma = getActivePrisma();
    const user = await activePrisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return {
        authorized: false,
        error: 'Akun tidak terdaftar di tenant sekolah ini',
        status: 401
      };
    }

    return {
      authorized: true,
      user
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
