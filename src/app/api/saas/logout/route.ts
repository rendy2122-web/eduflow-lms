import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const cookieStore = cookies();
    cookieStore.delete('saas_owner_email');
    cookieStore.delete('saas_owner_role');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('SaaS logout API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
