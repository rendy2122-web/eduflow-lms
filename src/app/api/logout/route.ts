import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const cookieStore = cookies();
    // Clear ALL session cookies
    cookieStore.delete('session_email');
    cookieStore.delete('session_role');
    cookieStore.delete('session_id');
    cookieStore.delete('session_tenant_id');
    cookieStore.delete('session_tenant_name');

    // Also clear localStorage data by setting empty values
    return NextResponse.json({ 
      success: true,
      redirectTo: '/login'
    });
  } catch (err: any) {
    console.error('Logout error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
