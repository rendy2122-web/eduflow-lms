import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email dan kata sandi wajib diisi' }, { status: 400 });
    }

    if (email !== 'admin@eduflow.com' || password !== 'adminpassword') {
      return NextResponse.json({ success: false, error: 'Email atau kata sandi tidak cocok' }, { status: 401 });
    }

    const cookieStore = cookies();
    cookieStore.set('saas_owner_email', email, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
    cookieStore.set('saas_owner_role', 'saas_owner', { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('SaaS login API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
