import React from 'react';
import { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'EduFlow - Integrated School Operations & LMS',
  description: 'Digitalisasi Operasional, Administrasi, Pembelajaran, dan Keuangan Sekolah Terintegrasi.',
  metadataBase: new URL('https://eduflow-demo.sch.id'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'EduFlow - Integrated School Operations & LMS',
    description: 'Digitalisasi Operasional, Administrasi, Pembelajaran, dan Keuangan Sekolah Terintegrasi.',
    url: 'https://eduflow-demo.sch.id',
    siteName: 'EduFlow',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EduFlow - Integrated School Operations & LMS',
    description: 'Digitalisasi Operasional, Administrasi, Pembelajaran, dan Keuangan Sekolah Terintegrasi.',
  },
};

import { headers } from 'next/headers';
import { getPrismaClient, getTenantDbUrl } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = headers();
  const tenantId = headerList.get('x-tenant-id');
  const originalPath = headerList.get('x-original-pathname') || '';

  // If a tenant is specified and is not the SaaS admin panel
  if (tenantId && tenantId !== 'saas-admin') {
    try {
      const controlPrisma = getPrismaClient(getTenantDbUrl('control'));
      const tenant = await controlPrisma.tenant.findUnique({
        where: { pathSegment: tenantId }
      });

      // If tenant doesn't exist, redirect to landing page
      if (!tenant) {
        redirect('/');
      }

      // If tenant is suspended, check if they are already on the suspended notice page
      if (tenant.status === 'SUSPENDED') {
        const isSuspendedPage = originalPath.endsWith('/suspended') || originalPath.endsWith('/suspended/');
        if (!isSuspendedPage) {
          redirect(`/${tenantId}/suspended`);
        }
      }
    } catch (err) {
      // Avoid infinite redirects during build static analysis
      if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
        throw err;
      }
      console.error('Error verifying tenant status in layout:', err);
    }
  }

  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}

