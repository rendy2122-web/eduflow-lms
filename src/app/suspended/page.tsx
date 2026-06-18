import React from 'react';
import { headers } from 'next/headers';
import { getPrismaClient, getTenantDbUrl } from '@/lib/prisma';
import Link from 'next/link';

export default async function SuspendedPage() {
  const headerList = headers();
  const tenantId = headerList.get('x-tenant-id') || '';
  
  let tenantName = 'Sekolah';
  
  if (tenantId && tenantId !== 'saas-admin') {
    try {
      const controlPrisma = getPrismaClient(getTenantDbUrl('control'));
      const tenant = await controlPrisma.tenant.findUnique({
        where: { pathSegment: tenantId }
      });
      if (tenant) {
        tenantName = tenant.name;
      }
    } catch (err) {
      console.error('Error fetching tenant details in suspended page:', err);
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'radial-gradient(circle at bottom left, #1e1b4b 0%, #030712 80%)',
      padding: 'var(--spacing-4)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div className="card-premium" style={{
        maxWidth: '550px',
        width: '100%',
        padding: 'var(--spacing-8)',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Animated Amber warning icon */}
        <div style={{
          width: '72px',
          height: '72px',
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '0 auto 24px auto',
          color: '#f59e0b',
          fontSize: '32px'
        }}>
          ⚠️
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#f9fafb',
          marginBottom: '12px'
        }}>
          Akses Layanan Ditangguhkan
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#a1a1aa',
          lineHeight: '1.6',
          marginBottom: '24px'
        }}>
          Layanan EduFlow untuk <strong style={{ color: '#f59e0b' }}>{tenantName}</strong> saat ini sedang ditangguhkan.
        </p>

        <div style={{
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          textAlign: 'left',
          fontSize: '14px',
          lineHeight: '1.5',
          color: '#d4d4d8',
          borderLeft: '4px solid #f59e0b'
        }}>
          <p style={{ margin: 0, fontWeight: 600, color: '#f59e0b', marginBottom: '4px' }}>Mengapa saya melihat halaman ini?</p>
          <p style={{ margin: 0 }}>
            Hal ini biasanya terjadi karena masa berlangganan sekolah Anda telah kedaluwarsa, atau terdapat administrasi pembayaran tagihan yang belum diselesaikan dengan pihak EduFlow.
          </p>
        </div>

        <p style={{
          fontSize: '14px',
          color: '#71717a',
          marginBottom: '32px'
        }}>
          Silakan hubungi Administrator IT Sekolah Anda atau hubungi dukungan EduFlow untuk mengaktifkan kembali layanan ini.
        </p>

        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center'
        }}>
          <a
            href="mailto:support@eduflow.com?subject=Aktivasi%20Tenant%20EduFlow"
            style={{
              padding: '12px 24px',
              background: '#f59e0b',
              color: '#000',
              fontWeight: '600',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'background 0.2s',
              fontSize: '14px'
            }}
          >
            Hubungi Dukungan
          </a>
          <Link
            href="/"
            style={{
              padding: '12px 24px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#fff',
              fontWeight: '600',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'background 0.2s',
              fontSize: '14px'
            }}
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
