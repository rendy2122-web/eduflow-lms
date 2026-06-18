import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const role = cookieStore.get('saas_owner_role')?.value;
    const email = cookieStore.get('saas_owner_email')?.value;

    if (!email || !role || role !== 'saas_owner') {
      return NextResponse.json({ success: false, error: 'Sesi SaaS owner tidak valid' }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: { email, role } });
  } catch (err: any) {
    console.error('Error checking SaaS owner session:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
