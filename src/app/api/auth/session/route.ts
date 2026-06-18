import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await checkAuth(['admin', 'guru', 'siswa', 'orang_tua']);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }
    return NextResponse.json({ success: true, user: auth.user });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
