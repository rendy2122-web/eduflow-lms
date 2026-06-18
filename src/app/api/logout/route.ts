import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const cookieStore = cookies();
    cookieStore.delete('session_email');
    cookieStore.delete('session_role');
    cookieStore.delete('session_id');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Logout error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
