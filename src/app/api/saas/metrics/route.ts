import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const role = cookieStore.get('saas_owner_role')?.value;
    const email = cookieStore.get('saas_owner_email')?.value;
    if (!email || !role || role !== 'saas_owner') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all tenants with subscriptions from Control DB
    const tenants = await prisma.tenant.findMany({
      include: {
        subscription: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    let activeCount = 0;
    let totalStorageBytes = 0;
    let mrrEst = 0;

    const tenantsWithMetrics = await Promise.all(
      tenants.map(async (t) => {
        let dbSizeKb = 0;
        try {
          const fullPath = path.join(process.cwd(), t.dbFilePath);
          const stats = await fs.stat(fullPath);
          dbSizeKb = Math.round(stats.size / 1024);
          totalStorageBytes += stats.size;
        } catch (e) {
          // File size not found
        }

        if (t.status === 'ACTIVE') {
          activeCount++;
          // Estimate MRR
          const plan = t.subscription?.plan;
          if (plan === 'BASIC') mrrEst += 500000;
          else if (plan === 'PREMIUM') mrrEst += 1200000;
        }

        return {
          id: t.id,
          name: t.name,
          pathSegment: t.pathSegment,
          dbFilePath: t.dbFilePath,
          status: t.status,
          created_at: t.created_at.toISOString(),
          dbSizeKb,
          subscription: t.subscription
            ? {
                plan: t.subscription.plan,
                expiresAt: t.subscription.expiresAt.toISOString(),
                maxUsers: t.subscription.maxUsers,
              }
            : null,
        };
      })
    );

    const totalStorageMb = totalStorageBytes / (1024 * 1024);

    return NextResponse.json({
      success: true,
      tenants: tenantsWithMetrics,
      activeCount,
      totalStorageMb,
      mrrEst,
    });
  } catch (err: any) {
    console.error('Error fetching SaaS metrics API:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
