import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Require SaaS owner auth via cookie
    const cookieStore = cookies();
    const role = cookieStore.get('saas_owner_role')?.value;
    const email = cookieStore.get('saas_owner_email')?.value;
    if (!email || !role || role !== 'saas_owner') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, status } = await req.json();
    if (!tenantId || !status) {
      return NextResponse.json({ success: false, error: 'Missing tenantId or status' }, { status: 400 });
    }

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: { status }
    });

    return NextResponse.json({ success: true, tenant: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
