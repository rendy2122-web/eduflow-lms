import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import { randomBytes, scryptSync } from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { name, pathSegment, adminName, adminEmail, adminPassword, plan } = await req.json();

    if (!name || !pathSegment) {
      return NextResponse.json({ success: false, error: 'Nama dan Path Segment wajib diisi' }, { status: 400 });
    }

    // Clean pathSegment to alphanumeric only to avoid folder traversal attacks
    const cleanSegment = pathSegment.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();

    if (cleanSegment.length < 3) {
      return NextResponse.json({ success: false, error: 'Path Segment minimal 3 karakter alfanumerik' }, { status: 400 });
    }

    // Check if segment already exists in Control DB
    const existing = await prisma.tenant.findUnique({
      where: { pathSegment: cleanSegment },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: 'Path segment ini sudah digunakan oleh sekolah lain' }, { status: 400 });
    }

    // Paths
    const templateDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const tenantDbFolder = path.join(process.cwd(), 'prisma', 'tenants');
    const tenantDbPath = path.join(tenantDbFolder, `${cleanSegment}.db`);

    // Ensure tenants folder exists
    await fs.mkdir(tenantDbFolder, { recursive: true });

    // Copy template dev.db to create client-specific database
    await fs.copyFile(templateDbPath, tenantDbPath);

    // Customize the default admin credentials inside the new tenant database
    try {
      const { PrismaClient: TenantPrismaClient } = require('@prisma/client');
      const tenantPrisma = new TenantPrismaClient({
        datasources: {
          db: {
            url: `file:${tenantDbPath}`,
          },
        },
      });

      // Hash the provided admin password using scrypt with a random salt
      const rawPassword = adminPassword || 'admin123';
      const salt = randomBytes(16).toString('hex');
      const derived = scryptSync(rawPassword, salt, 64).toString('hex');
      const storedHash = `${salt}$${derived}`;

      await tenantPrisma.user.updateMany({
        where: { role: 'admin' },
        data: {
          email: adminEmail || 'admin@sekolah.sch.id',
          nama: adminName || 'Admin Sekolah',
          password_hash: storedHash,
        },
      });

      await tenantPrisma.$disconnect();
    } catch (dbErr) {
      console.error('Failed to configure tenant admin user:', dbErr);
    }

    // Selected plan mapping
    const selectedPlan = plan || 'PREMIUM';
    const maxUsers = selectedPlan === 'FREE' ? 100 : selectedPlan === 'BASIC' ? 250 : 500;

    // Save metadata in Control DB
    const newTenant = await prisma.tenant.create({
      data: {
        name,
        pathSegment: cleanSegment,
        dbFilePath: `prisma/tenants/${cleanSegment}.db`,
        status: 'ACTIVE',
        subscription: {
          create: {
            plan: selectedPlan,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 Year subscription
            maxUsers,
          },
        },
      },
      include: {
        subscription: true,
      },
    });

    return NextResponse.json({ success: true, tenant: newTenant });
  } catch (err: any) {
    console.error('Error during tenant onboarding:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
